import React, { Component } from 'react';
import useSound from 'use-sound'
import schoolBellSound from './sounds/school-bell-sound.mp3'

import Login from './Login'
import {dateAdd, formatValue, removeFromArray} from './utils'

const axios = require('axios')

const SoundElement = (props) => {
  const [play] = useSound(schoolBellSound);

  if (props.playSound)
    return <button className='button' onLoad={play}>Sound!</button>
  else
    return <button className='button'>No sound</button>
};

const TableDisplay = (props) => {
  // TODO: make sure data is an array with at least one element

  if (props.data && props.data.length > 0) {

    // we are assuming that all the objects have the same format
    const keys = Object.keys(props.data[0])

    removeFromArray(keys, 'id')

    return (<div className="eventsTable"><table><thead>
      <tr>
      {
        keys.map((key) => {
        return (<th>{key}</th>)
        })
      }
      </tr>
      </thead>
      <tbody>
      {
        props.data.map((row) => {
          return (<tr>
          {
            keys.map((key) => {
            return <td>{formatValue(row[key])}</td>
            })}
          </tr>)
        })
      }
      </tbody>
      </table></div>
    )
  } else {
    return <div className="tagline">No Zoom calendar events</div>
  }
}

const auto_zoom_token_key = 'auto-zoom-token'

export default class App extends Component {
  constructor(props) {
    super(props);
    const access_token = (location.hash.match(/\#access_token=([^&]+)/) || [])[1];
    const token_type = (location.hash.match(/token_type=([^&]+)/) || [])[1];
    const scope = (location.hash.match(/scope=([^&]+)/) || [])[1];

    let auth_token

    if (access_token) {
      auth_token = {
        access_token: access_token,
        token_type: token_type,
        scope: scope
      }

      localStorage.setItem(auto_zoom_token_key, JSON.stringify(auth_token));
    }
    else {
      const local_storage_string = localStorage.getItem(auto_zoom_token_key)
      auth_token = local_storage_string && JSON.parse(local_storage_string)
    }
    
    this.state = {
      curTime: '',
      zoom_classes: null,
      open_zoom_classes: [],
      play_sound: false,
      auth_token: auth_token
    };
  }

  async checkForClass(current_time) {
    const that = this
    if (this.state.zoom_classes) {
      this.state.zoom_classes.forEach(this_class => {
        const time_diff = current_time.getTime() - this_class.start_date.getTime()
        if (time_diff >= 0 && time_diff <= 1000){
            if (that.state.open_zoom_classes.indexOf(this_class.id))
            {
              if (that.openURL(this_class.location)) {
                that.setState({open_zoom_classes: that.state.open_zoom_classes.concat([this_class.id])})
                that.setState({play_sound: true})
              }
            }
          }
        }
      )
    }
  }

  async componentDidMount() {
    setInterval(() => {
      if (this.state.auth_token) {
        const current_time = new Date()
        this.setState({
          curTime : formatValue(current_time)
        })
        this.checkForClass(current_time)
      }
    }, 1000)

    if (this.state.auth_token  && !this.state.zoom_classes) {

      const headers = {
        "Authorization": `Bearer ${this.state.auth_token.access_token}`,
        "Content-Type": "application/json"
      }
  
      const now = new Date()
      const oneWeekFromNow = dateAdd(now, 'week', 1)

      const that = this

      axios.get(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${oneWeekFromNow.toISOString()}&singleEvents=true`, {
        headers: headers
      }).then(function(response) {
        const filtered_events = response.data.items.filter((one_event) => one_event.location && one_event.location.includes('zoom.us'))
        const simplified_events = filtered_events.map((evt) => {
          return {
            start_date: new Date(evt.start.dateTime),
            location: evt.location,
            description: evt.summary,
            id: evt.id
          }}
      )
        that.setState({ zoom_classes: simplified_events})},
        function(error) {
          that.setState({auth_token: null})
      })
    }
  }

  async openURL(url) {
    const win = window.open(url, '_blank');
    if (win != null) {
      win.focus();
      return true
    }
    else return false
  }

  doLogout() {
    this.setState({auth_token: null})
    localStorage.removeItem(auto_zoom_token_key);
  }
  
  addTestEvent() {
    const fiveSecondsFromNow = dateAdd(new Date(), 'second', 5)
    const new_zoom_classes = [...this.state.zoom_classes]

    // TODO: create an object to represent classes
    new_zoom_classes.push({
      start_date: fiveSecondsFromNow,
      location: 'https://iwastesomuchtime.com/random',
      description: 'Test event',
      id: new Date().getTime()
    })
    this.setState({zoom_classes: new_zoom_classes})
  }

  render() {
    if (!this.state.auth_token)
      return (
        <div>
        <Login />
      </div>)
    else
      return (
        <div className="container">
          <div className='header buttonContainer'>
          <button className='button' onClick={this.doLogout.bind(this)}>Logout</button>
          <button className='button' onClick={this.addTestEvent.bind(this)}>Add Test Event</button>
          <SoundElement />
          </div>

          <div className="tagline">
            Date: {this.state.curTime}
          </div>
          
          <TableDisplay data={this.state.zoom_classes} />
        </div>
      )
  }
}

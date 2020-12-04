import React, { Component, useState } from 'react';
import useSound from 'use-sound'
import schoolBellSound from './sounds/school-bell-sound.mp3'

import Login from './Login'
import {dateAdd, formatValue, removeFromArray, toCapitalizedWords} from './utils'
import queryString from 'query-string'

const axios = require('axios')

const SoundElement = (props) => {
  const [play] = useSound(props.playSound)
  const [soundEnabled, setSoundEnabled] = useState(false)

  if (soundEnabled)
    return <button onLoad={() => play()} className='button' onClick={() => setSoundEnabled(false)}>Sound</button>
  else
    return <button className='button' onClick={() => setSoundEnabled(true)}>No Sound</button>
};

const TableDisplay = (props) => {
  // TODO: make sure data is an array with at least one element

  if (props.data && props.data.length > 0) {

    // we are assuming that all the objects have the same format
    const keys = Object.keys(props.data[0])

    removeFromArray(keys, 'id')

    return (<div className="eventsTableWrapper">
      <h3>{props.title}</h3>
      <table className="eventsTable">
      <thead>
      <tr>
      {
        keys.map((key) => {
        return (<th>{toCapitalizedWords(key)}</th>)
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
            return <td dangerouslySetInnerHTML={{ __html: formatValue(row[key]) }}></td>
            })}
          </tr>)
        })
      }
      </tbody>
      </table></div>
    )
  } else {
    return <div className="tagline">{props.noEventsTitle}</div>
  }
}

const auto_zoom_token_key = 'auto-zoom-token'

export default class App extends Component {
  constructor(props) {
    super(props);

    const parsedHash = queryString.parse(window.location.hash);
    
    let access_token = parsedHash.access_token

    if (access_token) {
      localStorage.setItem(auto_zoom_token_key, access_token);
    }
    else {
      access_token = localStorage.getItem(auto_zoom_token_key)
    }
    
    this.state = {
      curTime: '',
      zoom_classes: null,
      open_zoom_classes: [],
      play_sound: false,
      access_token: access_token
    };
  }

  async checkForClass(current_time) {
    const that = this
    if (this.state.zoom_classes) {
      this.state.zoom_classes.forEach(this_class => {
        const time_diff = current_time.getTime() - this_class.start_date.getTime()
        if (time_diff >= 0 && time_diff <= 1000){
            
            // check to see if this class has already been opened
            if (that.state.open_zoom_classes.findIndex(that_class => that_class.id == this_class.id))
            {
              if (that.openURL(this_class.location)) {
                that.setState({zoom_classes: this.state.zoom_classes.filter(that_class => that_class.id != this_class.id),
                  play_sound: true, 
                  open_zoom_classes: that.state.open_zoom_classes.concat([this_class])})
              }
            }
          }
        }
      )
    }
  }

  async componentDidMount() {
    setInterval(() => {
      if (this.state.access_token) {
        const current_time = new Date()
        this.setState({
          curTime : formatValue(current_time)
        })
        this.checkForClass(current_time)
      }
    }, 1000)

    if (this.state.access_token  && !this.state.zoom_classes) {

      const headers = {
        "Authorization": `Bearer ${this.state.access_token}`,
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
            location: new URL(evt.location),
            description: evt.summary,
            id: evt.id
          }}
      )
        that.setState({ zoom_classes: simplified_events})
      },
        function(error) {
          that.setState({access_token: null})
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
    this.setState({access_token: null})
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
    if (!this.state.access_token)
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
          <SoundElement playSound={this.state.play_sound}/>
          </div>

          <div className="currentTime">
            Current time: {this.state.curTime}
          </div>
          
          <TableDisplay data={this.state.zoom_classes} title='Upcoming events' noEventsTitle='No Zoom events'/>
          <TableDisplay data={this.state.open_zoom_classes} title='Past events' />
        </div>
      )
  }
}

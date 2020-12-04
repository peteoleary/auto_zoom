import React, { FC, useState, useEffect, useCallback } from "react";
import { Card, Button, Grid, FormRow } from "@material-ui/core";
import styled from "@emotion/styled";
import Accordion from '@material-ui/core/Accordion';


const StyledCard = styled(Card)`
  padding: 20px;
  margin: 100px auto;
  max-width: 70vw;
  min-width: 300px;
`;

const Login = () => {

  const handleGoogleLogin = useCallback(async () => {

    const params = {
        client_id: process.env.REACT_APP_CLIENT_ID,
        redirect_uri: process.env.REACT_APP_REDIRECT_URL, // The URL where you is redirected back, and where you perform run the callback() function
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.calendarlist.readonly",
        response_type: 'token'
      }

    const qParams = Object.keys(params).map(function(key) {
        return key + '=' + params[key]
    }).join('&');

    console.log(qParams)
    
    try {
      window.location.assign(`https://accounts.google.com/o/oauth2/auth?${qParams}`);
    } catch (e) {
      console.error(e);
    }
    
  }, []);

  return (
    <div>
      <StyledCard>
      <a style={{'padding-right': '17px'}} href='https://www.timelight.com/'>Back to Timelight.com</a>
      </StyledCard>
      <StyledCard>
        <h2>Auto Zoom</h2>
        <p>Don't ever want to miss another Zoom meeting? Having trouble get those kids to show up for distance learning? Put your Zoom meeting links into the Location field of Google Calendar then log into Auto Zoom. Your Zoom meetings will launch automatically and you will never be late again!
        </p>
        <Button variant="contained" color="primary" onClick={handleGoogleLogin}>
          Login with Google
        </Button>
        <p>
        <a style={{'padding-right': '17px'}} href='https://www.timelight.com/privacy-policy/' target='_blank'>Privacy Policy</a>
        <a href='https://www.timelight.com/terms-of-service/' target='_blank'>Terms of Service</a>
        </p>
      </StyledCard>
    </div>
  );
};

export default Login;
import React, { FC, useState, useEffect, useCallback } from "react";
import { Card, Button } from "@material-ui/core";
import styled from "@emotion/styled";

const StyledCard = styled(Card)`
  padding: 20px;
  margin: 100px auto;
  max-width: 40vw;
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
    <StyledCard>
      <Button variant="contained" color="primary" onClick={handleGoogleLogin}>
        Login with Google
      </Button>
    </StyledCard>
  );
};

export default Login;
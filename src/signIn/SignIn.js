import React, { useState, useEffect } from 'react';
import { Input, Button, Tabs, message, Space, Spin } from 'antd';
import { useHistory } from "react-router-dom";
import { inject, observer } from 'mobx-react';
import './SignIn.scss';
import SignInSuccess from './SignInSuccess';

const { TabPane } = Tabs;

//Make sure you use an HTTPS URL in production to avoid your link being potentially intercepted by intermediary servers.
var actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be whitelisted in the Firebase Console.
  url: 'http://localhost:3000/login',
  // This must be true.
  handleCodeInApp: true,
};

const SignIn = inject('appStore')(observer((({ appStore }) => {
  const { auth } = appStore;
  const history = useHistory();
  const [email, setEmail] = useState();
  const [confirmingEmail, setConfirmingEmail] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [sendSignInLoading, setSendSignInLoading] = useState(false);

  const changeEmail = ({ target: { value }}) => {
    setEmail(value);
  }

  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const sendSignInLink = async () => {
    setSendSignInLoading(true);
    if (!validateEmail(email)){
      message.error('Please provide a valid email address.', 3);
    } else {
      try {
        await auth.sendSignInLinkToEmail(email, actionCodeSettings)
        .then(function() {
          window.localStorage.setItem('emailForSignIn', email);
          appStore.setEmailSent();
        })
        .catch(function(e) {
          console.log(e);
          message.error('Some error occurred while sending your sign in link. Refresh the page and try again.');
        });
      } catch (e) {
        console.log(e)
      }
    }
    setSendSignInLoading(false);
  }

  useEffect(() => {
    if (auth.isSignInWithEmailLink(window.location.href)) {
      console.log('Using auth link')
      var storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        console.log('no email stored in cookies, prompting confirmation')
        setConfirmingEmail(true);
      } else {
        confirmEmail(storedEmail);
      }
    }
  }, []);

  const confirmEmail = async (emailAddress) => {
    setSignInLoading(true);
    await auth.signInWithEmailLink(emailAddress, window.location.href)
    .then(function(result) {
      window.localStorage.removeItem('emailForSignIn');
      // You can access the new user via result.user
      // Additional user info profile not available via:
      // result.additionalUserInfo.profile == null
      // You can check if the user is new or existing:
      // result.additionalUserInfo.isNewUser
      console.log('sign in with email link success')
      setSignInLoading(false);
      history.push('/home');
    })
    .catch(function(e) {
      // Some error occurred, you can inspect the code: error.code
      // Common errors could be invalid email and invalid or expired OTPs.
      console.log(e)
      if ('auth/invalid-action-code') {
        message.error('Youve already used this code before. Please retry with a new link.', 5);
        setConfirmingEmail(false);
      }
      setSignInLoading(false);
    });
  }

  if (signInLoading) {
    return <div className='spinner'><Spin size="large" /></div>
  }
  if (appStore.emailSent) {
    return <div id='sign-in-root'><SignInSuccess /></div>
  }
  return (
    <div id='sign-in-root'>
      <div>
        {!confirmingEmail && !appStore.emailSent && <>
          <h2>Welcome!</h2>
          <Space>
            <Input
              placeholder="Email address"
              onChange={(e) => changeEmail(e)}
            />
            <Button type="primary" onClick={() => sendSignInLink()} loading={sendSignInLoading}>
              Get email link
            </Button>
          </Space>
        </>}
        {confirmingEmail && <>
          <h2>Confirm your email please</h2>
          <Space>
            <Input
              placeholder="Email address"
              onChange={(e) => changeEmail(e)}
            />
            <Button type="primary" onClick={() => confirmEmail(email)}>
              Confirm email
            </Button>
          </Space>
        </>}
      </div>
    </div>
  );
})));

export default SignIn;
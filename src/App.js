import React, { useState } from 'react';
import './App.scss';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
} from "react-router-dom";
import { Layout, Button, Spin } from 'antd';
import { Provider, observer, inject } from 'mobx-react';
import AppStore from './AppStore';
import SignIn from './signIn/SignIn';

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const appStore = new AppStore();
  return (
    <Provider appStore={appStore}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  )
};

const AppContent = inject('appStore')(observer(({ appStore }) => {
  const { authenticated, loaded, emailSent } = appStore;
  if (!loaded) {
    return <div className='spinner'><Spin size="large" /></div>
  }
  if (loaded && !authenticated || emailSent) {
    return <SignIn />;
  }
  return (
    <>
      <Button onClick={() => appStore.logout()} className="logout-button" type="text">Logout</Button>
      <Switch>
        <Route path="/">
          <div>home page</div>
        </Route>
      </Switch>
    </>
  );
}));

export default App;

import { observable, action, decorate, runInAction, toJS, computed, reaction, autorun } from "mobx"
import { firestore, firebaseAuth } from './FirebaseConfig';
import { message } from 'antd';

export default class AppStore {
  auth = firebaseAuth;
  db = firestore;
  // Manually setting to me
  // authenticated = true;
  // userId = 'UTz9IpUMnyVQAdcTN2b5JWwFctr2';
  userId = null;
  authenticated = false;
  loaded = false;

  constructor() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.authenticated = true;
        this.userId = user.uid;
        this.initilizeUser();
      } else {
        // This stops it from getting stuck at spinner and go to login
        this.loaded = true;
      }
    });
  }

  async initilizeUser() {
    console.log(this.userId)
    const user = await this.db
    .collection('users').doc(this.userId).get();

    if (!user.exists) {
      console.log('User doesnt exist. Adding them');
      const newUserParams = formatNewUser(this.userId);
      await firestore.collection('users').doc(this.userId).set(newUserParams);
      this.setNewUser();
    }
    runInAction(() => this.loaded = true )
  }

  logout() {
    this.auth.signOut();
    this.authenticated = false;
    window.localStorage.removeItem('emailForSignIn');
  }

  // Used to keep users who just signed up on the same success page
  emailSent = false;
  setEmailSent() {
    this.emailSent = true;
  }

  newUser = false;
  setNewUser() {
    this.newUser = true;
    message.success('Welcome new user!', 5);
  }
}

const formatNewUser = (userId) => {
  return ({
    books: [],
    notes: [],
    createdAt: new Date(),
  })
}

decorate(AppStore, {
  setAuthenticated: action,
  authenticated: observable,
  fbAuth: observable,
  emailSent: observable,
  newUser: observable,
  setEmailSent: action,
  setNewUser: action,
  logout: action,
  loaded: observable,

  initilizeUser: action,
});
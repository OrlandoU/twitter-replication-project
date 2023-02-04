import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/Main/App';
import { initializeApp } from "firebase/app";
import { HashRouter } from 'react-router-dom';
import './assets/css/index.css'



const root = ReactDOM.createRoot(document.getElementById('root'));

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATvPrYknRtklwo7mq2N8e4qEQPIPaFLew",
  authDomain: "twitter-748a1.firebaseapp.com",
  projectId: "twitter-748a1",
  storageBucket: "twitter-748a1.appspot.com",
  messagingSenderId: "147058456352",
  appId: "1:147058456352:web:1e2df483023c19be424945"
};

// Initialize Firebase
initializeApp(firebaseConfig);

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);



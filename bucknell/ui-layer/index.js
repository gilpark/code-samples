import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {
    unstable_createMuiStrictModeTheme as createMuiTheme,
    darken,
} from "@material-ui/core/styles";
import {ThemeProvider} from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import {RecoilRoot} from "recoil";
import * as firebase from "firebase"
import './assets/font/FreigSanProBold.otf'
import './assets/font/FreigSanProMed.otf'
import './assets/font/FreigSanProSem.otf'
import './assets/font/TradeGothicLTPro-BdCn20.otf'

const theme = createMuiTheme({

    // palette: {
    //     primary: {
    //         main: '#556cd6',
    //     },
    //     secondary: {
    //         main: '#19857b',
    //     },
    //     error: {
    //         main: red.A400,
    //     },
    //     background: {
    //         default: '#fff',
    //     },
    // },

});

const firebaseConfig = {
    apiKey: "AIzaSyDSmkbkzsGxNMgIfdleyAP8Fmj1XTJ26nI",
    authDomain: "bucknell-342ca.firebaseapp.com",
    databaseURL: "https://bucknell-342ca.firebaseio.com",
    projectId: "bucknell-342ca",
    storageBucket: "bucknell-342ca.appspot.com",
    messagingSenderId: "694457409919",
    appId: "1:694457409919:web:aed0fa966d11092595ba4a",
    measurementId: "G-HSGVXJB2TZ"
}
firebase.initializeApp(firebaseConfig)

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <App />
            </ThemeProvider>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import {
    unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { MuiThemeProvider } from "@material-ui/core/styles"
import * as firebase from "firebase"
import {
    RecoilRoot,
} from 'recoil'
import './assets/font/FreigSanProBold.otf'
import './assets/font/FreigSanProMed.otf'
import './assets/font/FreigSanProSem.otf'
import './assets/font/TradeGothicLTPro-BdCn20.otf'

const theme = createMuiTheme({
    palette: {
        primary: {
            light:"#3e6293",
            main: '#003865',
            dark:"#00123a",
            contrastText:"#ffffff"
        },
        secondary: {
            light:"#FAC710",
            main: '#F47521',
            dark:"#bc5900",
            contrastText:"#000000"
        },
        error: {
            light:"#ff0000",
            main: '#ffb844',
            dark:"#ffb844",
            contrastText:"#ffffff"
        },
        background: {
            default: '#071521',
            paper:'#e0dbd2'
        },

    },
    typography:{
        fontFamily:['FreigSan Pro Medium', 'FreigSan Pro Sem','FreigSan Pro Bold','TradeGothic']
    },
    divider:'rgba(255,255,255,1)'
})

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
        <MuiThemeProvider theme={theme}>
            <React.StrictMode>
                <RecoilRoot>
                    <App />
                </RecoilRoot>
            </React.StrictMode>
        </MuiThemeProvider>
,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

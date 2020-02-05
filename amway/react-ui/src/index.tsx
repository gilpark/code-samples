import * as serviceWorker from './serviceWorker';
import { run } from "@cycle/run";
import { makeDOMDriver } from "@cycle/react-dom";
import { main } from './App'
import {makeHTTPDriver} from "@cycle/http";
// import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';

run(main, {
    react: makeDOMDriver(document.getElementById("root")),
    http : makeHTTPDriver(),
    test : ()=>{}
});
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();

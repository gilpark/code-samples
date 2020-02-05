
import './App.css'
import {connect} from 'react-redux'
import React from "react";
import PhotoModule from './components/PhotoModule/PhotoModule'
import MixModePhoto from './components/PhotoModule/MixModePhoto'
import IdlePlayer from './components/VideoModule/IdlePlayer'
import VideoModule from './components/VideoModule/VideoModule'
import MixModeVideo from './components/VideoModule/MixModeVideo'
import Lobby from './components/Empty'
import Configuration from './components/Configuration'
import DownloadModule from './components/DownloadModule'
import {makeComponent} from "@cycle/react"
import {CHANGE_MODE, UPDATE_FLAG} from "./store/reducers";
import * as Rx from 'rxjs'
import {Socket$} from "./Util/WebSocket$";
import MixVideo from "./components/VideoModule/MixVideo";


const app = (sources) =>{
    const props$ = sources.react.props().map(p=> p)
    const keyup$ = Rx.Observable.fromEvent(document, 'keypress').filter(x => x.key ==='c')

    keyup$.subscribe(x =>{
        Socket$.ws().close()
        sources.react.props()._v.dispatch(UPDATE_FLAG('overwrite'))
        sources.react.props()._v.dispatch(CHANGE_MODE('empty'))
        sources.react.props()._v.dispatch(CHANGE_MODE('config'))

    })
    const elem$ = props$
        .map(p => {
            let mode = p.mode

            switch (mode) {
                case 'lobby': return <Lobby/>
                case 'empty': return (<div>blank</div>)
                case 'idle': return <IdlePlayer/>
                case 'video': return <VideoModule/>
                case 'mix_video': return <MixVideo />
                case 'photo': return <PhotoModule/>
                case 'config' : return <Configuration />
                case 'download' :{
                  return <DownloadModule/>
                }
              case 'mix':
                    if(p.config.id === "3" ||
                        p.config.id === 3 ||
                        p.config.id === "6" ||
                        p.config.id === 6 ||
                        p.config.id === "0" ||
                        p.config.id === 0
                    ){
                        return <MixModeVideo/> } else { return <MixModePhoto/> }
                default: return <Lobby/>
            }
        })
    return{ react : elem$}
}

const App = makeComponent(app)
export default connect((store) => {
    return{
        mode : store.mode,
        config : store.config,
        json : store.json
    }
})(App)
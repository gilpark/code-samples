import connect from "react-redux/es/connect/connect"
import {makeComponent} from '@cycle/react'
import {h1,h2,h3,h5,div} from '@cycle/react-dom'
import moment from 'moment'
import {
  CHANGE_MODE,
  PICK_CLIP,
  PICK_COLLAGE, PICK_MIX_CLIP,
  UPDATE_ERROR, UPDATE_MODE_JSON
} from "../store/reducers";
import {Socket$} from "../Util/WebSocket$";
import dropRepeats from 'xstream/extra/dropRepeats'

const modeChange$ = Socket$.stream.filter(msg => msg.action ==='SELECT_MODE').map(msg => msg.data).compose(dropRepeats())
const format = 'MMMM Do YYYY, h:mm:ss a'
let localTime = ""
let lastError = ""
const lobby = (sources) =>{
  const modeChangeListener  =
      {
        next: data => {
          let mode = data.mode
          switch (mode) {
            case 'ws_connected':
              if(lastError === "CANNOT TALK TO SERVER")
                sources.react.props()._v.dispatch(UPDATE_ERROR(''))
              sources.react.props()._v.dispatch(CHANGE_MODE('empty'))
              sources.react.props()._v.dispatch(CHANGE_MODE('lobby'))
              break
            case 'ws_error':
              sources.react.props()._v.dispatch(UPDATE_ERROR('CANNOT TALK TO SERVER'))
              sources.react.props()._v.dispatch(CHANGE_MODE('empty'))
              sources.react.props()._v.dispatch(CHANGE_MODE('lobby'))
              break
            case 'stamp':
              let rawServerStamp = data.time
              let serverStamp = moment(rawServerStamp,format)
              if(localTime === "") localTime = "January 23rd 2018, 2:45:19 pm"
              let localStamp = moment(localTime,format)
              if(serverStamp.isAfter(localStamp)){
                sources.react.props()._v.dispatch(CHANGE_MODE('empty'))
                sources.react.props()._v.dispatch(UPDATE_MODE_JSON('download',data,()=> {
                  localTime = rawServerStamp
                }))
              }
              break
            case 'idle':
              sources.react.props()._v.dispatch(CHANGE_MODE('idle'))
              break
            case 'video':
              sources.react.props()._v.dispatch(PICK_CLIP(data.clips))
              sources.react.props()._v.dispatch(CHANGE_MODE('empty'))
              sources.react.props()._v.dispatch(CHANGE_MODE('video'))
              break
            case 'mix_video':
              sources.react.props()._v.dispatch(PICK_MIX_CLIP(data.clip))
              sources.react.props()._v.dispatch(CHANGE_MODE('empty'))
              sources.react.props()._v.dispatch(CHANGE_MODE('mix_video'))
              break
            case 'collage':
              sources.react.props()._v.dispatch(PICK_COLLAGE(data.collage))
              sources.react.props()._v.dispatch(CHANGE_MODE('empty'))
              sources.react.props()._v.dispatch(CHANGE_MODE('photo'))
              break
            case 'mix':
              sources.react.props()._v.dispatch(CHANGE_MODE('mix'))
              break

            default :
              sources.react.props()._v.dispatch(CHANGE_MODE('config'))
              break
          }
        },
        error: err => console.log('app.js','modeChange$',err),
        complete:()=>console.log('app.js','modeChange$ is disposed')
      }

  const view$ =  sources.react.props().take(1).map(p =>{
    let props = p
    console.log("should initialize ws",modeChange$._ils.length)

    Socket$.ws(props.config.server)
    // localTime = props.stamp
    lastError = props.error

    Socket$.ws()
        .send(JSON.stringify({id : props.config.id, side: props.config.side}))

    if(Socket$.ws(props.config.server).readyState === 3){
      console.log("reconnect")
      Socket$.ws(props.config.server).reconnect()
    }

    if(modeChange$._ils.length === 0)modeChange$.addListener(modeChangeListener)
    let connected = Socket$.ws(props.config.server).readyState === 1
    let idColor = connected? 'yellow' : "gray"
    return div([
      h1({},'Device Info'),
      h2({},{style :{color: idColor}},'ID: ' + props.config.id),
      h2({},{style :{color: idColor}},'SIDE: ' + props.config.side),
      h5({},'version : 0.1.24' ),
      h5({},'SERVER: ' + props.config.server),
      h5({},'Checked in: ' + props.stamp),
      h3({},{style :{color: 'red'}}, props.error===""? '':'ERROR : '+props.error)
    ])
  })
  return{
    react : view$
  }
}

const Lobby = makeComponent(lobby)
export default connect((store) => {
  return{
    mode : store.mode,
    config : store.config,
    idle: store.idle,
    clips : store.clips,
    collage : store.collage,
    mix : store.mix,
    flag : store.flag,
    stamp : store.stamp,
    error : store.error,
    MixClips : store.MixClips,
    mix_video_index : store.mix_video_index
  }
})(Lobby)

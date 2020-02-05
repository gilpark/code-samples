import xstream from 'xstream'
import ReconnectingWebSocket from 'reconnecting-websocket';

let _ws = null
const ws = (ip) => {
  if(_ws === null) _ws = new ReconnectingWebSocket(`ws:///${ip}:1234`)
  return _ws
}

let producer  = {
  start: (listener) => {
    _ws.addEventListener('open', e =>{
     console.log(`WS: Connected to ${e.currentTarget.url}`)
        let msg = {action : 'SELECT_MODE', data:{mode : 'ws_connected'}}
        listener.next(msg)
    })

    _ws.addEventListener('message', msg =>{
      if(!msg.data.startsWith('{'))return
      listener.next(JSON.parse(msg.data))
    })
      _ws.addEventListener('error', err =>{
          let msg = {action : 'SELECT_MODE', data:{mode : 'ws_error'}}
          listener.next(msg)
          // listener.error(err)
      })
  },
  error: (listener) => {

  },
  stop: ()=>{
    _ws.removeEventListener('open'|'message'|'error', e =>{
      console.log(`WS: Disconnected`)
    })
  }
  //todo set id and check if this stream is duplicated
}
export const Socket$  = {stream : xstream.create(producer), ws : ws}



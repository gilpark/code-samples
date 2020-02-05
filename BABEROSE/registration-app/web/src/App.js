import React,{ useState,useRef } from 'react'
import './App.css'
import Registration from "./comp/registration"
import FilterSelection from './comp/filterSelection'
import CountDown from "./comp/countdown"
import Idle from "./comp/idle"
import PreView from "./comp/preview"
import ThankYou from "./comp/thankyou"
import Ready from "./comp/ready"
import useProfunctorState from "@staltz/use-profunctor-state"
import ReconnectingWebSocket from 'reconnecting-websocket'
import styled from "styled-components";


const rws = new ReconnectingWebSocket('ws://localhost:5000');
rws.addEventListener('open', () => {
    console.log("ws connection open!")
})
rws.addEventListener('message', (Event) => {
    console.log("ws message: ",Event.data)
})

export const ResetButton = styled.div`
  left: 0;
  top: 0;
  height: 15vw;
  position: absolute;
  width: 15vw;
`
const switchComp = (pro) => {
    // console.table(pro.state)
    switch (pro.state.path) {
        case '/':
            return <Idle {...pro}/>
        case '/reg':
            return <Registration {...pro}/>
        case '/select':
            return <FilterSelection {...pro}/>
        case '/ready':
            return <Ready {...pro}/>
        case '/count':
            return <CountDown {...pro}/>
        case '/preview':
            return <PreView {...pro}/>
        case '/thank':
            return <ThankYou {...pro}/>
        default:
            return <Idle {...pro}/>
    }
}

function App() {
    const sendWS = (msg) => rws.send(msg)
    const initState = {path:'/', data:{}, send:sendWS}
    const appProf = useProfunctorState(initState)
    const [clickCount,setCount] = useState(0)
    const prof = appProf.promap(
        state => state,
        ({path,data}, state) => ({ ...state, path: path, data: data})
    )
    const onReset = e =>{
        if(appProf.state.path === '/thank'||appProf.state.path === '/count') {
            console.log("cannot reset on this state")
            return
        }
        if(clickCount > 0){
            setTimeout(()=>{setCount(0)},500)
            if(clickCount>1){
                appProf.setState(initState)
                sendWS(JSON.stringify({id:'reg', preview:false}))
            }
        }
        setCount(clickCount+1)
    }
  return (
      <div style={{width:"100vw",height:'100vh', margin:'0'}}>
          {switchComp(prof)}
          <ResetButton onClick={onReset}/>
      </div>
  )
}
export default App

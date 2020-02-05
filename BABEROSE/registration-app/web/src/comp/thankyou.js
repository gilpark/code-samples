import React , { useState, useEffect }from 'react'
import {BabeLogo, HashTagImg, Row3GridDiv} from "./layoutComps";
import logo from "../assets/babe_logo.png";
import hashTag from "../assets/sprite_UI_hashtag.png";
import styled from "styled-components";

const BigTextDiv = styled.div`
  margin: auto;
  font-size: 7.5vw;
  //padding-top: 10vh;
  //padding-bottom: 10vh;
`
const StartButton = styled.button`
  margin: 2vh auto auto;
  font-size: 4vw;
  background: #FDE0E0;
  color: #1D2972;
  border: 1vh solid #1D2972;
  width: 32vw;
  height: 16.5vh;
  letter-spacing: 1vw;
  box-shadow: 1vw 2vh 0 0 rgba(29,41,114,1);
`
function ThankYou({ state, setState }) {
    const onReadyButton = e => {
        setState(pre => ({...pre,path:'/',data:{}}))
        state.send(JSON.stringify({id:'reg',  preview:false}))
        // state.send(JSON.stringify({id:'reg',action:'select', selection: 0,  preview:false}))
    }
    return (
        <Row3GridDiv onClick = {onReadyButton}>
            <div>
                <BabeLogo src = {logo}/>
            </div>
            <div>
                <BigTextDiv>{'THANK YOU! CHECK YOUR EMAIL TO VIEW YOUR GIF.'}</BigTextDiv>
                <StartButton>{'CONFIRM'}</StartButton>
                <HashTagImg src={hashTag}/>
            </div>
        </Row3GridDiv>
    )
}
export default ThankYou
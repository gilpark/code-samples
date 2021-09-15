import React , { useState, useEffect }from 'react'
import {BabeLogo, Row3GridDiv, HashTagImg} from './layoutComps'
import styled from "styled-components";
import logo from '../assets/babe_logo.png'
import hashTag from '../assets/sprite_UI_hashtag.png'

const BigTextDiv = styled.div`
  margin: auto;
  font-size: 8vw;
  padding-top: 10vh;
  padding-bottom: 10vh;
`
const StartButton = styled.button`
  margin: auto;
  font-size: 4vw;
  background: #FDE0E0;
  color: #1D2972;
  border: 1vh solid #1D2972;
  width: 45vw;
  height: 18vh;
  letter-spacing: 1vw;
  box-shadow: 1vw 2vh 0 0 rgba(29,41,114,1);
`
function Idle({ state, setState }) {
    const onStartButton = e => setState(pre => ({...pre, path:'/reg'}))
    state.send(JSON.stringify({id:'reg', preview:false})) //msg to td
    return (
        <Row3GridDiv onClick = {onStartButton}>
            <div>
                <BabeLogo src = {logo}/>
            </div>
            <div>
                <BigTextDiv>{'BABE Does America'}</BigTextDiv>
                <StartButton type={'button'}>{'GET STARTED'}</StartButton>
                <br/>
                <HashTagImg src={hashTag}/>
            </div>

        </Row3GridDiv>
    )
}
export default Idle
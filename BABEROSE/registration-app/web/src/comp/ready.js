import React, { useState, useEffect } from 'react'
import { BabeLogo, HashTagImg, Row3GridDiv } from "./layoutComps";
import logo from "../assets/babe_logo.png";
import styled from "styled-components";
import hashTag from '../assets/sprite_UI_hashtag.png'

// the amount of time we wait till we show the confirm and back buttons
var revealButtonsTimer = 8000;

const BigTextDiv = styled.div`
  padding-top: 75px;
  margin: auto;
  font-size: 7.5vw;
`
const ConfirmButton = styled.button`
  margin-top: 3vh;margin-right: auto;margin-left: 1.5vw;margin-bottom: auto;
  font-size: 4vw;
  background: #FDE0E0;
  color: #1D2972;
  border: 1vh solid #1D2972;
  width: 33vw;
  height: 16vh;
  letter-spacing: 1vw;
  //box-shadow: 1vw 2vh 0 0 rgba(29,41,114,1);
  display: ${props => (props.primary ? 'none' : 'block')};
`
const BackButton = styled.button`
  margin-top: 3vh;margin-right: 1.5vw;margin-left: auto;margin-bottom: auto;
  font-size: 4vw;
  background: #1D2972;
  color: white;
  border: 1vh solid #1D2972;
  width: 33vw;
  height: 16vh;
  letter-spacing: 1vw;
  display: ${props => (props.primary ? 'none' : 'block')};
`
function Ready({ state, setState }) {

    const [waitdone, setwait] = useState(false);

    setTimeout(() => setwait(true), revealButtonsTimer);

    const onReadyButton = e => {
        console.log(state)
        setState(pre => ({ ...pre, path: '/count' }))
    }
    const onBackButton = e => setState(pre => ({ ...pre, path: '/select' }))
    return (
        <Row3GridDiv >
            <div>
                <BabeLogo src={logo} />
            </div>
            <div>
                <BigTextDiv>{'HOP ON THE BED AND GET READY FOR YOUR GIF'}</BigTextDiv>

                {waitdone ?
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                        <BackButton onClick={onBackButton}>{'BACK'}</BackButton>
                        <ConfirmButton onClick={onReadyButton}>{'CONFIRM'}</ConfirmButton>
                    </div> :
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                        <BackButton primary onClick={onBackButton}>{'BACK'}</BackButton>
                        <ConfirmButton primary onClick={onReadyButton}>{'CONFIRM'}</ConfirmButton>
                    </div>
                }

                <HashTagImg src={hashTag} />
            </div>
        </Row3GridDiv>
    )
}
export default Ready
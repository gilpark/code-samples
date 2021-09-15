import React , { useState, useEffect }from 'react'
import {BabeLogo, CenterDiv, HashTagImg, Row3GridDiv} from "./layoutComps";
import logo from "../assets/babe_logo.png";
import hashTag from "../assets/sprite_UI_hashtag.png";
import styled from "styled-components";

const ConfirmButton = styled.button`
  margin-top: auto;margin-right: auto;margin-left: 10vw;margin-bottom: 5vh;
  font-size: 3vw;
  background: #1D2972;
  color: white;
  border: 1vh solid #1D2972;
  width: 30vw;
  height: 15vh;
  letter-spacing: 1vw;
`
const RetakeButton = styled.button`
  margin-top: 5vh;margin-right: auto;margin-left: 10vw;margin-bottom: auto;
  font-size: 3vw;
  background: #FDE0E0;
  color: #1D2972;
  border: 1vh solid #1D2972;
  width: 30vw;
  height: 15vh;
  letter-spacing: 1vw;
`
const Wrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
  display: grid;
  width: 80%;
  height: 80%;
  grid-template-columns: 50% 50%;
`
const PreViewDiv = styled.div`
  margin: auto;
  width: 95%;
  height: 95%;
  background: white;
`
const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

function PreView({ state, setState }) {
    state.send(JSON.stringify({id:'reg', preview:true})) //msg to td
    const onConfirmButton = e => {
        state.send(JSON.stringify({id:'reg', preview:false, action:'convert', data: state.data}))
        setState(pre => ({...pre, path:'/thank'}))
    }
    const onReTakeButton = e => {
        state.send(JSON.stringify({id:'reg', preview:false}))
        setState(pre => ({...pre, path:'/count'}))
    }
    return (
        <Row3GridDiv>
            <div>
                <BabeLogo src = {logo}/>
            </div>
            <Wrapper>
                <PreViewDiv/>
                <ButtonWrapper>
                    <ConfirmButton onClick = {onConfirmButton}>CONFIRM</ConfirmButton>
                    <RetakeButton onClick = {onReTakeButton}>RETAKE</RetakeButton>
                </ButtonWrapper>
            </Wrapper>
                <HashTagImg src={hashTag}/>


        </Row3GridDiv>
    )
}
export default PreView
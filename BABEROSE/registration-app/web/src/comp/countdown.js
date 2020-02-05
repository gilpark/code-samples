import React , { useState, useEffect }from 'react'
import {BabeLogo, HashTagImg, Row3GridDiv} from "./layoutComps";
import logo from "../assets/babe_logo.png";
import hashTag from "../assets/sprite_UI_hashtag.png";
import styled from "styled-components";
import Three from "../assets/sprite_UI_Countdown_Can_A.png";
import One from "../assets/sprite_UI_Countdown_Can_B.png";
import Two from "../assets/sprite_UI_Countdown_Can_C.png";

const BigTextDiv = styled.div`
  font-size: 15vw;
  margin: -10vh auto 0;
`
const SodaWrapper = styled.div`
  margin-top: -5.5vh;
  margin-right: auto;
  margin-left: auto;
  height: 57vh;
  width: 30vw;
  display: flex;
  overflow: hidden;
`
export const SodaCan = styled.img`
  height: 95%;
  width: auto;
  margin: 0.5vw;
  transform: translateY(${props => props.offset}vh);
  transition: all 1s;
`
const ProcssingeDiv = styled.div`
  position: fixed;
  top: 50vh;
  font-size: 20vh;
  right: -80vw;
  //overflow: hidden;
  transform: translateX(${props => props.offset}vw);
  transition: all 1s;
`
function CountDown({ state, setState }) {
    const maxCount = 3
    const processBuffer = 3
    const [count,setCount] = useState(maxCount)
    setTimeout(() => {
        if(count > -processBuffer){
            if(count === 0){
                state.send(JSON.stringify({id:'reg', action:'save', preview:false}))
                setTimeout(()=>{
                    setState(pre => ({...pre,path:'/preview'}))
                },processBuffer * 1000)
            }
            setCount(count -1)
        }
    },1000)
    return (
        <Row3GridDiv >
            <div>
                <BabeLogo src = {logo}/>
            </div>
            <div >
                <BigTextDiv>{count>0?count:<span>&nbsp;</span>}</BigTextDiv>
                <SodaWrapper>
                    <SodaCan src={Three} offset={count < 3 ?'80':'0'}/>
                    <SodaCan src={One} offset={count < 1 ?'80':'0'}/>
                    <SodaCan src={Two} offset={count < 2 ?'80':'0'}/>
                </SodaWrapper>
                <ProcssingeDiv offset={count < 1 ?'-90':'0'}>{'Processing...'}</ProcssingeDiv>
                <HashTagImg src={hashTag}/>
            </div>

        </Row3GridDiv>
    )
}
export default CountDown
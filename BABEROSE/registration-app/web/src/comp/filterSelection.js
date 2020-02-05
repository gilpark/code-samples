import React, {useState} from 'react'
import logo from '../assets/babe_logo.png'
import {BabeLogo, Row3GridDiv, HashTagImg} from "./layoutComps";
import {SubmitButton} from "./registration";
import styled from "styled-components";
import hashTag from "../assets/sprite_UI_hashtag.png";
import option_1 from "../assets/cloud.png"
import option_2 from "../assets/water.png"
import option_3 from "../assets/beach.png"
import option_4 from "../assets/fabric.png"

export const WhiteDiv = styled.div`
  margin-right: auto;
  margin-left: auto;
  //margin-top: 2vh;
  width: 46.5vw;
  height: cal(100%-2.5vw);
  background: white;
  display: grid;
  
  grid-template-columns: 22vw 22vw;
  grid-auto-rows: 19vw 19vw;
  margin-top: 2.5vw;
  grid-column-gap: 2.5vw;
  grid-row-gap: 2.5vw;
`
export const FilterBox = styled.div`

`
export const FilterContent = styled.div`
  background: #FDE0E0;
  width: 100%;
  height: 100%;
`
function FilterSelection({ state, setState }) {
    const makeOnClickHandler = idx =>{
        return e => {
            state.send(JSON.stringify({id:'reg', action:'select', selection: idx,  preview:false}))
            // setIndex(idx)
            setState(pre => {
                return ({...pre, path:'/ready', data:{...pre.data, option:idx}})
            })
        }
    }
    return (
        <Row3GridDiv>
            <div>
                <BabeLogo src = {logo}/>
                <div style={{
                    paddingTop:'1.5vh',
                    fontSize:'7vh'
                }}>
                    {'PICK YOUR FILTER'}
                </div>
            </div>
            <div style={{background:'white', width:'100%', height:'100%'}}>
                <WhiteDiv>
                    <FilterBox onClick={makeOnClickHandler(1)}>
                        <FilterContent>
                            <img src = {option_1} style={{width:"100%", height:"100%",objectFit:"cover" }} alt={'option1'}/>
                        </FilterContent>
                    </FilterBox>
                    <FilterBox onClick={makeOnClickHandler(2)}>
                        <FilterContent>
                            <img src = {option_2} style={{width:"100%", height:"100%",objectFit:"cover" }} alt={'option2'}/>
                        </FilterContent>
                    </FilterBox>
                    <FilterBox onClick={makeOnClickHandler(3)}>
                        <FilterContent>
                            <img src = {option_3} style={{width:"100%", height:"100%",objectFit:"cover" }} alt={'option3'}/>
                        </FilterContent>
                    </FilterBox>
                    <FilterBox onClick={makeOnClickHandler(4)}>
                        <FilterContent>
                            <img src = {option_4} style={{width:"100%", height:"100%",objectFit:"cover" }} alt={'option4'}/>
                        </FilterContent>
                    </FilterBox>
                </WhiteDiv>
                <HashTagImg src={hashTag}/>
            </div>

        </Row3GridDiv>

    )
}
export default FilterSelection

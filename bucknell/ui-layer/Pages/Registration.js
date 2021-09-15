import React, {useEffect, useState} from 'react'
import RegForm from "./RegForm"
import {makeStyles} from "@material-ui/core/styles"
import StickyBox from "react-sticky-box";
import useWindowResize from "../Hooks/useWindowResize";
import StepperComp from "../Components/Stepper";
import bgSrc from '../assets/reg_bg.png'
const useStyles = makeStyles((theme) => ({
    root:{
        width:'100vw',
        display:'flex',
        flexDirection:props=>props.isVertical?'column':'row',
        alignItems: 'flex-start',
        background: `url(${bgSrc}) no-repeat center center fixed`,
    },
    stepper:{
        color:'white',
        width:props=>props.isVertical?'100vw':'25vw',
        background:'#003865',
        height: props => props.isVertical?'12vh':props.height,
        maxWidth: props => props.isVertical?'100%':'220px',
        // paddingLeft:'30%'
    }
}))
function Registration(props) {
    const {setUser} = props
    const verticalCondition = window.innerWidth < 900
    const [isVertical, setVertical] =useState( verticalCondition)
    const size = useWindowResize()
    const {width,height} = size;
    useEffect(()=>{
        setVertical(verticalCondition)
    },[size])
    const classes = useStyles({height:height, isVertical:isVertical})
    return (
        <div className={classes.root}>
            <StickyBox >
                <StepperComp className={classes.stepper} isVertical={isVertical}/>
            </StickyBox>
            <RegForm setUser={setUser}/>
        </div>
    )
}

export default Registration

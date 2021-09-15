import React, {useCallback, useEffect, useRef, useState} from 'react'
import makeStyles from "@material-ui/core/styles/makeStyles"
import {ArrowBack, ArrowForward} from "@material-ui/icons"
import {isMobile} from "../Utils/windowsVar"
import {useRecoilState} from "recoil"
import { categoryTitle} from "../States/states"
import ClipLoader from "react-spinners/ClipLoader";
import useKeyPress from "../Hooks/useKeyPress";

const useStyles = makeStyles((theme) => ({
    root: {
        display:'flex',
        justifyContent:'space-between'
    },
    pre:{
        opacity:p=>p.hide?'0.5':"1",
        color:'white',
        cursor:p=>p.hide?'not-allowed':'pointer'
    },
    next:{
        opacity:p=>p.hide?'0.5':"1",
        color:'white',
        cursor:p=>p.hide?'not-allowed':'pointer'
    },
    titleWrapper:{
    },
    categoryTitle:{
        color:'white',
        fontSize:'1.2rem',
        marginTop:'0.3rem',
        textAlign:'center',
        fontFamily: 'FreigSan Pro Medium'
    },
    icons:{
        width:'3rem',
        height:'3rem',
    },
    buttonText:{
        fontFamily: 'FreigSan Pro Medium',
        fontSize:'0.6rem',
        textAlign:'center',
        marginTop:'-0.5rem'
    },
    loadingWrapper:{
        position:'fixed',
        top:'calc(50% - 5vh)',
        left:'calc(50% - 5vh)',
        '&> div':{
            borderColor:'rgba(255,255,255,0.5)',
            borderBottomColor:'transparent'
        }
    },
}))

export default function Video360Buttons({pcApp, configList, open}) {
    const isMobileScreen = isMobile()
    const [videoIndex, setVideoIndex] = useState(0)
    const [videoConfig, setVideoConfig] = useState({})
    const [title, setTitle] = useRecoilState(categoryTitle)
    const [isSingleVideo,setSingle] = useState(false)
    const classes = useStyles({hide:isSingleVideo})
    const [isButtonClicked, setButtonClicked] = useState(false)
    const [isVideoReady,setVideoReady] = useState(false)
    const leftButtonRef = useRef(null)
    const rightButtonRef = useRef(null)
    const arrowLeft = useKeyPress('ArrowLeft')
    const arrowRight = useKeyPress('ArrowRight')
    useEffect(()=>{
        //dont check with lendth
        if(configList&&configList.length>0){
            setVideoConfig(configList[videoIndex])
        }
        if(configList&&configList.length>0){
            setSingle(configList.length ===1)
        }
    },[configList])
    useEffect( ()=>{
        setVideoIndex(0)
        console.log('is video panel open', open, videoIndex)
        window.videoPanel = open;
    },[open])


    const onBackClicked =() =>{
        if(configList.length === 0 && isButtonClicked)return
        if(isSingleVideo)return
        setVideoReady(false)
        const endIdx = configList.length -1
        const nextIdx = videoIndex === 0? endIdx : videoIndex - 1
        setVideoIndex(nextIdx)
        setButtonClicked(true)
        setTimeout(()=>setButtonClicked(false),500)
        if(pcApp)pcApp.fire('mediaplayer:videoIndexUpdate',nextIdx)
    }

    const onNextClicked = () =>{
        if(configList.length === 0 && isButtonClicked)return
        if(isSingleVideo)return
        setVideoReady(false)
        const videoLen = configList.length - 1
        const nextIdx = videoIndex === videoLen? 0: videoIndex + 1
        setVideoIndex(nextIdx)
        setButtonClicked(true)
        setTimeout(()=>setButtonClicked(false),500)
        if(pcApp)pcApp.fire('mediaplayer:videoIndexUpdate',nextIdx)
    }

    useEffect(()=>{
        const videoReadyHandler = b =>setVideoReady(true)
        if(pcApp){
            pcApp.on('videoReady',videoReadyHandler)
        }
        return ()=>{
            if(pcApp){
                pcApp.off('videoReady',videoReadyHandler)
            }
        }
    },[pcApp])

    //todo KEYBINDING for 360video
    const onLeftButtonClick = () =>{
        if(leftButtonRef.current)leftButtonRef.current.click()
    }
    const onRightButtonClick = () =>{
        if(leftButtonRef.current)rightButtonRef.current.click()
    }
    useEffect( ()=>{
        if(open)console.log('video panel is...',open)
        if(arrowLeft){
            if(open)onLeftButtonClick()
        }
        if(arrowRight){
            if(open)onRightButtonClick()
        }
    },[arrowLeft,arrowRight])


    return (
        <div className={classes.root}>
            <div className={classes.pre} onClick={onBackClicked} ref={leftButtonRef}>
                <ArrowBack fontSize={'large'}/>
                <div className={classes.buttonText}>PREVIOUS</div>
            </div>
            <div className={classes.titleWrapper}>
                <div className={classes.categoryTitle}>
                    {title}
                </div>
            </div>
            {!isVideoReady&&
            <div className={classes.loadingWrapper}>
                <ClipLoader  size={'10vh'}/>
            </div>
            }
            <div className={classes.next} onClick={onNextClicked} ref={rightButtonRef}>
                <ArrowForward fontSize={'large'}/>
                <div className={classes.buttonText}>NEXT</div>
            </div>
        </div>
    )
}
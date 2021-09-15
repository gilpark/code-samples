import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useRecoilState} from "recoil"
import makeStyles from "@material-ui/core/styles/makeStyles"
import IconButton from "@material-ui/core/IconButton"
import {GalleryView} from "./GalleryView"
import {isMobile} from "../Utils/windowsVar"
import {categoryState, categoryTitle} from "../States/states"
import CloseIcon from '../Icons/IconClose'
import {updateCRM} from "../Pages/api";
import {useStorageState} from "react-storage-hooks";
import useKeyPress from "../Hooks/useKeyPress";
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        height: '100vh',
        background:'rgba(0,0,0,0.8)',
        display: p=> p.open?'grid':'none',
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'hidden',
        gridTemplateColumns:'minmax(2rem, 1fr) minmax(auto, 65ch) minmax(2rem, 1fr);'
    },
    galleryWrapper:{
        // width: props => props.isMobile?'100%':'80%',
        // maxWidth: '100vh'
        height:'auto',
        width:'100%',
        gridColumn:'1/4',
        // maxWidth: props => props.isMobile?'100%':'80%',
        justifySelf:'center'
    },
    galleryPadding:{
        width:'100%',
        height:'100%'
    },
    paper: {
        height: 140,
        width: 100,
    },
    closeButton:{
        position:'absolute',
        top:'1.5vh',
        right:'1vh',
        color:'white',
        zIndex:'10000001'
    },
    icons:{
        width:'3rem',
        height:'3rem',
    }
}))

const MediaPanel = React.memo(({pcApp, manifest, open,pin}) => {
    const isMobileScreen = isMobile()
    const classes = useStyles({isMobile:isMobileScreen, open:open})
    const [currentCategoryIndex, ] = useRecoilState(categoryState)
    const [title, ] = useRecoilState(categoryTitle)
    const esc = useKeyPress('Escape')
    const exitButtonRef = useRef(null)

    // const [userId, setUserId, error] = useStorageState(sessionStorage, 'uid',"")
    const handleClose = useCallback(() =>{
        if(pcApp)pcApp.fire('ui:statechange',{state:0})
        console.log('-----duration------',window.elapsedSeconds,pin)
        updateCRM({
            index:currentCategoryIndex,
            item:2, //media gallery
            sender:'pc',
            pin:pin,
            duration:window.elapsedSeconds
        }).then(r=>r.json()).then(console.log)
    },[pcApp,currentCategoryIndex,pin])


    //todo KEYBINDING for media panel
    const onExitButtonClick = () =>{
        if(exitButtonRef.current)exitButtonRef.current.click()
    }
    useEffect( ()=>{
        console.log('media x button is interactable...',open)
        if(esc){
            if(open)onExitButtonClick()
        }
    },[esc])
    return (
        <div className={classes.root}>
            <IconButton
                className={classes.closeButton}
                color="default" aria-label="gallery"
                component="span" onClick={handleClose}
                ref={exitButtonRef}
            >
                <CloseIcon color={'white'} className={classes.icons}/>
            </IconButton>

            <div className={classes.galleryWrapper}>
                {/*<div className={classes.galleryPadding}>*/}
                <GalleryView manifest={manifest}
                             isMobile={isMobileScreen}
                             categoryIdx={currentCategoryIndex}
                />
                {/*</div>*/}

            </div>
        </div>
    )
})

export default MediaPanel
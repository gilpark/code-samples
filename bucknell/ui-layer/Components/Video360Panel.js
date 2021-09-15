import React, {useCallback, useEffect, useRef, useState} from 'react'
import makeStyles from "@material-ui/core/styles/makeStyles"
import IconButton from "@material-ui/core/IconButton"
import {isMobile} from "../Utils/windowsVar"
import CloseIcon from '../Icons/IconClose'
import {useRecoilState} from "recoil"
import {categoryState} from "../States/states"
import f from "../Utils/functional.es"
import jsonPath from "../Utils/JsonPath"
import Video360Buttons from "./Video360Buttons"
import AlumniPanel from "./AlmuniPanel";
import {updateCRM} from "../Pages/api";
import {useStorageState} from "react-storage-hooks";
import useKeyPress from "../Hooks/useKeyPress";

const useStyles = makeStyles((theme) => ({
    root: {
        display: p=> p.open?'':'none',
    },
    galleryWrapper:{
        width: props => props.isMobile?'100%':'80%',
    },
    backWrapper:{
        position:'fixed',
        top:'1.5vh',
        right:'1vh',
        color:'white',
        zIndex:'10000001',
        cursor:'pointer'
    },
    backText:{
        color:'white',
        marginTop:'0.8rem'
    },
    backButton:{
        color:'white',
    },
    icons:{
        width:'3rem',
        height:'3rem',
    },
    control:{
        position:'fixed',
        width:'300px',
        bottom:'3rem',
        left:'50vw',
        marginLeft:'-150px'
    }
}))

const Video360Panel = React.memo(({pcApp, manifest, open,pin}) => {
    const isMobileScreen = isMobile()
    const classes = useStyles({isMobile:isMobileScreen, open:open})
    const [currentCategoryIndex, ] = useRecoilState(categoryState)
    const [videoConfigList,setVideoConfigList] = useState([])
    const [selectedConfigList, setSelected] = useState([])
    const esc = useKeyPress('Escape')
    const exitButtonRef = useRef(null)
    const handleClose = useCallback(() =>{
        if(pcApp){
            pcApp.fire('mediaplayer:exit',0)
            if(pcApp)pcApp.timeScale = 1
        }
        updateCRM({
            index:currentCategoryIndex,
            item:1, //video gallery
            sender:'pc',
            pin:pin,
            duration:window.elapsedSeconds
        }).then(r=>r.json()).then(console.log)
    },[pcApp,currentCategoryIndex,pin])


    useEffect(()=>{
        if(manifest){
            const videos =  f.range(0,11).map(idx => {
                return jsonPath(manifest[idx], `$.entries[0].data`)[0] || []
            })
            const parsed = videos.map(arr => arr
                .filter(d => d.title)
                .map((data,index) => ({
                    stream_url:data.stream_url,
                    ios_url:data.ios_url,
                    thumbnail_url:data.thumbnail_url,
                    index:index,
                    preveiw_url:data.preview_url
                })))
            setVideoConfigList(parsed)
        }

    },[manifest])
    //todo KEYBINDING for 360video
    const onExitButtonClick = () =>{
        if(exitButtonRef.current)exitButtonRef.current.click()
    }
    useEffect( ()=>{
        console.log('video x button is interactable...',open)
        if(esc){
            if(open)onExitButtonClick()
        }
    },[esc])


    useEffect(()=>{
        if(videoConfigList.length === 0|| currentCategoryIndex ===11)return
        setSelected(videoConfigList[currentCategoryIndex])
    },[currentCategoryIndex, videoConfigList])
    const isAlumni = currentCategoryIndex === 9
    return (
        <>
            {isAlumni
                ? <AlumniPanel videoConfig={videoConfigList[currentCategoryIndex]} pcApp={pcApp} open={open}/>
                :
                <div className={classes.root}>
                    <div className={classes.backWrapper} onClick={handleClose} ref={exitButtonRef}>
                        <IconButton
                            className={classes.backButton}
                            color="default" aria-label="gallery"
                            component="span"
                            //onClick={handleClose}
                        >
                            <CloseIcon className={classes.icons}/>
                        </IconButton>
                    </div>
                    <div className={classes.control}>
                        <Video360Buttons pcApp={pcApp} configList={selectedConfigList} open={open}/>
                    </div>
                </div>
            }
        </>
    )
})
export default Video360Panel
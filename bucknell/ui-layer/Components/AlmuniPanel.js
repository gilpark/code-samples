import React, {useCallback, useEffect, useRef, useState} from 'react'
import makeStyles from "@material-ui/core/styles/makeStyles"
import IconButton from "@material-ui/core/IconButton"
import CloseIcon from '../Icons/IconClose'
import useWindowResize from "../Hooks/useWindowResize";
import useKeyPress from "../Hooks/useKeyPress";

const useStyles = makeStyles((theme) => ({
    wrapper:{
        display: p=> p.open?'':'none',
    },
    root: {
        width: '100vw',
        height: '100vh',
        background:'rgba(0,0,0,0.8)',
        gridTemplateColumns:'minmax(2rem, 1fr) minmax(auto, 65ch) minmax(2rem, 1fr)',
        gridTemplateRows:'minmax(2rem, 1fr) minmax(auto, 65ch) minmax(2rem, 1fr)',
        overflowY: 'hidden',
        display: p=> p.open?'grid':'none',
    },
    TextWrapper:{
        gridColumn:'1/4',
        gridRow:'2/3',
        justifySelf:'center',
        marginTop:'2rem',
        // maxWidth:'600px',
        // padding:'2rem'
    },
    videoWrapper:{
        marginTop:'1rem',
        marginBottom:'1rem',
        width:'100%',
        maxHeight:'80vh'
    },
    video:{
        width:p=>p.isVertical?"100%":'auto',
        height:p=>p.isVertical?'auto':'60vh'
    },
    closeButton:{
        position:'absolute',
        top:'1.5vh',
        right:'1vh',
        color:'white',
        display: p=> p.open?'':'none',
    },
    icons:{
        width:'3rem',
        height:'3rem',
    }
}))
const AlumniPanel = React.memo(({pcApp, videoConfig, open}) => {
    const [vidSrc, setSrc] = useState(undefined)
    const verticalCondition = window.innerWidth < window.innerHeight
    const [isVertical, setVertical] =useState( verticalCondition)
    const size = useWindowResize()
    const esc = useKeyPress('Escape')
    const exitButtonRef = useRef(null)
    useEffect(()=>{
        setVertical(verticalCondition)
    },[size])
    useEffect(()=>{
        console.log(videoConfig)
        if(videoConfig)setSrc(videoConfig[0].stream_url)
    },[videoConfig])

    const classes = useStyles({isVertical:isVertical, open:open})
    const handleClose = () =>{
        if(pcApp)pcApp.fire('ui:statechange',{state:0})
    }
    const setRef = useCallback(el =>{
        if(el && !open){
            el.pause()
            pcApp.timeScale = 1
        }
        if(el && open){
            el.muted= window.mute
            console.log('mute---',window.mute)
            el.play()
        }
        if(pcApp && open){
            // pcApp.fire('audio:mute',false)
            pcApp.timeScale = 0
        }

        const onMute = b =>{
            if(el) el.muted = b
        }
        if(pcApp){
            pcApp.on('audio:mute',onMute)
        }
    },[open,window.mute])

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
    useEffect( ()=>{
        console.log('video x button is interactable...',open)
        if(esc){
            if(open)onExitButtonClick()
        }
    },[esc])
    return (
        <>
            <div className={classes.root}>
                <div className={classes.TextWrapper}>

                    <div className={classes.videoWrapper}>
                        {vidSrc&&
                        <video
                            className={classes.video}
                            src={vidSrc}
                            playsInline={true}
                            loop={false}
                            ref={setRef}
                            muted={false}
                            controls={true}/>}
                    </div>
                </div>
            </div>
            <IconButton
                className={classes.closeButton}
                color="default" aria-label="gallery"
                component="span" onClick={handleClose}
                ref={exitButtonRef}
            >
                <CloseIcon className={classes.icons}/>
            </IconButton>
        </>

    )
})

export default AlumniPanel
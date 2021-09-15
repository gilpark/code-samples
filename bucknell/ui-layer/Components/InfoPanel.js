import React, {useCallback, useEffect, useRef, useState} from 'react'
import makeStyles from "@material-ui/core/styles/makeStyles"
import IconButton from "@material-ui/core/IconButton"
import f from "../Utils/functional.es"
import jsonPath from "../Utils/JsonPath"
import {useRecoilState} from "recoil"
import {categoryState} from "../States/states"
import CloseIcon from '../Icons/IconClose'
import {updateCRM} from "../Pages/api";
import {useStorageState} from "react-storage-hooks";
import useKeyPress from "../Hooks/useKeyPress";

//todo on mobile take full
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        height: '100vh',
        background:'rgba(0,0,0,0.9)',
        display: p=> p.open?'grid':'none',
        gridTemplateColumns:'minmax(2rem, 1fr) minmax(auto, 100ch) minmax(2rem, 1fr)',
        gridTemplateRows:'minmax(2rem, 1fr) minmax(auto, 100ch) minmax(2rem, 1fr)',
        overflowY: 'hidden'
    },
    TextWrapper:{
        gridColumn:'2',
        gridRow:'2',
        justifySelf:'center',
        // marginTop:'2rem',
        // maxWidth:'100%',
        // padding:'2rem',
        display:'flex',
        alignItems:'center',
    },
    text:{
        fontSize:'clamp(1rem, 4vh, 1.5rem)',
        color:'white',
        marginBottom:'1rem',
        fontFamily: 'FreigSan Pro Medium'
    },
    closeButton:{
        position:'absolute',
        top:'1.5vh',
        right:'1vh',
        color:'white',
    },
    icons:{
        width:'3rem',
        height:'3rem',
    }
}))
const InfoPanel = React.memo(({pcApp, manifest,open,pin}) => {
    const [currentCatIdx, ] = useRecoilState(categoryState)
    // const [categoryTitles, setCategoryTitles] = useState([])
    const [masterArr, setMasterArr] = useState([])
    const [currentItems, setCurrentItems] = useState([])

    const esc = useKeyPress('Escape')
    const exitButtonRef = useRef(null)

    useEffect(()=>{
        if(manifest){
            const infotexts =  f.range(0,10).map(idx => {
                return jsonPath(manifest[idx], `$.entries[2].data`)[0] || []
            })
            setMasterArr(infotexts)

        }
    },[manifest])
    useEffect(()=>{
        if(masterArr.length>0 && currentCatIdx !== 10)
            setCurrentItems(masterArr[currentCatIdx].filter(d => d.title && d.value !== "")
            .map(i => ({...i,value:i.value.replace('•','')})))
    },[currentCatIdx])
    const classes = useStyles({open:open})
    const handleClose = useCallback(() =>{
        if(pcApp)pcApp.fire('ui:statechange',{state:0})
        console.log('-----duration------',window.elapsedSeconds,pin)
        updateCRM({
            index:currentCatIdx,
            item:3, //info
            sender:'pc',
            pin:pin,
            duration:window.elapsedSeconds
        }).then(r=>r.json()).then(console.log)
    },[currentCatIdx, pcApp,pin])


    //todo KEYBINDING for infoPanel
    const onExitButtonClick = () =>{
        if(exitButtonRef.current)exitButtonRef.current.click()
    }
    useEffect( ()=>{
        console.log('info x button is interactable...',open)
        if(esc){
            if(open)onExitButtonClick()
        }
    },[esc])

    return (
        <>
            <div className={classes.root}>
                <div className={classes.TextWrapper}>
                    <ul>
                        {currentItems.map(d =>{
                            const {index, value} = d
                            return (<li key={index} className={classes.text}> {value} </li>)})}
                    </ul>
                </div>
            </div>
            <IconButton
                className={classes.closeButton}
                color="default" aria-label="gallery"
                component="span" onClick={handleClose}
                ref={exitButtonRef}
            >
                <CloseIcon color='white' className={classes.icons}/>
            </IconButton>
        </>

    )
})

export default InfoPanel
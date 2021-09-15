import React, {useEffect, useState} from 'react'
import {makeStyles} from "@material-ui/core/styles"
import {usePlayCanvas} from "../Hooks/usePlayCanvas"
import {isMobile} from "../Utils/windowsVar"
import CategoryPanel from "../Components/CateogryPanel"
import {useRecoilState} from "recoil"
import {categoryState, UI_SATE, categoryTitle} from "../States/states"
import MediaPanel from "../Components/MediaPanel"
import InfoPanel from "../Components/InfoPanel"
import Video360Panel from "../Components/Video360Panel"
import applySrc from '../assets/BTN_Apply.png'
import useWindowResize from "../Hooks/useWindowResize";
import useKeyPress from "../Hooks/useKeyPress";
const useStyles = makeStyles((theme) => ({
    root:{
        
    },
    volumeButton:{
        position:'absolute',
        top:'0.1vh',
        left:'4rem',
        color:'white'
    },
    icons:{
        width:'4rem',
        height:'4rem',
    },
    apply:{
        position:'fixed',
        bottom:'1rem',
        left:'90%',
        marginLeft:p=>p.isVertical?'-11rem':'-8rem',
        width:'13rem',
        padding:'0.5rem 0.5rem 0 0.5rem',
        '& >img':{
            width:'100%'
        },
        display:p=>p.showApply?'':'none',
        cursor:'pointer'
    }
}))
let isLoaded = false
const loadScripts = () =>{
    if(isLoaded) return
    isLoaded = true
    console.log('...........loading playcanvas ..........')
    const start = document.createElement('script')
    const load = document.createElement('script')
    start.src = "__start__.js"
    load.src = "__loading__.js"
    document.body.append(start)
    setTimeout(()=>{
        document.body.append(load)
    },500)

}
const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}
const VirtualTour = React.memo(({pin}) =>{
    const isMobileScreen = isMobile()
    const [currentCategoryIndex, setCurrentCategoryIndex] = useRecoilState(categoryState)
    const [manifest, setManifest] = useState(null)
    const [openMediaPanel, setOpenMediaPanel] = useState(false)
    const [openInfoPanel, setOpenInfoPanel] = useState(false)
    const [showCategoryButton,setShowCategory] = useState(false)
    const [openVideo360Panel,setOpenVidPanel] = useState(false)
    const [showVolumeButton, setShowVolumeButton] = useState(false)
    const [categoryTitles, setCategoryTitles] = useState([])
    const [showCTA,setShowCTA] = useState(true)
    const [title, setTitle] = useRecoilState(categoryTitle)
    const verticalCondition = window.innerWidth < window.innerHeight
    const [isVertical, setVertical] =useState( verticalCondition)
    const [whiteIconColor,setWhiteIconColor] = useState(false)
    const size = useWindowResize()

    useEffect(()=>{
        setVertical(verticalCondition)
    },[size])
    const pcApp = usePlayCanvas()

    useEffect(()=>{
        loadScripts()
        const url = ' https://bucknell-342ca.web.app/api/manifest'
        fetch(url)
            .then(r=>r.json())
            .then(m=>setManifest(m.manifest)).catch(console.error)
    },[pcApp])
    useEffect(()=>{
        if(manifest){
            const titles = manifest
                .map(_=>({title:capitalize(_.category_title.replace('/',' / ')),index:_.category_index}))
            setCategoryTitles(titles)
            setTitle(titles[currentCategoryIndex].title)
        }
    },[manifest])



    useEffect(()=>{
        const doOnTutorialDone = () =>{
            setShowCategory(true)
        }
        const doOnStart  = ()=>{
            setTimeout(()=>{
                setShowVolumeButton(true)
                pcApp.fire('setting:isReact', true)
                window.isPaused = false
                //start timer

            },500)
        }
        const doOnCateogryIndexChange = idx => {
            setCurrentCategoryIndex(idx)
        }
        //todo change it to uisatechange
        const doOnGalleryOpen = b =>  {
            // console.log('open react gallery')
            setOpenMediaPanel(true)
            if(pcApp)pcApp.timeScale = 0
        }
        const doOnUIStateChange = ({state}) =>{
            switch (state){
                case UI_SATE.CATEGORY:
                    if(pcApp)pcApp.timeScale = 0
                    return
                case UI_SATE.VIEWER_IMAGE:
                    setShowCategory(false)
                    setWhiteIconColor(true)
                    setOpenMediaPanel(true)
                    setShowVolumeButton(true)
                    setShowCTA(false)
                    if(pcApp)pcApp.timeScale = 0
                    return
                case UI_SATE.VIEWER_VIDEO:
                    setShowCategory(false)
                    setWhiteIconColor(false)
                    setOpenMediaPanel(true)
                    setShowVolumeButton(true)
                    setShowCTA(false)
                    if(pcApp)pcApp.timeScale = 0
                    return
                case UI_SATE.ZONE_INFO:
                    setShowCategory(false)
                    setOpenInfoPanel(true)
                    setShowVolumeButton(true)
                    setShowCTA(false)
                    setWhiteIconColor(true)
                    if(pcApp)pcApp.timeScale = 0
                    return
                case UI_SATE.VIDEO_360:
                    setShowCategory(false)
                    setWhiteIconColor(false)
                    setOpenVidPanel(true)
                    setShowVolumeButton(true)
                    setShowCTA(false)
                    return
                case UI_SATE.ALUMNI_VIDEO:
                    setShowCategory(false)
                    setWhiteIconColor(true)
                    setOpenVidPanel(true)
                    setShowVolumeButton(true)
                    setShowCTA(false)
                    return
                default: //hide all
                    setWhiteIconColor(false)
                    setOpenMediaPanel(false)
                    setOpenInfoPanel(false)
                    setOpenVidPanel(false)
                    setShowVolumeButton(true)
                    setShowCategory(true)
                    setShowCTA(true)
                    if(pcApp)pcApp.timeScale = 1
                    return
            }
        }
        if(pcApp){
            pcApp.on('tutorial:complete',doOnTutorialDone)
            pcApp.on('start',doOnStart)
            pcApp.on('categorymanager:categoryIndexUpdate',doOnCateogryIndexChange)
            pcApp.on('react:gallery',doOnGalleryOpen)
            pcApp.on('ui:statechange', doOnUIStateChange)
        }
        return ()=>{
            if(pcApp){
                //cleanup
                pcApp.off('start',doOnStart)
                pcApp.off('tutorial:complete',doOnTutorialDone)
                pcApp.off('categorymanager:categoryIndexUpdate',doOnCateogryIndexChange)
                pcApp.off('react:gallery',doOnGalleryOpen)
                pcApp.off('ui:statechange', doOnUIStateChange)
            }
        }
    },[pcApp,window.pc.Application.getApplication()])

    useEffect(()=>{
        if(categoryTitles.length>0 && categoryTitles[currentCategoryIndex])
            setTitle(categoryTitles[currentCategoryIndex].title)
    },[currentCategoryIndex])


    const classes = useStyles({isVertical:isVertical, showApply:showCTA})
    return (
        <div >
            <Video360Panel pcApp={pcApp} manifest={manifest}
                           pin={pin}
                           open={openVideo360Panel}/>
            <CategoryPanel pcApp={pcApp} manifest={manifest} showVolume={setShowVolumeButton}
                           whiteIconColor={whiteIconColor}
                           open={showCategoryButton}
                           showVolumeButton={showVolumeButton}
            />
            <MediaPanel pcApp={pcApp} manifest={manifest}
                        pin={pin}
                        open={openMediaPanel} />
            <InfoPanel pcApp={pcApp} manifest={manifest}
                       pin={pin}
                       open={openInfoPanel}/>
            {showVolumeButton &&
            <div className={classes.apply} onClick={()=> {
                window.open('https://www.bucknell.edu/meet-bucknell/plan-visit?utm_source=vr_experience&utm_medium=web_experience&utm_campaign=vr_web_experience&utm_term=visit_link')
            }}>
                <img src={applySrc} alt={'apply'}/>
            </div>
            }

        </div>

    )
})

export default VirtualTour

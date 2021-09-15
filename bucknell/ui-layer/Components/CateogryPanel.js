import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useRecoilState} from "recoil"
import {
    categoryState,
    uiState,UI_SATE
} from "../States/states"
import makeStyles from "@material-ui/core/styles/makeStyles"
import IconButton from "@material-ui/core/IconButton"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Divider from "@material-ui/core/Divider"
import logoSrc from '../assets/logo.png'
import useWindowResize from "../Hooks/useWindowResize"
import IconCatCommunityLifeAtBucknell from "../Icons/IconCatCommunityLifeAtBucknell"
import IconCatOpportunities from "../Icons/IconCatOpportunities"
import IconCatCollegeOfArtsAndSciences from "../Icons/IconCatCollegeOfArtsAndSciences"
import IconCatCollegeOfEngineering from "../Icons/IconCatCollegeOfEngineering"
import IconCatCollegeOfManagement from "../Icons/IconCatCollegeOfManagement"
import IconCatHousingAndDining from "../Icons/IconCatHousingAndDining"
import IconCatPerformingArts from "../Icons/IconCatPerformingArts"
import IconCatAthletics from "../Icons/IconCatAthletics"
import IconCatLewisbergAndBeyond from "../Icons/IconCatLewisbergAndBeyond"
import IconCatAlumniOutcomes from "../Icons/IconCatAlumniOutcomes"
import MenuIcon from '../Icons/IconHamburger'
import CloseIcon from '../Icons/IconClose'
import VolumeOn from "../Icons/IconVolOn";
import VolumeOff from "../Icons/IconVolOff";
import useKeyPress from "../Hooks/useKeyPress";
import ccOnSrc from '../assets/ICON_CloseCaptions_On.png'
import ccOffSrc from '../assets/ICON_CloseCaptions_Off.png'
const createIcon = idx =>{
    const iconlist =[
        IconCatCommunityLifeAtBucknell,
        IconCatOpportunities,
        IconCatCollegeOfArtsAndSciences,
        IconCatCollegeOfEngineering,
        IconCatCollegeOfManagement,
        IconCatHousingAndDining,
        IconCatPerformingArts,
        IconCatAthletics,
        IconCatLewisbergAndBeyond,
        IconCatAlumniOutcomes
    ]
    return iconlist[idx]
}

const useStyles = makeStyles((theme) => ({
    innerWrapper:{
        marginTop:'6rem',

        display:'flex',
        flexDirection:'column'
    },
    root: {
        overflowY:'auto',
        overflowX:'hidden',
        position:'fixed',
        width:'30vw',
        minWidth:'250px',
        maxWidth:'300px',
        height:'100%',
        background:'linear-gradient(0deg, rgba(0,130,186,0.9) 0%, rgba(0,56,101,0.9) 80%)',
        transform:p => p.show? 'translateX(0px)' :'translateX(-350px)',
        transition:'transform 0.3s ease-in',
        zIndex:'10000000',
        fontFamily: 'FreigSan Pro Sem',
        display: p=> p.open?'':'none',
    },
    paper: {
        height: 140,
        width: 100,
    },
    buttonWrapper:{
        top:'1vh',
        left:'1vh',
        position:'absolute',
        // display:'flex',
        width:'25vw',
        // justifyContent:'space-between'
    },
    categoryButton:{
        display: p=> p.open?'':'none',
        color:'white',
        zIndex:'10000001'
    },
    TextItem:{
        fontSize:'0.9rem',
        color:'white',
        marginLeft:'0.2rem',
        fontFamily: 'FreigSan Pro Medium'
    },
    titleListWrapper:{
    },

    logoContainer:{
        bottom:'0',
        width:'100%',
        padding:'2em 3rem 0rem 3rem'
    },
    tooltip:{},
    tooltipText:{
        color:'white',
        marginLeft:'2rem',
        marginBottom:'0.7rem',
        fontSize:p=>p.isSmall?'0.8rem':'0.9rem'
    },
    tooltipDivider:{
        background:'#54C2E0',
        marginLeft:'1.5rem',
        width: p=>p.isSmall?'210px':'225px',
        marginBottom:'0.7rem'
    },
    listDivider:{
        background:'rgba(0,0,0,0)'
    },
    categoryIcon:{
        width:'3rem',
        height:'3rem',
        marginTop:'-0.6rem'
    },
    icons:{
        width:'3rem',
        height:'3rem',
    },
    ccIcon:{
        width:'3rem',
        height:'3rem',
        zIndex:'11111111',
        padding:'1.2rem 0.5rem 0.5rem 0.5rem',
        '&>img':{
            width:'100%',
            height:'auto'
        }
    },
    ccIcon2:{
        width:'100%',
        height:'2rem',
        position:'absolute',
        '&>img':{
            width:'2rem',
            height:'auto'
        },
        marginTop:'-4.2rem',
        display:'flex',
        flexDirection:'row-reverse',
        paddingRight:'1rem'
    },
    volumIcons:{
        width:'4rem',
        height:'4rem',
        zIndex:'10000001'
    }
}))
const CreateCategoryItem = React.memo(({title, idx, cb, ready,pcApp}) => {
    const buttonRef = useRef(null)
    const classes = useStyles()
    const onCategoryClick = idx =>(e) =>{
        if(cb) cb(idx)
    }
    const Icon = createIcon(idx)
    const num = useKeyPress(idx !== 9? (idx+1).toString():'0')
    const ButtonClick = () =>{
        if(buttonRef.current)buttonRef.current.click()
    }
    useEffect( ()=>{
        if(num){
            if(ready && pcApp) pcApp.fire('gamemanager:nav',{
                category: idx,
                hotspot: 0,
                uiAnchor: null,
                transform: null,
                type:'teleport'
            })
        }
    },[num,pcApp])

    return (
        <>
            <ListItem button onClick={onCategoryClick(idx)} alignItems="flex-start" ref={buttonRef}>
                <Icon className={classes.categoryIcon}/>
                <ListItemText primary={title} classes={{primary:classes.TextItem}}/>
            </ListItem>
            <Divider className={classes.listDivider}/>
        </>
    )
})
const CategoryPanel = React.memo(({pcApp, manifest,showVolume,open,showVolumeButton,whiteIconColor}) => {
    const [categoryTitles, setCategoryTitles] = useState([])
    const [categoryOpen,setCategoryOpen] = useState(false)
    const [currentUIState, ] = useRecoilState(uiState)
    const [currentCategoryIndex, ] = useRecoilState(categoryState)
    const [showSub, setSub] = useState(false)
    const smallScreenCondition = window.innerWidth < 400
    const [isSmallDisplay, setSmallDisplay] =useState(smallScreenCondition)
    const [volumeState, setVolumeState] = useState(true)
    const exitAndMenuButtonRef = useRef(null)
    const volumeButtonRef = useRef(null)
    // const m = useKeyPress('m')
    const esc = useKeyPress('Escape')
    const v = useKeyPress('v')
    const size = useWindowResize()
    const panelRef = useRef(null)

    useEffect(()=>{
        setSmallDisplay(smallScreenCondition)
    },[size])
    const isAlumni = currentCategoryIndex === 9
    const handleCategoryChange = useCallback((idx) => {
        pcApp.fire('ui:statechange',{state:0})
        const isOpen = !categoryOpen
        setCategoryOpen(isOpen)

        if(currentCategoryIndex !== idx)
        pcApp.fire('gamemanager:nav',{
            category: idx,
            hotspot: 0,
            uiAnchor: null,
            transform: null,
            type:'teleport'
        })
        if(exitAndMenuButtonRef.current)exitAndMenuButtonRef.current.click()
    },[open,pcApp])

    const handleCategoryOpen = () =>{
        if(!categoryOpen) panelRef.current.scrollTop = 0
        const isOpen = !categoryOpen
        setCategoryOpen(isOpen)
        showVolume(!isOpen)
        if(!isOpen){
            console.log('clicking canvas')
            const can = document.getElementById('application-canvas')
            can.focus()
        }
        if(pcApp)pcApp.timeScale = isOpen? 0: 1;
    }
    useEffect(()=>{
        if(manifest) {
            setCategoryTitles(manifest
                .map(_=>({title:_.category_title,index:_.category_index})))
        }
    },[manifest])
    useEffect(()=>{
        setCategoryOpen(currentUIState === UI_SATE.CATEGORY)
    },[currentUIState])

    const handleVolume = () => {
        if(pcApp)pcApp.fire('audio:mute',volumeState)
        setVolumeState(b => {
            window.mute = b
            console.log('mute---',window.mute)
            return !b
        })

    }


    //todo KEYBINDING for category panel
    const onVolumeButtonClick = () =>{
        if(volumeButtonRef.current)volumeButtonRef.current.click()
    }
    useEffect( ()=>{
        console.log('categorymaneu interactable...',open)
        if(v){
            if(showVolumeButton)onVolumeButtonClick()
        }
    },[esc,v])

    const handleSub = () =>{
        if(pcApp)pcApp.fire('audioManager:hideSub', showSub)
        setSub(b => {
            return !b
        })
    }
    const classes = useStyles({show: categoryOpen, isSmall:isSmallDisplay, open:open})
    return (
        <>
            <div className={classes.root}
                 ref={panelRef}
            >
                <div className={classes.innerWrapper} >
                    <div className={classes.ccIcon2} onClick={handleSub}>
                        <img src={showSub?ccOnSrc:ccOffSrc}/>
                    </div>
                <div className={classes.titleListWrapper}>
                    <div className={classes.tooltip}>
                        <div className={classes.tooltipText}>
                            Click to go Straight to an exhibit
                        </div>
                        <Divider className={classes.tooltipDivider}/>
                    </div>
                    {categoryTitles.filter(d => d.title !== 'tutorial').map((d,i)=>{
                        return <CreateCategoryItem
                            ready={open}
                            // categoryOpen={categoryOpen}
                            tabIndex={0}
                            key={d.index}
                            title={d.title}
                            idx={d.index}
                            cb ={handleCategoryChange}
                            pcApp ={pcApp}
                        />
                    })}
                </div>
                <div className={classes.logoContainer}>
                    <img src={logoSrc} style={{
                        width:'100%',
                        objectFit:'contain'
                    }}/>
                </div>
            </div>
            </div>
            <div className={classes.buttonWrapper}>
                <IconButton
                    className={classes.categoryButton}
                    color="default" aria-label="category menu"
                    component="span" onClick={handleCategoryOpen}
                    ref={exitAndMenuButtonRef}
                >
                    {categoryOpen?<CloseIcon className={classes.icons} color='white'/>

                    :<MenuIcon color={whiteIconColor?'white':'#003865'} className={classes.icons}/>}


                </IconButton>
                {/*{*/}

                {/*    categoryOpen&&*/}
                {/*    <div className={classes.ccIcon}>*/}
                {/*        <img src={ccOnSrc}/>*/}
                {/*    </div>*/}
                {/*}*/}
                {showVolumeButton &&   <IconButton
                    className={classes.volumeButton}
                    color="default" aria-label="gallery"
                    component="span" onClick={handleVolume}
                    ref={volumeButtonRef}
                >
                    {volumeState? <VolumeOn
                        color={whiteIconColor?'white':'#003865'}
                        className={classes.volumIcons}/>
                        :<VolumeOff
                            color={whiteIconColor?'white':'#003865'}
                            className={classes.volumIcons}/>}
                </IconButton>}
            </div>

        </>

    )
})

export default CategoryPanel
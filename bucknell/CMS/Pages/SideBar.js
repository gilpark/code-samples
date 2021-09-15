import React, {memo, useCallback, useEffect, useState} from 'react'
import {makeStyles} from "@material-ui/core/styles"
import logoSrc from "../assets/Bucknell_B_Icon.png"
import IconButton from "@material-ui/core/IconButton"
import ListAltIcon from "@material-ui/icons/ListAlt"
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary"
import SettingsIcon from "@material-ui/icons/Settings"
import ListItem from "@material-ui/core/ListItem"
import List from "@material-ui/core/List"
import ListItemText from "@material-ui/core/ListItemText"
import Divider from '@material-ui/core/Divider'
import {useHistory} from "react-router-dom"
import routes from "../routes"
import {useRecoilState} from "recoil";
import {ENTRY_ID, headerTitleState, useCategories} from "./Entry/api/state";
import IconCatCommunityLifeAtBucknell from "../assets/Icons/IconCatCommunityLifeAtBucknell";
import IconCatOpportunities from "../assets/Icons/IconCatOpportunities";
import IconCatCollegeOfArtsAndSciences from "../assets/Icons/IconCatCollegeOfArtsAndSciences";
import IconCatCollegeOfEngineering from "../assets/Icons/IconCatCollegeOfEngineering";
import IconCatCollegeOfManagement from "../assets/Icons/IconCatCollegeOfManagement";
import IconCatHousingAndDining from "../assets/Icons/IconCatHousingAndDining";
import IconCatPerformingArts from "../assets/Icons/IconCatPerformingArts";
import IconCatAthletics from "../assets/Icons/IconCatAthletics";
import IconCatLewisbergAndBeyond from "../assets/Icons/IconCatLewisbergAndBeyond";
import IconCatAlumniOutcomes from "../assets/Icons/IconCatAlumniOutcomes";
import memoize from "memoizee"
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import {functional as f} from '../utils/functional.es'
import PeopleIcon from '@material-ui/icons/People';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        minWidth:'250px',
        display:'flex',
        flexDirection:'row',
        flexGrow:1,
        position:'fixed',
        background:theme.palette.background.default
    },
    sideBar: {
        height:'100%',
        minWidth:'50px',
        display:'flex',
        flexDirection:'column',
        background:theme.palette.secondary.main
    },
    category:{
        // margin:theme.spacing(1),
        height:'100%',
        minWidth:'200px',
        display:'flex',
        flexDirection:'column',
        backgroundColor: theme.palette.primary.main,
    },
    logoWrapper:{
        maxWidth:'50px',
        width:'100%',
        height:'auto',
        paddingTop:'0.2rem',
        background:theme.palette.primary.dark
    },
    logoImage:{
        margin:'0.3rem',
        objectFit: 'cover',
        maxWidth:'60px',
        width:'calc(100% - 0.6rem)',
        height:'auto',

    },
    TextItem:{
        color:'white',
        fontSize:'0.8rem',
        fontFamily:'FreigSan Pro Medium'
    },
    icons:{
        color:'rgba(0,0,0,1)'
    },
    categoryIcon:{
        width:'2.5rem',
        height:'2.5rem',
        marginTop:'-0.6rem',
        marginLeft:'-0.7rem',
        marginRight:'0.3rem'
    },
    // listItem:{
    //     marginLeft:'1rem'
    // },
    firstLevelIcon:{
        borderRadius:'0'
    },
    firstLevelIconActive:{
        background:theme.palette.secondary.dark,
        borderRadius:'0'
    }
}))
const createIcon = memoize((idx) =>{
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
        IconCatAlumniOutcomes,
        IconCatAlumniOutcomes
    ]
    return iconlist[idx]
})

const CreateCategoryItem = memo(({title, uid,id})=> {
    const classes = useStyles()
    const history = useHistory()
    const [headerTitle,setHeaderTitle] = useRecoilState(headerTitleState)
    const onCategoryClick = catID =>(e) =>{
        history.push(`${routes.pages.categories}/${catID}`)
        setHeaderTitle({cat:title,idx:id,entry:ENTRY_ID.CATEGORY})
    }
    const Icon = createIcon(id)
    return (
        <>
            <ListItem
                // className={classes.listItem}
                button onClick={onCategoryClick(uid)} alignItems="flex-start">
                <Icon className={classes.categoryIcon}/>
                <ListItemText
                    componen={'p'}
                    primary={title}
                    classes={{primary:classes.TextItem}}/>
            </ListItem>
            <Divider/>
        </>
    )
})

const SideBar = ({userInfo,logOut})=> {
    const classes = useStyles()
    const {categories}  = useCategories()
    const firstCategoryID = categories[0].uid
    const history = useHistory()
    const [isAdmin,setAdmin] = useState(false)
    const [isDev,setDev] = useState(false)

    useEffect(()=>{
        if(userInfo && userInfo.tier){
            setAdmin(userInfo.tier.toLowerCase() !== 'author')
            setDev(userInfo.tier === 'dev')
            // const isAdmin = userInfo.tier.toLowerCase() !== 'author'
            // const isDev = userInfo.tier === 'dev'
        }

    },[userInfo])

    const filteredCategory = f.go(
        categories,
        f.take(isDev?11:10)
    )
    const [firstLevelIconState,setIconState] = useState('none')

    const handlePageChange = (path) => e =>{
        history.push(path)
    }
    const checkPath = (partialPath) =>  history.location.pathname.includes(partialPath)
    const sideFirstLevelIconState =
        checkPath('categories')
            ?'category'
            : checkPath('mediaLibrary')
            ?'library'
            : checkPath('settings')
                ?'setting'
                :checkPath('meta')
                ?'library':'none'
    useEffect(()=>{
        setIconState(sideFirstLevelIconState)
    },[history.location.pathname])

    const firstLevelIconClassName = state => firstLevelIconState === state
        ? classes.firstLevelIconActive
        :classes.firstLevelIcon

    const onLogOut = () =>{
        if(logOut){
            history.replace('/')
            logOut()
                .then(console.log())
                .then(_=>{
                    console.log('should logout')
                })
        }

    }
    return (
        <div className={classes.root}>
            <div className={classes.sideBar}>
                <div className={classes.logoWrapper}>
                    <img src={logoSrc} alt={'logo'} className={classes.logoImage}/>
                </div>
                <IconButton aria-label="content"
                            className={firstLevelIconClassName('category')}
                            size="medium"
                            onClick={ handlePageChange(`${routes.pages.categories}/${firstCategoryID}`)}>
                    <ListAltIcon
                        className={classes.icons}
                        fontSize="inherit" />
                </IconButton>
                <IconButton aria-label="media-library"
                            className={firstLevelIconClassName('library')}
                            size="medium"
                            onClick={handlePageChange(`${routes.pages.mediaLibrary}`)}>
                    <PhotoLibraryIcon
                        className={classes.icons}
                        fontSize="inherit" />
                </IconButton>

                {isAdmin&&
                <IconButton aria-label="settings"
                            className={firstLevelIconClassName('setting')}
                            size="medium"
                            onClick={handlePageChange(`${routes.pages.settings}`)}>
                    <PeopleIcon
                        className={classes.icons}
                        fontSize="inherit" />
                </IconButton>
                }

                <IconButton aria-label="logout"
                            className={classes.firstLevelIcon}
                            size="medium"
                            onClick={onLogOut}
                    >
                    <ExitToAppIcon
                        className={classes.icons}
                        fontSize="inherit" />
                </IconButton>
            </div>
            <List component="nav" className={classes.category}>
                {filteredCategory
                    .map((d) =>{
                    return <CreateCategoryItem key={d.index} id={d.index} title={d.title} uid={d.uid}/>
                })}
            </List>
        </div>
    )
}

export default SideBar

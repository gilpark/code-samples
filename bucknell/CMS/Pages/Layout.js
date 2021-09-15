import React, {Suspense, useEffect, useState} from 'react'
import {makeStyles} from "@material-ui/core/styles";
import SideBar from "./SideBar";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useHistory,
    useLocation,
    useParams,
    useRouteMatch

} from "react-router-dom"
import routes from "../routes"
import EntryPage from "./Entry"
import MediaLibraryPage from "./MediaLibrary"
import MetadataPage from "./MetaData"
import SettingPage from "./Setting"
import logoSrc from '../assets/logo.png'
import ErrorIcon from '@material-ui/icons/Error'

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width:'100%',
        // background:theme.palette.background.default
    },
    //need to be sticky later
    content:{
        height: '100%',
        width:'auto',
        marginLeft:'300px'
    },
    content_main:{
        height: 'auto',
        width:'100%',
        marginTop:"0",
        display: 'grid',
        justifyContent: 'center',
        alignContent: 'start',
        paddingTop:'5rem'
    },
    notfoundText :{
        color:'white',
        fontSize:'3rem',
        textAlign:'center'
    },
    logo:{
        maxWidth:'20rem',
        opacity:'0.3'
    },
    iconWrapper:{
        display:'flex',
        justifyContent:'center'
    },
    icon:{
        width:'5rem',
        height:'5rem',
        color:'white'
    }
}))

const PageNotFound = React.memo(() =>{
    const classes = useStyles()
    const {...rest} = useParams()
    let { path, url } = useRouteMatch()

    return (
        <div className={classes.content_main} >
            <div className={classes.iconWrapper}>
                <ErrorIcon className={classes.icon}/>
            </div>
            <h1 className={classes.notfoundText}>{'Page Not Found'}</h1>
            <img className={classes.logo} src={logoSrc}/>
        </div>
    )
})
const Layout = React.memo(({userInfo,logOut})=> {
    const classes = useStyles()
    const history = useHistory()
    const location = useLocation()
    const {...rest} = useParams()

    const isSettingPage = location.pathname.toLowerCase().includes('settings')

    useEffect(()=>{
        if(userInfo && userInfo.tier){
            const isAdmin = userInfo&&userInfo.tier.toLowerCase() !== 'author'
            if(!isAdmin && isSettingPage)history.push('/')
        }

    },[location])
    return (
            <div className={classes.root}>
                <aside>
                    <SideBar userInfo={userInfo} logOut={logOut}/>
                </aside>
                <main className={classes.content}>
                    <Switch>
                        <Route path={routes.categories.category} component={EntryPage}/>
                        <Route path={routes.pages.mediaLibrary} component={MediaLibraryPage} exact={true}/>
                        <Route path={routes.pages.metadata} component={()=><MetadataPage userInfo={userInfo}/>} exact={true} />
                        <Route path={routes.pages.settings} component={()=><SettingPage userInfo={userInfo}/>}/>
                        <Route path={routes.pages.pageNotFound} component={PageNotFound} />
                    </Switch>
                </main>
            </div>
    )
})

export default Layout

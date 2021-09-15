import React, {useEffect, useState} from 'react'
import RegForm from "./RegForm"
import {makeStyles} from "@material-ui/core/styles"
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
import Registration from "./Registration"
import VirtualTour from "./VirtualTour"
import { useStorageState } from 'react-storage-hooks'
import {IfElseThen} from "../Components/IfElseThen";
import LoginForm from "../Components/Login";
const useStyles = makeStyles((theme) => ({
}))
function Layout() {
    const [userId, setUserId, error] = useStorageState(sessionStorage, 'uid',"")
    useEffect(()=>{
        console.log('[user id]', userId)
    },[userId])
    const registration = '/'
    const virtualTour = '/virtualExperience'
    //todo continue from here
    const isUserId = userId !== ""
    const VirtualTourView = IfElseThen(isUserId, VirtualTour, LoginForm)
    return (
        <Switch>
            <Route path={registration} component={()=><Registration setUser={setUserId}/>} exact={true} />
            <Route path={virtualTour} component={()=> <VirtualTourView setUser={setUserId} pin={userId}/>}/>
            <Route path={'*'} component={()=><h1>PAGE NOT FOUND</h1>} />
        </Switch>
    )
}

export default Layout

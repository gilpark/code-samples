import React, {Suspense, useEffect, useState} from 'react'
import './App.css'
import {useFirebaseAuth} from "./Hooks/useFirebaseAuth"
import {LoadingIndicator} from './Component/isLoading'
import LoginComp from './Component/Login'
import {IfElseThen} from "./Component/IfElseThen"
import {makeStyles} from "@material-ui/core/styles";
import Layout from "./Pages/Layout";
import {BrowserRouter as Router} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width:'100%'
    }
}))

function App() {
    const [loginState, user, logIn, logOut, error] = useFirebaseAuth()
    const classes = useStyles()
    const AppView = IfElseThen(loginState, Layout, LoginComp)
    return (
            <Router>
                <AppView loginCallback={logIn}  userInfo={user} logOut ={logOut}/>
            </Router>
    )
}
export default App

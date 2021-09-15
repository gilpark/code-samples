import React, {useEffect, useState} from 'react'
import './App.css'
import {makeStyles} from "@material-ui/core/styles"
import {BrowserRouter as Router} from "react-router-dom"
import Layout from "./Pages/Layout"

const useStyles = makeStyles((theme) => ({
    root:{
        width: '100%',
        height: '100vh',
    },
}))
function App() {
    return (
        <Router>
            <Layout/>
        </Router>

    )
}

export default App;

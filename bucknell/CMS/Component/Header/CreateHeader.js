import React from 'react'
import {makeStyles} from '@material-ui/core/styles'

//todo header background setup here
//todo max header width setup here
const useStyles = makeStyles((theme) => ({
    headerRoot:{
        maxWidth:'1000px',
        width:'calc(100% - 300px)',
        display:'flex',
        justifyContent:'space-between',
        position:'fixed',
        background:theme.palette.background.default,
        zIndex:1000
    },
    titleWrapper:{
        display:'flex',
        flexDirection:'column',
        alignItems:'flex-start'
    },
    controlsWrapper:{
       marginRight:'1rem'
    },
}))

export default function CreateHeader(TitleComp, ControllerComp){
    const classes = useStyles()
    return (props) => {

        return (
            <div className={classes.headerRoot}>
                <div className={classes.titleWrapper}>
                    <TitleComp {...props}/>
                </div>
                <div className={classes.controlsWrapper}>
                    <ControllerComp {...props}/>
                </div>
            </div>
        )
    }
}

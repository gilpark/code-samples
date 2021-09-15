import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {Box, IconButton, Typography} from "@material-ui/core";
import MovieIcon from "@material-ui/icons/Movie";
import HeadsetIcon from "@material-ui/icons/Headset";
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation'
import ListAltIcon from "@material-ui/icons/ListAlt";
import {useRecoilState} from "recoil";
import {entryUpdateFlag, openFileDialogState} from "../../Pages/Entry/api/state";
import {targetFileFieldState} from "../../States/states";
import AddIcon from "@material-ui/icons/Add";
const useStyles = makeStyles((theme) => ({
    //todo update width and height
    img:{
        width:'100%',
        height:'auto',
        objectFit:'contain',
        maxWidth:'500px',
        maxHeight:'300px',
    },
    //calculate fontsize from here
    icons:{
        color:'rgba(255,255,255,0.5)',
        fontSize:'5rem',
        margin:'auto',
    },
    wrapper:{
        width:'100%',
        height:'100%',
        display:'flex',
        justifyItems:'center',
        minHeight:'200px'
    },
    controlOverlay:{
        top:'0',
        left:'0',
        position:'absolute',
        width:'100%',
        display:'flex',
        background:'rgba(188,187,187,0.85)',
        minHeight:'2.5rem',
        justifyContent:'space-between',
        opacity: p=> p.isHover?'1':'0.4',
        alignItems:'center',
        '&>p':{
            color:'black',
            marginLeft:'1rem'
        },
        transition:'opacity 0.2s'
    },

}))

const SelectFileComp = React.memo(({state,className})=>{
    const classes = useStyles()
    const [open, setOpen] = useRecoilState(openFileDialogState)
    const [, setTarget] = useRecoilState(targetFileFieldState)
    const [updateFlag,setUpdateFlag] = useRecoilState(entryUpdateFlag)
    const openDialogWindow = () =>{
        setOpen(true)
        setTarget(state)
        setUpdateFlag(true)
    }
    useEffect(()=>()=> setTarget({}),[])
    return (
        <Box className={className}

        >
            <div className={classes.wrapper}
                 onClick={openDialogWindow}
            >
                <AddIcon className={classes.icons}
                         aria-hidden="true" fontSize="large"
                         type={'font'} />
                {/*<div className={classes.controlOverlay}>*/}
                {/*    <Typography>{'click to select file'}</Typography>*/}

                {/*</div>*/}
            </div>

        </Box>
    )
})

export default SelectFileComp
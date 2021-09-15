import React, {useEffect} from "react";
import Fab from "@material-ui/core/Fab";
import NavigationIcon from '@material-ui/icons/Navigation';
import makeStyles from "@material-ui/core/styles/makeStyles";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil'
import {
    categoryWindowOpenState,
    mediaWindowOpenState,
    navButtonState,
    PANEL_TYPE,
    panelOpenState
} from "../States/states";
import CategoryPanel from "./CateogryPanel";

const useStyles = makeStyles((theme) => ({
    button: {
        width:'50px',
        height:'50px',
    },
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
        position:'fixed',
        left: '50%',
        bottom:'5%',
        marginLeft: props => props.three?`calc(-${theme.spacing(2)}px - 100px)`:'-25px',
    },
}))

export  default function MainMenu({three}) {
    const classes = useStyles()
    const [categoryPanelOpen,setCatPanelOpen] = useRecoilState(categoryWindowOpenState)
    const [mediaPanelOpen,setMediaPanelOpen] = useRecoilState(mediaWindowOpenState)

    const displayNavButton = !categoryPanelOpen && !mediaPanelOpen
    const onClick = () =>{
        setCatPanelOpen(b=>{
            return !b
        })
    }
    const onNavButtonClick = (direction) => (e) => {
        if(categoryPanelOpen) setCatPanelOpen(false)
    }
    return (
        <>
            {displayNavButton &&
            <div className={classes.root}>
                <Fab className={classes.button} onClick={onClick} >
                    <NavigationIcon />
                </Fab>
            </div>
            }
            <CategoryPanel three={three}/>
        </>
    )
}
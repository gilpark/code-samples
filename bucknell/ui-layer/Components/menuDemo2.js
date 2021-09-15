import React, {useEffect} from "react";
import Fab from "@material-ui/core/Fab";
import NavigationIcon from '@material-ui/icons/Navigation';
import makeStyles from "@material-ui/core/styles/makeStyles";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import MenuIcon from '@material-ui/icons/Menu'
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
        // alignSelf:'center',
        left: '50%',
        bottom:'5%',
        marginLeft: props => props.three?`calc(-${theme.spacing(2)}px - 100px)`:'-25px',
    },
}))

export  default function MainMenu2({three}) {
    const classes = useStyles({three:three})
    const [categoryPanelOpen,setCatPanelOpen] = useRecoilState(categoryWindowOpenState)
    const [mediaPanelOpen,setMediaPanelOpen] = useRecoilState(mediaWindowOpenState)
    const [navState,setNavState] = useRecoilState(navButtonState)
    const displayNavButton = !categoryPanelOpen && !mediaPanelOpen
    const onClick = () =>{
        setMediaPanelOpen(true)
    }
    const onNavButtonClick = (direction) => (e) => {
        setNavState(pre => pre+direction)
    }
    return (
        <>
            {displayNavButton &&
            <div className={classes.root}>
                <Fab className={classes.button} onClick={onNavButtonClick(-1)} >
                    <NavigateBeforeIcon />
                </Fab>
                <Fab className={classes.button} onClick={onClick} >
                    <MenuIcon />
                </Fab>
                <Fab className={classes.button} onClick={onNavButtonClick(1)} >
                    <NavigateNextIcon />
                </Fab>
            </div>
            }
            <CategoryPanel three={three}/>
        </>
    )
}
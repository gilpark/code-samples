import React from 'react'
import makeStyles from "@material-ui/core/styles/makeStyles"
import Fab from "@material-ui/core/Fab"
import CloseIcon from '@material-ui/icons/Close'
import {useRecoilState} from "recoil"
import {categoryWindowOpenState, mediaWindowOpenState} from "../States/states"
import useTheme from "@material-ui/core/styles/useTheme"
import useMediaQuery from "@material-ui/core/useMediaQuery"
const useStyles = makeStyles((theme) => ({
    root: {
        alignSelf:'flex-end',
        position:'fixed',
        transform:'translate(0px,0px)',
        color:'white'
        // margin: theme.spacing(1),
    },
    icon:{
        maxWidth:'50px',
        maxHeight:'50px',
        // background:'#003D69',
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}))

export function ExitButton({onClose}) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
                <CloseIcon fontSize={'large'} onClick={onClose}  />
        </div>

    )
}

const useSwitchButtonsStyles = makeStyles((theme) => ({
    root: {
        alignSelf:'center',
        position:'fixed',
        transform: props=> props.fullScreen ?'translate(0px,90vh)':'translate(0px,61vh)',
        // margin: theme.spacing(1),
    },
    galleryIcon:{
        // maxWidth:'40px',
        maxHeight:'40px',
        background: props=> props.cat ?'#003D69':'#ff5100',
        margin: theme.spacing(1),
    },
    categoryIcon:{
        // maxWidth:'40px',
        maxHeight:'40px',
        background:props=> props.media ?'#003D69':'#ff5100',
        margin: theme.spacing(1),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}))
export function SwitchButtons() {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [categoryPanelOpen,setCatPanelOpen] = useRecoilState(categoryWindowOpenState)
    const [mediaPanelOpen,setMediaPanelOpen] = useRecoilState(mediaWindowOpenState)
    const classes = useSwitchButtonsStyles({cat:categoryPanelOpen, media:mediaPanelOpen, fullScreen:fullScreen})
    const onNavigateClicked = () => {
        setMediaPanelOpen(false)
        setCatPanelOpen(true)
    }
    const onGalleryClicked = () => {
        setCatPanelOpen(false)
        setMediaPanelOpen(true)
    }
    return (
        <div className={classes.root}>
            <Fab  variant="extended" onClick={onNavigateClicked} className={classes.categoryIcon} >
                {'Navigate'}
            </Fab>
            <Fab variant="extended" onClick={onGalleryClicked} className={classes.galleryIcon} >
                {'Gallery'}
            </Fab>
        </div>

    )
}
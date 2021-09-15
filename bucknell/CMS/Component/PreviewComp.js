import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {Box, IconButton, Typography} from "@material-ui/core";
import MovieIcon from "@material-ui/icons/Movie";
import HeadsetIcon from "@material-ui/icons/Headset";
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation'
import ListAltIcon from "@material-ui/icons/ListAlt"
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit'
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
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
    overlayText:{
        fontSize:'0.8rem'
    },
    buttonWrapper:{

    }

}))
//todo thumbnail cover size for portrait mode images
const Preview = React.memo(({
    className, contentType, downloadURL, thumb_url,name,
    onDeselect
})=> {

    const isThumbNail = thumb_url && thumb_url !==''
    const [isHover,setHover] = useState(false)
    const classes = useStyles({isHover:isHover})
    const preview = (contentType) =>{
        switch (contentType){
            case 'image':
                return  <img src={downloadURL} className={classes.img} alt={''}/>
            case 'video':
                return   isThumbNail
                    ? <img src={thumb_url} className={classes.img} alt={''}/>
                    : <MovieIcon className={classes.icons}
                                       aria-hidden="true" fontSize="large"
                                       fill={'red'} type={'font'} />

            case 'audio':
                return <HeadsetIcon className={classes.icons}
                                     aria-hidden="true" fontSize="large"
                                     fill={'red'} type={'font'} />
            default:

                return <DescriptionIcon className={classes.icons}
                                        aria-hidden="true" fontSize="large"
                                        fill={'red'} type={'font'} />
        }
    }

    return (
        <Box className={className}>
            <div className={classes.wrapper}
                 onMouseEnter={()=>setHover(true)}
                 onMouseLeave={()=>setHover(false)}
            >
                {preview(contentType)}
                <div className={classes.controlOverlay}
                     // onClick={()=> window.open(downloadURL,'_blank')}
                >
                    <Typography className={classes.overlayText}>{name}</Typography>
                    {onDeselect?
                        <div className={classes.buttonWrapper}>
                            <IconButton
                                aria-label="content"
                                size="medium"
                                onClick={()=> window.open(downloadURL,'_blank')}
                            >
                                <FullscreenExitIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton
                                aria-label="content"
                                size="medium"
                                onClick={onDeselect}
                                style={{color:'black'}}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </div>
                        :<IconButton
                            onClick={()=> window.open(downloadURL,'_blank')}
                            aria-label="content"
                            size="medium"
                        >
                            <FullscreenExitIcon fontSize="inherit" />
                        </IconButton>
                    }


                </div>
            </div>

        </Box>
    )
})

export default Preview
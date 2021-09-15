import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {Box} from "@material-ui/core";
import MovieIcon from "@material-ui/icons/Movie";
import HeadsetIcon from "@material-ui/icons/Headset";
import DescriptionIcon from '@material-ui/icons/Description';

const useStyles = makeStyles((theme) => ({
    root: {
        width:  p => p.highlight?'159px':'160px',
        height:p  => p.highlight?'159px':'160px',
        overflow:'hidden',
        background:'rgba(255,255,255,0.2)',
        borderRadius:'5px',
        border: p => p.highlight?'1px solid rgba(244,117,33,1)':'0px solid rgba(255,255,255,0)',
        '&:hover': {
            cursor: "pointer",
        },
    },
    img:{
        objectFit:'cover',
        width:'100%',
        height:'100%'
    },
    icons:{
        color:'rgba(255,255,255,0.5)',
        fontSize:'100px',
        marginTop:'30px',
        marginLeft:'30px',
    }
}))
//todo thumbnail cover size for portrait mode images
const ThumbNail = React.memo(({contentType, downloadURL, thumb_url, highlight})=> {
    const classes = useStyles({highlight:highlight})
    const isThumbNail = thumb_url && thumb_url !==''
    const preview = (contentType) =>{
        switch (contentType){
            case 'image':
                return  <img src={downloadURL} className={classes.img} alt={''}/>
            case 'video':
                return   isThumbNail
                    ?<img src={thumb_url} className={classes.img} alt={''}/>:
                    <MovieIcon className={classes.icons}
                                    aria-hidden="true" fontSize="large"
                                    fill={'red'} type={'font'} />
            case 'audio':
                return  <HeadsetIcon className={classes.icons}
                                     aria-hidden="true" fontSize="large"
                                     fill={'red'} type={'font'} />
            default:
                return <DescriptionIcon className={classes.icons}
                                    aria-hidden="true" fontSize="large"
                                    fill={'red'} type={'font'} />
        }
    }

    return (
        <Box className={classes.root} >
            {preview(contentType)}
        </Box>
    )
})

export default ThumbNail
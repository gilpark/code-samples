import React, {useCallback, useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useRecoilState, useRecoilValue } from 'recoil'
import {Box} from "@material-ui/core"
import ThumbNail from "./ThumbNail"
import {multiselectState,} from "../../States/states"
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import IconButton from "@material-ui/core/IconButton"
import {removeAt} from "../../utils/functions"
const useStyles = makeStyles((theme) => ({
    root: {
        width: '160px',
        height:'auto',
        display:'flex',
        flexDirection:'column',
        flexGrow:1,
    },
    title:{
        fontFamily:'FreigSan Pro Bold',
        fontSize:'0.8rem',
        paddingTop:'5px',
        paddingBottom:'5px'
    },
    subTitle:{
        fontFamily:'FreigSan Pro Sem',
        fontSize:'0.7rem',
        color:p => p.isDark?'rgba(255,255,255,0.5)':'rgba(1,1,1,0.5)',
        paddingBottom:'10px'
    },
    checkMarkWrapper:{
        position:'absolute',
        width: '160px',
        height:'160px',
        borderRadius:'5px',
        cursor:'pointer',
        background: props=> props.checked? 'rgba(1,1,1,0.2)'
            : props.hover?'rgba(1,1,1,0.2)'
                : 'rgba(1,1,1,0)',
        display: props=> props.checked?""
            : props.hover?""
                : 'none'
    },
    iconWrapper:{
        padding:'5px',
        color:props =>
            props.checked?'rgba(244,117,33,1)':
                props.hover? 'rgba(244,117,33,0.6)':'rgba(244,117,33,0)',
    }
}))

const FileItem = React.memo(({data, multiSelectMode,isDark})=>{
    const { contentSubType, contentType, downloadURL,
        fileType, id, name, note, size, tags, title, updated,
        usage,thumb_url,thumb_path, quest_url, ios_url, stream_url, backup_url,preview_url
    } = data
    const fieldData =  { contentSubType, contentType, downloadURL, quest_url, ios_url, stream_url, backup_url,
        fileType, id, name, note, size, tags, title, updated, usage,thumb_url,thumb_path,preview_url }
    const [hover,setHover] = useState(false)
    const [check,setCheck] = useState(false)
    const [selected,setMultiSelect] = useRecoilState(multiselectState)
    const classes = useStyles({hover:hover, checked:check, isDark:isDark})

    useEffect(()=>{
        const found = selected.filter(s => s.name === name)
        if(found.length === 0){
            setHover(false)
            setCheck(false)
        }
    },[selected])

    const onItemSelected = useCallback(() =>{
        for(let key of Object.keys(fieldData)){
            const value = fieldData[key]
            if(!value) fieldData[key] =""
        }
        setMultiSelect(pre =>{
            const exists = pre.find(d => d.id ===fieldData.id) !== undefined
            return exists? pre : [...pre,fieldData]
        })
        if(multiSelectMode){
            setCheck(!check)
            const unChecked = !check === false
            unChecked &&
            setMultiSelect(pre =>removeAt(pre.find(d => d.id ===fieldData.id),pre))
        }
    },[fieldData])
    const CheckMarkIcon = () => check? <CheckCircleIcon/> : <CheckCircleOutlineIcon />
    return (
        <Box className={classes.root}
             onMouseEnter={e => setHover(true)}
             onMouseLeave={e => setHover(false)}
             onClick={onItemSelected}
        >
            <ThumbNail
                contentType={contentType}
                downloadURL={downloadURL}
                thumb_url={thumb_url}
                highlight = {hover || check }
            />
            <div className={classes.title}>{title}</div>
            <div className={classes.subTitle}>{`${contentType}/${contentSubType}`}</div>
            {multiSelectMode &&
            <div className={classes.checkMarkWrapper} >
                {multiSelectMode &&
                <IconButton color="primary" aria-label="check mark"
                            component="span"
                            className={classes.iconWrapper}>
                    <CheckMarkIcon />
                </IconButton>}
            </div>}
        </Box>
    )
})

export const ProgressItem = React.memo((props)=>{
    const classes = useStyles()
    const {index, done} = props
    return(
        <Box className={classes.root} >
            <div style={{width:'160px', height:'160px', borderRadius:'5px', background:'rgba(255,255,255,0.2)'}}/>
            <div className={classes.title}>{'processing..'}</div>
            <div className={classes.subTitle}>{'processing..'}</div>
        </Box>
    )
})

export default FileItem
import React, {useCallback, useEffect, useState} from 'react'
import {fade, makeStyles} from '@material-ui/core/styles'
import { useParams, useHistory} from "react-router-dom"
import CreateHeader from "../../Component/Header/CreateHeader"
import {ArrowBack, Check } from '@material-ui/icons'
import * as firebase from 'firebase'
import TextField from "@material-ui/core/TextField"
import Chip from "@material-ui/core/Chip"
import {IconButton, Typography} from "@material-ui/core"
import DescriptionIcon from '@material-ui/icons/Description'
import Preview from "../../Component/PreviewComp";
const useStyles = makeStyles((theme) => ({
    root: {
        color:'white',
        maxWidth:'1000px',
        paddingBottom:'100px'
    },
    main:{
        paddingTop:'100px'
    },
    preview:{
        maxHeight: '300px',
        maxWidth:'500px',
        borderRadius:'0.5rem',
        background:'rgba(0,0,0,0.4)',
        overflow:'hidden',
        position:'relative'
    },
    submitIconWrapper:{
        maxHeight: "3rem",
        maxWidth: "3rem",
        color:'#f57f1f',
        marginLeft:'-1rem',
        marginTop:'1rem',
        '&.Mui-disabled':{
            color:'rgba(255,255,255,0.3)'
        }
    },
    backIcon:{
        maxHeight: "3rem",
        maxWidth: "3rem",
        color:'white',
        marginLeft:'-1rem',
        marginTop:'-0.2rem'
    },
    titleRoot:{
        marginTop:'1.2rem',
        display:'flex',
        fontFamily:'TradeGothic',
    },
    titleText:{
        fontFamily:'TradeGothic',
    },
    titleIcon:{
        marginRight:'1rem'
    },
    chipRoot: {
        display: 'flex',
        justifyContent: 'start',
        flexWrap: 'wrap',
        listStyle: 'none',
        padding: theme.spacing(0.5),
        margin: 0,
    },
    chip: {
        margin: theme.spacing(0.5),
    },
    inputs: {
        minWidth:'14rem',
        color:'white',
        position: 'relative',
        fontFamily:'FreigSan Pro Medium',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        // margin:'0.5rem',
        width: 'auto',
        '& .MuiFilledInput-input':{
            padding:'12px',
            color:'white'
        }
    },
    inputs_disabled: {
        minWidth:'14rem',
        // color:'white',
        position: 'relative',
        fontFamily:'FreigSan Pro Medium',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.1),
        // margin:'0.5rem',
        width: 'auto',
        '& .MuiFilledInput-input':{
            padding:'12px',
            color:'grey'
        }
    },
    fieldWrapper:{
        maxWidth:'15rem',
        display:'flex',
        flexDirection:'column',
        paddingTop:'1rem',
        // paddingBottom:'1rem',
        '& > p':{
            paddingBottom:'0.3rem',
        }
    },
    fieldWrapper_full:{
        maxWidth:'30rem',
        width:'100%',
        display:'flex',
        flexDirection:'column',
        paddingTop:'1rem',
        // paddingBottom:'1rem',
        '& > p':{
            paddingBottom:'0.3rem',
        }

    },
    fieldsItem:{
        maxWidth:'30rem',
        display:'flex',
        justifyContent:'space-between',
        flexWrap:'wrap'
    }
}))

const Header = React.memo((props)=>{
    const classes = useStyles()
    const history = useHistory()
    const {title, onSubmit, isDataChanged} = props
    const [submitDisabled, setDisabled] = useState(false)
    useEffect(()=>{
        setDisabled(!isDataChanged)
    },[isDataChanged])

    const handleSubmit = () =>{
        setDisabled(true)
        try {
            if(onSubmit)onSubmit().then(history.push('/mediaLibrary')).then(console.log)
        }catch (e) {
            window.alert(e)
            setDisabled(false)
        }
    }
    const Title  = () =>(
        <div className={classes.titleRoot}>
            <IconButton color="default" aria-label="back"
                 onClick={()=> history.push('/mediaLibrary')}
                 className={classes.backIcon}>
                <ArrowBack/>
            </IconButton>
            <DescriptionIcon
                className={classes.titleIcon}
                fontSize={'large'}/>
            <Typography
                className={classes.titleText}
                variant={'h4'}>{title}</Typography>
        </div>
    )

    //todo disable
    const Controls = () =>(
        <IconButton
             aria-label="submit"
             onClick={handleSubmit}
             disabled={submitDisabled}
             className={classes.submitIconWrapper}
        >
            <Check />
        </IconButton>
    )
    const Header = CreateHeader(Title, Controls)
    return(
        <Header {...props}/>
    )
})

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


//todo promise error
const MetadataPage = React.memo(({userInfo})=> {
    const classes = useStyles()
    const {fileID} = useParams()
    const history = useHistory()
    const [metadata,setMetadata] = useState(null)
    const [tag,setTag] = useState("")
    const [chipData, setChipData] = useState([])
    const [isVideo, setIsVideo] = useState(false)
    const [isDataChanged,setDataChanged] = useState(false)
    const isDev = userInfo.tier === 'dev'

    useEffect(()=>{
        if(metadata) return
        firebase.database().ref(`/${fileID}`)
            .once('value')
            .then(d =>{
                const data = d.val()
                const tags = Object.values(data.tags||{})
                setChipData(tags.map((tag,idx) => ({key:idx, label:tag})))
                setMetadata(data)
                setIsVideo(data.contentType === 'video')
            })
        return () => setDataChanged(false)
    },[])

    const handleChange = useCallback((fieldName) => e =>{
        setDataChanged(true)
        const val = e.target.value
        setMetadata(pre =>{
            const fields = {...pre}
            fields[fieldName] = val
            return fields
        })
    },[])
    const onSubmit = async () =>{
        const tagData = chipData.map(d => d.label)
        const data = {
            ...metadata,
            tags: tagData.length>0? tagData:"",
            quest_url: (isVideo && metadata.quest_url)?metadata.quest_url :"",
            ios_url: (isVideo && metadata.ios_url)?metadata.ios_url :"",
            stream_url: (isVideo && metadata.stream_url)?metadata.stream_url :"",
            backup_url: (isVideo && metadata.backup_url)?metadata.backup_url :"",
            thumb_url: (isVideo && metadata.thumb_url)?metadata.thumb_url :"",
            preview_url:(isVideo && metadata.preview_url)?metadata.preview_url :"",
        }
        const usageList = Object.values(data.usage||[])

        for(const usage of usageList){
            const {index, path } = usage
            const res = await firebase.firestore().doc(usage.path).get()
            const {fields} = res.data()
            const hasID = fields[index].data.id === data.id
            if(hasID){
                const update = await firebase.firestore().doc(usage.path).set({
                    'fields':{
                        [index.toString()]:{
                            data:{...data}
                        }
                    }
                },{merge:true})
            }
        }

        return firebase.database().ref(`/${fileID}`)
            .set(data)

    }

    const handleDelete = (chipToDelete) => () => {
        setChipData((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
    }
    const handleTag = e =>{
        const value = e.target.value
        if(value.includes(' ') || value.length === 0) return
        setTag(value)
    }
    const handleEnterOnTag = e =>{
        if(e.key === 'Enter'){
            const value = e.target.value
            if(value.includes(' ') || value.length === 0) return
            setDataChanged(true)
            setChipData(pre =>{
                const idx = pre.length
                return [...pre, {key:idx, label:tag}]
            })
            setTag("")
        }
    }
    return (
        <div  className={classes.root}>
            {metadata &&
            <Header title={metadata.title}
                    isDataChanged={isDataChanged}
                    onSubmit ={onSubmit}/>
            }
            {metadata &&
            <div className={classes.main}>

               <Preview className={classes.preview} {...metadata}/>

                <div className={classes.fieldWrapper_full}>
                    <Typography>{'Title'}</Typography>
                    <TextField variant="filled"
                               color={'secondary'}
                               className={classes.inputs}
                               value={metadata.title}
                               onChange={handleChange('title')}
                    />
                </div>
                <div className={classes.fieldWrapper_full}>
                    <Typography>{'Note'}</Typography>
                    <TextField
                        variant="filled"
                        color={'secondary'}
                        className={classes.inputs}
                        value={metadata.note}
                        onChange={handleChange('note')}
                    />
                </div>
                <div className={classes.fieldsItem}>
                    <div className={classes.fieldWrapper}>
                        <Typography>{'Tags'}</Typography>
                        <TextField variant="filled"
                                   color={'secondary'}
                                   className={classes.inputs}
                                   value={tag} onChange={handleTag} onKeyDown={handleEnterOnTag}
                        />
                        <div  className={classes.chipRoot}>
                            {chipData.map((data) => {
                                return (
                                    <li key={data.key}>
                                        <Chip
                                            label={data.label}
                                            onDelete={ handleDelete(data)}
                                            className={classes.chip}
                                        />
                                    </li>
                                )
                            })}
                        </div>
                    </div>
                    <div className={classes.fieldWrapper}>
                        <Typography>{'Filesize'}</Typography>
                        <TextField
                            variant="filled"
                            color={'secondary'}
                            className={classes.inputs_disabled}
                            value={formatBytes(metadata.size)}
                            disabled={true}/>
                    </div>
                    <div className={classes.fieldWrapper}>
                        <Typography>{'Updated'}</Typography>
                        <TextField
                            variant="filled"
                            color={'secondary'}
                            className={classes.inputs_disabled}
                            value={ new Date(metadata.updated * 1000).toLocaleDateString()}
                            disabled={true}/>
                    </div>
                </div>

                {/*video metadata.. hide from not dev users*/}
                {(isVideo && isDev) &&
                <>
                    <div className={classes.fieldWrapper_full}>
                        <Typography>{'Preview URL'}</Typography>
                        <TextField
                            variant="filled"
                            color={'secondary'}
                            className={classes.inputs}
                            value={metadata.preview_url}
                            onChange={handleChange('preview_url')}
                        />
                    </div>

                    <div className={classes.fieldWrapper_full}>
                        <Typography>{'Thumbnail URL'}</Typography>
                        <TextField
                            variant="filled"
                            color={'secondary'}
                            className={classes.inputs}
                            value={metadata.thumb_url}
                            onChange={handleChange('thumb_url')}
                        />
                    </div>
                    {/*<div className={classes.fieldWrapper}>*/}
                    {/*    <h4>{'quest url'}</h4>*/}
                    {/*    <TextField*/}
                    {/*        variant="filled"*/}
                    {/*        color={'secondary'}*/}
                    {/*        className={classes.inputs}*/}
                    {/*        value={metadata.quest_url}*/}
                    {/*        onChange={handleChange('quest_url')}*/}
                    {/*    />*/}
                    {/*</div>*/}
                    <div className={classes.fieldWrapper_full}>
                        <Typography>{'iOS URL'}</Typography>
                        <TextField
                            variant="filled"
                            color={'secondary'}
                            className={classes.inputs}
                            value={metadata.ios_url}
                            onChange={handleChange('ios_url')}
                        />
                    </div>
                    <div className={classes.fieldWrapper_full}>
                        <Typography>{'Streaming URL'}</Typography>
                        <TextField
                            variant="filled"
                            color={'secondary'}
                            className={classes.inputs}
                            value={metadata.stream_url}
                            onChange={handleChange('stream_url')}
                        />
                    </div>
                    {/*<div className={classes.fieldWrapper_full}>*/}
                    {/*    <Typography>{'backup url'}</Typography>*/}
                    {/*    <TextField*/}
                    {/*        variant="filled"*/}
                    {/*        color={'secondary'}*/}
                    {/*        className={classes.inputs}*/}
                    {/*        value={metadata.backup_url}*/}
                    {/*        onChange={handleChange('backup_url')}*/}
                    {/*    />*/}
                    {/*</div>*/}
                </>
                }
            </div>
            }
        </div>
    )
})

export default MetadataPage
import React, {useEffect, useState} from 'react'
import { fade, makeStyles } from '@material-ui/core/styles'
import {useRecoilState, useRecoilValue} from "recoil";
import { multiselectState, queryState, uploadingFilesState,} from "../../States/states"
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add'
import {go, curry, delay, takeWhile, L, take, removeAt} from '../../utils/functions'
import {deleteTask, uploadTask} from "../../API/firebaseAPIs";
import {DeleteForever,Search, Edit, Check} from '@material-ui/icons'
import InputBase from '@material-ui/core/InputBase'
import CreateHeader from "./CreateHeader"
import {useHistory} from "react-router-dom";
import FileDeleteDialog from "../../Pages/MediaLibrary/DeleteDialog";
import {openFileDelete} from "../../Pages/MediaLibrary/api/state";
import IconButton from "@material-ui/core/IconButton";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary"
import {Typography} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    FileLibHeaderRoot:{
        width:'100%',
        display:'flex',
        justifyContent:'space-between',
        position:'fixed'
    },
    titleWrapper:{
        display:'flex',
        flexDirection:'column',
        alignItems:'flex-start',
        marginLeft: theme.spacing(2)
    },
    titleRoot:{
        marginTop:'1.2rem',
        display:'flex',
    },
    titleText:{
        fontFamily:'TradeGothic'
    },
    titleIcon:{
        marginRight:'1rem'
    },
    iconWrapper:{
        display:'flex',
        marginTop:'1rem',
    },
    icon:{
        color:'white',
        maxHeight: "3rem",
        maxWidth: "3rem",
        marginRight: "1rem",
    },
    deleteIcon:{
        maxHeight: "3rem",
        maxWidth: "3rem",
        marginRight: "1rem",
        // background:'black',
        color:theme.palette.secondary.main
    },
    input: {
        display: 'none',
    },
    search: {
        position: 'relative',
        fontFamily:'FreigSan Pro Medium',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
       margin:'0.5rem',
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}))


const createUploadTasks = files => {
    const tasks = []
    for(const file of files)
        tasks.push({filename:file.name, task: uploadTask(file)})
    return tasks
}


const ControlButtonSet = React.memo(()=>{
    const [multiSelected, setMultiSelect] = useRecoilState(multiselectState)
    const [,setUploadFiles] = useRecoilState(uploadingFilesState)
    const [isTyping, setTyping] = useState(false)
    const [searchText, setSearchText] = useState("")
    const [,setQueries] = useRecoilState(queryState)
    const [,setOpenDeleteDialog] = useRecoilState(openFileDelete)
    const history = useHistory()
    const onQueryChange = e =>{
        setSearchText(e.target.value)
    }
    const onFileChange = async (e) =>{
        const fileList = e.target.files
        const files = Object.values(fileList)
        const uploadTasks =  createUploadTasks(files)
        for(const ut of uploadTasks){
            const {filename, task} = ut
            setUploadFiles(pre =>[...pre,{filename: filename}])
            task()
                .then(_=> {
                    setUploadFiles(pre =>removeAt(pre.find(d => d.filename === filename),pre))
                    console.log('file upload completed ', filename, _)
                })
                .catch(window.alert)
        }
    }
    const onDeleteClicked = e =>{
        setOpenDeleteDialog(true)
    }

    useEffect(()=>{
        if(!isTyping) {
            setQueries(searchText.split(' ').filter(t => t!==""))
            return
        }
        const timer = setTimeout(()=>setTyping(false),700)
        return ()=> clearInterval(timer)
    },[isTyping])

    const onKeyDown = e =>{
        setTyping(true)
    }
    const classes = useStyles()
    const showEditButton = multiSelected.length === 1
    const showDeleteButton = multiSelected.length > 0
    const showMetaDataButtons = false
    const onEditButtonClicked = () =>{
        history.push(`/mediaLibrary/${multiSelected[0].id}`)
        setMultiSelect([])
    }
    return(
        <div className={classes.iconWrapper}>
            {/*search */}
            {!showMetaDataButtons&&
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                    <Search />
                </div>
                <InputBase
                    onChange={onQueryChange} onKeyDown={onKeyDown}
                    placeholder="Search…"
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                />
            </div>
            }
            {/*edit icon*/}
            {showEditButton &&
            <IconButton
                color="default"
                aria-label="delete"
                onClick={onEditButtonClicked}
                className={classes.icon}>
                <Edit/>
            </IconButton>
            }

            {/*upload button*/}
            {!showMetaDataButtons &&
            <>
                <input
                    accept={'image/*, audio/*, video/*'} className={classes.input}
                    id="upload-file" multiple type="file"
                    onChange={onFileChange}
                />
                <label htmlFor="upload-file">
                    <IconButton
                        color="default"
                        aria-label="update"
                        component="span"
                        className={classes.icon}>
                        <AddIcon />
                    </IconButton>
                </label>
            </>}
            {/*delete button*/}
            {showDeleteButton&&
            <IconButton
                color="default"
                aria-label="delete"
                onClick={onDeleteClicked}
                className={classes.deleteIcon}>
                <DeleteForever />
            </IconButton>
            }
        </div>
    )
})

const FileLibTitle = React.memo(()=>{
    const classes = useStyles()

    return(
        <div className={classes.titleRoot}>
            <PhotoLibraryIcon
                className={classes.titleIcon}
                fontSize={'large'}/>
            <Typography
                className={classes.titleText}
                variant={'h4'}>Media Library</Typography>
        </div>

    )
})

const FileLibHeader = React.memo((props)=>{
    const classes = useStyles()
    const Header = CreateHeader(FileLibTitle, ControlButtonSet)
    return(
        <>
            <Header  {...props}/>
            <FileDeleteDialog/>
        </>

    )
})

export default FileLibHeader
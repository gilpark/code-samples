import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {useRecoilState, useRecoilValue} from "recoil"
import Fab from "@material-ui/core/Fab"
import PublishIcon from "@material-ui/icons/Publish"
import VideocamIcon from '@material-ui/icons/Videocam'
import PhotoIcon from '@material-ui/icons/Photo'
import InfoIcon from '@material-ui/icons/Info'
import {removeFileUsage, updateEntry, updateFileFieldsUsage} from "../../API/firebaseAPIs"
import CreateHeader from "./CreateHeader"
import {docPath, ENTRY_ID, entryUpdateFlag, headerTitleState} from "../../Pages/Entry/api/state"
import {deselectTodo} from "../../States/states";
import DataChangeDialog from "../DataChangeDialog";
import {IconButton, Typography} from "@material-ui/core";
import {Check} from "@material-ui/icons";
import CategoryIcon from '@material-ui/icons/Category'
import NoteIcon from '@material-ui/icons/Note';
import memoize from "memoizee";
import ListAltIcon from "@material-ui/icons/ListAlt"

const useStyles = makeStyles((theme) => ({
    icon:{

        maxHeight: "3rem",
        maxWidth: "3rem",
        marginRight: "1rem",
        color:'white'
    },

    headerTitle:{
        display:'flex',
        flexDirection:'column',
        color:'white',
        '&>h4':{
            fontFamily:'TradeGothic',
            fontSize:'1.5rem'
        },
        '&>p':{
            color:'rgba(255,255,255,0.6)',
            fontFamily:'FreigSan Pro Medium',
            fontSize:'0.8rem'
        }
    },
    categoryIcon:{
        // backgroundImage:p=>`url(${p.svg})`,
        // backgroundSize:'cover',
        width:'3rem',
        height:'3rem',
        // marginTop:'0.2rem',
        marginRight:'0.5rem'
    },
    iconWrapper:{
        marginTop:'1.2rem'
    },
    headerWrapper:{
        marginTop:'1.2rem',
        display:'flex',
        flexDirection:'row',
        color:'white'
    },
}))


const EntryControls = React.memo(({entry, categoryID})=>{
    const [headerTitle,setHeaderTitle] = useRecoilState(headerTitleState)
    const [entryDocPath,setDocPath] = useRecoilState(docPath)
    const [todos, todoOnSubmit] = useRecoilState(deselectTodo)
    const [updateFlag,setUpdateFlag] = useRecoilState(entryUpdateFlag)
    const [openDialog, setOpenDialog] = useState(false)
    //todo temp
    const [onConfirm, setonConFirm] = useState(null)
    const classes = useStyles()

    //todo use callback
    const onEntryIDChange = targetId => e =>{
        setOpenDialog(true)
        setHeaderTitle(pre =>({...pre, entry:targetId}))
        todoOnSubmit([])
        setUpdateFlag(false)
        // setUpdateFlag(false)
        // if(updateFlag){
        //     setonConFirm(()=>()=>{
        //         setHeaderTitle(pre =>({...pre, entry:targetId}))
        //         todoOnSubmit([])
        //         setUpdateFlag(false)
        //     })
        // }else{
        //     setHeaderTitle(pre =>({...pre, entry:targetId}))
        //     todoOnSubmit([])
        //     setUpdateFlag(false)
        // }
    }

    const onCancelCallback = () =>{
        console.log('on cancel')
        setOpenDialog(false)
    }
    const onSubmit = async () =>{
        const entryObj = {...entry, fields:{...entry.fields}}
        await updateFileFieldsUsage(entryObj.fields)
        const res = await updateEntry(entryDocPath.path, entryObj)
        for (const todo of todos){
            removeFileUsage(todo.id, todo.path).then(r => console.log('remove usage...',r === undefined))
        }
        todoOnSubmit([])
        setUpdateFlag(false)
    }
    useEffect(()=>{

    },[])
    return (
        <div className={classes.iconWrapper}>
            <IconButton color="default"
                 aria-label="360videos"
                 onClick={onEntryIDChange(ENTRY_ID.VIDEO360)}
                 className={classes.icon}>
                <VideocamIcon />
            </IconButton>
            <IconButton color="default"
                 aria-label="gallery"
                 onClick={onEntryIDChange(ENTRY_ID.GALLERY)}
                 className={classes.icon}>
                <PhotoIcon />
            </IconButton>
            <IconButton color="default"
                 aria-label="info"
                 onClick={onEntryIDChange(ENTRY_ID.INFO)}
                 className={classes.icon}>
                <InfoIcon />
            </IconButton>
            <IconButton color={updateFlag?'primary':'default'} aria-label="update"
                 className={classes.icon}
                 onClick={onSubmit}>
                <Check />
            </IconButton>
            {openDialog && <DataChangeDialog onClose={onCancelCallback} onConfirm={onConfirm}/>}
        </div>
    )
})



const CategoryTitle = React.memo(()=>{
    const [headerTitle,] = useRecoilState(headerTitleState)
    const isCategorySetting = headerTitle.entry === ENTRY_ID.CATEGORY
    const is360Entry = headerTitle.entry === ENTRY_ID.VIDEO360
    const isInfoEntry = headerTitle.entry === ENTRY_ID.INFO
    const isGalleryEntry = headerTitle.entry === ENTRY_ID.GALLERY
    const categoryTitle = headerTitle.cat
    const entryTitle = isCategorySetting?'Category content':headerTitle.entry
    const classes = useStyles()

    const HeaderIcon = () =>{
        if(isCategorySetting) return CategoryIcon
        if(is360Entry) return VideocamIcon
        if(isInfoEntry) return InfoIcon
        if(isGalleryEntry) return PhotoIcon
    }
    const Icon = HeaderIcon()
    return(
        <div className={classes.headerWrapper}>
            <Icon className={classes.categoryIcon}/>
            <div className={classes.headerTitle}>
                <Typography variant={'h4'}>{entryTitle}</Typography>
                <Typography>{categoryTitle}</Typography>
            </div>
        </div>

    )
})

export default function CategoryHeader(props){
    const CategoryHeader = CreateHeader(CategoryTitle, EntryControls)
    return(
        <CategoryHeader {...props}/>
    )
}
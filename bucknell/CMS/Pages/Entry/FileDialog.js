import React, {useEffect, useState} from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import {makeStyles} from "@material-ui/core/styles";
import FileGrid from "../../Component/FileGrid/FileGrid";
import {useRecoilState} from "recoil";
import {openFileDialogState} from "../../States/atoms";
import {targetFileFieldState, multiselectState, queryState} from "../../States/states";
import {docPath, fieldDataState} from "./api/state";
import * as firebase from "firebase";
import {convertDocPath2Usage} from "../../API/firebaseAPIs";
import {Search} from "@material-ui/icons";
import InputBase from "@material-ui/core/InputBase";

const useStyles = makeStyles((theme) => ({
    preview:{
        maxWidth:'40%',
        maxHeight:'300px',
    },
    content:{
        display:'flex',
        flexDirection:'column',

        '&>p':{
            padding:'5px',
            margin:'5px'
        }
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        maxWidth: 300,
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
    noLabel: {
        marginTop: theme.spacing(3),
    },
    dialogWindow:{
        minWidth:'500px',
        width:'60vw',
        maxWidth:'750px'
    },
    search:{
        display:'flex',
        marginLeft:'1rem'
    },
    title:{
        '&>h2':{
            fontFamily:'TradeGothic'
        }
    },
    searchIcon:{
        marginTop:'0.3rem',
        marginRight:'0.5rem'
    }
}));


const FileSelectDialog = React.memo(({isOpen,setOpen})=> {
    const classes = useStyles()
    // const [isOpen, setOpen] = useRecoilState(openFileDialogState)
    const [selectedFiles, setSelected ] = useRecoilState(multiselectState)
    const [targetField, ] = useRecoilState(targetFileFieldState)
    const param = {index: targetField.index, interfaceType:'file'}
    const [, setFieldData] = useRecoilState(fieldDataState(param))
    const [firebaseDocPath,] = useRecoilState(docPath)
    const [queries, setQueries] = useRecoilState(queryState)
    const [isTyping, setTyping] = useState(false)
    const [searchText, setSearchText] = useState("")
    const onClose = () => {
        setOpen(false)
        setQueries([])
        setTyping(false)
        setSearchText("")
    }
    //todo note: file usage is set here
    useEffect(()=>{
        if(selectedFiles.length > 0){
            const fileData = {...selectedFiles[0]}
            const fieldData = convertDocPath2Usage(targetField, fileData, firebaseDocPath)
            setSelected([])
            setFieldData(fieldData)
            setOpen(false)
        }
        return ()=>{
        }
    },[selectedFiles])
    const onQueryChange = e =>{
        setSearchText(e.target.value)
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
    return (
        <Dialog open={isOpen} onClose={onClose}
                fullWidth={false}
                maxWidth={'md'}
                classes={{paper:classes.dialogWindow}}
                aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title"
                             className={classes.title}
                >{'Select file'}</DialogTitle>
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
                <DialogContent className={classes.content}>
                   <FileGrid multiSelectMode={false} isDark={false}/>
                </DialogContent>
        </Dialog>
    )
})

export default FileSelectDialog
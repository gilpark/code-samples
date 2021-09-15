import React, {useEffect} from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import {useRecoilState} from "recoil";
import {openFileDelete} from "./api/state";
import {multiselectState} from "../../States/states";
import {go,L} from "../../utils/functions";
import {convert2Json, deleteTask, removeFileFromEntry} from "../../API/firebaseAPIs";
import {makeStyles, unstable_createMuiStrictModeTheme as createMuiTheme} from "@material-ui/core/styles";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})
const useStyles = makeStyles((theme) => ({
}))

const createUsageList = files =>{
    return files
        // .filter(data => data.usage !== "[]" && data.usage !== "")
        .map((data, dataIdx) =>{
        const {name, usage} = data
        const usageArr = Object.values(usage||{})
        return(
            <div key ={dataIdx}>
                <p style={{color:'#000000ab'}}>{name}</p>
                <ul>
                    {usageArr.map((u,pathIdx) =>(
                        <li
                            style={{fontFamily:'FreigSan Pro Medium', color:'rgba(0, 0, 0, 0.54)'}}
                            key={pathIdx}>{u.location.replace('|',' > ')}</li>
                    ))}
                </ul>
            </div>
        )
    })
}
const removeFileFromFields = files =>{
    const usages = files.map(({usage}) => usage?Object.values(usage):[])
    const flat = usages.reduce((a,c)=>a.concat(c),[])
    return Promise.all(flat.map(u => {
        // console.log(u)
        return removeFileFromEntry(u)
    }))
}

const FileDeleteDialog = React.memo(()=> {
    const [open, setOpen] = useRecoilState(openFileDelete)
    const [multiSelected, setMultiSelect] = useRecoilState(multiselectState)

    const onDelete = async () => {
        try {
            const removeFileData = await removeFileFromFields(multiSelected).catch(console.log)
            const deleteRes = await deleteTask([...multiSelected.map(f=>f.id)])
        }catch (e) {
            window.alert(e)
        }
        setMultiSelect([])
        setOpen(false)
    }
    const handleClose = () => {
        setOpen(false)
    }
    const classes = useStyles()
    const isMultiple = multiSelected.length > 1
    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title"
                         className={classes.title}
            >
                {`Delete File${isMultiple?'s':''}`}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" className={classes.description}>
                   {` Selected file${isMultiple?'s':''} :`}
                </DialogContentText>
                {createUsageList(multiSelected)}
                <DialogContentText id="alert-dialog-slide-description" className={classes.description}>
                    deleting selected cannot be reverted and may affect how data presented in the app.
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <Button onClick={onDelete} color="default">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    )
})

export default FileDeleteDialog
import React, {memo, useEffect, useState} from 'react'
import TextField from '@material-ui/core/TextField'
import {fade, makeStyles} from '@material-ui/core/styles'
import {
    useRecoilState,
} from 'recoil'
import FileFieldComp from "../FileField/FileFieldComp";
import {entryUpdateFlag, fieldDataState} from "../../Pages/Entry/api/state";

const useStyles = makeStyles((theme) => ({
    half:{
        width:'100%',
        maxWidth:'350px',
        padding:'0.2rem'
    },
    full:{
        gridColumn: '1 / -1',
        padding:'0.2rem'
    },
    textField:{
        width:'100%',
        // minWidth:'300px',
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
        // width: 'auto',
        '& .MuiFilledInput-input':{
            padding:'12px',
            color:'white'
        }
    }
}))

const TextFieldComp = React.memo(({index})=>{
    const classes = useStyles()
    const param = {index:index, interfaceType:'text'}
    const [state,setState] = useRecoilState(fieldDataState(param))
    const [updateFlag,setUpdateFlag] = useRecoilState(entryUpdateFlag)
    const {note, interfaceType, name, option, value} = state
    const onValueChange = event => {
        const val = event.target.value
        setState(val)
        setUpdateFlag(true)
    }
    return (
        <>
            <TextField  variant="filled"  color='secondary' value={value} onChange={onValueChange}
                        className={classes.textField}/>
        </>
    )
})

function TextAreaFieldComp({index}){
    const classes = useStyles()
    const param = {index:index, interfaceType:'textArea'}
    const [state,setState] = useRecoilState(fieldDataState(param))
    const [updateFlag,setUpdateFlag] = useRecoilState(entryUpdateFlag)
    const {note, interfaceType, name, option, value} = state
    const [text, setText]= useState(value)
    const onValueChange = event => {
        const val = event.target.value
        setState(val)
        setUpdateFlag(true)
    }
    return (
        <>
            <TextField  variant="filled"  color='secondary' multiline rowsMax={10} value={value} onChange={onValueChange}
                       className={classes.textField}/>
        </>
    )
}




const FieldComp = React.memo(({data})=> {
    const {name, interfaceType, index, option} = data
    const classes = useStyles()
    const CreateField = (interfaceType) =>{
        switch (interfaceType){
            case "text":
                return <TextFieldComp index={index}/>
            case "textArea":
                return <TextAreaFieldComp index={index}/>
            case "file":
                return <FileFieldComp index={index}/>
            default:
                return <TextFieldComp index={index}/>
        }
    }
    const fieldName = name.includes('test text')?name.replace('test text','info text'):name
    return (
        data &&
        <div className={option.width === 'half'?classes.half:classes.full}>
            <h4>{fieldName}</h4>
            { CreateField(interfaceType) }
        </div>
    )
})
export default FieldComp

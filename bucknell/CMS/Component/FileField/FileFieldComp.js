import {useRecoilState} from "recoil"
import React, {useEffect, useState} from "react"
import {makeStyles} from "@material-ui/core/styles"
import SelectFile from "./SelectFile"
import {deselectTodo, targetFileFieldState} from "../../States/states"
import {docPath, entryUpdateFlag, fieldDataState} from "../../Pages/Entry/api/state"
import {removeFileUsage} from "../../API/firebaseAPIs";
import Preview from "../PreviewComp";

const useStyles = makeStyles((theme) => ({
    preview: {
        width:'100%',
        height:'auto',
        maxHeight:'350px',
        position:'relative',
        borderRadius:'0.5rem',
        background:'rgba(1,1,1,0.3)',
        overflow:'hidden',
        cursor:'pointer'
    },
    select: {
        width:'100%',
        height:'auto',
        maxHeight:'350px',
        position:'relative',
        borderRadius:'0.5rem',
        background:'rgba(1,1,1,0.3)',
        overflow:'hidden',
        border:'2px dashed rgba(255,255,255,0.3)',
        cursor:'pointer'
    },
}))

export default function FileFieldComp({index}){
    //todo fix deselect
    const classes = useStyles()
    const param = {index:index, interfaceType:'file'}
    const [state, setState] = useRecoilState(fieldDataState(param))
    const [hasFieldData, setField] = useState(false)
    const {note, interfaceType, name, option, value, data} = state //value is preview url
    const [firebaseDocPath,] = useRecoilState(docPath)
    const [todos, todoOnSubmit] = useRecoilState(deselectTodo)
    const [updateFlag,setUpdateFlag] = useRecoilState(entryUpdateFlag)
    const onDeselect = e => {
        const todo =  {id:data.id, path:`${firebaseDocPath.path}:${index}`.replaceAll('/',':')}
        // removeFileUsage(todo.id, todo.path).then(r => console.log(r))
        todoOnSubmit(pre =>[...pre, todo])
        setState({})
        setField(false)
        setUpdateFlag(true)
    }
    useEffect(()=>{
        setField(value !=="")
    },[state])

    return (
        <>
            {hasFieldData?
                <Preview className={classes.preview} onDeselect={onDeselect}{...data}/>
                :
                <SelectFile className={classes.select} state={state}/>
            }
        </>
    )
}
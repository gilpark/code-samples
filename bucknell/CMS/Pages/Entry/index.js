import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FieldComp from "../../Component/Field/FieldComp"
import {useRecoilState} from "recoil";
import {headerTitleState, openFileDialogState, useEntry} from "./api/state";
import FileSelectDialog from "./FileDialog";
import {
    useParams,
} from "react-router-dom"
import CategoryHeader from "../../Component/Header/CategoryHeader";
const useStyles = makeStyles((theme) => ({
    root:{
        color:'white',
        paddingBottom:'100px'
    },
    //todo window width smaller than 480, just 1 or 2items
    gridWrapper:{
        paddingTop:'100px',
        display:'grid',
        maxWidth:'800px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gridTemplateRows: 'auto',
        gridGap:'2rem'
    },
    updateIcon:{
        maxHeight: "3rem",
        maxWidth: "3rem",
        marginRight: "1rem",
        marginTop:'1.2rem'
    }
}))

export default function EntryPage() {
    const classes = useStyles()
    const {categoryID} = useParams()
    const {entry, isLoading, error} = useEntry(categoryID)
    const [open, setOpen] = useRecoilState(openFileDialogState)
    return (
        <div  className={classes.root}>
            <CategoryHeader entry ={entry} categoryID={categoryID}/>
            <div className={classes.gridWrapper}>
                {
                    isLoading?
                        <p>Loading</p> :
                        entry.fields
                            .map((data,i) =>{
                            return (<FieldComp key={i} data={data}/>)
                        })
                }
            </div>
           <FileSelectDialog isOpen ={open} setOpen={setOpen}/>
        </div>
    )
}
// export default EntryPage
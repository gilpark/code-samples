import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useRecoilState, useRecoilValue } from 'recoil'
import MetadataView from "./MetadataView";
import FileGrid from "../../Component/FileGrid/FileGrid";
import {IfElseThen} from "../../Component/IfElseThen";
import {multiselectState} from "../../States/states";
import {Container} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        width:'100%',
        height:'100%'
    },
    header:{
        display:'flex',
        justifyContent:'space-between'
    },
    updateIcon:{
        maxHeight: "3rem",
        maxWidth: "3rem",
        marginRight: "1rem",
        marginTop:'1.2rem'
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    input: {
        display: 'none',
    },
}))
export default function FileLibraryView() {
    const classes = useStyles()
    const [selectedID, setID] = useRecoilState(selectedFileState)
    const isFileSelected = selectedID.id !== ""// todo implement multiselect state
    const ViewFiles = IfElseThen(isFileSelected, MetadataView, FileGrid)
    return (
            <Container>
                <ViewFiles/>
            </Container>
    )
}

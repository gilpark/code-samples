import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FileLibHeader from "../../Component/Header/FileLibHeader"
import FileGrid from "../../Component/FileGrid/FileGrid"
const useStyles = makeStyles((theme) => ({
    root: {
        // background:theme.palette.background.default
        color:'white',
        maxWidth:'1000px'
    },
    main:{
        paddingTop:'100px'
    }
}))

const MediaLibraryPage = React.memo(()=> {
    const classes = useStyles()
    return (
        <div  className={classes.root}>
            <FileLibHeader />
            <div className={classes.main}>
                <FileGrid multiSelectMode={true} isDark={true}/>
            </div>
        </div>
    )
})
export default MediaLibraryPage
import React, {useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FileItem from "./FileItem"
import {useRecoilState, useRecoilValue} from "recoil";
import {
    multiselectState,
    queryState, realtimeDBState, targetFileFieldState, uploadingFilesState,
} from "../../States/states";
import {ProgressItem} from "./FileItem";
import * as firebase from "firebase";
import Loader from "react-loader-spinner";
import {useRLDB} from "../../Hooks/useRealTimeDB";
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
    gridWrapper:{
        display:'grid',
        maxWidth:'100%',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gridTemplateRows: 'auto',
        gridGap:'0.5rem'
    },
}))


const LoadingIndicator = React.memo(() => {
    return (
        <div
            style={{
                width: "100%",
                height: "90vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Loader type="ThreeDots" color="white" height="70" width="70" />
        </div>
    )
})
const FileGrid = React.memo(({multiSelectMode, isDark})=> {
    const classes = useStyles()
    const [placeholderItems,] = useRecoilState(uploadingFilesState)
    const [queries,] = useRecoilState(queryState)
    const [targetField, ] = useRecoilState(targetFileFieldState)
    // const [isLoading,setLoading] = useState(false)
    const [files,isLoading] = useRLDB(realtimeDBState)
    const selectedFieldFilter = (data) =>
        targetField.option? targetField.option.fileFilter.includes(data.contentType) : true
    const QueryFilter = data  =>{
        if(queries.length === 0) return true
        const { contentSubType, contentType, fileType, name, note, tags, title } = data
        console.log(contentType)
        const dataQueriesArr = [note,name,title,...tags,contentType,contentType,contentSubType].filter(t => t!=="")
        //todo 3rd deep or use for each for nested search
        const matchedArrWith1stQuery =  dataQueriesArr.filter(q => q.toLowerCase().includes(queries[0].toLowerCase()))
        const [,...resQueries] = queries
        if(resQueries.length > 0){
            return dataQueriesArr.filter(dataQuery => {
                const found = resQueries.filter(q => dataQuery.toLowerCase().includes(q.toLowerCase()))
                return found.length > 0
            }).length > 0
        }
        return matchedArrWith1stQuery.length > 0
    }
    const uploadingProcessFilter = d =>{
        const isFound = files.find(f => f.name === d.filename) !== undefined
        return !isFound
    }
    //todo merge progress Item and file Item
    const isFiles = files.filter(selectedFieldFilter).filter(QueryFilter).length>0
    return (
        <>
            {isLoading?
                <LoadingIndicator/>
                :   <div className={classes.gridWrapper}>
                    {isFiles ?
                        <>
                            {
                                placeholderItems
                                    .filter(uploadingProcessFilter)
                                    .map((data, index) =>  (
                                        <div key={index}>
                                            <ProgressItem {...data}/>
                                        </div>
                                    ))
                            }
                            {
                                files.filter(d => d.title)
                                    .filter(selectedFieldFilter)
                                    .filter(QueryFilter)
                                    .map((data,index) =>{
                                        return (
                                            <div key={index}>
                                                <FileItem className={classes.paper}
                                                          data={data}
                                                          isDark={isDark}
                                                          multiSelectMode={multiSelectMode} />
                                            </div>
                                        )
                                    })
                            }
                        </>
                        :<p style={{fontFamily:'FreigSan Pro Sem'}}>No result found..</p>
                    }
                </div>
            }
        </>

    )
})
export default FileGrid
import {atom, selectorFamily, useRecoilState} from "recoil";
import useSWR,{ mutate } from "swr";
import {fetchCategories, fetchEntry} from "../../../API/firebaseAPIs";
import {useEffect, useState} from "react";
import {template360, templateCategorySetting, templateGallery, templateInfo} from "../../../States/templates";
import * as firebase from "firebase"

export const ENTRY_ID = {
    CATEGORY: "Category",
    VIDEO360: '360Videos',
    GALLERY: 'Gallery',
    INFO: 'Info'
}

const getTemplate = type =>{
    switch (type){
        case ENTRY_ID.VIDEO360:
            return template360
        case ENTRY_ID.GALLERY:
            return templateGallery
        case ENTRY_ID.INFO:
            return templateInfo
        default:
            return templateCategorySetting
    }
}
//todo map category path to actual names
export const docPath = atom({key:'docPath', default:""})
export function useEntry(categoryPath){
    const [headerTitle,setHeaderTitle] = useRecoilState(headerTitleState)
    const entryID = headerTitle.entry
    const isCategorySetting =  entryID ===ENTRY_ID.CATEGORY

    const firebaseDocPath = isCategorySetting ?
        `/categories/${categoryPath}`:
        `/categories/${categoryPath}/content/${entryID}`

    const { data, error } = useSWR(firebaseDocPath, fetchEntry)
    const [entryData, setEntryData] = useRecoilState(entryDataState)
    const [,setDocPath] = useRecoilState(docPath)
    const [categories, _] = useRecoilState(categoryListState)

    useEffect(()=>{
        const categoryTitle = categories.length>0?categories.filter(c => c.uid ===categoryPath)[0].title:""
        const categoryId =  categories.length>0?categories.filter(c => c.uid ===categoryPath)[0].uid:""
        const docKey = isCategorySetting?
            `${categoryTitle}`
            :`${categoryTitle}|${entryID}`
        setHeaderTitle(pre => ({...pre, cat: categoryTitle}))
        setDocPath({
            location : docKey,
            path: firebaseDocPath,
            index:-1
        })

    },[data,firebaseDocPath])

    useEffect(()=>{
        if(data) {
            console.log(data)
            const template = getTemplate(entryID)
            const isTile =  data.title && data.title !== ""
            const isNote = data.note && data.note !== ""
            const isFieldsArray =  data.fields !== undefined && Array.isArray(data.fields)
            const fieldArr = isFieldsArray? data.fields : data.fields ? Object.values(data.fields) :[]
            const hasFields = fieldArr.length > 0
            const fieldsData = template.fields.map(t =>{
                const found = fieldArr.find(d => d.index === t.index)
                return found? found : t
            })
            setEntryData(({
                ...data,
                title: isTile? data.title : template.title,
                note: isNote? data.note : template.note,
                fields: fieldsData
            }))
        }
        if(error){
            console.log(error)
        }
    },[data])
    return {
        entry : entryData,
        isLoading: !error && !data,
        error:error
    }
}

//category list state management
export const headerTitleState = atom(
    {key:'headerTitleState',
    default:{cat:"Community/Life at Bucknell",idx:0,entry:ENTRY_ID.CATEGORY}}
    )
const categoryDefaultDataStr = "[{\"index\":0,\"title\":\"Life at Bucknell\",\"uid\":\"ILHV9uj0jZNi3GbVdc8o\"},{\"index\":1,\"title\":\"Opportunities\",\"uid\":\"lHUVp36ng0A5Wk8zZESn\"},{\"index\":2,\"title\":\"College of Arts & Sciences\",\"uid\":\"EBfzQ0EINAmWyOlH2mQl\"},{\"index\":3,\"title\":\"College of Engineering\",\"uid\":\"QK3KSQJwaYzfIuprQTNX\"},{\"index\":4,\"title\":\"College of Management\",\"uid\":\"gASmroCOltXfj5YsObWZ\"},{\"index\":5,\"title\":\"Housing and Dining﻿\",\"uid\":\"iO3kmkCcYArz5xnEJ9g4\"},{\"index\":6,\"title\":\"The Arts at Bucknell﻿\",\"uid\":\"iq0pTv18haTHUa4cH22P\"},{\"index\":7,\"title\":\"Athletics/KLARC﻿\",\"uid\":\"t3P0tLf952jbsr4LZTTZ\"},{\"index\":8,\"title\":\"Lewisburg and Beyond﻿\",\"uid\":\"RsHmREnrKqq8zDavPUGl\"},{\"index\":9,\"title\":\"Alumni/Outcomes\",\"uid\":\"iN7zz2H5pgEsHebXSQGi\"},{\"index\":10,\"title\":\"tutorial\",\"uid\":\"X7BMDK8Vj3KbrHlZc9RK\"}]"
const categoryDefaultData = JSON.parse(categoryDefaultDataStr)
export const categoryListState = atom(
    {key:'_categoryState',default:categoryDefaultData ||[]}
    )


const useCategory = () =>{
    const [f,setF] = useState([])
    useEffect(()=>{
        const unsubscribe =
        firebase.firestore()
            .collection('categories')
            .onSnapshot(async snap =>{
                const res = snap.docs.map(x => x.data())
                setF(res)
            })
        return () => unsubscribe()
    },[])
    return [f]
}
const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}
export function useCategories(){
    // const { data, error } = useSWR('/categories',fetchCategories,{revalidateOnMount:true,refreshInterval:100})
    const [data] = useCategory()
    const [categories, setCategory] = useRecoilState(categoryListState)
    useEffect(()=>{
        if(data.length>0) {
            const sorted =
                data.map(d =>({index:d.index, title:capitalize(d.title.replace('/',' / ')),uid:d.uid}))
                    .sort((a,b) => a.index - b.index)
            setCategory(sorted)
        }
    },[data])
    return {
        categories : categories,
        // isLoading: !error && !data,
        // error:error
    }
}

export const openFileDialogState = atom({key:'_openFileDialogState', default:false})
export const entryDataState = atom({key:'_entryDataState', default: templateCategorySetting})

export const fieldDataState = selectorFamily({
    key:'_fieldDataState',
    get: type =>({get}) =>{
        const {index, interfaceType} = type
        const entryData = get(entryDataState).fields
        const condition = d => d.index === index && d.interfaceType === interfaceType
        return entryData.filter(condition)[0] || undefined
    },
    set: type =>({set},newValue) =>{
        const {index, interfaceType} = type
        if(interfaceType === 'file'){
            set(entryDataState, pre =>{
                const data = newValue.data || {}
                const url = data.downloadURL || ""
                const fields = [...pre.fields]
                const condition = d => d.index === index && d.interfaceType === interfaceType
                let found = fields.find(condition)
                fields[index] = {...found, value: url, data:data}
                // set(selectedFileState,{name:"",id:"",data:{}})
                return {...pre, fields:fields}
            })
        }else{
            set(entryDataState, pre =>{
                const fields = [...pre.fields]
                const condition = d => d.index === index && d.interfaceType === interfaceType
                let found = fields.find(condition)
                fields[index] = {...found, value: newValue}
                return {...pre, fields:fields}
            })
        }

    }
})

export const entryUpdateFlag = atom({key:'entryUpdateFlag',default:false})
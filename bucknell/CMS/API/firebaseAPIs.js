import * as firebase from "firebase"
import memoize from 'memoizee'
import {delay, go, L} from "../utils/functions";
import * as f from '../utils/functional.es'

const conditionally = config => props => {
    return config.if(props) ? config.then(props) : config.else(props)
}
const asyncConditionally = config => async props => {
    return (await config.if(props))
        ? await config.then(props)
        : await config.else(props)
}
const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email.toLowerCase())
}
const transform = operation => data => operation(data)
const mergeData = (...fns) => async () => {
    try {
        let result = {}
        for (let i = 0; i < fns.length; i++) {
            const r = await fns[i]()
            result = { ...result, ...r }
        }
        return result
    } catch (e) {
        throw e
    }
}

/* fetch, update, Entries, categories */
export const fetchCategories = async (path) =>{
    const firestore = firebase.firestore()
    const docExist =  await checkDocExist(path)
    if(!docExist) throw new Error(`doc not exist: ${path}`)
    const res =
    await go(
        firestore.collection(path).get(),
        res => Promise.all(res.docs.map(async x => {
            const data = await x.data()
            return  ({...data, uid:x.id})
        }))
    )
    console.log(res)
    return res
}
export const fetchEntry = async (path) =>{
    const firestore = firebase.firestore()
    const docExist =  await checkDocExist(path)
    if(!docExist) return {}
    return go(
        firestore.doc(path).get(),
        d => ({...d.data(),uid:d.id})
    )
}
const checkDocExist = path => go(firebase.firestore().doc(path).get(), d=>d.exists)
export const updateEntry = async(path,data) =>{
    const firestore = firebase.firestore()
    const timestamps = firebase.firestore.Timestamp.fromDate(new Date())
    const category = path.split('/content')[0]
    console.log(path, data)
    return go(
            firestore.doc(path).set(data),
        firestore.doc(category).update({updated:timestamps}),
    )
}

export const convertDocPath2Usage = (targetField,fileData, firebaseDocPath) =>{
    let newUsage = {...firebaseDocPath, index: targetField.index}
    const key = `${newUsage.path}:${targetField.index}`.replaceAll('/',":")
    return{...targetField, data:
            {...fileData,
                usage:
                    {
                        // ...fileData.usage,
                        [key] : {...newUsage, key:key}
                    }
            }}
}



/* upload/delete files */
const generateMetadata = (metadata, url) =>{
    const filenameWithExt = metadata.name.split('/').pop()
    const fileNameNameHasDot = filenameWithExt.includes('.')
    const fileExt = fileNameNameHasDot? filenameWithExt.split('.').pop() : 'document'
    const filename = fileNameNameHasDot? filenameWithExt.replace(`.${fileExt}`,"") : filenameWithExt
    const MIMEType = metadata.contentType.split('/')
    return  {
        title: filename,
        contentType: MIMEType[0],
        contentSubType: MIMEType[1],
        fileType: fileExt,
        tags: "",
        id: metadata.md5Hash.replace(/\//g, '_'),
        note:"",
        name: filenameWithExt,
        updated: firebase.firestore.Timestamp.now().seconds,
        size:metadata.size,
        downloadURL: url,
        usage: "",
    }
}
//todo error handling
export const uploadTask = (f) => async ()=> {
    const fbStorage = firebase.storage()
    const database = firebase.database()
    const fileRef = fbStorage.ref('files').child(f.name)
    const res = await fileRef.put(f)
    const url = await res.ref.getDownloadURL()
    const metadata = generateMetadata(res.metadata,url)
    return await database.ref(`/${metadata.id}`).set(metadata)
}
export const deleteTask = (files) =>{
    const database = firebase.database()
    return go(
        files,
        L.map(id => database.ref(`/${id}`).remove()),
        L.take(files.length)
    )
}


/* file meatadata, usage hadling */
//todo clean up and test, error handling
export const updateFileFieldsUsage = async (fields) =>{
    const fieldsArr = Array.isArray(fields) ? fields : Object.values(fields)
    const fileUsageArr = fieldsArr.filter(f => f.data).map(f => f.data).filter(d=> d.usage)
    //todo use go
    for(const metadata of fileUsageArr){
        const fileId = metadata.id
        const usage1st = Object.values(metadata.usage)[0]
        const u_key = usage1st.key
        const res = await firebase.database().ref(`/${fileId}/usage/${u_key}`).update(usage1st)
    }
}

export const convert2Json = str => JSON.parse(str)
export const convert2String = obj => JSON.stringify(obj)

export const removeFileUsage = (fileId, usagePath) =>{
    if(!usagePath.includes(':')) throw new Error('field index not provided')
    return firebase.database().ref(`/${fileId}/usage/${usagePath}`)
        .remove()
}

export const removeFileFromEntry = (usagePath) =>{
    const fieldIndex = usagePath.key.split(':').pop()
    const docPath = usagePath.path
    const update = {}
    update[`fields.${fieldIndex}.value`] = ''
    update[`fields.${fieldIndex}.data`] = {}
    return firebase.firestore().doc(docPath).update(update)
}


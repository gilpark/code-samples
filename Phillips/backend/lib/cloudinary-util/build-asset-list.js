const fetch = require('node-fetch')
const f = require('../funtional.es')
const fs = require("fs")
const {convertJson, buildThumbNailUrl} = require("./common");
const {info, error} = require('../logger')

const headers = {
    'Authorization':'Basic ' + Buffer.from("128198633997253" + ":" + "plGXdjWQ7HTOYzedOaXVGiQ9wDA").toString('base64'),
    'Content-Type': 'application/json'
}

const fetchFolders = path =>{
    const baseUrl =  `https://api.cloudinary.com/v1_1/facepaint/folders/${path}`
    return fetch(baseUrl, {
        method: 'GET',
        headers: headers
    })
}

const fetchFiles = path => {
    const filesUrlBase = 'https://api.cloudinary.com/v1_1/facepaint/resources/search'
    return fetch(filesUrlBase, {
        method: 'POST',
        headers:headers,
        body: JSON.stringify({expression : `folder=${path}`})
    })
}

const recurseFetchFolders = async (starPath, recurse = false) =>{
    const res = await fetchFolders(starPath)
    const {folders} = await res.json()
    return folders.reduce(async (result, {path})=>{
        const ret = await result
        ret.push(path)
        if(recurse) ret.push(...await recurseFetchFolders(path))
        return ret
    },[])
}


//fetch files per folder
const recurseFetch = async (path, recurse) =>{
    try {
        const arr = await f.go(
            recurseFetchFolders(path, recurse),
            f.mapC(fetchFiles),
            f.mapC(r => r.json()),
            f.mapC(r => r.resources)
        )
        return arr.flat()
    }catch (e){
        error('fetchAndBuild::', e)
    }
    return []
}



//relative path to array /path/to/file => [path,to,file]
const makeFolderIndex = ({public_id}) => {
    const arr = public_id.split('/')
    arr.shift()
    arr.pop()
    return arr.filter(d => d !== "")
}
//remove project folder
const makeId = ({public_id, format}) => {
    const arr = public_id.split('/')
    arr.shift()
    let name = arr.pop()
    arr.unshift('')
    const path = arr.join('/')
    if(name.includes('txt') || name.includes('json')){
        return `${path}/${name}`
    }
    return `${path}/${name}.${format}`
}
const makeAsset = d =>{
    const thumbURL = f.curry2(buildThumbNailUrl)('w_200')
    return {
        ...d,
        folder_index: makeFolderIndex(d),
        id: makeId(d),
        thumbnail:thumbURL(d)
    }
}

const buildAssetList = async (path, recurse = false ) => {
    const assetList = await recurseFetch(path, recurse)
    return assetList.map(makeAsset)
}

module.exports = {fetchAssetList: buildAssetList, convert2Asset: makeAsset, parseFolderIndex: makeFolderIndex}


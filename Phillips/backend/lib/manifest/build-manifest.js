const f = require('../funtional.es')
const downloadHandler = require('../cloudinary-util/download-asset')
const buildFileTree = require('../folder-tree/folder-tree.js')
const {info, error} = require('../logger')
const lowdb = require('../db')

let WATCH_FOLDER = ""
let HOSTING_URL =  ""
let CLD_ROOT = ""

const {filterByKeys, setFromPath} = require("../object.utils")
const {fetchAssetList} = require("../cloudinary-util/build-asset-list")
const extend = operation => d => ({...d, ...operation(d)})

const filePathsFromDB = (fileDatabase) => data =>
    ({file_paths: f.sel([...data.folder_index, "files", {id: data.id}, "paths"], fileDatabase)})

const downloadAssets = async (list) =>{
    info('downloading files', list.length)
    try {
        await f.go(list,f.mapC(downloadHandler(WATCH_FOLDER)))
        info('downloaded: ', list.map(d => d.id))
        return list
    }catch(err){
        console.log(err)
        error('downloadingAssets:'. err)
    }
    return []
}

//todo remove lowdb dependency, maybe use global object?
const downloadItems = f.pipe(
    downloadAssets,
    list =>{
        list.forEach(l =>lowdb().get('assetList').push(l).write())
        return lowdb().get('assetList').value()
    })

//todo remove lowdb dependency, maybe use global object?
const fetchAssets = f.pipe(
    _=>fetchAssetList(CLD_ROOT, true),
    f.tap(list => lowdb().set('assetList', list).write())
)

//todo remove this
const reBuildTree_List = async (list) =>{
    let fileTree = buildFileTree(WATCH_FOLDER)
    return [list.map(extend(filePathsFromDB(fileTree))), fileTree]
}
const extendAssetList = async list =>{
    let fileTree = buildFileTree(WATCH_FOLDER)
    let extended = await f.go(list, f.mapC(extend(filePathsFromDB(fileTree))))
    return [extended,fileTree]
}

const checkMissingFiles = async data =>{
    const [list, fileTree] = data
    const missingFiles = list.filter(d => !d.file_paths || d.public_id.includes('txt'))
    return missingFiles.length > 0? await f.go(downloadItems(missingFiles),dl =>[...list, ...dl], extendAssetList): data
}

const buildList_Tree = async (list = []) => {
    const downloadAssetList = () => f.go(downloadItems(list), extendAssetList)
    const fetchAssetList = () => f.go(fetchAssets(), extendAssetList, checkMissingFiles)
    return await f.go(
        list.length > 0
            ? downloadAssetList()
            : fetchAssetList()
    )
}

const buildManifest = async (list, rebuild = false) =>{
    const [assetList, fileTree] = rebuild? await reBuildTree_List(list): await buildList_Tree(list)
    return assetList.reduce((result, item) =>{
        const selectedFields = filterByKeys("asset_id", "version", "secure_url", "thumbnail")(item)
        //todo check undefined
        // console.log(item.file_paths)
        result = item.file_paths? setFromPath(fileTree, item.file_paths, {...selectedFields, url: `${HOSTING_URL}${item.id}` }) : result
        return result
    }, fileTree)
}

module.exports = async({hostingUrlBase, watchFolder, cloudFolderPath}) =>{
    console.time('manifest build time')
    WATCH_FOLDER = watchFolder
    HOSTING_URL = hostingUrlBase
    CLD_ROOT = cloudFolderPath
    const ret = await buildManifest()
    console.timeEnd('manifest build time')
    return ret
}

module.exports.buildManifest = buildManifest


//test
// const cloudFolderPath = 'PM'
// const localFolderPath = path.join(__dirname,'../download')
// const hostingUrlBase = `http://localhost:3000/assets`
// const assetListBackupPath = path.join(localFolderPath,'assetList.json')
// startRoutine(hostingUrlBase, localFolderPath, cloudFolderPath, assetListBackupPath).then(_=>console.timeEnd('check'))



// modules
const fs = require('fs')
const pathModule = require('path')
const _ = require('lodash')

// exports
let pathRoot = ""
module.exports = function(path, options) {
    pathRoot = path
    options = _.extend({
        recurse: true,
        // filterFiles: /^(.+)\.js(on)?$/,
        // filterFolders: /^([^\.].*)$/,
    }, options || {})

    const result =  processFolder(path, options)
    result.id =  '/'
    result.path = []
    return result
};

const noop = () =>{}
const groupFilesFolders = (path, files) =>{
    // files.sort()
    const buildFilePath = (path, file) => pathModule.join(path, file)
    const isFolder = (file) => fs.statSync(buildFilePath(path, file)).isDirectory()
    const isFile = (file) => !fs.statSync(buildFilePath(path, file)).isDirectory()
    const folderList = files.filter(isFolder)
    const fileList = files.filter(isFile)
    return [folderList, fileList]
}

const parseFileList = (files, path) =>{
    return files.map((file,i) =>{
        const obj = {}
        //relative path as token /folder1/folder2
        const filePath = pathModule.join(path, file);
        obj.paths = filePath.split(pathRoot).pop().split('\\').filter(d => d !== "")
        obj.id =  '/'+obj.paths.join('/')
        obj.paths.pop()
        obj.paths.push('files')
        obj.paths.push(i)
        // obj.url = filePath
        obj.name = file
        obj.format = file.split('.').pop()
        return obj
    })
}

const parseFolderList = (folders, path, recurse) =>{
    return folders.reduce(function(obj, file) {
        const filePath = pathModule.join(path, file)
        const r = recurse(filePath)
        obj[file] = {
            id :  file,
            paths : filePath.split(pathRoot).pop().split('\\').filter(d => d !== ""),
            ...r
        }
        return obj
    },{})
}

function processFolder(path, options)
{
    let files = fs.readdirSync(path)
    files.sort();
    const [folderList, fileList] = groupFilesFolders(path.toString(), files)
    const folderResults = parseFolderList(folderList, path,
        options.recurse?(filePath) => processFolder(filePath, options) : noop)
    const fileResults = parseFileList(fileList, path)
    return {...folderResults, files: fileResults};
}

function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

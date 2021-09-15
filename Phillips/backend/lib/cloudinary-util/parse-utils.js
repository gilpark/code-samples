const fs = require('fs')
const path = require("path")
const util = require('util')
const readdir = util.promisify(fs.readdir)

//todo take entire cloudinary data instead of only pid
//covert 2 relative path without root project folder
const pid2FolderPath = pid =>{
    const arr = pid.split('/')
    arr.shift() //remove project folder name
    arr.pop()// remove filename
    arr.unshift('')
    arr.push('')
    return arr.join('\\')
}
//expand local path with pid
const pid2LocalPath = async (pid, localFolderPath) =>{
    const filename = pid.split('/').pop()
    const files = await readdir(localFolderPath)
    const match = files.map(file => file.split('.'))
        .filter(arr=>arr.length > 1)
        .find(arr => arr[0] === filename)
    return match? path.join(localFolderPath,match.join('.')) :undefined
}

const makeThumbNailUrl = (size = 'w_200',{format, secure_url}) =>{
    const baseUrl = secure_url.replace('upload',`upload/t_media_lib_thumb/`)
    const urlArr = baseUrl.split('/')
    const name = urlArr.pop().split('.')[0]
    urlArr.push(name)
    return `${urlArr.join('/')}.jpg`
}

module.exports = {pid2LocalPath,pid2FolderPath}

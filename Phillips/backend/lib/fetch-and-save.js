const fetch = require('node-fetch')
const fs = require('fs')
const util = require('util')
const {pipeline} = require('stream')
const streamPipeline = util.promisify(pipeline)

const fetchAndSave = async (url, writePath) =>{
    // console.log(writePath)
    const pArr = writePath.split('\\')
    pArr.pop() //remove filename
    const folderPath = pArr.join('\\')
    !fs.existsSync(folderPath) && fs.mkdirSync(folderPath, { recursive: true })
    const response = await fetch(url)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    return await streamPipeline(response.body, fs.createWriteStream(writePath))
}

module.exports = fetchAndSave
const fs = require('fs')
const path = require("path")
const util = require('util')
const readdir = util.promisify(fs.readdir)

const pid2LocalPath = async (pid, localFolderPath) =>{
    const filename = pid.split('/').pop()
    const files = await readdir(localFolderPath)
    const match = files.map(file => file.split('.'))
        .filter(arr=>arr.length > 1)
        .find(arr => arr[0] === filename)
    return match? path.join(localFolderPath,match.join('.')) :undefined
}

module.exports = pid2LocalPath
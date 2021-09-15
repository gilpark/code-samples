const path = require('path')
const fetchAndSave = require("../fetch-and-save");
const {pid2FolderPath} = require("./parse-utils")

const downloadResource = (folderPath) =>
{
    return async ({public_id, secure_url, id}) =>{
        const subFolder = pid2FolderPath(public_id)
        const filename = id.split('/').pop()
        // console.log(id, filename)
        const filePath = path.join(folderPath, subFolder, `${filename}`)
        await fetchAndSave(secure_url, filePath)
    }
}

module.exports = downloadResource
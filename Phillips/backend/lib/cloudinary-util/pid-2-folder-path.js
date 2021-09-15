const pid2FolderPath = pid =>{
    const arr = pid.split('/')
    arr.shift() //remove project folder name
    arr.pop()// remove filename
    arr.unshift('')
    arr.push('')
    return arr.join('\\')
}

module.exports = pid2FolderPath
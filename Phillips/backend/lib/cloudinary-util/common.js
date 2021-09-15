//take cloudinary resource object and build thumbnailUrl
const buildThumbNailUrl = (size = 'w_200',{format, secure_url}) =>{
    const baseUrl = secure_url.replace('upload',`upload/t_media_lib_thumb/`)
    const urlArr = baseUrl.split('/')
    const nameArr = urlArr.pop().split('.')
    nameArr.pop()
    const name =nameArr.join('.')
    urlArr.push(name)
    return `${urlArr.join('/')}.jpg`
}
const noop = () => {}

const convertJson = (str, defaultValue = {}) =>{
    try {
        return JSON.parse(str)
    } catch (e) {
        console.log(e)
        return defaultValue
    }
}


module.exports = {buildThumbNailUrl, convertJson}
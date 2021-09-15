const JSON2Value = (str, defaultValue = {}) =>{
    try {
        return JSON.parse(str)
    } catch (e) {
        console.log(e)
        return defaultValue
    }
}

module.exports = JSON2Value
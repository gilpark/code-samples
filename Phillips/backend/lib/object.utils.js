module.exports.setFromPath = function setDeep(obj, path, value, setrecursively = false) {
    //todo cleanup and chekc path array
    // console.log(path)
    let result  = Object.freeze(obj)
    path.reduce((a, b, level) => {
        if (setrecursively && typeof a[b] === "undefined" && level !== path.length-1){
            a[b] = {};
            return a[b];
        }
        if (level === path.length-1){
            a[b] = typeof value === "object"?{...a[b], ...value} : value;
            return value;
        }
        return a[b];
    }, result);
    return result
}

module.exports.filterByKeys = (...args) =>(obj) =>{
    const ret = {}
    args.forEach(a => ret[a] = obj[a])
    return ret
}

module.exports.selDeep = (obj, path) => {
    let result = Object.freeze(obj)
    return path.reduce((a, b) => {
        return a[b];
    }, result);
}
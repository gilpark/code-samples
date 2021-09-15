module.exports.forEachAsync = operation => source => {
    let talkback;
    source(0, async (t, d) => {
        if (t === 0) talkback = d
        if (t === 1) await operation(d)
        if (t === 1 || t === 0) talkback(1)
    })
}
module.exports.startWithAsyncTask = (task) => async (start, sink) => {
    if(start !== 0) return
    sink(0, t => {
        if(t === 2){
            console.log('clean up')
        }
    })
    let data = await task()
    sink(1,data)
}

module.exports.inject = (...objs) => source => (start,sink) =>{
    if(start !== 0) return
    source(0, (t, d) => {
        let arr = {}
        for(let i =0; i < objs.length; i++){
            let obj = objs[i]
            for(let key in obj){
                arr[key] = obj[key]
            }
        }
        sink(t, t === 1 ? {...d,...arr} : d)
    })
}

module.exports.buildMessage = (location,success,message, data) =>{
    //todo check args
    //success === number
    //msg === string
    //data === obj
    return {location:location, success:success, message:message, data:data}
}
module.exports.asyncMap = f => source => (start, sink) => {
    if (start !== 0) return;
    source(0, async (t, d) => {
        sink(t, t === 1 ? await f(d) : d)
    })
}
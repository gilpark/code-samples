const callbagsExpress = require('express')
const {pipe, share, merge, filter, forEach, map} = require('callbag-basics')

//todo create module for basic utils
function getDateTime() {
    let d = new Date();
    return ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
        ("00" + d.getDate()).slice(-2) + "-" +
        ("00" + d.getHours()).slice(-2) + "h" +
        ("00" + d.getMinutes()).slice(-2) + "m" +
        ("00" + d.getSeconds()).slice(-2) + "s"
}
String.prototype.isEmpty = () => this === ""

module.exports.startWithExpress = (app,setupProcess = null) =>  (start, sink) => {
    if(start !== 0) return
    if(typeof setupProcess === "function"){
        setupProcess(app)
    }
    sink(0, t => {
        if(t === 2){
            console.log('clean up')
        }
    })
    sink(-1,app)
}

//todo return fn to get object from setup
module.exports.createExpressSource = (port, setupProcess = null) => (start,sink) => {
    if(start !== 0) return
    const app = callbagsExpress()
    if(typeof setupProcess === "function"){
        setupProcess(app)
    }
    app.set('port',(process.env.PORT || port))
    sink(-1, app) //set app
    sink(0, t => {
        if(t === 2){
            console.log('clean up')
        }
    })
    // https.createServer({}, app).listen(app.get('port'))
    app.listen(app.get('port'), function () {
        console.log(`[${getDateTime()}] NextNow services are running on port`, app.get('port'))
    })
}

module.exports.addRoutes = (...paths) =>{
    return source => (start,sink) =>{
        if(start !== 0) return
        source(0, (t, d) => {
            if (t === -1) {
                let app = d
                paths.forEach(({path, method}) => {
                    if(path.isEmpty()) throw new Error('path is empty')
                    if(method.isEmpty()) throw new Error('method is empty')
                    app[method.toLowerCase()](path, (req,res) => sink(1,{path,req,res}))
                })
                sink(-1,app)
            } else{
                sink(t, d)
            }
        })
    }
}

module.exports.addExtension = operation => source => (start,sink) =>{
    let extension = undefined
    if(start !== 0) return
    source(0, (t, d) => {

        if (t === -1) {
            let app = d
            extension = operation(app)
            sink(-1,app)
        } else if(t === 1){
            // console.log({...d, ...extension}, 0)
            // console.log(d, 1)
            sink(t, extension?{...d, ...extension} : d)
        }else{
            sink(t, d)
        }
    })
}


//todo add regex for custom filtering
//todo use fn => fn to skip route.connect
module.exports.makeRoutes = (path, method, strict = true) =>{
    if(path.isEmpty()) throw new Error('path is empty')
    if(method.isEmpty()) throw new Error('method is empty')
    return {
        path,
        method,
        connect: stream => pipe(
                            stream,
                            filter(d => strict?(d.path === path):d.path.includes(path)),
                            map(d => ({res:d.res,req:d.req}))
        )
    }
}
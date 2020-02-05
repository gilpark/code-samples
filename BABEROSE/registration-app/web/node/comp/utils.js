const fs = require('fs')
const { execFile } = require('child_process')
const path = require('path')

function getDateTime() {
    let d = new Date();
    return ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
        ("00" + d.getDate()).slice(-2) + "-" +
        ("00" + d.getHours()).slice(-2) + "h" +
        ("00" + d.getMinutes()).slice(-2) + "m" +
        ("00" + d.getSeconds()).slice(-2) + "s"
}

function getDate() {
    let d = new Date();
    return ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2)
}

function readFilePromise(fileName)
{
    return new Promise(function(resolve, reject) {
        fs.readFile(fileName, function(err, data) {
            if(err !== null) return reject(err);
            resolve(data);
        })
    })
}

function writeFilePromise(filename,data) {
    return new Promise(function (resolve,reject) {
        fs.writeFile(filename, data, function(err) {
            if (err) reject(err)
            else resolve(data)
        })
    })
}

function toLocaleUTCDateString(date) {
    let formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    })

    return formatter.formatToParts(date).map(({type, value}) => {
        switch (type) {
            case 'day': return date.getUTCDate();
            case 'hour': return date.getUTCHours();
            case 'minute': return date.getUTCMinutes();
            case 'month': return date.getUTCMonth() + 1;
            case 'second': return date.getUTCSeconds();
            case 'timeZoneName': return "UTC";
            case 'year': return date.getUTCFullYear();
            default : return value;
        }
    }).reduce((string, part) => string + part);
}

/** * @return {string} */
function TimeStamp(){ return `[${getDateTime()}]`}
function promisify(fn) {
    return function promisified(...params) {
        return new Promise((resolve, reject) => fn(...params.concat([(err, ...args) => err ? reject(err) : resolve( args.length < 2 ? args[0] : args )])))
    }
}


const batchProcess = (logger,BAT_PATH,DEST_PATH) => source =>(start, sink) =>{
    if(start  !== 0) return
    source(0,(t,d) =>{
        if(t === 1){
            const {data} = d
            console.log(data,"batch")
            try{
                const pathToBatch = path.join(BAT_PATH,'convert.bat')
                logger.debug(`[${getDateTime()}] starting video converting process`.blue.bold)
                logger.debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'.white.bold)
                execFile(pathToBatch, (err, stdout, stderr) => {
                    if (err) {
                        logger.debug("Batch process encountered an error".magenta);
                        logger.debug(err);
                        return sink(t,d)
                    }
                    logger.debug(stdout.toString().grey);
                    logger.debug(`[${getDateTime()}] Done processing`.blue.bold);
                    logger.debug('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<'.white.bold)
                    let filename = `${data.f}-${getDateTime()}.gif`
                    let dest_path = path.join(DEST_PATH,filename)
                    fs.createReadStream(path.join(BAT_PATH,'output.gif'))
                        .pipe(fs.createWriteStream(dest_path))
                    logger.debug(`[${getDateTime()}] copied output.gif file to ${dest_path}`.blue.bold)
                    setTimeout(()=>{

                        fs.unlink(path.join(BAT_PATH,'out.mp4'), function (err) {
                            if (err) console.log(err)
                            console.log(path.join(BAT_PATH,'out.mp4'),'File deleted!')
                        })
                        fs.unlink(path.join(BAT_PATH,'convert.mp4'), function (err) {
                            if (err) console.log(err)
                            console.log(path.join(BAT_PATH,'convert.mp4'),'File deleted!')
                        })
                        sink(1,{first: data.f, last:data.l, email:data.e, file_name: filename, file_path: dest_path, option:data.option})
                    },100)
                })
            }
            catch (e) {
                logger.debug(`[${getDateTime()}] got error while processing`.magenta,e)
            }
        }
        else sink(t,d)
    })
}

const fromGetRoute = (app, path) => (start, sink) => {
    if (start !== 0) return;
    const handler = (req,res) =>{
        return sink(1, [req,res]);
    }
    sink(0, t => {
        if (t === 2){
            console.log('disposed')
        }
    })
    app.get(path, handler);
}
const fromWS = (app, path) => (start, sink) => {
    if (start !== 0) return;
    const handler = (ws, req) =>{
            ws.on('message', (msg) =>{
                return sink(1, msg)
            })
            console.log('new client connected')
    }
    sink(0, t => {
        if (t === 2){
            console.log('disposed')
        }
    })
    app.ws(path, handler);
}

const emptyOP = d =>{}

module.exports = {writeFilePromise,getDateTime,toLocaleUTCDateString,getDate,promisify, fromGetRoute, emptyOP,batchProcess,fromWS}
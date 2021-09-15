const express = require('express')
const app = express()
const path = require('path')
const colors = require('colors')
const {setupProject} = require('./comp/setup')
const {DBQ} = require('./comp/lowDBQ')
const {forEach, map, filter, pipe, merge} = require('callbag-basics')
const {getDateTime,fromGetRoute,batchProcess,fromWS,emptyOP} = require("./comp/utils")
const {makeQProcess,makeGAProcess}  = require('./comp/qProcess')

const service = async () => {
    const {DEST_FOLDER, DB_PATH, logger, SERVER_URL, BAT_PATH} = await setupProject()
    const expressWs = require('express-ws')(app)
    app.use(express.static(path.resolve(__dirname, './build')))
    app.set('port', (process.env.PORT || 5000))
    const aWss = expressWs.getWss('/')
    const broadCast = (msg) =>{
        aWss.clients.forEach((client) => client.send(msg))
        return JSON.parse(msg)
     }
    logger.debug(`====================================babe-Q-v0.1==========================================`.blue.bold)
    logger.debug(`[${getDateTime()}] app running in [${process.cwd()}] folder`.white.bold)
    logger.debug(`[${getDateTime()}] server endpoint: ${SERVER_URL}`.white.bold)
    logger.debug(`[${getDateTime()}] UPLOAD FOLDER at : [${DEST_FOLDER}] folder`.white.bold)
    logger.debug(`=======================================================================================`.blue.bold)

    const qProcess = makeQProcess(logger, SERVER_URL)
    const gaProcess = makeGAProcess(logger, SERVER_URL)
    const Q = new DBQ(qProcess, {afterProcessDelay: 2000}, DB_PATH)
    const onReq$ = pipe(
        fromGetRoute(app, '/'),
        map(([req,res]) => res.sendFile(path.resolve(__dirname, './build', 'index.html')))
    )
    const ws$ = pipe(
        fromWS(app,'/'),
        map(msg => broadCast(msg)),
        filter(json => json.action === 'convert'),
        batchProcess(logger, BAT_PATH, DEST_FOLDER),
        map(d => {
            gaProcess(d)
            Q.add(d)
        })
    )
    const endpoints = merge(onReq$,ws$)
    forEach(emptyOP)(endpoints)

    app.listen(app.get('port'), function () {
        logger.debug(`[${getDateTime()}] NextNow services are running on port`.blue.bold, app.get('port'))
        Q.run()
    })
}
// service()
module.exports = {service}
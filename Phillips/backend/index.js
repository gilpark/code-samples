const {pipe, share, merge} = require('callbag-basics')
const observe = require('callbag-observe')

const fs = require('fs')
const util = require('util')
const unlink = util.promisify(fs.unlink)
const path = require("path")

const express = require('express')
const cors = require('cors')

// const pid2subFolderPath = require("./lib/cloudinary-util/pid-2-folder-path")
const longpoll = require("express-longpoll")
const {addRoutes, createExpressSource, makeRoutes} = require('./lib/node-callbags-utils/callbags-express')
const makeOnNotifyHandler = require('./src/NotifictiaonHandler')
const makePublishHandler = require('./src/PublishHandler')
const makeManifestHandler = require('./src/ManifestHandler')
const createMasterManifest = require("./lib/manifest/build-manifest")

const {info, error} = require('./lib/logger')
const lowdb = require('./lib/db')
const {compareAndUpdate} = require("./lib/db")

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const service = async () =>{
    const TABLET_BUILD_FOLDER = path.join(__dirname,'public')
    // const TEST_FOLDER = path.join(__dirname,'test')
    const adapter = new FileSync(path.join(process.cwd(),'config.json'))
    const lowConfig = low(adapter)
    lowConfig.defaults({
        SYNC_FOLDER: path.join(process.cwd(),'download'),
        CLD_ROOT_FOLDER:'PM',
        PORT:3000
    }).write()
    const {SYNC_FOLDER, CLD_ROOT_FOLDER, PORT} = lowConfig.read().value()

    const HOSTING_URL_BASE = `http://localhost:${PORT}/assets`
    info('================== node app started ===================')
    info('creating asset manifest..')
    const config = {
        hostingUrlBase: HOSTING_URL_BASE,
        watchFolder: SYNC_FOLDER,
        cloudFolderPath:CLD_ROOT_FOLDER
    }

    const db = lowdb(SYNC_FOLDER)
    const manifest = await createMasterManifest(config)
    const removeFolders = compareAndUpdate(manifest, db)
    removeFolders.forEach(f =>  fs.rmdirSync(path.join(SYNC_FOLDER, f), { recursive: true }))
    // console.log(db.read().value())
    const setExpressOptions = app => {
        app.use(cors())
        app.use(express.json()) //body parser deprecated.
        app.use(express.urlencoded({extended: true}))
        app.use('/assets', express.static(SYNC_FOLDER))
        app.use('/', express.static(TABLET_BUILD_FOLDER))
        // app.use('/test', express.static(TEST_FOLDER))
        const lp = longpoll(app)
        lp.create("/subscribe")
        info('express setup done')
    }

    //todo handle 404 routes
    const notificationRoute = makeRoutes('/notification', 'post' )
    const publishRoute = makeRoutes('/publish', 'post' )
    const manifestRoute = makeRoutes('/manifest/:id', 'post', false )

    const express$ = share(pipe(
        createExpressSource(PORT,setExpressOptions),
        addRoutes(notificationRoute, publishRoute, manifestRoute),
    ))
    const onNotify$ = makeOnNotifyHandler(express$, notificationRoute, SYNC_FOLDER)
    const onPub$ = makePublishHandler(express$, publishRoute)
    const onManifest$ = makeManifestHandler(express$, manifestRoute)
    const sources = merge(onNotify$, onPub$, onManifest$)

    pipe(
        sources,
        observe(()=>{})
    )
}

module.exports = {service}



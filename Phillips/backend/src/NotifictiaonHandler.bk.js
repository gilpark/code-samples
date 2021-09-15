const path = require('path')
const util = require('util')
const fs = require('fs')
const unlink = util.promisify(fs.unlink)

const {info, error} = require('../lib/logger')
const lowdb = require('../lib/db')
const longpoll = require("express-longpoll")

const {pipe, share, filter, map, merge} = require('callbag-basics')
const tap = require('../lib/node-callbags-utils/async-tap.js')
const of = require('callbag-of').default;
const switchMap = require('callbag-switch-map')

const pid2FolderPath = require("../lib/cloudinary-util/pid-2-folder-path")
const pid2LocalPath = require("../lib/cloudinary-util/pid-2-local-path")
const {compareAndUpdate} = require("../lib/db");
const {convert2Asset} = require("../lib/cloudinary-util/build-asset-list");
const {buildManifest} = require("../lib/manifest/build-manifest");


module.exports = function (express$, routes, SYNC_FOLDER){
    const checkSyncFolderName = ({public_id}) => public_id?.startsWith('PM/')
    const checkNotifyType = type => d => d.notification_type === type
    const lp = longpoll()
    const db = lowdb()
    const source =
        share(pipe(
            routes.connect(express$),
            switchMap(({res, req}) =>{
                res.status(200)
                res.send('pass')
                const {notification_type,resources} = req.body
                info('get notification from cloudinary:', notification_type)
                return resources?
                    pipe(of(...resources),map(d => ({notification_type,...d})))
                    : of({notification_type,...req.body})
            }),
            filter(checkSyncFolderName),
        ))

    const onFileUploadEvent = pipe(
        source,
        filter(checkNotifyType('upload')),
        tap( async (d) =>{
            info('new content:', d)
            const manifest = await buildManifest([convert2Asset(d)])
            lp.publish("/subscribe", {id:'all', action:'manifest-update', payload:JSON.stringify(db.read().value())})
            info('manifest updated :', manifest)
            compareAndUpdate(manifest, db)
        })
    )
    const onFileDeletedEvent = pipe(
        source,
        filter(checkNotifyType('delete')),
        tap(async (d) =>{
            info('delete content:', d)
            const {public_id} = d

            const subFolder = pid2FolderPath(public_id)
            const folderPath = path.join(SYNC_FOLDER, subFolder)
            const filePath = await pid2LocalPath(public_id, folderPath)
            const res = filePath? await unlink(filePath) : 'file not found'

            db.get('assetList').remove({public_id:public_id}).write()
            const list = db.get('assetList').value()

            const manifest = await buildManifest(list, true)
            lp.publish("/subscribe", {id:'all', action:'manifest-update', payload: JSON.stringify(db.read().value())})
            compareAndUpdate(manifest, db)
            info('manifest updated :', manifest)
            // db.set('manifest', manifest).write()

        })
    )
    return merge(onFileUploadEvent,onFileDeletedEvent)
}

/*
raw upload event data
{
    "notification_type": "upload",
    "timestamp": "2021-04-15T16:45:47+00:00",
    "request_id": "a1e5ca1e429f000125097f846b7327f3",
    "asset_id": "eb8fa7e7cb1c9a54243039f53381f4e3",
    "public_id": "PM/totem/aaaa",
    "version": 1618505146,
    "version_id": "44896e4bad670eedb860bb758b3495b1",
    "width": 300,
    "height": 400,
    "format": "png",
    "resource_type": "image",
    "created_at": "2021-04-15T16:45:46Z",
    "tags": [],
    "bytes": 1237,
    "type": "upload",
    "etag": "41c1dad4827c72051da6bb11a7b98fdf",
    "placeholder": false,
    "url": "http://res.cloudinary.com/facepaint/image/upload/v1618505146/PM/totem/aaaa.png",
    "secure_url": "https://res.cloudinary.com/facepaint/image/upload/v1618505146/PM/totem/aaaa.png",
    "access_mode": "public",
    "original_filename": "aaaa"
}

raw delete event data
{
    "notification_type": "delete",
    "resources": [
        {
            "resource_type": "image",
            "type": "upload",
            "asset_id": "eb8fa7e7cb1c9a54243039f53381f4e3",
            "public_id": "PM/totem/aaaa",
            "version": 1618505146
        }
    ]
}

* */
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require("path")
const f = require('./funtional.es')
const equal = require('fast-deep-equal')
let db = undefined
const fs = require('fs')


module.exports = (SYNC_FOLDER) =>{
    if(!db){
        console.log(SYNC_FOLDER)
        !fs.existsSync(SYNC_FOLDER) && fs.mkdirSync(SYNC_FOLDER, { recursive: true })
        const adapter = new FileSync(path.join(SYNC_FOLDER,'master.json'))
        db = low(adapter)
        db.defaults({master:{}, assetList:[]}).write()
    }
    return db
}

const compareAndUpdate = (newData, _db, cb = undefined) =>{
    const subFolders = f.go(newData, f.filter(d =>d['id']))
    const folderList = _db.get('assetList').value().map(d => {
        // console.log(d)
        return d.folder?d.folder.split('/')[1] : d.folder_index[0]
    }).filter(onlyUnique)
    const removeFolders = Object.keys(subFolders).filter(f => !folderList.includes(f))
    const deviceIds = folderList
    const getSavedVersion = id => _db.get(id).value() || {}
    const timeStamp = Date.now()
    const updateDB = d =>{
        _db.set(
            d.id,
            d.updated?{...d.old, manifest_version: d.version} : {...d.new, manifest_version: timeStamp})
            .write()
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    db._.mixin({
        removeKey: function(obj) {
            removeFolders.forEach(key =>{
                console.log('removing from json-', key)
                delete obj[key]
            })
            return obj
        }
    })
    db.read().removeKey().write()


    const runWithIds = ids => f.go(
        ids,
        // removeOutdated,
        f.map(id => {
            const oldData = getSavedVersion(id)
            return{
                version: oldData.manifest_version,
                id: id,
                old: f.go(oldData, f.tap(d => delete d['manifest_version'])),
                new: id === 'master'?newData : newData[id],
            }
        }),
        f.map(d =>({...d, updated: equal(d.new, d.old)})),
        f.map(updateDB)
    )
    runWithIds([...deviceIds,'master'])
    if(cb){
        cb()
    }

    return removeFolders
}

module.exports.compareAndUpdate = compareAndUpdate
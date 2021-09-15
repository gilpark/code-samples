module.exports.createLowDBSource = (dbPath) => {
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync(dbPath)
    return {db:low(adapter)}
}

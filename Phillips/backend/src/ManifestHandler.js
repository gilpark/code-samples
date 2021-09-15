const {pipe, share, filter, map, merge} = require('callbag-basics')
const tap = require('../lib/node-callbags-utils/async-tap.js')
const f = require('../lib/funtional.es')
const lowdb = require('../lib/db')
const {info, error} = require('../lib/logger')

module.exports = function (express$, route){
    const db = lowdb()
    return pipe(
        route.connect(express$),
        tap( ({res, req}) =>{
            const master = db.get('master').value()
            const {id} = req.params
            const selected = db.get(id).value()
            const ret = selected || master
            info('manifest requested from', id)
            res.send(({...ret}))
            info('manifest sent')
        })
    )
}

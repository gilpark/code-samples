const {pipe, share, filter, map, merge} = require('callbag-basics')
const tap = require('../lib/node-callbags-utils/async-tap.js')
const longpoll = require("express-longpoll")
const {info, error} = require('../lib/logger')

module.exports = function (express$, route){
    const lp = longpoll()
    return  pipe(
        route.connect(express$),
        tap( ({res, req}) =>{
            const data = req.body
            const id = data?.id
            const action = data?.action

            if(!id || !action) return res.status(400).send({
                message: '[id] or [action] field is missing!'
            })
            lp.publish("/subscribe",data)
            res.send(({...data}))
            info('broadcast data:', data)
        })
    )
}

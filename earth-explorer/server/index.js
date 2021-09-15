const fs = require('fs')
const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const SerialPort = require('serialport')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const FxJS = require("fxjs")
const _ = require("fxjs/Strict")
const L = require("fxjs/Lazy")
const C = require("fxjs/Concurrency")
const fetch = require('node-fetch')
const csv = require('csv-parser')
let testdata = require('./test-data')


const service = async () =>{
    const adapter = new FileSync('config.json')
    const raw_config = low(adapter)
    const server_port = 3000

    raw_config.defaults({
        SERIAL: {
            serial_port: "COM3",
            baudRate: 9600
        },
        UI: {
            imageHeight: "20%",
            fontSize: "1rem",
            toggleHeight: 400,
            backgroundColor: "rgba(0,0,0,0.7)",
            hudHeight: "95%",
            maskStartCircleSize:"40%",
            maskEndCircleSize:"48%",
            // labelAndPinScale:2
        },
        APP: {
            MAX_HEIGHT: 10000000,
            MIN_HEIGHT: 400,
            MAX_Y: 80,
            chromePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            // popupImagePath:"C:\\Users\\sendt\\Documents\\Projects\\EE\\poc\\build\\popup-images",
            TIMEOUT_SECONDS: 3000,
            TIMEOUT_MAX_ZOOM_OUT_DURATION: 30,
            TIMEOUT_TILT_X: 3
        },
        CONTROL: {
            TILT_SPEED: 0.3,
            TILT_X_THRESHOLD: 0.1,
            TILT_Y_THRESHOLD: 0.1,
            TILT_SPEED_MUL_NEAR_GROUND: 3,

            ZOOM_SPEED: 1,
            ZOOM_THRESHOLD: 0,

            INVERT_X: false,
            INVERT_Y: false,
            INVERT_Z: true
        },
        DEBUG: {
            joystick: true,
            debugHeight: true,
            fps: true,
            tilt: true,
            zoom: true,
            hideAll: false
        }
    }).write()

    const {serial_port, baudRate} = raw_config.read().value().SERIAL
    const chromePath = raw_config.read().value().APP.chromePath
    const buildPath = path.resolve(__dirname, '../public')
    const popupImagePath = path.resolve(process.cwd(),'popup-images')
    console.log(popupImagePath)
    app.use(express.static(buildPath))
    app.use('/popup',express.static(popupImagePath))
    app.set('port', (process.env.PORT || server_port))
    // app.use(express.json())
    app.use(cors())

    const server = require('http').Server(app)
    const io = require('socket.io')(server, { cors: { origin: '*' } })

    io.on('connection', client => {
        console.log('Client connected...');
        client.on('join', function (data) {
            console.log(data);
        })
    })

    const reversed = [...testdata].reverse()
    const zoomTestDataSet = [...testdata, ...reversed]
    const len = zoomTestDataSet.length
    let index = 0
    //replay recorded data
    app.get('/test',(req, res)=>{
        // let i = 0;
        _.go(
            fetch(`http://localhost:${server_port}/test/test.json`),
            r => r.json(),
            _.map(({tick, value}) => ({tick:parseFloat(tick), data:JSON.parse(value)})),
            _.map(_.tap(d => setTimeout(()=>{
                let ret = d.data
                // const idx = index % len
                // let ret = zoomTestDataSet[idx]
                io.emit('data',ret)
                index ++
            },d.tick * 1000))),
            _=>res.send('test')
        )
    })

    app.get('/config', (req, res) => {
        const config_data = raw_config.read().value()
        res.json(config_data)
    })


    const serport = new SerialPort(serial_port, { baudRate: baudRate })
    const parser = serport.pipe(new SerialPort.parsers.Readline({ delimiter: '\r' }))

    serport.on('error', function(err) {
        console.log('Error: ', err.message)
    })

    parser.on('data', data =>{
        console.log(data)
        let values = data.split(' ')
        let d = {
            x: parseFloat(values[1]),
            y: parseFloat(values[2]),
            z: parseFloat(values[3])
        }
        if(values[0] === "0x80") {
            io.emit('data', d)
        }
    })

    //resetting the table input
    serport.write(Buffer.from('spewoff\r'))
    serport.write(Buffer.from('quiet\r'))
    serport.write(Buffer.from('x0set\r'))
    serport.write(Buffer.from('y0set\r'))
    serport.write(Buffer.from('z0set\r'))
    serport.write(Buffer.from('spewman2\r'))


    server.listen(app.get('port'), ()=>{
        console.log('EE app started')
    })

   
}

module.exports = {service}
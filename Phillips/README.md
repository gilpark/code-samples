# Phillips-Medisize TouchScreen (svelte.js, electron.js, node.js)

### Code samples

Read and parse Serial data from node.js
`server/index.js`

```javascript
const server = require('http').Server(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })

/..../

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
```

listening the data from client side
`src/components/joysticks.js`

```javascript
/..../
const socket = io('http://localhost:3000')

socket.on('connect', function(data) {
    // socket.emit('join', 'Hello World from client');
})

let tempX= 0, tempY= 0, tempZ = 0
socket.on('data', messages => {
    const {x,y,z} = messages
    const targetX = x.remap(-20,20,-1,1,true) * (INVERT_X? -1 :1)
    const targetY = y.remap(-20,20,-1,1,true) * (INVERT_Y? -1 :1)

    //todo config zoom min/max range
    const targetZ =  (z - tempZ).remap(-15,15,-1,1,true)  * (INVERT_Z? -1 :1)
    input$.set({
        tilt: { x: targetX, y: targetY },
        zoom: targetZ
    })
    tempX = x
    tempY = y
    tempZ = z
})
```

consuming 3DOF values in svelte/cesium
api/store
inputHandler


### documentation
#### App
 * [video 1](https://drive.google.com/file/d/1EhHYihvC4hPGFzWnv5ML3AtN10DpcKAP/view?usp=sharing)

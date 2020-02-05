const fs = require("fs")
const express = require('express')
const path = require('path')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const PORT = process.env.PORT || 5000
const nocache = require('nocache')
const cors = require('cors')
const {readFilePromise} = require("./utils");
const {writeFilePromise} = require("./utils");
let whitelist = ['https://a60ar.ihostcontent.com', 'https://amway-landing.herokuapp.com'];
let corsOptions = {
  origin: function(origin, callback){
    let originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  methods:["GET", "PUT", "POST", "DELETE"],
  allowedHeaders:["Origin", "X-Requested-With", "Content-Type", "Accept"],
  maxAge:-1
}

const mysql = require('mysql');
let dbConfig = {
  host: "##############",
  user: "##############",
  password: "##############",
  database: "##############"
}
let connection
function handleDisconnect() {
  connection = mysql.createConnection(dbConfig); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      console.log(err)                                 // server variable configures this)
    }})
}

handleDisconnect();

function getRecord() {
  let val = {xs: 0,beauty: 0,icook:0,nutrition:0}
  connection.query("SELECT * FROM record", function (err, result, fields) {
    if (err) connection.log(err)
    console.log(result);
    val.xs = result[0].xs;
    val.beauty = result[0].beauty
    val.icook = result[0].icook
    val.nutrition = result[0].nutrition
  })
  return val
}

if (!fs.existsSync(path.resolve(__dirname, '../react-ui/build/db.json'))) {
  writeFilePromise("db.json",JSON.stringify({"xs":0, "beauty":0, "icook": 0, "nutrition": 0}))
      .then(x => {
        console.log(x)
      })
}

if (cluster.isMaster) {
  console.log(`Node cluster master ${process.pid} is running`)
  for (let i = 0; i < numCPUs; i++) cluster.fork()
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  })
} else {
  const app = express()
  app.use(express.static(path.resolve(__dirname, '../react-ui/build')))
  app.use(nocache())
  app.get('*',cors(corsOptions), function(request, response) {
      response.sendFile( path.resolve(__dirname, '../react-ui/build', 'index.html'))
  })
  app.post('/update-xs', function(request, response) {
    let sql = "UPDATE record SET xs=xs+1, beauty=beauty, icook=beauty, nutrition=beauty ORDER BY xs DESC LIMIT 1";
    connection.query(sql, function (err, result) {
      if (err) console.log(err)
      console.log(result.affectedRows + " record(s) updated");
    })

    readFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'))
        .then(x => {
          let db =  JSON.parse(x)
          let xs = db.xs + 1
          db.xs = xs;
          return db
        })
        .then(data => {
          console.log(data)
          return writeFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'),JSON.stringify(data))
        })
        .then(x =>{
          console.log(x)
          return response.send(JSON.parse(x))
        })
        .catch(e => response.code(400).send({err:e}))
  })
  app.post('/update-beauty', function(request, response) {
    let sql = "UPDATE record SET xs=xs, beauty=beauty+1, icook=icook, nutrition=nutrition ORDER BY xs DESC LIMIT 1";
    connection.query(sql, function (err, result) {
      if (err) console.log(err)
      console.log(result.affectedRows + " record(s) updated");
    })

    readFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'))
        .then(x => {
          let db =  JSON.parse(x)
          let beauty = db.beauty + 1
          db.beauty = beauty;
          return db
        })
        .then(data => {
          console.log(data)
          return writeFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'),JSON.stringify(data))
        })
        .then(x =>{
          console.log(x)
          return response.send(JSON.parse(x))
        })
        .catch(e => response.code(400).send({err:e}))
  })
  app.post('/update-icook', function(request, response) {
    let sql = "UPDATE record SET xs=xs, beauty=beauty, icook=icook+1, nutrition=nutrition ORDER BY xs DESC LIMIT 1";
    connection.query(sql, function (err, result) {
      if (err) console.log(err)
      console.log(result.affectedRows + " record(s) updated");
    })

    readFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'))
        .then(x => {
          let db =  JSON.parse(x)
          let icook = db.icook + 1
          db.icook = icook;
          return db
        })
        .then(data => {
          console.log(data)
          return writeFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'),JSON.stringify(data))
        })
        .then(x =>{
          console.log(x)
          return response.send(JSON.parse(x))
        })
        .catch(e => response.code(400).send({err:e}))
  })
  app.post('/update-nutrition', function(request, response) {
    let sql = "UPDATE record SET xs=xs, beauty=beauty, icook=icook, nutrition=nutrition+1 ORDER BY xs DESC LIMIT 1";
    connection.query(sql, function (err, result) {
      if (err) console.log(err)
      console.log(result.affectedRows + " record(s) updated");
    })
    readFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'))
        .then(x => {
          let db =  JSON.parse(x)
          let nutrition = db.nutrition + 1
          db.nutrition = nutrition;
          return db
        })
        .then(data => {
          console.log(data)
          return writeFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'),JSON.stringify(data))
        })
        .then(x =>{
          console.log(x)
          return response.send(JSON.parse(x))
        })
        .catch(e => response.code(400).send({err:e}))
  })
  app.post('/reset', function(request, response) {
    let sql = "UPDATE record SET xs=0, beauty=0, icook=0, nutrition=0 ORDER BY xs DESC LIMIT 1";
    connection.query(sql, function (err, result) {
      if (err) console.log(err)
      console.log(result.affectedRows + " record(s) updated");
    })
    readFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'))
        .then(x => {
          let db =  JSON.parse(x)
          db =  {"xs":0, "beauty":0, "icook": 0, "nutrition": 0};
          return db
        })
        .then(data => {
          console.log(data)
          return writeFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'),JSON.stringify(data))
        })
        .then(x =>{
          console.log(x)
          return response.send(JSON.parse(x))
        })
        .catch(e => response.code(400).send({err:e}))
  })
  app.post('/record', function(request, response) {
    readFilePromise(path.resolve(__dirname, '../react-ui/build/db.json'))
        .then(x =>{
          console.log(x)
          return response.send(JSON.parse(x))
        })
        .catch(e => response.code(400).send({err:e}))
  })

  app.post('/record-sql', function(request, response) {
    connection.query("SELECT * FROM record", function (err, result, fields) {
      if (err) connection.log(err)
      console.log(result);
      return response.send({
        msg: "SQL response",
        xs: result[0].xs,
        beauty: result[0].beauty,
        icook: result[0].icook,
        nutrition: result[0].nutrition
      })
    })
  })

  app.listen(PORT, function () {
    console.log(`Node cluster worker ${process.pid}: listening on port ${PORT}`)
  })
}
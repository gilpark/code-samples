const fs = require('fs')

function getDateTime() {
  let d = new Date();
  let str =
      ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d.getDate()).slice(-2) + "-" +
      ("00" + d.getHours()).slice(-2) + "h" +
      ("00" + d.getMinutes()).slice(-2) + "m" +
      ("00" + d.getSeconds()).slice(-2) + "s"
  return str
}

function readFilePromise(fileName)
{
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, function(err, data) {
      if(err !== null) return reject(err);
      resolve(data);
    })
  })
}

function writeFilePromise(filename,data) {
  return new Promise(function (resolve,reject) {
    fs.writeFile(filename, data, function(err) {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

function appendFilePromise(filename,data) {
  return new Promise(function (resolve,reject) {
    fs.appendFile(filename, data, function(err) {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

const checkAppendFilePromise = (fileName,item) => {
  return readFilePromise(fileName).then(data => {
    let str = data.toString('utf8').split('\n')
    let splitArray = str
    let start = splitArray.indexOf(item.replace('\n',''))
    if(start !== -1) {
      return  data.toString('utf8')
    }else{
      return appendFilePromise(fileName,item)
    }
  })
}

const removeItem = (fileName, item) => {
  return readFilePromise(fileName).then(data => {
    let str = data.toString('utf8').split('\n')
    let splitArray = str
    let start = splitArray.indexOf(item.replace('\n',''))
    if(start !== -1) {
      splitArray.splice(splitArray.indexOf(item), 1)
      return writeFilePromise(fileName,splitArray.join('\n'))
    }else{
      return data.toString('utf8')
    }
  })
}

module.exports = {checkAppendFilePromise,readFilePromise,writeFilePromise,getDateTime,appendFilePromise,removeItem}
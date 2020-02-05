/*global chrome window*/
import xs from "xstream";
import axios from "axios";
import Filer from 'filer.js'

// export const readJSonPromise = (url) =>{
//   //todo url resolve, or response time
//   return new Promise(function(resolve, reject) {
//     return fetch(url).then(response => {
//       if (response.ok) {
//         resolve(response.json())
//       } else {
//         resolve(-1)
//       }
//     }, error => {
//       console.log(error)
//       resolve(-1)
//     })
//   })
// }

// export  const readJsonObservable = (url) => {
//   return xs.create({start : listener => {
//       fetch(url).then(x => x.json())
//           .then(x => {
//             listener.next(x)
//             listener.complete()
//           }).catch(e => listener.next(-1))
//     },
//     stop : () => console.log(`read json completed => ${url}`)})
// }

// export const clearStorageObservable = (recipe) => xs.create(
//     {
//       start : listener => {
//         // console.log(recipe)
//         // console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
//         let PASS = {...recipe, pass:false}
//         let ERR = e => {
//           let err = {...recipe, pass:false, Error: e}
//           listener.next(err)
//           listener.complete()
//         }
//         window.requestFileSystem(window.PERSISTENT, 1024*1024, function (fs) {
//           fs.clear().then(() => {
//             listener.next(PASS)
//             listener.complete()
//           }).catch(ERR)
//         })
//       }
//     ,
//     stop : () => console.log("data all cleared")})


export const downloadObservable = (recipe) => xs.create({start : listener => {

    let URL = recipe.url
    let PASS = {...recipe, pass:true}
    let ERR = e => {
      let err = {...recipe, pass:false, Error: e}
      listener.next(err)
      listener.complete()
    }
    axios({
      url : URL,
      method : 'GET',
      responseType : 'blob',
      // timeout
      onDownloadProgress : (progressEvent)=>{
        let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        listener.next({...recipe, progress: percentCompleted, pass: 0})
        if(percentCompleted === 100){
          // console.log("completed!!!!!!!!!", recipe.filename)
          listener.next(PASS)
        }
      }
    })
        .then(x => x.data)
        .then(blob => {
          window.requestFileSystem(window.PERSISTENT, blob.size, function (fs) {
            fs.root.getFile(recipe.filename, {create: true}, (fileEntry) => {
              fileEntry.createWriter((writer) => {
                writer.onwriteend = (event) => {
                  // listener.next(PASS)
                  listener.complete()
                }
                writer.onerror = error =>  ERR(error)
                writer.write(blob)
              })

            }, error => ERR(error))
          }, error => ERR(error))
        }).catch(e =>ERR(e))
  },
  stop : () => console.log("download process done", recipe.filename)})

export const  getBaseURLObservable = () => {
  return  xs.create({start : listener =>{
      window.requestFileSystem(window.PERSISTENT, 1024 * 1024,
          fs => {
            listener.next(fs.root.toURL())
            listener.complete()
          }, err =>
              listener.error(new Error(err)))
    },stop : () => console.log("fetching based url done") })
}

export const readFromStorageObservable = (key) => {
  return xs.create({
    start : listener => {
      let isChromeBuild = process.env.NODE_ENV !== "development"
      if(isChromeBuild){
        chrome.storage.local.get([key], function(result) {
          console.log("readFromStoragePromise..",key, "requesting ..",result[key])
          if(result[key] === undefined) {
            listener.error(`Error ${key} : cannot find it`)
            listener.complete()
          }
          else {
            listener.next(result[key])
            listener.complete()
            console.table(JSON.parse(result[key]))
          }
        })
      }else
      {
        let response = localStorage.getItem(key)
        if (response === null){
          listener.error(`Error ${key} : cannot find it`)
          listener.complete()
        }else{
          navigator.webkitPersistentStorage.requestQuota(1024*1024*1024,
              (grantedBytes) => {
                window.requestFileSystem(window.PERSISTENT, grantedBytes,
                    ()=> {
                      listener.next(response)
                      listener.complete()
                      console.table(JSON.parse(response))
                    }, err => {
                      listener.error(`Error ${key} : ${err}`)
                      listener.complete()
                    })
              },err => {
                listener.error(`Error ${key} : ${err}`)
                listener.error(`Error ${key} : ${err}`)
                listener.complete()
              })
        }
      }
    },
    stop : ()=> {
      console.log("reading From Storage with key :",key,"..done")

    }})
}

export const removeFromStorageObservable = (filename) => {
  console.log(filename)
  return xs.create({

    start : listener => {
      let ERR = e => {
        let err = false
        console.log(e)
        listener.next(err)
        listener.complete()
      }

      window.requestFileSystem(window.PERSISTENT, 1024*1024, function (fs) {
        fs.root.getFile(filename, {create: false}, (fileEntry) => {
          fileEntry.remove(function() {
            console.log('File removed.' + filename)
            listener.next(true)
            listener.complete()
          }, ERR)

        }, error => ERR(error))
      }, error => ERR(error))
    },
    stop : ()=> console.log("remvoing file :",filename,"..done")})
}


export const writeToStorageObservable = (key,value) => {
  return xs.create({
    start : listener => {
      let isChromeBuild = process.env.NODE_ENV !== "development"
      if(isChromeBuild){
        try {
          let toStore = typeof value === "object"? JSON.stringify(value) : value
          let obj = {}
          obj[key] = toStore
          console.log("writeToStoragePromise: storing..",obj)
          chrome.storage.local.set(obj, function() {
            console.log(`${key} is set to`)
            console.table(value)
            listener.next(value)
            listener.complete()
          })
        }catch (e) {
          listener.error(new Error(e))
          listener.complete()
        }
      }else
      {
        try {
          let toStore = typeof value === "object"? JSON.stringify(value) : value
          localStorage.setItem(key,toStore)
          console.log(`${key} is set to`)
          console.table(value)
          listener.next(value)
          listener.complete()
        }catch (e) {
          listener.error(new Error(e))
          listener.complete()
        }
      }
    },
    stop : ()=> console.log("writing to Storage with key :",key,"..done")})
}
export  const compileDownloadRecipe$ = (id,json,side,substr) => xs.create({
  start : listener => {
     console.table(json)
    try {
      let idle_filename = json.idle.replace(substr,"")
      let idleRecipe = {category: 'idle', filename: idle_filename.replace('/','_'), url: json.idle, index : 0}
      listener.next(idleRecipe)

      let videolen = json.video.length
      if(videolen !== 0)
        for (let i = 0;  i < json.video.length; i++){
          let filename = json.video[i].replace(substr,"")
          let videoRecipe =
              {category: 'video', filename: filename.replace('/','_'),
                index : i,
                url: `${json.video[i]}`, created : json.created}

          listener.next(videoRecipe)
        }

      if( json['mix_video'] !== undefined){
        let Mixvideolen = json['mix_video'].length
        if(Mixvideolen !== 0)
          for (let i = 0;  i < Mixvideolen; i++){
            let filename = json['mix_video'][i]['url'].replace(substr,"")
            let index = json['mix_video'][i]['index']
            let url = json['mix_video'][i]['url']
            // console.log("mix",filename,index, url)
            let MixVideoRecipe =
                {category: 'video_mix', filename: filename,
                  index : index,
                  url: url, created : json.created}
            listener.next(MixVideoRecipe)
          }
      }

      for(let set in json.collage) {
        console.table(json.collage)
        let collageRecipe = {category: 'collage',index: set, filename: `${json.collage[set].replace(substr,"")}`,
          url: json.collage[set], created : json.created}
        listener.next(collageRecipe)
      }

      let mixRecipe = {category: 'mix', filename: json.mix.replace(substr,""), url: json.mix, created : json.created, index : 0}
      listener.next(mixRecipe)
      listener.complete()
    }
    catch (e) {
      console.log(e)
    }
  },
  stop : () => {console.log("download.js","compileDownloadRecipe$","done----|||")}
})
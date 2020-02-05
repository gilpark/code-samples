import {connect} from 'react-redux'
import {makeComponent} from '@cycle/react'
import {h1,h2,div} from '@cycle/react-dom';
import xs from 'xstream'

import {
  CHANGE_MODE,
  UPDATE_TIMESTAMP,
  UPDATE_CONTENT, UPDATE_ERROR
} from "../store/reducers";

import flattenSequentially from 'xstream/extra/flattenSequentially'

import {
  downloadObservable,removeFromStorageObservable,writeToStorageObservable,
  compileDownloadRecipe$,readFromStorageObservable
} from '../Util/utils'

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
const TableTemplate = () => [
  {category : 'idle', index: 0, filename : "", url :"", pass : false, idx : 0},

  {category : 'video_mix', index: 0, filename : "", url :"", pass : false , idx : 1},
  {category : 'video_mix', index: 1, filename : "", url :"", pass : false , idx : 2},
  {category : 'video_mix', index: 2, filename : "", url :"", pass : false , idx : 3},
  {category : 'video_mix', index: 3, filename : "", url :"", pass : false , idx : 4},
  {category : 'video_mix', index: 4, filename : "", url :"", pass : false , idx : 5},

  {category : 'video', index: 0, filename : "", url :"", pass : false , idx : 6},
  {category : 'video', index: 1, filename : "", url :"", pass : false , idx : 7},
  {category : 'video', index: 2, filename : "", url :"", pass : false , idx : 8},
  {category : 'video', index: 3, filename : "", url :"", pass : false , idx : 9},
  {category : 'video', index: 4, filename : "", url :"", pass : false , idx : 10},

  {category : 'collage', index: 'c0', filename : "", url :"", pass : false, idx : 11},
  {category : 'collage', index: 'c1', filename : "", url :"", pass : false, idx : 12},
  {category : 'collage', index: 'c2', filename : "", url :"", pass : false, idx : 13},

  {category : 'mix', index: 0, filename : "", url :"", pass : false, idx : 14}
]
const download = (sources) =>{
  let tempList = []
  let tempURL = []
  let dataTable = []

  const loadTable =readFromStorageObservable('dataTable')
      .debug(list=> {
        //if data table ever exists it will return list or do nothing
        dataTable = JSON.parse(list)
        tempURL = dataTable.filter(x=> x.pass)
            .map(x => x.url).filter(onlyUnique)
        tempList  = dataTable.filter(x=> x.pass)
            .map(x => x.filename).filter(onlyUnique)
      }).replaceError(_=>{
        return xs.of(0)
      })

  //returns -1 if error else id, data.json,side
  const fetchJson$ = sources.react.props().take(1).map(p => {
    let server = p.config.server
    let id = p.config.id
    let side = p.config.side
    let json = p.json
      return xs.combine(loadTable,xs.of([id,json,side,`http://${server}/web-config/media/`]))
  }).compose(flattenSequentially).map(x => x[1])

  const updateTimestamp = fetchJson$
      .map(x => {
        return writeToStorageObservable('created',x[1].created)
      }).compose(flattenSequentially)
  updateTimestamp.subscribe({next : x =>sources.react.props()._v.dispatch(UPDATE_TIMESTAMP(x))})

  //error handling if it cannot fetch data.json
  const compileRecipeOrError =
      fetchJson$
          .map(x => {
            // console.log(0,x)
            if(x === -1){
              console.log('error cannot fetch data.json')
              sources.react.props()._v.dispatch(UPDATE_ERROR('CANNOT FETCH DATA.JSON FROM SERVER'))
              sources.react.props()._v.dispatch(CHANGE_MODE('lobby'))
              return xs.empty()
            }
            else return compileDownloadRecipe$(x[0],x[1],x[2],x[3])
          }).compose(flattenSequentially)

  let idleRemove = ""
  const checkRecipes = compileRecipeOrError
      .map(x => {
        // console.table(x)
        let isExists = tempURL.includes(x.url)
        if(isExists){
          let items = dataTable.filter(y => y.url === x.url).map(z=> z.pass)
          //if already downloaded
          let newRecipe = {...x}
          if(items[0]){
            newRecipe['pass'] = true
            return xs.of(newRecipe)

          }else{
            return downloadObservable(x)
          }

        }else {
          if(x.filename === "" || x.url === ""){
            // console.log("recipe",{...x})
            let empty = {...x}
            empty['pass'] = false
            return xs.of(empty)
          }
          console.log('fresh download ', x.filename)
          return downloadObservable(x)
        }
      }).compose(flattenSequentially)
  let template = []
  let round = 0
  const updateDataTable = checkRecipes
      .map(recipe => {
        try {
          if(round === 0)template = TableTemplate()
          let item = template.filter(x => x.category === recipe.category)
              .filter(x => {
                if(x.category === 'collage')
                  return x.index === recipe.index
                else  return parseInt(x.index) === parseInt(recipe.index)
              })
          template[item[0].idx].category = recipe.category
          if(recipe.category === 'collage')
            template[item[0].idx].index = recipe.index
            else template[item[0].idx].index = parseInt(recipe.index)
          template[item[0].idx].filename = recipe.filename
          template[item[0].idx].url = recipe.url
          template[item[0].idx].pass = recipe.pass
          round ++
        }
        catch (e) {
          console.log(e)
        }
        return recipe
      }).last().map(recipe => {
        round = 0
        dataTable = template
        return writeToStorageObservable('dataTable',dataTable)
      }).compose(flattenSequentially)
      .map(x => {
        let old = tempList
        let saved =  dataTable.filter(x=> x.pass)
            .map(x => x.filename).filter(onlyUnique)
        let toRemove =old.filter(value => -1 === saved.indexOf(value))
        if(idleRemove !== "")toRemove.push(idleRemove)
        console.log(toRemove, "need to remove")
        return toRemove
      })


  const pushOldFiles = files => xs.create({start : listener => {
      for (let i = 0; i < files.length; i++){
        listener.next(files[i])
        // console.log(files[i])
      }
      listener.complete()
    },stop : () => {
      console.log("pushed all old files", files)
      let idle = dataTable.filter(z => z.category ==='idle').map(z => z.filename)

      let clips = dataTable.filter(z => z.category ==='video')
          .filter(z => z.filename).map(z => z.filename)

      let mix_clips = dataTable.filter(z => z.category ==='video_mix')
          .filter(z => z.filename).map(z => {
            return ({index : z.index, filename : z.filename})
          })
      let collage = {}
      dataTable.filter(z => z.category ==='collage')
          .filter(z => z.filename).map(z => {
        let obj = {}
        obj[z.index] = z.filename
        collage[z.index] = z.filename
        return obj
      })
      let mix = dataTable.filter(z => z.category ==='mix').map(x=>x.filename)
      sources.react.props()._v.dispatch(UPDATE_CONTENT(idle,clips,mix_clips,collage,mix))

      let items = dataTable.filter(z => z.filename).filter(z=> !z.pass)
          .map(x=>x.filename)
      let errorFiles = items.toString()

      if(items.length >0)
        sources.react.props()._v.dispatch(UPDATE_ERROR(`CANNOT DOWNLOAD FILES: ${errorFiles}`))
      else
        sources.react.props()._v.dispatch(UPDATE_ERROR(""))
      sources.react.props()._v.dispatch(CHANGE_MODE('lobby'))
    }})

  const updateAndRemove = updateDataTable.map(x => pushOldFiles(x))
      .compose(flattenSequentially)
      .map(file => {
        return removeFromStorageObservable(file)
      })
      .compose(flattenSequentially)

  updateAndRemove.subscribe({next : x => {console.log(x)}})

  //todo clean up this
  const view$ = checkRecipes.map(p =>{
    if(p.pass === true){
      console.table({"Download succeed" : p.filename})
    }
    else if(p.pass === false && p.filename !== ""){
      console.table({"Download failed" : p.filename})
    }
    return div([
      h1({},'DOWNLOADING :'),
      h2({},{style : {color : 'grey'}}, p.filename ),
      h1({},{style : {color : 'white'}},  p.progress === undefined?  "" :  p.progress +"%" )
    ])

  })
  return { react: view$, }

}
const DownloadModule = makeComponent(download)
export default connect((store) => {
  return{
    mode : store.mode,
    config : store.config,
    flag : store.flag,
    json : store.json
  }
})(DownloadModule)
import React, {useState} from 'react';
import './App.css';
import { Path } from 'path-parser'
import {swapViews,} from './comp/small-comps.js';
import {GalleryView} from './comp/gallery'
import {isFileExist} from "./utils";
import appConfig from './appConfig'

const path = new Path('/user/:assetID')
function App() {
    let id = path.test(window.location.pathname)
    const initialState = {
        imageURL: `${appConfig.userImageBaseURL}/${id ? id.assetID : null}.gif`,
        resourceFound: false,
        isLoading: true,
        assetID: id ? id.assetID : null
    }
    let [state, setState] = useState(initialState)
    // let isFileExist = isFileExist(`${appConfig.userImageBaseURL}/${state.assetID}.gif`)
    // if (state.isLoading) {
    //     if (isFileExist){
    //         setState({...state, resourceFound: true, isLoading: false})
    //     } else {
    //         setState({...state, resourceFound: false, isLoading: false})
    //     }
    // }
  return (
      <GalleryView /> //to use gallery view try this
      // swapViews(state)
  )
}
export default App

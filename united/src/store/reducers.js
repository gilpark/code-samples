const initialState = {
    mode : "empty",
    config : {},
    clips : [],
    MixClips : [],
    collage: {},
    collage_index: 0,
    video_index : [],
    mix_video_index : 0,
    mix : "",
    flag : "",
    stamp : "",
    error : ""
}

export const UPDATE_ERROR = (error) =>{
    return {type:'UPDATE_ERROR', payload : {error : error}}
}
export const UPDATE_MODE_CONFIG = (mode, config) =>{
     return {type:'UPDATE_MODE_CONFIG', payload : {mode : mode, config: config}}
}
export const UPDATE_MODE_JSON = (mode, json, time) =>{
  return {type:'UPDATE_MODE_JSON', payload : {mode : mode, json: json, localTime : time}}
}

export const PICK_COLLAGE = (target) =>{
    return {type:'PICK_COLLAGE', payload : {collage_index : target}}
}
export const PICK_CLIP = (target) =>{
    return {type:'PICK_CLIP', payload : {video_index : target.split(',').filter(x => x.length > 0)}}
}
export const PICK_MIX_CLIP = (target) =>{
  return {type:'PICK_MIX_CLIP', payload : {mix_video_index : parseInt(target)}}
}
export const CHANGE_MODE = (target) =>{
    return {type:'CHANGE_MODE', payload : {mode : target}}
}


export const UPDATE_TIMESTAMP = (target) =>{
    return {type:'UPDATE_TIMESTAMP', payload : {stamp : target}}
}
export const UPDATE_CLIPS = (target) =>{
    return {type:'UPDATE_CLIPS', payload : {clips : target}}
}
export const UPDATE_MIX = (target) =>{
    return {type:'UPDATE_MIX', payload : {mix : target}}
}
export const UPDATE_COLLAGE = (obj) =>{
    return {type:'UPDATE_COLLAGE', payload : {collage :obj}}
}


export const UPDATE_CONFIG = (value) =>{
    return {type:'UPDATE_CONFIG', payload : {config : value}}
}
export const UPDATE_FLAG = (value) =>{
    return {type:'UPDATE_FLAG', payload : {flag : value}}
}

export const UPDATE_CONTENT = (IDLE,CLIPS,MIX_CLIPS,COLLAGE,MIX) =>{
    return {type:'UPDATE_CONTENT', payload : {idle : IDLE, clips : CLIPS, MixClips : MIX_CLIPS, collage : COLLAGE, mix : MIX}}
}

export const reducer = (state = initialState, action) =>{
// console.log(action)
    if(action.type ==='UPDATE_ERROR'){
        return {...state, error : action.payload.error}
    }
    if(action.type ==='UPDATE_CONTENT'){
        return {...state, idle : action.payload.idle,
          clips : action.payload.clips,
          MixClips : action.payload.MixClips,
          collage : action.payload.collage, mix : action.payload.mix}
    }
    if(action.type ==='REPLACE_COLLAGE_PROPS'){
        return {...state, collage : action.payload.collage}
    }
    if(action.type ==='UPDATE_TIMESTAMP'){
        return {...state, stamp : action.payload.stamp}
    }
    if(action.type ==='UPDATE_FLAG'){
        return {...state, flag : action.payload.flag}
    }

    if(action.type ==='UPDATE_MIX'){
        return {...state, mix : action.payload.mix}
    }
  if(action.type ==='UPDATE_MODE_JSON'){
    let data = action.payload.json
    let local_id = parseInt(state.config.id)
    let local_side = state.config.side
    let server_id = parseInt(data.id)
    let server_side = data.side



    if(local_id === server_id && local_side === server_side ){
      action.payload.localTime()
      return {...state, mode : action.payload.mode, json : data.json}
    }
  else {
      return {...state, mode : 'empty', json : data.json}
    }
  }
    if(action.type ==='UPDATE_MODE_CONFIG'){
        return {...state, mode : action.payload.mode, config : action.payload.config}
    }
    if(action.type ==='PICK_COLLAGE'){
        return {...state, collage_index : action.payload.collage_index}
    }
    if(action.type ==='PICK_CLIP'){
        return {...state, video_index : action.payload.video_index}
    }
  if(action.type ==='PICK_MIX_CLIP'){
    return {...state, mix_video_index : action.payload.mix_video_index}
  }
    if(action.type ==='CHANGE_MODE'){
        return {...state, mode : action.payload.mode}
    }
    if(action.type ==='UPDATE_CONFIG'){
        return {...state, config : action.payload.config}
    }
    if(action.type ==='UPDATE_CLIPS'){
        // let newClips = [...state.clips, action.payload.clips]
        return {...state, clips :  action.payload.clips}
    }
    if(action.type ==='UPDATE_COLLAGE'){
        // let newCollage = state.collage
        // newCollage[action.payload.key] = action.payload.value
        return {...state, collage : action.payload.collage}
    }
    return {...state,mode:'config'}
}
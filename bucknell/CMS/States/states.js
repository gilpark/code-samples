import {atom, selector, selectorFamily, useRecoilState, useRecoilValue} from "recoil";
import * as firebase from "firebase"

//file states
export const targetFileFieldState = atom({key:'_targetFileFieldIDState', default: {}})

export const uploadingFilesState = atom({
    key:'uploadingState',
    default:[]
})
//multiselect, edit
export const multiselectState = atom({
    key:'multiselectState',
    default:[]
})

//search
export const queryState = atom({
    key:'queryState',
    default:[]
})
export const deselectTodo = atom({
    key:'deselectTodo',
    default:[]
})

export const realtimeDBState = atom({
    key:'realtimeDBState',
    default:[]
})
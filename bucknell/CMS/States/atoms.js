import React from 'react'
import {atom} from 'recoil'
import memoize from 'memoizee'
import {fieldState, fileOption} from "./templates";

const fieldStateWithID = memoize((id, interfaceType) => {
    const key = `${interfaceType}_${id}`
    const option = interfaceType === 'file'? fileOption : {}
    const state = {
        ...fieldState,
        interfaceType: interfaceType,
        index: id,
        option:{
            ...option,
            width:"half",
        }
    }
    return atom({
        key: key,
        default: state,
    })
})

const entryState = atom({key:'entryState', default:[]})
const entryIndexState = atom({key:'entrySelection',default: {category:0, entry:0}})
const menuIndexState = atom({key:'menuIndex', default: 0})

const uploadingListState = atom({key:'uploadingList', default:[]})
const openFileDialogState = atom({key:'openFileDialogState', default:false})
export {openFileDialogState,fieldStateWithID, entryIndexState, entryState, menuIndexState, uploadingListState}
import {selector, selectorFamily} from "recoil"
import {entryIndexState, fieldStateWithID} from "./atoms"
import {fetchCategories, updateEntry} from "../API/firebaseAPIs"
import memoize from 'memoizee'
import {template360, templateCategorySetting, templateGallery, templateInfo} from "./templates"

const ENTRY_ID_OLD = {
    CATEGORY: "Category",
    VIDEO360: '360Videos',
    GALLERY: 'Gallery',
    INFO: 'Info'
}
const getTemplate = type =>{
    switch (type){
        case ENTRY_ID_OLD.VIDEO360:
            return template360
        case ENTRY_ID_OLD.GALLERY:
            return templateGallery
        case ENTRY_ID_OLD.INFO:
            return templateInfo
        default:
            return templateCategorySetting
    }
}

//todo error handling with firestore apis
const fieldsChangeState =  selectorFamily({
    key: 'outgoingState',
    get: type =>({get}) => {
        const template = getTemplate(type)
        const selected = template.fields.map(data=> ({index:data.index, interfaceType:data.interfaceType}))
        return selected.map(({index,interfaceType}) => {
            return get(fieldStateWithID(index,interfaceType))
        })
    },
    set: data => async ({set}, newValue) =>{
        const {path,data} = newValue
        await updateEntry(path, {fields:data})
    }
})

const getPathFromEntryIndex = (entryIndex, categoryState) =>{
    const categoryDocName = categoryState.find(c => c.index === entryIndex.category).uid
    const entryName =  Object.values(ENTRY_ID_OLD)[entryIndex.entry]
    const isCategorySetting = entryName === ENTRY_ID_OLD.CATEGORY
    return isCategorySetting? `/categories/${categoryDocName}`: `/categories/${categoryDocName}/content/${entryName}`
}
//compare field data b4 fetching..
const docPathState = selector({
    key:'pathState',
    get: ({get}) =>{
        const entryIndex = get(entryIndexState)
        const catState = get(categoryState)
        return getPathFromEntryIndex(entryIndex, catState)
    }
})

const _categoryState = memoize(()=>selector({
    key:'categoryState',
    get: async ({get}) => {
        const categories = await fetchCategories()
        return categories.sort((a,b) => a.index - b.index)
    }
}))
const categoryState = _categoryState()

export {fieldsChangeState, categoryState, docPathState, getTemplate, ENTRY_ID_OLD}
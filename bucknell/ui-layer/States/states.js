import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue, selectorFamily,
} from 'recoil'


export const categoryState = atom({
    key: 'categoryState',
    default:10,//todo test
})
export const uiState = atom({
    key: 'uiState',
    default: 0,
})
export const categoryTitle = atom({
    key: 'categoryTitle',
    default: "",
})
export const UI_SATE ={
    HIDDEN : 0,
    CATEGORY : 1,
    VIEWER_IMAGE : 3,
    ZONE_INFO : 2,
    VIEWER_VIDEO : 4,
    VIDEO_360: 5,
    ALUMNI_VIDEO:6
}
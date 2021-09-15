import {SvelteSubject} from "../libs/SvelteSubject"
import {timer, merge, fromEvent} from "rxjs"
import {switchMap, mapTo, distinctUntilChanged, tap, map, filter} from "rxjs/operators"
import toSvelteSubject from "../libs/toSvelteSubject";

const tutorialState = {
    swipeDone_molex_1:false,
    swipeDone_molex_2:false,
    swipeDone_molex_3:false,
    swipeDone_molex_4:false,
    swipeDone:false,
    tabDone:false,
    gridDone:false,
}
const createInActivityStore = () =>{
    const inactivity$ = new SvelteSubject(true) //true when user inactive
    const heartBeat = () => inactivity$.set(false)
    const timeOut = 30*1000
    window.addEventListener('touchstart',heartBeat)
    window.addEventListener('touchmove',heartBeat)
    window.addEventListener('click',heartBeat)
    const inactiveCount$ = inactivity$.pipe(
        switchMap(d => timer(timeOut)
            .pipe(
                filter(_=>{
                    const videos = document.getElementsByTagName('VIDEO')
                    let currentlyPlaying = Array.from(videos).filter(v => !v.autoplay && !v.paused)
                    return currentlyPlaying.length === 0
                }),
                mapTo(true)
            )
        )
    )
    return {
        stream: merge(inactivity$, inactiveCount$).pipe(
                    distinctUntilChanged(),
                    tap(b =>{
                        if(b)tutorialState$.set(tutorialState)
                        viewState$.pushViewSate(b?VIEWSTATE.IDLE:VIEWSTATE.MAIN)
                    })
                ),
        heartBeat: heartBeat
    }
}
export const userInactive$ = createInActivityStore()

export const tutorialState$ = new SvelteSubject(tutorialState)

export const VIEWSTATE = {
    IDLE:'IDLE',
    MAIN:'MAIN',
    PHIL:'PHIL',
    KOCH:'KOCH',
    MOLEX:'MOLEX',
    FOUR: 'FOUR'
}
const createViewState = () =>{
    const fromLocation$ = fromEvent(window, 'popstate').pipe(mapTo(document.location.hash))
    const vState$ = new SvelteSubject(`#${VIEWSTATE.IDLE}`)
    const updateHash = state => {
        window.history.pushState(null, null, `#${VIEWSTATE[state]}`)
        vState$.set(`#${VIEWSTATE[state]}`)
        tutorialState$.set({swipeDone:false, tabDone:false, gridDone:false})
    }
    return{
        stream : merge(fromLocation$, vState$).pipe(distinctUntilChanged()),
        pushViewSate: updateHash
    }
}
export const viewState$ = createViewState()


export const BASE_URL = 'http://localhost:1983'

export const Koch_selectedCard = new SvelteSubject(-1)
export const page_scroll = new SvelteSubject(0)
export const molex_slider_1 = new SvelteSubject([0,100])
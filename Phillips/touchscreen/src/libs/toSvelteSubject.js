import {SvelteSubject} from "./SvelteSubject";

export default (obs,initVal = undefined) =>{
    const s = new SvelteSubject(initVal)
    //todo check objs is observable
    obs.subscribe(
        d => s.set(d),
        e => console.error(e),
    )
    return s
}
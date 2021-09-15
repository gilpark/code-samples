import {BehaviorSubject} from "rxjs"

export class SvelteSubject extends BehaviorSubject {
    set(value) {
        super.next(value)
    }
    update(updater) {
        // console.log(cb instanceof Function)
        // console.log(cb instanceof Object)
        if(updater instanceof Function)return super.next(updater(super.getValue()))
        super.next({...super.getValue(),...updater})
    }
    lift(operator) {
        const result = new SvelteSubject()
        result.operator = operator
        result.source = this
        return result
    }
}

export const toSvelteSubject = (stream) =>{
    const s = new SvelteSubject()
    stream.subscribe(s)
    return s
}

//minimum functional utils
// https://github.com/indongyoo/NAVER-Teck-Talk/blob/master/index.html
export const L ={}
export const curry = f => (a, ...bs) => bs.length ? f(a, ...bs) : (...bs) => f(a, ...bs)
L.range = function *(stop) {
    let i = -1
    while (++i < stop) yield i
}
L.filter = curry(function *(f, iter) {
    for (const a of iter) {
        if (f(a)) yield a
    }
})
L.flat = function *(iter) {
    for (const a of iter) {
        if (a && a[Symbol.iterator]) yield* a;
        else yield a;
    }
};
L.map = curry(function *(f, iter) {
    for (const a of iter) {
        yield f(a)
    }
})

L.take = curry(function(length, iter) {
    let res = []
    for (const a of iter) {
        res.push(a)
        if (res.length === length) return res
    }
    return res
})
L.takeWhile = curry(function(f, iter) {
    iter = iter[Symbol.iterator]()
    iter.return = null
    let res = []
    return function recur() {
        for (const a of iter) {
            const b = _go(a, f)
            if (!b) return res
            if (b instanceof Promise) return b.then(
                async b => b ? (res.push(await a), recur()) : res)
            res.push(a)
        }
        return res
    } ()
})
export const reduce = curry(function(f, acc, iter) {
    if (arguments.length === 2) {
        iter = acc[Symbol.iterator]()
        acc = iter.next().value
    }
    for (const a of iter) {
        acc = f(acc, a)
    }
    return acc
})
const _go = (a, f) => {
    return a instanceof Promise ? a.then(f) : f(a)
}
export const go = (...as) => reduce(_go, as)
export const delay = (time, a) => new Promise(resolve =>
    setTimeout(() => resolve(a), time))

export async function recur(job, time) {
    return Promise.all([
        delay(time),
        job().then(console.log)
    ]).then(_=>recur(job, time))
}

export function removeAt(obj, list){
    const array = [...list]
    const index = array.indexOf(obj)
    if (index > -1) {
        array.splice(index, 1)
    }
    return array
}
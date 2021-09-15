const forEach = operation => source => {
    let talkback;
    source(0, (t, d) => {
        if (t === 0) talkback = d
        if (t === 1) operation instanceof Promise?operation.then(d):operation(d)
        if (t === 1 || t === 0) talkback(1)
    })
}

module.exports = forEach
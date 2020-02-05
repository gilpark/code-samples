export function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
}

export function remap(n, start1, stop1, start2, stop2, withinBounds) {
    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return constrain(newval, start2, stop2)
    } else {
        return constrain(newval, stop2, start2)
    }
}

export function isFileExist(urlToFile) {
    const xhr = new XMLHttpRequest()
    xhr.open('HEAD', urlToFile, false)
    xhr.send();
    return xhr.status !== 404
}
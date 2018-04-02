function getFinishCol(progress, idx) {
    var fc = progress.finishCols
    if (fc !== undefined) {
        var c = fc[idx]
        if (c !== undefined) {
            return c
        }
    }
    return 'n'
}

function addFinishCol(progress, c) {
    var fc = progress.finishCols
    if (fc === undefined) {
        progress.finishCols = c
    } else {
        if (!fc.includes(c)) {
            progress.finishCols += c
        }
    }
}

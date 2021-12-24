function getFinishCol(progress, idx) {
    let fc = progress.finishCols
    if (fc !== undefined) {
        let c = fc[idx]
        if (c !== undefined) {
            return c
        }
    }
    return 'n'
}

function addFinishCol(progress, c) {
    let fc = progress.finishCols
    if (fc === undefined) {
        progress.finishCols = c
    } else {
        if (!fc.includes(c)) {
            progress.finishCols += c
        }
    }
}

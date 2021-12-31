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

const getCompletedCount = function(progress) {
    let c = 0
    for (const p of Object.values(progress.sub)) {
        if (p.finishCols !== undefined)
            c += p.finishCols.length
        if (p.sub !== undefined) {
            c += getCompletedCount(p)
        }
    }
    return c
}

const getSubCompletions = function(m) {
    const submazes = m.mazes
    if (submazes === undefined)
        return 0
    return submazes.reduce((c, s) => c + s.nEnds + getSubCompletions(s), 0)
}

let mazeModes = {}

function gameShardAssemble(iface, m, doneCallback, progress, saveProgressCb) {
    const sm = new shardMoves(iface, m)
    const returnToMenu = function(col) {
        sm.cleanUp()
        doneCallback(col)
    }
    this.abort = sm.cleanUp  // Used by editor
    let resetMaze = function() {
        if (sm.isAtStart()) {
            returnToMenu(null)
        } else {
            sm.reset()
        }
    }
    sm.setMarkerCb(resetMaze)
    let hexFunc = function(hex) {
        const shardMoveFunc = sm.getHexFunc(hex)
        let moveFunc =  function() {
            const col = shardMoveFunc()
            if (sm.finished()) {
                addFinishCol(progress, col)
                saveProgressCb()
                sm.showWin(() => returnToMenu(col))
            }
        }
        return moveFunc
    }
    sm.hexFuncsSetup(hexFunc)
}

mazeModes.shard = (i, m, c, p, s) => new gameShardAssemble(i, m, c, p, s)

function gameStandard(iface, m, doneCallback, progress, saveProgressCb) {
    m['starts'] = [m['start']]
    return new gameShardAssemble(iface, m, doneCallback, progress, saveProgressCb)
}

mazeModes.std = gameStandard

function playMaze(iface, m, cb, progress, saveProgressCb) {
    if (typeof setHelp !== 'undefined')
        setHelp(m.mode)
    return mazeModes[m.mode](iface, m, cb, progress, saveProgressCb)
}

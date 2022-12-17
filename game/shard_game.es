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

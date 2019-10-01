function gameStandard(iface, m, doneCallback, progress, saveProgressCb) {
    m['starts'] = [m['start']]
    gameShardAssemble(iface, m, doneCallback, progress, saveProgressCb)
}

mazeModes.std = gameStandard

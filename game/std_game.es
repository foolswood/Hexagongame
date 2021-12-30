function gameStandard(iface, m, doneCallback, progress, saveProgressCb) {
    m['starts'] = [m['start']]
    return new gameShardAssemble(iface, m, doneCallback, progress, saveProgressCb)
}

mazeModes.std = gameStandard

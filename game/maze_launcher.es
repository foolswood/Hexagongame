let mazeModes = {}

function playMaze(iface, m, cb, progress, saveProgressCb) {
    if (typeof setHelp !== 'undefined')
        setHelp(m.mode)
    return mazeModes[m.mode](iface, m, cb, progress, saveProgressCb)
}

let mazeModes = {}

function playMaze(iface, m, cb, progress, saveProgressCb) {
    mazeModes[m.mode](iface, m, cb, progress, saveProgressCb)
}

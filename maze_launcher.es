var mazeModes = {}

function playMaze(iface, m, cb, progress) {
    mazeModes[m.mode](iface, m, cb, progress)
}

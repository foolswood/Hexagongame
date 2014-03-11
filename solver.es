var solver = function(start_state, moves_func) {
    ways_to = {}
    var traverse = function(state, route) {
        var moves = moves_func(state)
        var next
        for (var m=0; m<moves.length; m++) {
            next = moves[m]
            if (ways_to[next] === undefined) {
                ways_to[next] = [route]
                var new_route = route.slice(0)
                new_route.push(next)
                traverse(next, new_route)
            } else {
                ways_to[next].push(route)
            }
        }
    }
    traverse(start_state, [start_state])
    return ways_to
}

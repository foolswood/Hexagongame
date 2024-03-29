const xlinkNS="http://www.w3.org/1999/xlink", svgNS="http://www.w3.org/2000/svg";

function Pressable(domElem) {
    var touchStartTime
    var currentCb
    domElem.addEventListener('touchstart', (evt) => touchStartTime = performance.now())
    domElem.addEventListener('touchend', (evt) => {
        if (currentCb !== undefined && touchStartTime !== undefined && performance.now() - touchStartTime < 50) {
            evt.preventDefault()
            currentCb()
        }
    })

    this.get = () => currentCb

    this.set = function(func) {
        if (currentCb !== undefined) {
            domElem.removeEventListener('click', currentCb)
        }
        domElem.addEventListener('click', func)
        currentCb = func
    }
}

function SVGInterface(element_id) {
    const animEpoch = performance.now()
    const svg = document.getElementById(element_id).getSVGDocument()
    const hexGroup = svg.getElementById("hexes")
    const dividerGroup = svg.getElementById("dividers")
    const routeGroup = svg.getElementById("route")
    const routeReplayGroup = svg.getElementById("routeReplay")
    const finishMarkers = svg.getElementById("finishMarkers")
    const playerMarkers = svg.getElementById("playerMarkers")
    const defs = svg.getElementsByTagName("defs")[0]
    const modalSplash = svg.getElementById("modalSplash")
    const modalBg = svg.getElementById("modalBg")
    const modalSplashAnims = [0, 1].map((i) => svg.getElementById("modalSplashAnim" + i))

    // Data that I would rather wasn't here
    const strokeColourMap = { //Colours for dividing lines
        "w": "white",
        "k": "#252525",
        "r": "red",
        "g": "forestgreen",
        "b": "blue",
        "y": "yellow",
        "p": "magenta"
    }
    const hexHeight = 866
    const hexWidth = 1001
    const pieDiameter = 200
    const shardClipRadius = 250 // Bigger than player circle

    let finishPositions = [[350, 0], [175, 303], [-175, 303], [-350, 0], [-175, -303], [175, -303]];
    // End of data that should be in the svg file really

    const svgCoord = function(pos) {
        let x = ((0.75*pos[0])+0.5)*hexWidth
        let y = ((pos[1]+((pos[0]%2)*0.5))+0.5)*hexHeight
        return [x, y]
    }

    const beginNow = function()
    {
        return ((performance.now() - animEpoch) / 1000.0) + "s"
    }

    const SVGUIElement = function(dom_elem, colour_fill) {
        let colour, position, current_cb

        this.__defineSetter__("position", function(pos) {
            const loc = svgCoord(pos)
            dom_elem.setAttribute("transform", "translate(" + loc[0] + "," + loc[1] + ")")
            position = pos
        })

        this.__defineGetter__("position", function() {
            return position
        })

        if (colour_fill) {
            this.__defineSetter__("colour", function(col) {
                dom_elem.setAttribute("fill", "url(#"+col+")")
                colour = col
            })
        } else {
            this.__defineSetter__("colour", function(col) {
                dom_elem.setAttribute("stroke", strokeColourMap[col])
                colour = col
            })
        }
        this.__defineGetter__("colour", function() {
            return colour
        })

        this.__defineSetter__("visible", function(bool) {
            if (bool) {
                dom_elem.removeAttribute("display")
            } else {
                dom_elem.setAttribute("display", "none")
            }
        })

        const p = new Pressable(dom_elem)
        this.__defineGetter__("callback", p.get)
        this.__defineSetter__("callback", p.set)

        this.flash = function() {
            const flashAnim = svg.createElementNS(svgNS, "animate")
            flashAnim.setAttribute("attributeName", "stroke-width")
            flashAnim.setAttribute("begin", beginNow())
            flashAnim.setAttribute("dur", "1.5s")
            flashAnim.setAttribute("values", "10;20;5;10")
            flashAnim.setAttribute("repeatCount", "5")
            dom_elem.appendChild(flashAnim)
        }
    }

    this.hexes = []
    this.endMarker = new SVGUIElement(svg.getElementById("end"), true)
    this.upArrow = new SVGUIElement(svg.getElementById("upArrow"), true)
    this.playMeta = new SVGUIElement(svg.getElementById("playMeta"), true)

    const shardPointStr = function(angle) {
        return Math.sin(angle) * shardClipRadius + "," + Math.cos(angle) * shardClipRadius
    }

    const circleClip = function(startAngle, angleSize, id) {
        const shardStart = shardPointStr(startAngle)
        const shardEnd = shardPointStr(startAngle + angleSize)
        const path = svg.createElementNS(svgNS, "path")
        const large = angleSize > Math.PI ? 1 : 0
        path.setAttribute(
            "d",
            "M 0 0 " +
            "L " + shardStart +
            " A " + shardClipRadius + " " + shardClipRadius + " " + large + " " + large + " 0 " + shardEnd +
            " Z")
        const clipPath = svg.createElementNS(svgNS, "clipPath")
        clipPath.setAttribute("id", id)
        clipPath.appendChild(path)
        return clipPath
    }

    this.getShardMarkers = function(nShards) {
        if (nShards === 1) {
            let playerMarkerUse = this.svgNewUse("playerMarker", true)
            playerMarkers.appendChild(playerMarkerUse[1])
            return {
                shards: [playerMarkerUse[0]],
                destroy: () => playerMarkerUse[1].remove()}
        }
        const radPerShard = 2 * Math.PI / nShards
        const rmElems = []
        const shards = []
        for (let s=0; s < nShards; s++) {
            const clipPathId = "playerMarkerClip" + s
            const clipPath = circleClip(radPerShard * s, radPerShard, clipPathId)
            defs.appendChild(clipPath)
            rmElems.push(clipPath)
            const playerMarkerUse = this.svgNewUse("playerMarker", true)
            playerMarkerUse[1].setAttribute("clip-path", "url(#" + clipPathId + ")")
            playerMarkers.appendChild(playerMarkerUse[1])
            rmElems.push(playerMarkerUse[1])
            shards.push(playerMarkerUse[0])
        }
        return {shards: shards, destroy: () => rmElems.map((n) => n.remove())}
    }

    this.addPie = function(pos, n, total) {
        const c = svg.createElementNS(svgNS, "circle")
        c.setAttribute("stroke", "white")
        c.setAttribute("r", pieDiameter)
        c.setAttribute("stroke-width", 10)
        c.setAttribute("fill", "none")
        const p = svg.createElementNS(svgNS, "circle")
        p.setAttribute("r", pieDiameter)
        p.setAttribute("fill", "white")
        const g = svg.createElementNS(svgNS, "g")
        const loc = svgCoord(pos)
        g.setAttribute("transform", "translate(" + loc[0] + "," + loc[1] + ")")
        g.setAttribute("opacity", 0.3)
        g.appendChild(c)
        g.appendChild(p)
        hexGroup.appendChild(g)
        if (n !== total) {
            const clipPathId = "pieClip" + pos
            const angle = n * 2 * Math.PI / total
            const clipPath = circleClip(Math.PI - angle, angle, clipPathId)
            g.appendChild(clipPath)
            p.setAttribute("clip-path", "url(#" + clipPathId + ")")
        }
        return new SVGUIElement(g, undefined)
    }

    this.svgNewUse = function(type, colour_fill) {
        if (colour_fill === undefined) {
            colour_fill = false
        }
        //Creates a new svgUse object
        let nu = svg.createElementNS(svgNS, "use")
        nu.setAttributeNS(xlinkNS, "href", "#"+type)
        let uie = new SVGUIElement(nu, colour_fill)
        return [uie, nu]
    }

    this.addDivider = function(a, b, colour) {
        let divider
        if (a[0] === b[0]) { //a on top of b
            divider = this.svgNewUse("center")
            divider[0].position = a
        } else {
            if (b[1] === a[1]) { //Same Line
                if (a[0]%2) { //Odd Rows
                    divider = this.svgNewUse("left")
                    divider[0].position = b
                } else { //Even Rows
                    divider = this.svgNewUse("right")
                    divider[0].position = a
                }
            } else { //Line Below
                if (a[0] - b[0] === 1) {
                    divider = this.svgNewUse("left")
                    divider[0].position = a
                } else {
                    divider = this.svgNewUse("right")
                    divider[0].position = a
                }
            }
        }
        divider[0].colour = colour
        dividerGroup.appendChild(divider[1])
        return divider[0]
    }

    this.addHex = function(pos, colour) {
        let hex = this.svgNewUse("hex", true);
        hexGroup.appendChild(hex[1])
        hex[0].colour = colour
        hex[0].position = pos
        this.hexes.push(hex[0])
        return hex[0]
    }

    this.addFinishMarkers = function(pos, n) {
        const loc = svgCoord(pos)
        let elem, x, y
        let elems = []
        for (let i=0; i<n; i++) {
            elem = this.svgNewUse("finishCircle", true)
            x = loc[0] + finishPositions[i][0]
            y = loc[1] + finishPositions[i][1]
            elem[1].setAttribute("x", x)
            elem[1].setAttribute("cx", x)
            elem[1].setAttribute("y", y)
            elem[1].setAttribute("cy", y)
            finishMarkers.appendChild(elem[1])
            elem[0].move = function(pos) {console.log("Moving finish markers is not supported")}
            elems.push(elem[0])
        }
        return elems
    }

    this.revealMetaMarkers = function(pos, upCb, playCb) {
        this.upArrow.position = pos
        this.upArrow.visible = true
        this.upArrow.callback = upCb
        this.playMeta.position = pos
        this.playMeta.visible = true
        this.playMeta.callback = playCb
    }

    const addRouteRailStep = function(c, start, end)
    {
        let elem = svg.createElementNS(svgNS, "line")
        elem.setAttribute("stroke", strokeColourMap[c])
        elem.setAttribute("x1", start[0])
        elem.setAttribute("y1", start[1])
        elem.setAttribute("x2", end[0])
        elem.setAttribute("y2", end[1])
        routeGroup.appendChild(elem)
    }

    const countChanges = function(route)
    {
        let changes = 0
        let prev = route[0][0]
        for (const r of route)
        {
            if (r[0].toString() !== prev.toString())
            {
                changes += 1
                prev = r[0]
            }
        }
        return changes
    }

    this.addRoute = function(route) {
        const totalChanges = countChanges(route)
        let start = svgCoord(route[0][0])
        let c = route[0][1]
        let path = "M " + start[0] + "," + start[1]
        let colourValues = ""
        let keyPoints = "0"
        let keyTimes = "0"
        let changeCount = 0
        for (let i = 1; i < route.length; i++) {
            colourValues += strokeColourMap[c] + ";"
            const end = svgCoord(route[i][0])
            if (start.toString() !== end.toString())
            {
                addRouteRailStep(c, start, end)
                path += " L" + end[0] + "," + end[1]
                start = end
                changeCount++
            }
            keyPoints += ";" + (changeCount / totalChanges)
            keyTimes += ";" + (i / (route.length - 1))
            c = route[i][1]
        }
        colourValues = colourValues.slice(0, colourValues.length - 1) //cut final ; off
        const replayColAnim = svg.createElementNS(svgNS, "animate")
        replayColAnim.setAttribute("calcMode", "discrete")
        replayColAnim.setAttribute("attributeName", "fill")
        replayColAnim.setAttribute("values", colourValues)
        const animElems = [replayColAnim]
        if (totalChanges) {
            const replayMovePath = svg.createElementNS(svgNS, "animateMotion")
            replayMovePath.setAttribute("calcMode", "linear")
            replayMovePath.setAttribute("keyPoints", keyPoints)
            replayMovePath.setAttribute("keyTimes", keyTimes)
            replayMovePath.setAttribute("path", path)
            animElems.push(replayMovePath)
        }
        const dur = route.length + "s"
        const begin = beginNow()
        const replayMarker = svg.createElementNS(svgNS, "circle")
        replayMarker.setAttribute("r", "9mm")
        animElems.forEach((e) => {
            e.setAttribute("begin", begin)
            e.setAttribute("dur", dur)
            e.setAttribute("repeatCount", "indefinite")
            replayMarker.appendChild(e)
        })
        if (!totalChanges) {
            replayMarker.setAttribute("cx", start[0])
            replayMarker.setAttribute("cy", start[1])
        }
        routeReplayGroup.appendChild(replayMarker)
    }

    let clearChildren = function(p) {
        //Remove all children of group.
        while (p.childNodes.length >= 1) {
            p.removeChild(p.firstChild);
        }
    }

    this.clearRoutes = function() {
        clearChildren(routeGroup)
        clearChildren(routeReplayGroup)
    }

    this.clear = function() {
        clearChildren(hexGroup)
        clearChildren(dividerGroup)
        this.clearRoutes()
        clearChildren(finishMarkers)
        this.hexes = []
        this.endMarker.visible = false
        this.upArrow.visible = false
        this.playMeta.visible = false
        modalBg.setAttribute("display", "none");
    }

    this.hexBounds = function(hex) {
        const svgPos = svgCoord(hex.position)
        return [svgPos[0]-(hexWidth/2), svgPos[1]-(hexHeight/2), svgPos[0]+(hexWidth/2), svgPos[1]+(hexHeight/2)]
    }

    this.mazeBounds = function() {
        if (this.hexes.length === 0) {
            [0, 0, 1, 1]
        }
        let hex = this.hexes[0]
        let bounds = this.hexBounds(hex)
        for (let h=1; h<this.hexes.length; h++) {
            hex = this.hexes[h]
            let hexbounds = this.hexBounds(hex)
            if (hexbounds[0] < bounds[0]) {
                bounds[0] = hexbounds[0]
            }
            if (hexbounds[1] < bounds[1]) {
                bounds[1] = hexbounds[1]
            }
            if (hexbounds[2] > bounds[2]) {
                bounds[2] = hexbounds[2]
            }
            if (hexbounds[3] > bounds[3]) {
                bounds[3] = hexbounds[3]
            }
        }
        bounds[2] = bounds[2] - bounds[0]
        bounds[3] = bounds[3] - bounds[1]
        return bounds
    }

    this.maximise = function() {
        svg.getElementById("gameGrid").setAttribute("viewBox", this.mazeBounds().join(" "))
    }

    this.winModal = function(cb, splashCentre) {
        const splashLoc = svgCoord(splashCentre)
        modalSplash.setAttribute("cx", splashLoc[0])
        modalSplash.setAttribute("cy", splashLoc[1])
        const begin = beginNow()
        modalSplashAnims.forEach((a) => a.setAttribute("begin", begin))
        const bounds = this.mazeBounds()
        modalBg.setAttribute("x", bounds[0])
        modalBg.setAttribute("y", bounds[1])
        modalBg.setAttribute("width", bounds[2] + bounds[0])
        modalBg.setAttribute("height", bounds[3] + bounds[1])
        modalBg.removeAttribute("display");
        modalBg.addEventListener('click', cb)
    }
}

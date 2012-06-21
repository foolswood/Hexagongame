var game;

function loadSet(ms, progress) {
	//Constructs a mazeSet object
	this.nMazes = ms.mazes.length;
	if (progress == null) {
		//Generate the progress data structure
		function genProgress(mazes) { //This insane construction exists because you can't delete a local variable
			var m, i, s;
			progress = [];
			for (m = 0; m < mazes.length; m++) {
				s = "";
				for (i = 0; i <= mazes[m].nEnds; i++)
					s += "n";
				progress.push(s);
			}
			return progress;
		}
		progress = genProgress(ms.mazes);
	}
	function genMeta(ms, progress, hl) {
		//Generate metaMaze and hexLocs
		var line, c, ml, x, y, count = 0, mm = [];
		for (y = 0; y < ms.mazeLayout.length; y++) {
			ml = "";
			line = ms.mazeLayout[y];
			for (x = 0; x < line.length; x++) {
				c = line[x];
				if (c == "?") {
					ml += progress[count++][0];
					hl.push([x/2, y/2]);
				} else {
					ml += c;
				}
			}
			mm.push(ml);
		}
		ms.maze = mm;
	}
	var hexLocs = [];
	genMeta(ms, progress, hexLocs);
	this.finishChange = function(evt) {
		//Callback for clicking the coloured circles
		//Update hexagon
		//Update progress
		//Update metaMaze?
	}
	//this.drawFinishColours = function() {
	//	//Draw on some finish colour circles
	//	var loc, cols;
	//	for (i = 0; i++; i < this.nMazes) {
	//		loc = this.hexLocs[i];
	//		cols = progress[i][1:];
	//	}	
	//}
	this.menuHexClick = function(h) {
		//Play the corresponding maze
		var i, loc;
		loc = h.id.slice(1);
		for (i=0; i<hexLocs.length; i++) {
			if (hexLocs[i].toString() == loc) {
				break;
			}
		}
		if (i < hexLocs.length) {
			gameStandard(ms.mazes[i]);
		} else if (loc == ms.start) {
			gameStandard(ms);
		}
	}
	this.showMenu = function() {
		//Draw the level select menu
		loadMaze(ms.maze);
		hexClick = this.menuHexClick;
	}
}

//To instanciate
mazeSet = new loadSet(msd, null);
mazeSet.showMenu();

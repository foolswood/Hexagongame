function loadSet(ms, progress) {
	//Constructs a mazeSet object
	this.nMazes = ms.mazes.length;
	if (progress == null) {
		//Generate the progress data structure
		function genProgress(mazes) { //This insane construction exists because you can't delete a local variable
			var m;
			progress = [];
			for (m = 0; m < mazes.length; m++)
				progress.push("n" * (mazes[m].nEnds + 1));
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
					hl.push([x, y]);
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
	this.menuHexClick = function(evt) {
		//Play the corresponding maze
	}
	this.showMenu = function() {
		//Draw the level select menu
		loadMaze(ms);
		//onHexClick = this.menuHexClick;
	}
}

//To instanciate
mazeSet = new loadSet(msd, null);
mazeSet.showMenu();

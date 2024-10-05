const levels = {
  0 : {
    name : "1",
    gridSize : 3,
    creatures : {
      fox : 1,
      rabbit : 1
    },
    completed : false
  },
  1 : {
    name : "2",
    gridSize : 4,
    creatures : {
      fox : 3,
      rabbit : 5
    },
    completed : false
  },
  2 : {
    name : "3",
    gridSize : 10,
    creatures : {
      fox : 10,
      rabbit : 10
    },
    completed : false
  },
  3 : {
    name : "4",
    gridSize : 10,
    creatures : {
      fox : 6,
      rabbit : 3
    },
    completed : false
  }
};

const creatures = {
  fox : {
    effectors : [[0,-1],[0,-2],[1,0],[2,0],[0,1],[0,2],[-1,0],[-2,0]],
    type : "territorial",
    startingAgitation : 0,
    image: {file:"creatures.png",crop:[0,0,300,300]}
  },
  rabbit : {
    effectors : [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]],
    type : "passive",
    startingAgitation : 0,
    image: {file:"creatures.png",crop:[300,0,300,300]}
  },
}

for (let creatureId in creatures) {
  let creature = creatures[creatureId];
  let newImage = cg.createImage({id:creatureId,file:creature.image.file,crop:creature.image.crop});
  creature.image = newImage;
}

const effectorTypes = {
  "territorial" : {
    self : 1,
    inRange : 1,
    colour : "#0000f9",
    invertIfSame : false
  },
  "aggressive" : {
    self : -1,
    inRange : 1,
    colour : "#ff0000",
    invertIfSame : false
  },
  "passive" : {
    self : 1,
    inRange : 0,
    colour : "#41ff77",
    invertIfSame : true
  },
  "calming" : {
    self : 0,
    inRange : -1,
    colour : "#ffff41",
    invertIfSame : false
  }
}

cg.settings.callbacks.keyDown = function(key) {
  console.log('Key down:', key);
}

cg.settings.callbacks.cursorUp = function() {
  let gridHovered = false;
  for (let button of grid.gridButtons) {
    if (cg.buttons[button.id].hovered) {
      gridHovered = true;
      break;
    }
  }
  if (grid.selectedCreature !== null) { // If creature was being held
    let newCreature = (grid.creatures[grid.selectedCreature].hidden&&!grid.creatures[grid.selectedCreature].unhideWhenDropped);
    if (!gridHovered||newCreature) { // Dropped off grid
      grid.creatures.splice(grid.selectedCreature,1);
    } else { // Dropped on grid
      ChoreoGraph.Input.hoveredCG.cnvs.style.cursor = "grab";
      grid.creatures[grid.selectedCreature].hidden = false;
    }
  }
  picker.update();
  grid.calculateAgitation();
  grid.selectedCreature = null;
  grid.updateButtonCursors();
}

cg.settings.callbacks.loopBefore = function(cg) {
  if (screen == "game") {
    cg.addToLevel(0,cg.graphics.grid);
    cg.addToLevel(0,cg.graphics.picker);
    cg.addToLevel(1,cg.graphics.returnToLevels);
  } else if (screen == "levels") {
    cg.addToLevel(0,cg.graphics.levelSelector);
  }
}

cg.settings.callbacks.loopAfter = function(cg) {
  if (grid.creatures[grid.selectedCreature]?.hidden) { // Draw held creature
    let imageSize = grid.maxWidth/grid.gSize*grid.creatureScale*cg.z;
    cg.drawImage(creatures[grid.creatures[grid.selectedCreature].creature].image,ChoreoGraph.Input.cursor.x,ChoreoGraph.Input.cursor.y,imageSize,imageSize,0,false);
  }
}

let screen = "levels";

ChoreoGraph.graphicTypes.grid = new class Grid {
  setup(g,graphicInit,cg) {
    g.gSize = 3;
    g.maxWidth = 600;

    g.textCornerPadding = 4;

    g.creatureScale = 0.8;
    g.creatures = [{creature:"fox",x:0,y:0,agitation:0},{creature:"rabbit",x:2,y:2,agitation:0}];
    g.selectedCreature = null;

    g.currentLevel = 0;
    g.gridButtons = [];

    g.loadLevel = function(level) {
      this.currentLevel = level;
      this.gSize = level.gridSize;
      this.creatures = [];

      for (let button of this.gridButtons) {
        cg.buttonNames.splice(cg.buttonNames.indexOf(button.id),1);
        cg.buttonCount--;
        delete cg.buttons[button.id];
      }
      this.gridButtons = [];
      
      this.createButtons();
      this.calculateAgitation();

      picker.update();
    }
    g.createButtons = function() {
      for (let x = 0; x < g.gSize; x++) {
        for (let y = 0; y < g.gSize; y++) {
          let tileSize = g.maxWidth/g.gSize;
          let xo = tileSize*g.gSize/2-tileSize/2;
          let yo = tileSize*g.gSize/2-tileSize/2;
          let newButton = cg.createButton({x:x*tileSize-xo,y:y*tileSize-yo,width:tileSize,height:tileSize,id:"grid"+x+","+y,gridX:x,gridY:y,cursor:"default",check:"gameScreen",CGSpace:true,
            enter:function(){
              if (grid.selectedCreature !== null) {
                let creature = grid.creatures[grid.selectedCreature];
                let spaceOccupied = false;
                for (let otherCreature of grid.creatures) {
                  if (otherCreature.x == this.gridX && otherCreature.y == this.gridY) {
                    spaceOccupied = true;
                    break;
                  }
                }
                if (!spaceOccupied) {
                  creature.x = this.gridX;
                  creature.y = this.gridY;
                  if (!creature.unhideWhenDropped) {
                    creature.hidden = false;
                  }
                  creature.hasEntered = true;
                  grid.calculateAgitation();
                }
              }
            },
            down:function(){
              let creatureIndex = 0;
              for (let creature of grid.creatures) {
                if (creature.x == this.gridX && creature.y == this.gridY) {
                  grid.selectedCreature = creatureIndex;
                  ChoreoGraph.Input.hoveredCG.cnvs.style.cursor = "grabbing";
                  creature.hidden = true;
                  creature.unhideWhenDropped = true;
                  break;
                }
                creatureIndex++;
              }
              grid.updateButtonCursors();
            }
          });
          this.gridButtons.push(newButton);
        }
      }
      g.updateButtonCursors();
    }
    g.updateButtonCursors = function() {
      for (let button of this.gridButtons) {
        let hasCreature = false;
        for (let creature of g.creatures) {
          if (creature.x == button.gridX && creature.y == button.gridY) { // If has creature
            hasCreature = true;
          }
        }
        if (hasCreature) {
          if (g.selectedCreature !== null) { // If has selected creature
            button.cursor = "not-allowed";
          } else { // If no selected creature
            button.cursor = "grab";
          }
        } else if (g.selectedCreature !== null) {
          button.cursor = "grabbing";
        } else {
          button.cursor = "default";
        }
      }
    }
    g.calculateAgitation = function() {
      for (let currentCreature of g.creatures) {
        currentCreature.agitation = creatures[currentCreature.creature].startingAgitation;
      }
      for (let currentCreature of g.creatures) {
        let currentAgitation = currentCreature.agitation;
        for (let effector of creatures[currentCreature.creature].effectors) { // For each effector
          let x = currentCreature.x+effector[0];
          let y = currentCreature.y+effector[1];
          if (x >= 0 && x < g.gSize && y >= 0 && y < g.gSize) { // If in bounds
            for (let otherCreature of g.creatures) { // For each other creature
              if (otherCreature.x == x && otherCreature.y == y) { // If other creature is in range
                let effectorType = effectorTypes[creatures[currentCreature.creature].type];
                let otherEffectorType = effectorTypes[creatures[otherCreature.creature].type];
                let currentCreatureAgitationChange = otherEffectorType.self;
                let otherCreatureAgitationChange = effectorType.inRange;
                if (currentCreature.creature == otherCreature.creature) {
                  if (effectorType.invertIfSame) {
                    currentCreatureAgitationChange = -currentCreatureAgitationChange;
                    otherCreatureAgitationChange = -otherCreatureAgitationChange;
                  }
                }
                currentAgitation += currentCreatureAgitationChange
                otherCreature.agitation += otherCreatureAgitationChange;
              }
            }
          }
        }
        currentCreature.agitation = currentAgitation;
      }
      let complete = true;
      let validGame = false;
      for (let creature of grid.creatures) {
        validGame = true;
        if (creature.agitation > 0) {
          complete = false;
          break;
        }
      }
      for (let creature of Object.keys(picker.creatures)) {
        if (picker.creatures[creature] > 0) {
          complete = false;
          break;
        }
      }
      if (complete&&validGame&&grid.currentLevel.completed == false) {
        console.log("Level complete");
        grid.currentLevel.completed = true;
      }
    }
  }
  draw(g,cg) {
    for (let x = 0; x < g.gSize; x++) {
      for (let y = 0; y < g.gSize; y++) {
        let tileSize = g.maxWidth/g.gSize;
        let xo = tileSize*g.gSize/2;
        let yo = tileSize*g.gSize/2;
        cg.c.strokeStyle = "#000000";
        cg.c.strokeRect(x*tileSize-xo,y*tileSize-yo,tileSize,tileSize);
      }
    }
    let markers = {};
    for (let effectorType of Object.keys(effectorTypes)) {
      markers[effectorType] = [];
    }
    let tileSize = g.maxWidth/g.gSize;
    let xoC = tileSize*g.gSize/2-tileSize/2;
    let yoC = tileSize*g.gSize/2-tileSize/2;
    let xo = tileSize*g.gSize/2;
    let yo = tileSize*g.gSize/2;
    for (let gridCreature of g.creatures) {
      if (!gridCreature.hasEntered) { continue; }
      let x = gridCreature.x;
      let y = gridCreature.y;

      // AGITATION
      cg.c.font = "20px Arial";
      cg.c.fillStyle = "#000000";
      cg.c.textAlign = "left";
      cg.c.textBaseline = "top";
      cg.c.fillText(gridCreature.agitation,x*tileSize-xo+g.textCornerPadding,y*tileSize-yo+g.textCornerPadding);

      // EFFECTOR AREA
      for (let effector of creatures[gridCreature.creature].effectors) {
        let xEffector = x+effector[0];
        let yEffector = y+effector[1];
        if (xEffector >= 0 && xEffector < g.gSize && yEffector >= 0 && yEffector < g.gSize) {
          markers[creatures[gridCreature.creature].type].push([xEffector,yEffector]);
        }
      }
    }
    let effectorsOfTile = {};
    for (let effectorType of Object.keys(effectorTypes)) {
      if (markers[effectorType] === undefined) {
        continue;
      }
      for (let marker of markers[effectorType]) {
        let xEffector = marker[0];
        let yEffector = marker[1];
        if (effectorsOfTile[xEffector+","+yEffector] === undefined) {
          effectorsOfTile[xEffector+","+yEffector] = 0;
        } else {
          effectorsOfTile[xEffector+","+yEffector]++;
        }
        let effectorsOfThisTile = effectorsOfTile[xEffector+","+yEffector];
        if (effectorType=="territorial") {
          cg.c.strokeStyle = effectorTypes[effectorType].colour;
          cg.c.lineWidth = 10;
          cg.c.strokeRect(xEffector*tileSize-xo+cg.c.lineWidth/2,yEffector*tileSize-yo+cg.c.lineWidth/2,tileSize-cg.c.lineWidth,tileSize-cg.c.lineWidth);
        } else {
          cg.c.fillStyle = effectorTypes[effectorType].colour;
          cg.c.globalAlpha = 0.8;
          cg.c.beginPath();
          // cg.c.arc(xEffector*tileSize-xo+effectorsOfThisTile*30+24,yEffector*tileSize-yo+24,12,0,2*Math.PI);
          cg.c.arc(xEffector*tileSize-xoC,yEffector*tileSize-yoC,tileSize/4,0,2*Math.PI);
          cg.c.fill();
          cg.c.globalAlpha = 1;
        }
      }
    }
    for (let gridCreature of g.creatures) {
      if (gridCreature.hidden) { continue; }
  
      let x = gridCreature.x;
      let y = gridCreature.y;
  
      // CREATURE IMAGE
      let creature = creatures[gridCreature.creature];
      cg.drawImage(creature.image,x*tileSize-xoC,y*tileSize-yoC,tileSize*g.creatureScale,tileSize*g.creatureScale,0,false);
    }
    cg.c.font = "50px Arial";
    cg.c.textAlign = "center";
    cg.c.textBaseline = "middle";
    if (grid.currentLevel.completed) {
      cg.c.fillStyle = "#00ad03";
      cg.c.fillText("Level Complete",0,350);
    } else {
      cg.c.fillStyle = "#ba3934";
      cg.c.fillText("Level Incomplete",0,350);
    }
  }
}
const grid = cg.createGraphic({type:"grid",id:"grid",CGSpace:true});

ChoreoGraph.graphicTypes.picker = new class Picker {
  setup(g,graphicInit,cg) {
    g.height = 800;
    g.width = 400;

    g.creatureScale = 0.8;
    g.creatures = {};

    g.lastUpdatedLevel = null;
    g.pickerButtons = [];

    g.update = function() {
      this.creatures = {};
      for (let creature of Object.keys(grid.currentLevel.creatures)) {
        this.creatures[creature] = grid.currentLevel.creatures[creature];
      }
      for (let creature of grid.creatures) {
        this.creatures[creature.creature] -= 1;
      }
      if (this.lastUpdatedLevel !== grid.currentLevel) {
        this.createButtons();
      }
      g.lastUpdatedLevel = grid.currentLevel;
    }
    g.createButtons = function() {
      for (let button of this.pickerButtons) {
        cg.buttonNames.splice(cg.buttonNames.indexOf(button.id),1);
        cg.buttonCount--;
        delete cg.buttons[button.id];
      }
      this.pickerButtons = [];
      let creatureNum = 0;
      for (let creature of Object.keys(this.creatures)) {
        let y = creatureNum;
        let x = picker.x;
        let buttonHeight = g.width/2;
        let xo = 0;
        let yo = g.height/2-buttonHeight/2;
        let newButton = cg.createButton({x:x,y:y*buttonHeight-yo,width:g.width,height:buttonHeight,id:"picker"+creature,creature:creature,cursor:"pointer",check:"gameScreen",CGSpace:true,
          down:function(){
            if (g.creatures[this.creature] > 0) {
              grid.creatures.push({creature:this.creature,x:0,y:0,agitation:0,hidden:true,unhideWhenDropped:true,hasEntered:false});
              grid.selectedCreature = grid.creatures.length-1;
              grid.calculateAgitation();
              grid.updateButtonCursors();
              picker.update();
            }
          }
        });
        this.pickerButtons.push(newButton);
        creatureNum++;
      }
    }
  }
  draw(g,cg) {
    cg.c.fillStyle = "#ff0000";
    cg.c.strokeRect(-g.width/2,-g.height/2,g.width,g.height)
    for (let creatureId of Object.keys(g.creatures)) {
      let creature = creatures[creatureId];
      let y = Object.keys(g.creatures).indexOf(creatureId);
      let x = 0;
      let tileSize = g.width/2;
      let xo = 0;
      let yo = g.height/2-tileSize/2;
      cg.drawImage(creature.image,x*tileSize-xo,y*tileSize-yo,tileSize*g.creatureScale,tileSize*g.creatureScale,0,false);
      cg.c.fillStyle = "#000000";
      cg.c.font = "20px Arial";
      cg.c.textAlign = "left";
      cg.c.textBaseline = "top";
      cg.c.fillText(g.creatures[creatureId],x*tileSize-xo,y*tileSize-yo);
    }
  }
}
const picker = cg.createGraphic({type:"picker",id:"picker",CGSpace:true,x:600});

ChoreoGraph.graphicTypes.levelSelector = new class LevelSelector {
  setup(g,graphicInit,cg) {
    g.levels = [0,1,2,3];

    g.widthPerLevel = 250;
    g.hightPerLevel = 200;

    g.createButtons = function() {
      let xo = g.levels.length*g.widthPerLevel/2-levelSelector.x;
      let yo = g.hightPerLevel/2-levelSelector.y;
      let xoC = g.levels.length*g.widthPerLevel/2-g.widthPerLevel/2;
      let levelNum = 0;
      for (let levelId of g.levels) {
        cg.createButton({x:0-xoC+g.widthPerLevel*levelNum,y:0,width:g.widthPerLevel,height:g.hightPerLevel,id:"level"+levelId,levelId:levelId,cursor:"pointer",check:"levelsScreen",CGSpace:true,
          down:function(){
            grid.loadLevel(levels[this.levelId]);
            screen = "game";
          }
        });
        levelNum++;
      }
    }
  }
  draw(g,cg) {
    let xo = g.levels.length*g.widthPerLevel/2;
    let yo = g.hightPerLevel/2;
    let xoC = g.levels.length*g.widthPerLevel/2-g.widthPerLevel/2;
    let levelNum = 0;
    for (let level of g.levels) {
      if (levels[level].completed) {
        cg.c.strokeStyle = "#00ff00";
      } else {
        cg.c.strokeStyle = "#ff0000";
      }
      cg.c.lineWidth = 10;
      cg.c.strokeRect(0-xo+g.widthPerLevel*levelNum+20,-yo+20,g.widthPerLevel-40,g.hightPerLevel-40);
      cg.c.textAlign = "center";
      cg.c.textBaseline = "middle";
      cg.c.font = "50px Arial";
      cg.c.fillStyle = "#000000";
      cg.c.fillText(levels[level].name,0-xoC+g.widthPerLevel*levelNum,0);
      levelNum++;
    }
  }
}
const levelSelector = cg.createGraphic({type:"levelSelector",id:"levelSelector",CGSpace:true});
levelSelector.createButtons();

ChoreoGraph.graphicTypes.returnToLevels = new class ReturnToLevels {
  draw(g,cg) {
    cg.c.fillStyle = cg.buttons.returnToLevels.hovered ? "#555555" : "#000000";
    cg.c.font = "50px Arial";
    cg.c.textAlign = "center";
    cg.c.textBaseline = "middle";
    cg.c.fillText("Return To Levels",0,50);
  }
}
const returnToLevels = cg.createGraphic({type:"returnToLevels",id:"returnToLevels",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:0});

cg.createButton({x:0,y:50,width:400,height:100,id:"returnToLevels",cursor:"pointer",check:"gameScreen",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:0,
  down:function(){
    screen = "levels";
  }
});

cg.settings.callbacks.updateButtonChecks = function(cg) {
  return {
    "gameScreen" : screen=="game",
    "levelsScreen" : screen=="levels"
  }
}

grid.loadLevel(levels[0]);

cg.camera.scaleMode = "maximum";
cg.camera.maximumSize = 1920;
cg.camera.WHRatio = 1;

ChoreoGraph.start();
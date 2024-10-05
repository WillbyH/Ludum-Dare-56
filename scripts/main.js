cg.createImage({id:"shine",file:"shine.png"});
cg.createGraphic({type:"image",id:"shine",CGSpace:true,image:cg.images.shine});
cg.createImage({id:"returnToLevels",file:"returnToLevels.png"});
cg.createImage({id:"grid5",file:"grid-5.png"});
cg.createImage({id:"grid4",file:"grid-4.png"});
cg.createImage({id:"grid3",file:"grid-3.png"});
cg.createImage({id:"reset",file:"reset.png"});

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
  2 : {
    name : "2",
    gridSize : 3,
    creatures : {
      fox : 1,
      rabbit : 4
    },
    completed : false
  },
  1 : {
    name : "3",
    gridSize : 4,
    creatures : {
      fox : 3,
      rabbit : 5
    },
    completed : false
  },
  "test" : {
    name : "x",
    gridSize : 10,
    creatures : {
      fox : 50,
      rabbit : 50,
      spider : 50,
      capybara : 50,
      snake : 50
    },
    completed : false
  },
  3 : {
    name : "4",
    gridSize : 5,
    creatures : {
      fox : 6,
      rabbit : 3
    },
    completed : false
  },
  4 : {
    name : "5",
    gridSize : 4,
    creatures : {
      fox : 2,
      rabbit : 7,
      capybara : 1,
      spider : 1
    },
    completed : false
  },
  5 : {
    name : "6",
    gridSize : 5,
    creatures : {
      rabbit : 18,
      snake : 2,
      spider : 2
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
  spider : {
    effectors : [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]],
    type : "territorial",
    startingAgitation : -2,
    image: {file:"creatures.png",crop:[600,0,300,300]}
  },
  capybara : {
    effectors : [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[2,0],[0,2],[-2,0],[0,-2]],
    type : "calming",
    startingAgitation : -1000,
    image: {file:"creatures.png",crop:[900,0,300,300]}
  },
  snake : {
    effectors : [[1,-1],[1,1],[-1,1],[-1,-1],[2,0],[0,2],[-2,0],[0,-2]],
    type : "aggressive",
    startingAgitation : 1,
    image: {file:"creatures.png",crop:[0,300,300,300]}
  }
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
  let isHoveredOccupied = false;
  for (let button of grid.gridButtons) {
    if (cg.buttons[button.id].hovered) {
      gridHovered = true;
      let creatureIndex = 0;
      for (let creature of grid.creatures) {
        if (creatureIndex == grid.selectedCreature) { continue; } // Skip self
        if (creature.x == button.gridX && creature.y == button.gridY) {
          isHoveredOccupied = true;
          break;
        }
        creatureIndex++;
      }
      break;
    }
  }
  if (grid.selectedCreature !== null) { // If creature was being held
    let newCreature = (grid.creatures[grid.selectedCreature].hidden&&!grid.creatures[grid.selectedCreature].unhideWhenDropped);
    if (!gridHovered||newCreature||isHoveredOccupied) { // Dropped off grid
      grid.creatures.splice(grid.selectedCreature,1);
    } else if (gridHovered) { // Dropped on grid
      ChoreoGraph.Input.hoveredCG.cnvs.style.cursor = "grab";
      grid.creatures[grid.selectedCreature].hidden = false;
      console.log("show")
    }
  }
  picker.update();
  grid.calculateAgitation();
  grid.selectedCreature = null;
  grid.updateButtonCursors();
}

cg.settings.callbacks.loopBefore = function(cg) {
  cg.graphics.shine.width = cg.cw/cg.z;
  cg.graphics.shine.height = cg.ch/cg.z;
  cg.addToLevel(0,cg.graphics.shine);
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
        for (let effector of creatures[currentCreature.creature].effectors) { // For each effector
          let x = currentCreature.x+effector[0];
          let y = currentCreature.y+effector[1];
          if (x >= 0 && x < g.gSize && y >= 0 && y < g.gSize) { // If in bounds
            for (let otherCreature of g.creatures) { // For each other creature
              if (otherCreature.x == x && otherCreature.y == y) { // If other creature is in range
                let effectorType = effectorTypes[creatures[currentCreature.creature].type];
                let currentCreatureAgitationChange = effectorType.self;
                let otherCreatureAgitationChange = effectorType.inRange;
                if (currentCreature.creature == otherCreature.creature&&effectorType.invertIfSame) {
                  currentCreatureAgitationChange = -currentCreatureAgitationChange;
                  otherCreatureAgitationChange = -otherCreatureAgitationChange;
                }
                currentCreature.agitation += currentCreatureAgitationChange
                otherCreature.agitation += otherCreatureAgitationChange;
              }
            }
          }
        }
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
    if (cg.images["grid"+g.gSize]==undefined) {
      for (let x = 0; x < g.gSize; x++) {
        for (let y = 0; y < g.gSize; y++) {
          let tileSize = g.maxWidth/g.gSize;
          let xo = tileSize*g.gSize/2;
          let yo = tileSize*g.gSize/2;
          cg.c.strokeStyle = "#000000";
          cg.c.strokeRect(x*tileSize-xo,y*tileSize-yo,tileSize,tileSize);
        }
      }
    } else {
      let image = cg.images["grid"+g.gSize];
      cg.drawImage(image,0,0,g.maxWidth*1.03,g.maxWidth*1.03,0,false);
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

      // EFFECTOR AREA
      for (let effector of creatures[gridCreature.creature].effectors) {
        let xEffector = x+effector[0];
        let yEffector = y+effector[1];
        if (xEffector >= 0 && xEffector < g.gSize && yEffector >= 0 && yEffector < g.gSize) {
          markers[creatures[gridCreature.creature].type].push([xEffector,yEffector,x,y]);
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
        let creatureX = marker[2];
        let creatureY = marker[3];
        if (effectorsOfTile[xEffector+","+yEffector] === undefined) {
          effectorsOfTile[xEffector+","+yEffector] = 0;
        } else {
          effectorsOfTile[xEffector+","+yEffector]++;
        }
        let effectorsOfThisTile = effectorsOfTile[xEffector+","+yEffector];
        if (cg.buttons["grid"+creatureX+","+creatureY]?.hovered) {
          cg.c.globalAlpha = 1;
        } else {
          cg.c.globalAlpha = 0.2;
        }
        if (effectorType=="territorial") {
          cg.c.strokeStyle = effectorTypes[effectorType].colour;
          cg.c.lineWidth = tileSize*0.1;
          cg.c.strokeRect(xEffector*tileSize-xo+cg.c.lineWidth/2,yEffector*tileSize-yo+cg.c.lineWidth/2,tileSize-cg.c.lineWidth,tileSize-cg.c.lineWidth);
        } else if (effectorType=="calming") {
          cg.c.strokeStyle = effectorTypes[effectorType].colour;
          cg.c.lineWidth = tileSize*0.1;
          cg.c.strokeRect(xEffector*tileSize-xo+cg.c.lineWidth*2,yEffector*tileSize-yo+cg.c.lineWidth*2,tileSize-cg.c.lineWidth*4,tileSize-cg.c.lineWidth*4);
        } else if (effectorType=="aggressive") {
          cg.c.fillStyle = effectorTypes[effectorType].colour;
          cg.c.fillRect(xEffector*tileSize-xo+tileSize/4,yEffector*tileSize-yo+tileSize/4,tileSize*0.5,tileSize*0.5);
        } else if (effectorType=="passive") {
          cg.c.fillStyle = effectorTypes[effectorType].colour;
          cg.c.beginPath();
          cg.c.arc(xEffector*tileSize-xoC,yEffector*tileSize-yoC,tileSize/4,0,2*Math.PI);
          cg.c.fill();
        }
        cg.c.globalAlpha = 1;
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
    for (let gridCreature of g.creatures) {
      if (!gridCreature.hasEntered||gridCreature.agitation<-50) { continue; }
      let x = gridCreature.x;
      let y = gridCreature.y;

      // AGITATION
      cg.c.fillStyle = "#ffffff";
      cg.c.beginPath();
      cg.c.arc(x*tileSize-xo+g.textCornerPadding+5.5,y*tileSize-yo+g.textCornerPadding+8,10,0,2*Math.PI);
      cg.c.fill();
      cg.c.strokeStyle = gridCreature.agitation > 0 ? "#ff0000" : "#00ff00";
      cg.c.lineWidth = 3;
      cg.c.stroke();
      cg.c.font = "bold 20px Arial";
      cg.c.fillStyle = "#000000";
      cg.c.textAlign = "left";
      cg.c.textBaseline = "top";
      cg.c.fillText(gridCreature.agitation,x*tileSize-xo+g.textCornerPadding,y*tileSize-yo+g.textCornerPadding);
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
    g.buttonHeight = 150;

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
        let yo = g.height/2-g.buttonHeight/2;
        let newButton = cg.createButton({x:x,y:y*g.buttonHeight-yo,width:g.width,height:g.buttonHeight,id:"picker"+creature,creature:creature,cursor:"pointer",check:"gameScreen",CGSpace:true,
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
      let yo = g.height/2-g.buttonHeight/2;
      cg.drawImage(creature.image,0,y*g.buttonHeight-yo,g.buttonHeight*g.creatureScale,g.buttonHeight*g.creatureScale,0,false);
      cg.c.fillStyle = "#000000";
      cg.c.font = "20px Arial";
      cg.c.textAlign = "left";
      cg.c.textBaseline = "top";
      cg.c.fillText("x"+g.creatures[creatureId],100,y*g.buttonHeight-yo);
      cg.c.textAlign = "center";
      cg.c.fillText(creatures[creatureId].type,0,y*g.buttonHeight-yo+g.buttonHeight/2-25);
      cg.c.strokeStyle = effectorTypes[creatures[creatureId].type].colour;
      cg.c.lineWidth = 10;
      cg.c.lineCap = "round";
      cg.c.beginPath();
      cg.c.moveTo(-50,y*g.buttonHeight-yo+g.buttonHeight/2);
      cg.c.lineTo(50,y*g.buttonHeight-yo+g.buttonHeight/2);
      cg.c.stroke();
    }
  }
}
const picker = cg.createGraphic({type:"picker",id:"picker",CGSpace:true,x:600});

ChoreoGraph.graphicTypes.levelSelector = new class LevelSelector {
  setup(g,graphicInit,cg) {
    g.levels = [0,2,1,3,4,5,"test"];

    g.widthPerLevel = 250;
    g.hightPerLevel = 200;

    
    g.levelsRandom = ["#e93526","#fb9938","#fdd816","#17912a","#10caf3","#a871d9","#ff47be","#e93526","#fb9938","#fdd816","#17912a","#10caf3","#a871d9","#ff47be"]
    g.levelsRandom = g.levelsRandom.sort(() => Math.random() - 0.5);

    g.createButtons = function() {
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
    let xoC = g.levels.length*g.widthPerLevel/2-g.widthPerLevel/2;
    let levelNum = 0;
    let completedPrevious = false;
    for (let level of g.levels) {
      if (levels[level].completed) {
        cg.c.strokeStyle = "#00ff00";
      } else {
        cg.c.strokeStyle = "#ff0000";
      }
      cg.c.lineWidth = 10;
      // cg.c.strokeRect(0-xo+g.widthPerLevel*levelNum+20,-yo+20,g.widthPerLevel-40,g.hightPerLevel-40);
      cg.c.textAlign = "center";
      cg.c.textBaseline = "middle";
      cg.c.font = "230px MgOpenModata";
      cg.c.fillStyle = ["#e93526","#fb9938","#fdd816","#17912a","#10caf3","#a871d9","#ff47be"][levelNum];
      if (cg.buttons["level"+level].hovered) {
        cg.c.fillStyle = ChoreoGraph.colourLerp(cg.c.fillStyle,"#000000",0.4);
      }
      if (!completedPrevious&&levelNum!=0) {
        cg.c.fillStyle = "#999999";
      }
      completedPrevious = false;
      cg.c.save();
      cg.c.translate(0-xoC+g.widthPerLevel*levelNum,12);
      let rotation = [4,-3,12,-12,6,-6,0][levelNum];
      cg.c.rotate(rotation*Math.PI/180);
      cg.c.fillText(levels[level].name,0,0);
      cg.c.strokeStyle = "#ffffff";
      cg.c.lineWidth = 3;
      if (cg.buttons["level"+level].hovered) {
        cg.c.strokeText(levels[level].name,0,0);
      }
      cg.c.strokeStyle = "#888888";
      cg.c.filter = "blur(8px)";
      cg.c.strokeText(levels[level].name,0,0);
      cg.c.restore();
      levelNum++;
      if (levels[level].completed) {
        completedPrevious = true;
      }
    }
    let letterNum = 0;
    for (let letter of ["L","E","V","E","L","S"]) {
      cg.c.font = "120px MgOpenModata";
      cg.c.fillStyle = g.levelsRandom[letterNum];
      cg.c.save();
      cg.c.translate(letterNum*80-(5*80)/2,-230);
      let rotation = [-1,-20,-3,7,6,6][letterNum];
      cg.c.rotate(rotation*Math.PI/180);
      cg.c.fillText(letter,0,0);
      cg.c.filter = "blur(8px)";
      cg.c.strokeStyle = "#888888";
      cg.c.lineWidth = 3;
      cg.c.strokeText(letter,0,0);
      cg.c.restore();
      letterNum++;
    }
  }
}
const levelSelector = cg.createGraphic({type:"levelSelector",id:"levelSelector",CGSpace:true});
levelSelector.createButtons();

ChoreoGraph.graphicTypes.returnToLevels = new class ReturnToLevels {
  draw(g,cg) {
    if (cg.buttons.returnToLevels.hovered) {
      cg.c.rotate(-0.05);
    }
    let imageScale = 0.25;
    cg.drawImage(cg.images.returnToLevels,0,65,1146*imageScale,569*imageScale,0,false);
  }
}
const returnToLevels = cg.createGraphic({type:"returnToLevels",id:"returnToLevels",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:0});

cg.createButton({x:0,y:70,width:400,height:120,id:"returnToLevels",cursor:"pointer",check:"gameScreen",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:0,
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
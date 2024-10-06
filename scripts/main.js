cg.createImage({id:"shine",file:"shine.png"});
cg.createGraphic({type:"image",id:"shine",CGSpace:true,image:cg.images.shine});
cg.createImage({id:"returnToLevels",file:"returnToLevels.png"});
cg.createImage({id:"grid5",file:"grid-5.png"});
cg.createImage({id:"grid4",file:"grid-4.png"});
cg.createImage({id:"grid3",file:"grid-3.png"});
cg.createImage({id:"reset",file:"reset.png"});
cg.createImage({id:"next",file:"next.png"});
cg.createImage({id:"win",file:"win.png"});
cg.createImage({id:"star",file:"star.png"});
cg.createImage({id:"credits",file:"credits.png"});

cg.createImage({id:"playtesters",file:"decoratives/playtesters.png"});
cg.createImage({id:"spoons",file:"decoratives/spoons.png"});
cg.createImage({id:"foxrabbit",file:"decoratives/foxrabbit.png"});
cg.createImage({id:"capybaraspider",file:"decoratives/capybaraspider.png"});

ChoreoGraph.AudioController.createSound("complete","audio/complete.mp3");
ChoreoGraph.AudioController.createSound("music","audio/ld56.mp3",{autoplay:true,volume:0.5,loop:true});

const levels = {
  0 : {
    name : "1",
    gridSize : 3,
    creatures : {
      fox : 1,
      rabbit : 1
    },
    completed : false,
    viewed : false,
    savedData : [],
    locked : false
  },
  2 : {
    name : "2",
    gridSize : 3,
    creatures : {
      fox : 1,
      rabbit : 4
    },
    completed : false,
    viewed : false,
    savedData : [],
    locked : false
  },
  1 : {
    name : "3",
    gridSize : 4,
    creatures : {
      fox : 3,
      rabbit : 5
    },
    completed : false,
    viewed : false,
    savedData : [],
    locked : false
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
    completed : false,
    viewed : false,
    savedData : [],
    locked : false
  },
  3 : {
    name : "4",
    gridSize : 5,
    creatures : {
      fox : 9
    },
    completed : false,
    viewed : false,
    savedData : [],
    locked : false
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
    completed : false,
    viewed : false,
    savedData : [],
    locked : false
  },
  5 : {
    name : "6",
    gridSize : 5,
    creatures : {
      rabbit : 18,
      snake : 2,
      spider : 2
    },
    completed : false,
    viewed : false,
    savedData : [],
    locked : false
  },
  6 : {
    name : "7",
    gridSize : 5,
    creatures : {
      rabbit : 11,
      snake : 2,
      spider : 1,
      fox: 2,
      capybara: 1
    },
    completed : false,
    viewed : false,
    savedData : [],
    locked : false
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
    colour : "#0041b0",
    invertIfSame : false
  },
  "passive" : {
    self : 1,
    inRange : 0,
    colour : "#00a143",
    invertIfSame : true
  },
  "calming" : {
    self : 0,
    inRange : -1,
    colour : "#ffff41",
    invertIfSame : false
  },
  "aggressive" : {
    self : -1,
    inRange : 1,
    colour : "#a11500",
    invertIfSame : false
  }
}

// cg.settings.callbacks.keyDown = function(key) {
//   console.log('Key down:', key);
// }

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
    }
  }
  picker.update();
  grid.calculateAgitation();
  cg.createEvent({duration:1,end:function(){grid.calculateAgitation();},loop:false});
  grid.selectedCreature = null;
  grid.updateButtonCursors();
}

cg.settings.callbacks.loopBefore = function(cg) {
  if (cg.cw/cg.ch>3) {
    cg.camera.maximumSize = 4000;
  } else if (cg.cw/cg.ch>2.65) {
    cg.camera.maximumSize = 3000;
  } else if (cg.cw/cg.ch>2.2) {
    cg.camera.maximumSize = 2500;
  } else {
    cg.camera.maximumSize = 1920;
  }
  cg.graphics.shine.width = cg.cw/cg.z;
  cg.graphics.shine.height = cg.ch/cg.z;
  cg.addToLevel(0,cg.graphics.shine);
  if (screen == "game") {
    cg.addToLevel(0,cg.graphics.grid);
    cg.addToLevel(0,cg.graphics.picker);
    cg.addToLevel(1,cg.graphics.returnToLevels);
    cg.addToLevel(1,cg.graphics.levelControls);
  } else if (screen == "levels") {
    cg.addToLevel(0,cg.graphics.levelSelector);
    cg.addToLevel(0,cg.graphics.levelSelectControls);
  } else if (screen == "credits") {
    cg.addToLevel(0,cg.graphics.credits);
    cg.addToLevel(1,cg.graphics.returnToLevels);
  }
  cg.addToLevel(2,cg.graphics.confetti);
}

cg.settings.callbacks.loopAfter = function(cg) {
  if (grid.creatures[grid.selectedCreature]?.hidden) { // Draw held creature
    let imageSize = grid.maxWidth/grid.gSize*grid.creatureScale*cg.z;
    cg.drawImage(creatures[grid.creatures[grid.selectedCreature].creature].image,ChoreoGraph.Input.cursor.x,ChoreoGraph.Input.cursor.y,imageSize,imageSize,0,false);
    grid.nextCompleteCheck = cg.clock+700;
  }
}

let screen = "levels";

ChoreoGraph.graphicTypes.grid = new class Grid {
  setup(g,graphicInit,cg) {
    g.gSize = 3;
    g.maxWidth = 600;

    g.textCornerPadding = 9;

    g.creatureScale = 0.8;
    g.creatures = [{creature:"fox",x:0,y:0,agitation:0},{creature:"rabbit",x:2,y:2,agitation:0}];
    g.selectedCreature = null;

    g.currentLevel = 0;
    g.gridButtons = [];

    g.nextCompleteCheck = 0;
    g.isInCompleteState = false;

    g.resetCurrentLevel = function() {
      grid.currentLevel.savedData = [];
      grid.currentLevel.locked = false;
      grid.loadLevel(grid.currentLevel);
    }
    g.loadLevel = function(level) {
      this.currentLevel = level;
      this.gSize = level.gridSize;
      this.creatures = [];
      if (level.savedData.length > 0) {
        this.creatures = Array.from(level.savedData);
      }

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
              if (grid.currentLevel.locked) { return; }
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
        if (grid.currentLevel.locked) {
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
              if (otherCreature.hidden) { continue; }
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
      if (complete&&validGame&&grid.isInCompleteState==false) {
        console.info("Level complete");
        grid.isInCompleteState = true;
      } else {
        grid.isInCompleteState = false;
      }
    }
  }
  draw(g,cg) {
    g.currentLevel.viewed = true;
    if (g.currentLevel.locked&&!g.currentLevel.completed) {
      console.warn("Level unlocked because the state was weird");
      g.currentLevel.locked = false;
    }
    if (cg.clock>g.nextCompleteCheck&&g.isInCompleteState&&g.currentLevel.locked==false) {
      g.currentLevel.completed = true;
      g.currentLevel.locked = true;
      ChoreoGraph.AudioController.start("complete",0,0,0.3);
      confetti.start();
      g.currentLevel.lockedTime = cg.clock;
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
        if (grid.currentLevel.locked) {
          cg.c.globalAlpha = Math.max(1-(cg.clock-g.currentLevel.lockedTime)/2000,0)*0.2;
        }
        if (effectorType=="territorial") {
          cg.c.strokeStyle = effectorTypes[effectorType].colour;
          cg.c.lineWidth = tileSize*0.2;
          cg.c.strokeRect(xEffector*tileSize-xo+cg.c.lineWidth/2,yEffector*tileSize-yo+cg.c.lineWidth/2,tileSize-cg.c.lineWidth,tileSize-cg.c.lineWidth);
        } else if (effectorType=="calming") {
          cg.c.strokeStyle = effectorTypes[effectorType].colour;
          cg.c.lineWidth = tileSize*0.2;
          cg.c.beginPath();
          cg.c.roundRect(xEffector*tileSize-xo+cg.c.lineWidth*1.5,yEffector*tileSize-yo+cg.c.lineWidth*1.5,tileSize-cg.c.lineWidth*3,tileSize-cg.c.lineWidth*3,5);
          cg.c.stroke();
        } else if (effectorType=="aggressive") {
          cg.c.fillStyle = effectorTypes[effectorType].colour;
          cg.c.beginPath();
          cg.c.roundRect(xEffector*tileSize-xo+tileSize/4,yEffector*tileSize-yo+tileSize/4,tileSize*0.5,tileSize*0.5,5);
          cg.c.fill();
        } else if (effectorType=="passive") {
          cg.c.fillStyle = effectorTypes[effectorType].colour;
          cg.c.beginPath();
          cg.c.arc(xEffector*tileSize-xoC,yEffector*tileSize-yoC,tileSize/3.5,0,2*Math.PI);
          cg.c.fill();
          cg.c.fillStyle = ChoreoGraph.colourLerp(effectorTypes[effectorType].colour,"#000000",0.5);
          cg.c.beginPath();
          cg.c.arc(xEffector*tileSize-xoC,yEffector*tileSize-yoC,tileSize/4.5,0,2*Math.PI);
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
    if (cg.images["grid"+g.gSize]==undefined) {
      for (let x = 0; x < g.gSize; x++) {
        for (let y = 0; y < g.gSize; y++) {
          let tileSize = g.maxWidth/g.gSize;
          let xo = tileSize*g.gSize/2;
          let yo = tileSize*g.gSize/2;
          cg.c.strokeStyle = "#000000";
          cg.c.lineWidth = 1;
          cg.c.strokeRect(x*tileSize-xo,y*tileSize-yo,tileSize,tileSize);
        }
      }
    } else {
      let image = cg.images["grid"+g.gSize];
      cg.drawImage(image,0,0,g.maxWidth*1.03,g.maxWidth*1.03,0,false);
    }
    for (let gridCreature of g.creatures) {
      if (!gridCreature.hasEntered||gridCreature.agitation<-50) { continue; }
      let x = gridCreature.x;
      let y = gridCreature.y;

      // AGITATION
      // cg.c.fillStyle = "#ffffff";
      // cg.c.beginPath();
      // cg.c.arc(x*tileSize-xo+g.textCornerPadding+5.5,y*tileSize-yo+g.textCornerPadding+8,10,0,2*Math.PI);
      // cg.c.fill();
      let amount = Math.abs(gridCreature.agitation);
      if (gridCreature.agitation<=0) { amount++; }
      if (amount>5) {
        cg.c.lineWidth = 1.5;
        cg.c.fillStyle = gridCreature.agitation > 0 ? "#ff0000" : "#00a24e";
        cg.c.strokeStyle = "#ffffff";
        let newXO = 0.5;
        let newYO = 1.5;
        cg.c.beginPath();
        cg.c.moveTo(x*tileSize-xo-g.textCornerPadding-9+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-5+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-5+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+4+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-5+tileSize+4+newXO,y*tileSize-yo+g.textCornerPadding+4+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-5+tileSize+4+newXO,y*tileSize-yo+g.textCornerPadding+8+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-5+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+8+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-5+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+12+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-9+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+12+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-9+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+8+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-13+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+8+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-13+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+4+newYO);
        cg.c.lineTo(x*tileSize-xo-g.textCornerPadding-9+tileSize+newXO,y*tileSize-yo+g.textCornerPadding+4+newYO);
        cg.c.closePath();
        cg.c.fill();
        cg.c.stroke();
      }
      amount = Math.min(amount,5);
      cg.c.fillStyle = gridCreature.agitation > 0 ? "#ff0000" : "#00a24e";
      cg.c.strokeStyle = "#ffffff";
      cg.c.beginPath();
      for (let i=0;i<amount;i++) {
        cg.c.moveTo(x*tileSize-xo+g.textCornerPadding+5.5+i*18+7,y*tileSize-yo+g.textCornerPadding+8);
        cg.c.arc(x*tileSize-xo+g.textCornerPadding+5.5+i*18,y*tileSize-yo+g.textCornerPadding+8,7,0,2*Math.PI);
      }
      cg.c.fill();
      cg.c.lineWidth = 2;
      cg.c.stroke();
      // cg.c.lineWidth = 3;
      // cg.c.stroke();
      // cg.c.font = "bold 20px Arial";
      // cg.c.fillStyle = "#000000";
      // cg.c.textAlign = "left";
      // cg.c.textBaseline = "top";
      // cg.c.fillText(gridCreature.agitation,x*tileSize-xo+g.textCornerPadding,y*tileSize-yo+g.textCornerPadding);
    }
    cg.c.font = "50px Arial";
    cg.c.textAlign = "center";
    cg.c.textBaseline = "middle";
    if (grid.currentLevel.completed) {
      cg.c.fillStyle = "#00ad03";
      // cg.c.fillText("Level Complete",0,350);
    } else {
      cg.c.fillStyle = "#ba3934";
      // cg.c.fillText("Level Incomplete",0,350);
    }
    let spoonsScaler = 0.8;
    cg.c.globalAlpha = 0.7;
    if (grid.currentLevel.name=="2") {
      cg.drawImage(cg.images.spoons,800,-700,791*spoonsScaler,1150*spoonsScaler,5,false);
    } else if (grid.currentLevel.name=="3") {
      cg.drawImage(cg.images.spoons,-700,800,791*spoonsScaler,1150*spoonsScaler,5,false);
    } else if (grid.currentLevel.name=="4") {
      cg.drawImage(cg.images.spoons,900,850,791*spoonsScaler,1150*spoonsScaler,-7,false);
    }
    cg.c.globalAlpha = 1;
    let tutorialScaler = 0.45;
    if (["1","2","3","4"].includes(grid.currentLevel.name)) {
      cg.drawImage(cg.images.foxrabbit,-650,0,1000*tutorialScaler,1500*tutorialScaler,5,false);
    } else if (["5"].includes(grid.currentLevel.name)) {
      cg.drawImage(cg.images.capybaraspider,-650,0,1000*tutorialScaler,1500*tutorialScaler,-5,false);
    }
  }
}
const grid = cg.createGraphic({type:"grid",id:"grid",CGSpace:true});

ChoreoGraph.graphicTypes.picker = new class Picker {
  setup(g,graphicInit,cg) {
    g.height = 800;
    g.width = 400;
    g.buttonHeight = 150;

    g.creatureScale = 1;
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
        let yo = (g.buttonHeight*(Object.keys(g.creatures).length-1)/2);
        let newButton = cg.createButton({x:x,y:y*g.buttonHeight-yo,width:g.width,height:g.buttonHeight,id:"picker"+creature,creature:creature,cursor:"pointer",check:"pick"+creatureNum,CGSpace:true,
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
    // cg.c.fillStyle = "#ff0000";
    // cg.c.strokeRect(-g.width/2,-g.height/2,g.width,g.height)
    for (let creatureId of Object.keys(g.creatures)) {
      let creature = creatures[creatureId];
      let y = Object.keys(g.creatures).indexOf(creatureId);
      let yo = (g.buttonHeight*(Object.keys(g.creatures).length-1)/2);
      if (g.creatures[creatureId] > 0) {
        cg.c.fillStyle = effectorTypes[creatures[creatureId].type].colour;
        cg.c.globalAlpha = 0.1;
        cg.c.beginPath();
        cg.c.arc(0,y*g.buttonHeight-yo,72,0,2*Math.PI);
        cg.c.fill();
        cg.c.globalAlpha = 1;
      }
      for (let i = 0; i < Math.min(g.creatures[creatureId],19); i++) {
        let rot = [20,-15,8,-12,15,2,8,-20,15,2,-7,12,16,-9,-15,2,12,-5,-10][i];
        cg.c.globalCompositeOperation = "source-over";
        cg.c.globalAlpha = 1;
        cg.drawImage(creature.image,0,y*g.buttonHeight-yo,g.buttonHeight*g.creatureScale,g.buttonHeight*g.creatureScale,rot,false);
        if (i!==Math.min(g.creatures[creatureId],19)-1) {
          cg.c.globalCompositeOperation = "destination-out";
          cg.c.fillStyle = "#000000";
          cg.c.globalAlpha = 0.1;
          cg.drawImage(creature.image,0,y*g.buttonHeight-yo,g.buttonHeight*g.creatureScale,g.buttonHeight*g.creatureScale,rot,false);
        }
      }
      cg.c.fillStyle = "#000000";
      cg.c.font = "20px MgOpenModata";
      cg.c.textAlign = "left";
      cg.c.textBaseline = "top";
      if (g.creatures[creatureId] > 0) {
        cg.c.fillText("x"+g.creatures[creatureId],100,y*g.buttonHeight-yo);
      }
      // cg.c.textAlign = "center";
      // cg.c.fillText(creatures[creatureId].type,0,y*g.buttonHeight-yo+g.buttonHeight/2-25);
      // cg.c.strokeStyle = effectorTypes[creatures[creatureId].type].colour;
      // cg.c.lineWidth = 10;
      // cg.c.lineCap = "round";
      // cg.c.beginPath();
      // cg.c.moveTo(-50,y*g.buttonHeight-yo+g.buttonHeight/2);
      // cg.c.lineTo(50,y*g.buttonHeight-yo+g.buttonHeight/2);
      // cg.c.stroke();
    }
  }
}
const picker = cg.createGraphic({type:"picker",id:"picker",CGSpace:true,x:600});

ChoreoGraph.graphicTypes.levelSelector = new class LevelSelector {
  setup(g,graphicInit,cg) {
    g.levels = [0,2,1,3,4,5,6];

    g.widthPerLevel = 250;
    g.hightPerLevel = 200;

    
    g.levelsRandom = ["#e93526","#fb9938","#fdd816","#17912a","#10caf3","#a871d9","#ff47be","#e93526","#fb9938","#fdd816","#17912a","#10caf3","#a871d9","#ff47be"]
    g.levelsRandom = g.levelsRandom.sort(() => Math.random() - 0.5);

    g.createButtons = function() {
      let xoC = g.levels.length*g.widthPerLevel/2-g.widthPerLevel/2;
      let levelNum = 0;
      for (let levelId of g.levels) {
        cg.createButton({x:0-xoC+g.widthPerLevel*levelNum,y:0,width:g.widthPerLevel,height:g.hightPerLevel,id:"level"+levelId,levelId:levelId,cursor:"pointer",check:"levelsScreenAvailable"+levels[levelId].name,CGSpace:true,
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
    let viewedPrevious = false;
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
      if (!viewedPrevious&&levelNum!=0) {
        cg.c.fillStyle = "#999999";
      }
      viewedPrevious = false;
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

      if (levels[level].completed) {
        let rot = [38,-60,180,270,100,300,230][levelNum];
        cg.drawImage(cg.images.star,0-xoC+g.widthPerLevel*levelNum-60,-g.hightPerLevel/2+180,70,70,rot,false);
      }

      levelNum++;
      if (levels[level].viewed) {
        viewedPrevious = true;
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

ChoreoGraph.graphicTypes.confetti = new class confetti {
  setup(g,graphicInit,cg) {
    g.active = false;
    g.particles = [];

    g.start = function() {
      if (g.active) { return; }
      g.active = true;
      g.particles = [];
      for (let i=0;i<200;i++) {
        g.particles.push({
          x:Math.random()*cg.cw,
          y:-100-Math.random()*2000,
          size:Math.random()*20+10,
          speed:Math.random()*0.70+0.3,
          rotation:Math.random()*360,
          rotationSpeed:Math.random()*10-5,
          colour:["#3fc0c2","#c92a37","#4ed03f","#e8e63b","#e78826","#e85ead","#2f6bbb"][Math.floor(Math.random()*7)]
        });
      }
    }
  }
  draw(g,cg) {
    if (g.active) {
      for (let particle of g.particles) {
        particle.y += particle.speed*cg.timeDelta;
        particle.rotation += particle.rotationSpeed;
        if (particle.y < -100) { continue; }
        cg.c.fillStyle = particle.colour;
        cg.c.save();
        cg.c.translate(particle.x,particle.y);
        cg.c.rotate(particle.rotation*Math.PI/180);
        cg.c.fillRect(-particle.size,-particle.size/2,particle.size*2,particle.size);
        cg.c.restore();
        if (particle.y > cg.ch+100) {
          g.particles.splice(g.particles.indexOf(particle),1);
        }
      }
    }
    if (g.particles.length == 0) {
      g.active = false;
    }
  }
}
const confetti = cg.createGraphic({type:"confetti",id:"confetti",CGSpace:false,canvasSpaceXAnchor:0,canvasSpaceYAnchor:0});

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


cg.createButton({x:0,y:70,width:400,height:120,id:"returnToLevels",cursor:"pointer",check:"gameAndCreditsScreen",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:0,
  down:function(){
    grid.currentLevel.savedData = Array.from(grid.creatures);
    screen = "levels";
  }
});

ChoreoGraph.graphicTypes.levelControls = new class levelControls {
  draw(g,cg) {
    let imageScale = 0.2;
    if (cg.buttons.reset.hovered) {
      imageScale = 0.19;
    }
    cg.drawImage(cg.images.reset,-140,-80,1500*imageScale,600*imageScale,0,false);
    imageScale = 0.2;
    if (cg.buttons.next.hovered) {
      imageScale = 0.19;
    }
    if (!grid.currentLevel.completed) {
      cg.c.globalAlpha = 0.2;
    }
    if (grid.currentLevel.name===levels[levelSelector.levels[levelSelector.levels.length-1]].name) { // Is last level
      cg.drawImage(cg.images.win,150,-80,1500*imageScale,600*imageScale,0,false);
    } else {
      cg.drawImage(cg.images.next,150,-80,1500*imageScale,600*imageScale,0,false);
    }
  }
}
const levelControls = cg.createGraphic({type:"levelControls",id:"levelControls",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:1});

ChoreoGraph.graphicTypes.levelSelectControls = new class levelSelectControls {
  draw(g,cg) {
    let imageScale = 0.2;
    if (cg.buttons.reset.hovered) {
      imageScale = 0.19;
    }
    cg.drawImage(cg.images.credits,0,-80,1500*imageScale,600*imageScale,0,false);
  }
}
const levelSelectControls = cg.createGraphic({type:"levelSelectControls",id:"levelSelectControls",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:1});

cg.createButton({x:-150,y:-80,width:270,height:120,id:"reset",cursor:"pointer",check:"gameScreen",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:1,
  down:function(){
    grid.resetCurrentLevel();
  }
});

cg.createButton({x:150,y:-80,width:270,height:120,id:"next",cursor:"pointer",check:"gameScreen-levelComplete",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:1,
  down:function(){
    grid.currentLevel.savedData = Array.from(grid.creatures);
    if (grid.currentLevel.name===levels[levelSelector.levels[levelSelector.levels.length-1]].name) { // Is last level
      screen = "credits";
    } else {
      for (let i = 0; i < levelSelector.levels.length; i++) {
        if (levels[levelSelector.levels[i]].name == grid.currentLevel.name) {
          if (i+1 < levelSelector.levels.length) {
            grid.loadLevel(levels[levelSelector.levels[i+1]]);
          }
          break;
        }
      }
    }
  }
});

ChoreoGraph.graphicTypes.credits = new class credits {
  setup(g,graphicInit,cg) {
    g.randomIntA = Math.floor(Math.random()*levelSelector.levels.length);
    g.randomIntB = Math.floor(Math.random()*26);
  }
  draw(g,cg) {
    let playtestersScale = 0.35;
    cg.drawImage(cg.images.playtesters,500,0,1600*playtestersScale,1600*playtestersScale,5,false);
    cg.c.fillStyle = "#1d1d1d";
    cg.c.textAlign = "center";
    cg.c.textBaseline = "middle";
    cg.c.font = "100px MgOpenModata";
    cg.c.fillText("LOGO",-400,-80);
    cg.c.font = "50px MgOpenModata";
    cg.c.fillText("Created by Willby",-400,80);
    cg.drawImage(cg.images.capybara,-700,350,220,220,-20,false);

    cg.c.font = "170px MgOpenModata";
    // cg.c.fillStyle = "#a871d9";
    cg.c.fillStyle = levelSelector.levelsRandom[g.randomIntA];
    cg.c.save();
    cg.c.translate(500,-380);
    cg.c.rotate((30)*Math.PI/180);
    cg.c.fillText(["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"][g.randomIntB],0,0);
    cg.c.filter = "blur(8px)";
    cg.c.strokeStyle = "#888888";
    cg.c.lineWidth = 3;
    cg.c.strokeText(["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"][g.randomIntB],0,0);
    cg.c.restore();
  }
}
const credits = cg.createGraphic({type:"credits",id:"credits",CGSpace:false,canvasSpaceXAnchor:0.5,canvasSpaceYAnchor:0.5});

cg.settings.callbacks.updateButtonChecks = function(cg) {
  let output = {
    "gameScreen" : screen=="game",
    "gameAndCreditsScreen" : screen=="game"||screen=="credits",
    "gameScreen-levelComplete" : screen=="game"&&grid.currentLevel.completed,
    "levelsScreen" : screen=="levels"
  }
  let levelNum = 0;
  let previous = null;
  for (let level of levelSelector.levels) {
    output["levelsScreenAvailable"+levels[level].name] = (previous?.viewed||levelNum===0)&&screen=="levels";
    previous = levels[level];
    levelNum++;
  }
  for (let creature of Object.keys(picker.creatures)) {
    output["pick"+Object.keys(picker.creatures).indexOf(creature)] = picker.creatures[creature] > 0&&screen=="game";
  }
  return output;
}

grid.loadLevel(levels[4]);

cg.camera.scaleMode = "maximum";
cg.camera.maximumSize = 1920;
cg.camera.WHRatio = 1;

ChoreoGraph.start();
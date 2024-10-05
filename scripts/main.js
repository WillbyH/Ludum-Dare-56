cg.settings.callbacks.keyDown = function(key) {
  console.log('Key down:', key);
}

cg.settings.callbacks.loopBefore = function(cg) {
  cg.addToLevel(0,cg.graphics.grid);
}

cg.settings.callbacks.loopAfter = function(cg) {
  cg.c.fillStyle = "#86acff";
  // cg.c.fillRect(100,100,100,100);
}

ChoreoGraph.graphicTypes.grid = new class {
  setup(g,graphicInit,cg) {
    g.gSize = 3;
    g.maxWidth = 600;

    g.textCornerPadding = 4;

    g.creatureScale = 0.8;
    g.creatures = [{creature:"fox",x:0,y:0,agitation:0},{creature:"rabbit",x:2,y:2,agitation:0}];
    g.selectedCreature = null;

    g.gridButtons = [];

    g.loadLevel = function(level) {
      this.gSize = level.gridSize;

      for (let button of this.gridButtons) {
        delete cg.buttons[button.id];
      }
      this.gridButtons = [];
      
      this.createButtons();
      this.calculateAgitation();
    }
    g.createButtons = function() {
      for (let x = 0; x < g.gSize; x++) {
        for (let y = 0; y < g.gSize; y++) {
          let tileSize = g.maxWidth/g.gSize;
          let xo = tileSize*g.gSize/2-tileSize/2;
          let yo = tileSize*g.gSize/2-tileSize/2;
          let newButton = cg.createButton({x:x*tileSize-xo,y:y*tileSize-yo,width:tileSize,height:tileSize,id:"grid"+x+","+y,gridX:x,gridY:y,cursor:"default",CGSpace:true,
            enter:function(){
              if (grid.selectedCreature !== null) {
                let creature = grid.creatures[grid.selectedCreature];
                let spaceOccupied = false;
                for (let creature of grid.creatures) {
                  if (creature.x == this.gridX && creature.y == this.gridY) {
                    spaceOccupied = true;
                    break;
                  }
                }
                if (!spaceOccupied) {
                  creature.x = this.gridX;
                  creature.y = this.gridY;
                  grid.calculateAgitation();
                }
              }
            },
            down:function(){
              let creatureIndex = 0;
              for (let creature of grid.creatures) {
                if (creature.x == this.gridX && creature.y == this.gridY) {
                  console.log("down",creature.creature);
                  grid.selectedCreature = creatureIndex;
                  break;
                }
                creatureIndex++;
              }
              grid.updateButtonCursors();
              ChoreoGraph.Input.hoveredCG.cnvs.style.cursor = "grabbing";
            },
            up:function(){
              grid.selectedCreature = null;
              grid.updateButtonCursors();
              ChoreoGraph.Input.hoveredCG.cnvs.style.cursor = "grab";
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
                    agitationChange = -agitationChange;
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
    for (let gridCreature of g.creatures) {
      let tileSize = g.maxWidth/g.gSize;
      let xoC = tileSize*g.gSize/2-tileSize/2;
      let yoC = tileSize*g.gSize/2-tileSize/2;
      let xo = tileSize*g.gSize/2;
      let yo = tileSize*g.gSize/2;
      let x = gridCreature.x;
      let y = gridCreature.y;
      let creature = creatures[gridCreature.creature];
      cg.drawImage(creature.image,x*tileSize-xoC,y*tileSize-yoC,tileSize*g.creatureScale,tileSize*g.creatureScale,0,false);
      cg.c.font = "20px Arial";
      cg.c.fillStyle = "#000000";
      cg.c.textAlign = "left";
      cg.c.textBaseline = "top";
      cg.c.fillText(gridCreature.agitation,x*tileSize-xo+g.textCornerPadding,y*tileSize-yo+g.textCornerPadding);
    }
  }
}
const grid = cg.createGraphic({type:"grid",id:"grid",CGSpace:true});

const levels = [
  {
    gridSize : 3,
    creatures : {
      fox : 1,
      rabbit : 1
    }
  },
  {
    gridSize : 4,
    creatures : {
      fox : 5,
      rabbit : 2
    }
  }
];

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
    invertIfSame : false
  },
  "aggressive" : {
    self : -1,
    inRange : 1,
    invertIfSame : false
  },
  "passive" : {
    self : 1,
    inRange : 0,
    invertIfSame : true
  },
  "calming" : {
    self : 0,
    inRange : -1,
    invertIfSame : false
  }
}

grid.loadLevel(levels[0]);

cg.camera.scaleMode = "maximum";
cg.camera.maximumSize = 1920;

ChoreoGraph.start();
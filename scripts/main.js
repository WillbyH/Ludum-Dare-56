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

ChoreoGraph.graphicTypes.grid = new class grid {
  setup(g,graphicInit,cg) {
    g.gWidth = 5;
    g.gHeight = 5;
    g.tWidth = 100;
    g.tHeight = 100;
  }
  draw(g,cg) {
    for (let x = 0; x < g.gWidth; x++) {
      for (let y = 0; y < g.gHeight; y++) {
        let xo = g.tWidth*g.gWidth/2;
        let yo = g.tHeight*g.gWidth/2;
        cg.c.strokeStyle = "#000000";
        cg.c.strokeRect(x*g.tWidth-xo,y*g.tHeight-yo,g.tWidth,g.tHeight);
      }
    }
    // cg.c.fillStyle = "#ff0000";
    // cg.c.fillRect(-50,-50,100,100);
  }
}
let grid = cg.createGraphic({type:"grid",id:"grid",CGSpace:true});

ChoreoGraph.start();
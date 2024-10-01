cg.settings.callbacks.keyDown = function(key) {
  console.log('Key down:', key);
}

cg.settings.callbacks.loopBefore = function(cg) {
  
}

cg.settings.callbacks.loopAfter = function(cg) {
  cg.c.fillStyle = "#86acff";
  cg.c.fillRect(100,100,100,100);
}

ChoreoGraph.start();
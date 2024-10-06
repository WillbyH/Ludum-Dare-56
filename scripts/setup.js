var cg = ChoreoGraph.instantiate(document.getElementsByTagName("canvas")[0],{
  parentElementId : "full",
  levels : 3,
  background : "#c9c7c5",
  useCamera : true,
  preventDefault : ["space","up","down","left","right","tab","mouseRight"],
});

cg.preventSingleTouch = true;


var cg = ChoreoGraph.instantiate(document.getElementsByTagName("canvas")[0],{
  parentElementId : "full",
  levels : 5,
  // background : "#fafafa",
  useCamera : true,
  preventDefault : ["space","up","down","left","right","tab"],
});

cg.preventSingleTouch = true;


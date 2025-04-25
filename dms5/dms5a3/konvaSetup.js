/* set up stage and layer */
let stage = new Konva.Stage({
    container: 'stageContainer',
    width: 800,
    height: 500
});

let layer = new Konva.Layer();
stage.add(layer);

var group = new Konva.Group({
});
layer.add(group);

/* set up canvas element */
const canvas = document.createElement('canvas');
canvas.width = stage.width();
canvas.height = stage.height();




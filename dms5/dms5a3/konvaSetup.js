/* set up stage and layer */
const stage = new Konva.Stage({
    container: 'stageContainer',
    width: 800,
    height: 500
});

const layer = new Konva.Layer();
stage.add(layer);

const group = new Konva.Group({
});
layer.add(group);
layer.draw();

/* set up canvas element */
const canvas = document.createElement('canvas');
canvas.width = stage.width();
canvas.height = stage.height();


// Pitch guide
const scale = window.scale;
const guideLayer = new Konva.Layer();
stage.add(guideLayer);

const canvasHeight = stage.height();
const canvasWidth = stage.width();
const pitchCount = scale.length;
const step = canvasHeight / pitchCount;

for (let i = 0; i < pitchCount; i++) {
  const y = i * step;

  const line = new Konva.Line({
    points: [0, y, canvasWidth, y],
    stroke: 'black',
    strokeWidth: 0.1,
  });

  const label = new Konva.Text({
    x: 5,
    y: y - 10,
    text: scale[scale.length - 1 - i],
    fontSize: 12,
    fill: 'gray'
  });

  guideLayer.add(line);
  guideLayer.add(label);
}

guideLayer.draw();


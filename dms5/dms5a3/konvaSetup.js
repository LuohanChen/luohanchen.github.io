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

// timeline line
const playhead = new Konva.Line({
  points: [0, 0, 0, stage.height()],
  stroke: 'black',
  strokeWidth: 1,
  visible: false
});
layer.add(playhead);
layer.draw();


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
    points: [0, y, canvasWidth, y
    ],
    stroke: 'black',
    strokeWidth: 0.1,
  });

  guideLayer.add(line);
}

guideLayer.draw();


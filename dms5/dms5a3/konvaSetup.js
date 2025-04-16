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

// const image = new Konva.Image({
//     image: canvas,
//     x: 0,
//     y: 0,
//   });
//   layer.add(image);

//   const context = canvas.getContext('2d');
// context.strokeStyle = '#df4b26';
// context.lineJoin = 'round';
// context.lineWidth = 5;

// let isPaint = false;
// let lastPointerPosition;
// let mode = 'brush';

// // image.on('mousedown touchstart', function () {
// //     isPaint = true;
// //     lastPointerPosition = stage.getPointerPosition();
// //     console.log(lastPointerPosition);
// //   });

// image.addEventListener('mousedown', (e)=>{
//     isPaint = true;
//     lastPointerPosition = stage.getPointerPosition();
//     console.log(lastPointerPosition);
// });

// image.addEventListener('mousemove', (e)=>{
//     if (isPaint) {
//         console.log(lastPointerPosition);
//     }
// })

// stage.addEventListener('mouseup', (e)=>{
//     isPaint = false;
//     console.log(lastPointerPosition);

// })

// stage.addEventListener('mouseout', (e)=>{
//     isPaint = false;
// })

// //   stage.on('mouseup touchend', function () {
// //     isPaint = false;
// //     console.log(lastPointerPosition);
// //   });

//   stage.on('mousemove touchmove', function () {
//     if (!isPaint) {
//       return;
//     }
  
//     if (mode === 'brush') {
//       context.globalCompositeOperation = 'source-over';
//     }
//     if (mode === 'eraser') {
//       context.globalCompositeOperation = 'destination-out';
//     }
//     context.beginPath();
  
//     const localPos = {
//       x: lastPointerPosition.x - image.x(),
//       y: lastPointerPosition.y - image.y(),
//     };
//     context.moveTo(localPos.x, localPos.y);
//     const pos = stage.getPointerPosition();
//     const newLocalPos = {
//       x: pos.x - image.x(),
//       y: pos.y - image.y(),
//     };
//     context.lineTo(newLocalPos.x, newLocalPos.y);
//     context.closePath();
//     context.stroke();
  
//     lastPointerPosition = pos;
//     // redraw manually
//     layer.batchDraw();
//   });
  
//   select.addEventListener('change', function () {
//     mode = select.value;
//   });

let currentColour = 'red';

// function addCircle() {
//   let circle = new Konva.Circle({
//       x: stage.width() / 2,
//       y: stage.height() / 2,
//       radius: 20,
//       fill: currentColour,
//       stroke: 'black',
//       strokeWidth: 4,
//       draggable: true
//   })
//   layer.add(circle);
//   }

//   function addSquare() {
//     let square = new Konva.Rect({
//       x: stage.width() / 2,
//       y: stage.height() / 2,
//         width: 35,
//         height: 35,
//         fill: currentColour,
//         stroke: 'black',
//         strokeWidth: 4,
//         draggable: true
//     })
//     layer.add(square);
//     }

//     function addTriangle() {
//       let triangle = new Konva.RegularPolygon({
//         x: stage.width() / 2,
//         y: stage.height() / 2,
//         sides: 3,
//         radius: 25,
//         fill: 'red',
//         stroke: 'black',
//         strokeWidth: 4,
//         draggable: true
//       })
//       layer.add(triangle);
//       }
  

//   document.getElementById("addCircle").addEventListener("click", addCircle);
//   document.getElementById("addSquare").addEventListener("click", addSquare);
//   document.getElementById("addTriangle").addEventListener("click", addTriangle);

stage.on('click', function () {
  var pos = group.getRelativePointerPosition();
  var shape1 = new Konva.Circle({
    x: pos.x,
    y: pos.y,
    fill: 'red',
    radius: 20,
    draggable: true
  });

  group.add(shape1);
});

stage.on('click', function () {
  var pos = group.getRelativePointerPosition();
  var shape2 = new Konva.Rect({
    x: pos.x,
    y: pos.y,
    fill: 'red',
    radius: 20,
  });

  group.add(shape2);
});
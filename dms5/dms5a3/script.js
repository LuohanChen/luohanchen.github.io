let currentColour = 'red';
let currentShape = 'circle';

function createShape(pos) {
    let shape;
    
    switch(currentShape) {
        case 'circle':
            shape = new Konva.Circle({
                x: pos.x,
                y: pos.y,
                fill: currentColour,
                radius: 20,
                draggable: true
            });
            break;
            
        case 'square':
            shape = new Konva.Rect({
                x: pos.x,
                y: pos.y,
                fill: currentColour,
                width: 30,
                height: 30,
                draggable: true
            });
            break;
            
        case 'triangle':
            shape = new Konva.RegularPolygon({
                x: pos.x,
                y: pos.y,
                fill: currentColour,
                sides: 3,
                radius: 20,
                draggable: true
            });
            break;
    }
    
    group.add(shape);
    layer.draw();
}

stage.on('click', function() {
    var pos = group.getRelativePointerPosition();
    createShape(pos);
});

document.getElementById('shape1').addEventListener('click', function() {
    currentShape = 'circle';
});
document.getElementById('shape2').addEventListener('click', function() {
    currentShape = 'square';
});
document.getElementById('shape3').addEventListener('click', function() {
    currentShape = 'triangle';
});

function changeCurrentColour(e) {
    currentColour = e.target.value;
}

document.getElementById("colourPicker").addEventListener("change", changeCurrentColour);
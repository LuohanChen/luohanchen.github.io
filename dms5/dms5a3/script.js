window.scale = ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4"];

window.addEventListener('DOMContentLoaded', () => {
    const synth = new Tone.Synth().toDestination();
    const circleSynth = new Tone.AMSynth().toDestination();
    const squareSynth = new Tone.PolySynth().toDestination();
    const triangleSynth = new Tone.FMSynth().toDestination();
  
    const shapeInstruments = {
      circle: circleSynth,
      square: squareSynth,
      triangle: triangleSynth
    };
  
    let currentColour = 'red';
    let currentShape = 'circle';
  
    function getPitchFromY(y) {
      const canvasHeight = 500;
      const noteIndex = Math.floor((1 - y / canvasHeight) * (scale.length - 1));
      return scale[Math.max(0, Math.min(scale.length - 1, noteIndex))];
    }
  
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
  
      const pitch = getPitchFromY(pos.y);
      Tone.start();
      shapeInstruments[currentShape].triggerAttackRelease(pitch, "4n");
    }
  
    stage.on('click', function () {
      const pos = stage.getPointerPosition();
      console.log("Clicked at:", pos);
      createShape(pos);
    });
  
    document.getElementById('shape1').addEventListener('click', () => currentShape = 'circle');
    document.getElementById('shape2').addEventListener('click', () => currentShape = 'square');
    document.getElementById('shape3').addEventListener('click', () => currentShape = 'triangle');
    document.getElementById('colourPicker').addEventListener('change', e => currentColour = e.target.value);

    // SOUND PLAYBACK
    document.getElementById('playButton').addEventListener('click', () => {
        const shapes = group.getChildren();
        const sortedShapes = shapes.slice().sort((a, b) => a.x() - b.x());
      
        let delay = 0;
        const stepTime = Tone.Time('8n').toSeconds();
      
        Tone.start();
        Tone.Transport.cancel();
        Tone.Transport.stop();
        Tone.Transport.position = 0;
      
        sortedShapes.forEach((shape) => {
            const x = shape.x();
            const y = shape.y();
            const pitch = getPitchFromY(y);
          
            let type;
            if (shape instanceof Konva.Circle) type = 'circle';
            else if (shape instanceof Konva.Rect) type = 'square';
            else if (shape instanceof Konva.RegularPolygon) type = 'triangle';
            else return;
          
            const instrument = shapeInstruments[type];
          
            Tone.Transport.scheduleOnce(time => {
              instrument.triggerAttackRelease(pitch, '8n', time);
          
              requestAnimationFrame(() => {
                const originalStroke = shape.stroke();
                const originalShadow = shape.shadowColor();
          
                shape.stroke('yellow');
                shape.strokeWidth(4);
                shape.shadowColor('yellow');
                shape.shadowBlur(10);
                layer.draw();
          
                setTimeout(() => {
                  shape.stroke(null);
                  shape.shadowColor(null);
                  shape.shadowBlur(0);
                  layer.draw();
                }, 150);
              });
            }, `+${delay}`);
          
            delay += stepTime;
          });
      
        Tone.Transport.start();
      });

const tempoSlider = document.getElementById('tempoSlider');
const tempoDisplay = document.getElementById('tempoDisplay');

tempoSlider.addEventListener('input', () => {
  const bpm = +tempoSlider.value;
  tempoDisplay.textContent = bpm;
  Tone.Transport.bpm.value = bpm;
});

// LOOP PLAYBACK
let loopEvent = null;

document.getElementById('startLoop').addEventListener('click', () => {
  if (loopEvent) {
    loopEvent.dispose();
  }

  const shapes = group.getChildren();
  const sortedShapes = shapes.slice().sort((a, b) => a.x() - b.x());

  if (sortedShapes.length === 0) return;

  const stepTime = 0.3;
  const totalTime = stepTime * sortedShapes.length;

  loopEvent = Tone.Transport.scheduleRepeat(time => {
    sortedShapes.forEach((shape, i) => {
      const x = shape.x();
      const y = shape.y();
      const pitch = getPitchFromY(y);

      let type;
      if (shape instanceof Konva.Circle) type = 'circle';
      else if (shape instanceof Konva.Rect) type = 'square';
      else if (shape instanceof Konva.RegularPolygon) type = 'triangle';
      else return;

      const instrument = shapeInstruments[type];

      // Schedule sound
      const shapeTime = time + i * stepTime;
      instrument.triggerAttackRelease(pitch, '8n', shapeTime);

      // Schedule highlight
      Tone.Draw.schedule(() => {
        shape.stroke('yellow');
        shape.strokeWidth(4);
        shape.shadowColor('yellow');
        shape.shadowBlur(10);
        layer.draw();

        setTimeout(() => {
          shape.stroke(null);
          shape.shadowColor(null);
          shape.shadowBlur(0);
          layer.draw();
        }, 150);
      }, shapeTime);
    });
  }, totalTime);

  Tone.Transport.start();
});

document.getElementById('stopLoop').addEventListener('click', () => {
  Tone.Transport.stop();
  if (loopEvent) {
    Tone.Transport.clear(loopEvent);
    loopEvent = null;
  }
});
  });
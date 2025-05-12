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
  let loopEvent = null;
  let loopRunning = false;

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Tempo controls
  const tempoSlider = document.getElementById('tempoSlider');
  const tempoDisplay = document.getElementById('tempoDisplay');
  Tone.Transport.bpm.value = parseInt(tempoSlider.value, 10);
  tempoDisplay.textContent = tempoSlider.value;

  tempoSlider.addEventListener('input', () => {
    const bpm = parseInt(tempoSlider.value, 10);
    Tone.Transport.bpm.value = bpm;
    tempoDisplay.textContent = bpm;
  });

  function getPitchFromY(y) {
    const canvasHeight = 500;
    const noteIndex = Math.floor((1 - y / canvasHeight) * (scale.length - 1));
    return scale[Math.max(0, Math.min(scale.length - 1, noteIndex))];
  }

  function createShape(pos) {
    let shape;
    switch (currentShape) {
      case 'circle':
        shape = new Konva.Circle({
          x: pos.x,
          y: pos.y,
          fill: getRandomColor(),
          radius: 20,
          draggable: true
        });
        break;
      case 'square':
        shape = new Konva.Rect({
          x: pos.x,
          y: pos.y,
          fill: getRandomColor(),
          width: 30,
          height: 30,
          draggable: true
        });
        break;
      case 'triangle':
        shape = new Konva.RegularPolygon({
          x: pos.x,
          y: pos.y,
          fill: getRandomColor(),
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

  // SOUND PLAYBACK
  document.getElementById('playButton').addEventListener('click', () => {
    const shapes = group.getChildren();
    if (shapes.length === 0) return;

    const canvasWidth = stage.width();
    const bpm = Tone.Transport.bpm.value;
    const beatsPerBar = 4;
    const duration = (60 / bpm) * beatsPerBar;

    shapes.forEach(shape => shape.hasPlayed = false);

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;
    Tone.start();
    Tone.Transport.start();

    playhead.visible(true);
    layer.draw();

    const startTime = Tone.now();

    function animate() {
      const now = Tone.now();
      const elapsed = now - startTime;
      const progress = elapsed / duration;
      const x = progress * canvasWidth;

      playhead.points([x, 0, x, stage.height()]);
      layer.draw();

      shapes.forEach(shape => {
        const shapeX = shape.x();
        if (!shape.hasPlayed && Math.abs(shapeX - x) < 5) {
          const pitch = getPitchFromY(shape.y());
          let type;
          if (shape instanceof Konva.Circle) type = 'circle';
          else if (shape instanceof Konva.Rect) type = 'square';
          else if (shape instanceof Konva.RegularPolygon) type = 'triangle';
          else return;

          const instrument = shapeInstruments[type];
          instrument.triggerAttackRelease(pitch, '8n', now);
          shape.hasPlayed = true;

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
        }
      });

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        playhead.visible(false);
        layer.draw();
        shapes.forEach(shape => delete shape.hasPlayed);
      }
    }

    requestAnimationFrame(animate);
  });

  // LOOP PLAYBACK
  document.getElementById('startLoop').addEventListener('click', () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;
    Tone.start();
    Tone.Transport.start();
  
    const shapes = group.getChildren();
    if (shapes.length === 0) return;
  
    const canvasWidth = stage.width();
    const beatsPerBar = 4;
  
    let loopStart = Tone.now();
  
    function animateLoop() {
      const bpm = Tone.Transport.bpm.value;
      const duration = (60 / bpm) * beatsPerBar;
      const now = Tone.now();
      const elapsed = (now - loopStart) % duration;
      const progress = elapsed / duration;
      const x = progress * canvasWidth;
  
      playhead.points([x, 0, x, stage.height()]);
      layer.draw();
  
      shapes.forEach(shape => {
        const shapeX = shape.x();
        if (!shape.lastPlayed || now - shape.lastPlayed > 0.2) {
          if (Math.abs(shapeX - x) < 5) {
            const pitch = getPitchFromY(shape.y());
            let type;
            if (shape instanceof Konva.Circle) type = 'circle';
            else if (shape instanceof Konva.Rect) type = 'square';
            else if (shape instanceof Konva.RegularPolygon) type = 'triangle';
            else return;
  
            const instrument = shapeInstruments[type];
            instrument.triggerAttackRelease(pitch, '8n', now);
            shape.lastPlayed = now;
  
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
          }
        }
      });
  
      if (loopRunning) {
        requestAnimationFrame(animateLoop);
      }
    }
  
    loopRunning = true;
    playhead.visible(true);
    layer.draw();
    animateLoop();
  });

  // Stop Loop
  document.getElementById('stopLoop').addEventListener('click', () => {
    Tone.Transport.stop();
    loopRunning = false;
    playhead.visible(false);
    layer.draw();
  });
});
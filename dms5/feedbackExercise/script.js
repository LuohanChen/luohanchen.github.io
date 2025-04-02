///////// Feedback

let meterText = document.getElementById("meterOutputText");

let meterCheckInterval = 100;

let currentVolume = null;

setInterval(() => {
  /* meter defined in toneSetup */
  currentVolume = meter.getValue();
  let newValue = clamp(currentVolume, -48, 0);
  let newValueInt = parseInt(newValue);
  let newRemappedValue = remapRange(newValueInt, -48, -6, 0, 100);
  let newRemappedValueInt = parseFloat(newRemappedValue.toPrecision(2));
  // meterText.innerHTML = newRemappedValueInt + "%";
  if (newRemappedValueInt < 1) {
meterText.innerHTML = "🔇";
  } else if (newRemappedValueInt < 60) {
    meterText.innerHTML = "🔉";
  }
 else {
  meterText.innerHTML = "🔊";
 }

 console.log(newRemappedValueInt);

  // getComputedStyle(document.documentElement).setProperty("--col03", "red");

  // let newColour = "color-mix(in hsl, hsl(200 50 80), coral 80%)";

  let newColour = `color-mix(in hsl, red, blue ${newRemappedValueInt}%)`;
  console.log(newColour);
  document.getElementById("playbackToggle").style.backgroundColor = newColour;

  // remappedValue =  parseInt(remapRange(clamp(currentVolume, -48, 0), -48, -6, 0, 100));
  // meterText.innerHTML = `${remappedValue} %`; 
}, meterCheckInterval);


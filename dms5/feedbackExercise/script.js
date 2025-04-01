///////// Feedback

let meterText = document.getElementById("meterOutputText");

let meterCheckInterval = 100;

let currentVolume = null;

setInterval(() => {
  /* meter defined in toneSetup */
  currentVolume = meter.getValue();
  // let newValue = clamp(currentVolume, -48, 0);
  // let newValueInt = parseInt(newValue);
  // let newRemappedValue = remapRange(newValueInt, -48, -6, 0, 1);
  // let newRemappedValueInt = parseFloat(newRemappedValue.toPrecision(2));
  // meterText.innerHTML = newRemappedValueInt + "%";

  remappedValue =  parseInt(remapRange(clamp(currentVolume, -48, 0), -48, -6, 0, 100));
  meterText.innerHTML = `${remappedValue} %`;
}, meterCheckInterval);


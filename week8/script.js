const myVideo = document.querySelector("#my-video");
console.log(myVideo);

// The following code block allows me to play and pause the video on a click of a button
const playPauseButton = document.querySelector("#play-pause-button");
console.log(playPauseButton);

const playPauseImg = document.querySelector("#play-pause-img");
console.log(playPauseImg);

playPauseButton.addEventListener("click", playPauseVideo);

function playPauseVideo() {
  if (myVideo.paused || myVideo.ended) {
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v2.png";
    myVideo.play();
  } else {
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v2.png";
    myVideo.pause();
  }
}

// Mute unmute button

const muteUnmuteButton = document.querySelector("#mute-unmute-button");
console.log(muteUnmuteButton);

const muteUnmuteImg = document.querySelector("#mute-unmute-img");
console.log(muteUnmuteImg);

muteUnmuteButton.addEventListener("click", toggleSound);

function toggleSound() {
  if (myVideo.muted) {
    muteUnmuteButton.style.backgroundColor = "#b43434";
    muteUnmuteImg.src =
      "https://img.icons8.com/ios-glyphs/30/high-volume--v2.png";
    myVideo.muted = false;
  } else {
    muteUnmuteButton.style.backgroundColor = "#411e1e";
    muteUnmuteImg.src = "https://img.icons8.com/ios-glyphs/30/no-audio--v1.png";
    myVideo.muted = true;
  }
}

// Progress bar

myVideo.addEventListener("timeupdate", updateProgressBar);

const progressBarFill = document.querySelector("#progress-bar-fill");

function updateProgressBar() {
  const progress = (myVideo.currentTime / myVideo.duration) * 100;
  console.log(progress);
  progressBarFill.style.width = progress + "%";
}

// fullscreen

myVideo.addEventListener("dbclick", goFullscreen);

const fullscreenButton = document.querySelector("#fullscreen-button");
console.log(fullscreenButton);

fullscreenButton.addEventListener("click", goFullscreen);

function goFullscreen() {
  if (!document.fullscreenElement) {
    myVideo.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// timestamp

const step1Button = document.querySelector("#step-1-button");
console.log(step1Button);
step1Button.addEventListener("click", gotoStep1);

function gotoStep1() {
  myVideo.currentTime = 16.0;
}

const step2Button = document.querySelector("#step-2-button");
console.log(step2Button);
step2Button.addEventListener("click", gotoStep2);

function gotoStep2() {
  myVideo.currentTime = 50.0;
}

// increase/decrease volume

const increaseVolumeButton = document.querySelector("#increase-volume-button");
console.log(increaseVolumeButton);
increaseVolumeButton.addEventListener("click", increaseVolume);

const decreaseVolumeButton = document.querySelector("#decrease-volume-button");
console.log(decreaseVolumeButton);
decreaseVolumeButton.addEventListener("click", decreaseVolume);

function increaseVolume() {
  if (myVideo.volume < 0.9) {
    myVideo.volume += 0.1;
  }
}

function decreaseVolume() {
  if (myVideo.volume > 0.11) {
    myVideo.volume -= 0.1;
  }
}

myVideo.addEventListener("volumechange", updateVolume);

function updateVolume() {
  console.log("current volume is", myVideo.volume);
}

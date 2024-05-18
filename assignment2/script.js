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

const muteUnmuteButton = document.querySelector("#mute-unmute-button");
console.log(muteUnmuteButton);

const muteUnmuteImg = document.querySelector("#mute-unmute-img");
console.log(muteUnmuteImg);

muteUnmuteButton.addEventListener("click", toggleSound);

function toggleSound() {
  if (myVideo.muted) {
    muteUnmuteButton.style.backgroundColor = "rgb(255, 126, 51)";
    muteUnmuteImg.src =
      "https://img.icons8.com/ios-glyphs/30/high-volume--v2.png";
    myVideo.muted = false;
  } else {
    muteUnmuteButton.style.backgroundColor = "rgb(116, 19, 19)";
    muteUnmuteImg.src = "https://img.icons8.com/ios-glyphs/30/no-audio--v1.png";
    myVideo.muted = true;
  }
}

myVideo.addEventListener("timeupdate", updateProgressBar);

const progressBarFill = document.querySelector("#progress-bar-fill");

function updateProgressBar() {
  const progress = (myVideo.currentTime / myVideo.duration) * 100;
  console.log(progress);
  progressBarFill.style.width = progress + "%";
}

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

const step1Button = document.querySelector("#time-1-button");
console.log(step1Button);
step1Button.addEventListener("click", gotoStep1);

function gotoStep1() {
  myVideo.currentTime = 14.0;
  if (myVideo.paused) {
    myVideo.play();
  }
  myVideo.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });
}

const step2Button = document.querySelector("#time-2-button");
console.log(step2Button);
step2Button.addEventListener("click", gotoStep2);

function gotoStep2() {
  myVideo.currentTime = 30.0;
  if (myVideo.paused) {
    myVideo.play();
  }
  myVideo.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });
}

const step3Button = document.querySelector("#time-3-button");
console.log(step3Button);
step3Button.addEventListener("click", gotoStep3);

function gotoStep3() {
  myVideo.currentTime = 51.0;
  if (myVideo.paused) {
    myVideo.play();
  }
  myVideo.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });
}

const step4Button = document.querySelector("#time-4-button");
console.log(step4Button);
step4Button.addEventListener("click", gotoStep4);

function gotoStep4() {
  myVideo.currentTime = 88.0;
  if (myVideo.paused) {
    myVideo.play();
  }
  myVideo.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });
}

const step5Button = document.querySelector("#time-5-button");
console.log(step5Button);
step5Button.addEventListener("click", gotoStep5);

function gotoStep5() {
  myVideo.currentTime = 127.0;
  if (myVideo.paused) {
    myVideo.play();
  }
  myVideo.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });
}

const step6Button = document.querySelector("#time-6-button");
console.log(step6Button);
step6Button.addEventListener("click", gotoStep6);

function gotoStep6() {
  myVideo.currentTime = 150.0;
  if (myVideo.paused) {
    myVideo.play();
  }
  myVideo.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });
}

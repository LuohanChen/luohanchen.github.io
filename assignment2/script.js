const myVideo = document.querySelector("#my-video");
console.log(myVideo);

// Upon clicking the "Play" button, this code calls upon the video element and plays the video. If the function detects that the video is currently playing, it will pause the video and switch the "play" icon with the "Pause" icon.
// This gives user control over when to play or stop playing the video.
const playPauseButton = document.querySelector("#play-pause-button");
console.log(playPauseButton);

const playPauseImg = document.querySelector("#play-pause-img");
console.log(playPauseImg);

playPauseButton.addEventListener("click", playPauseVideo);

function playPauseVideo() {
  if (myVideo.paused || myVideo.ended) {
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v2.png";
    myVideo.play();
  } else {
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v2.png";
    myVideo.pause();
  }
}

// This code block allows the user to mute or unmute the audio track in the video. The function detects whether the audio is currently muted or unmuted and executes the function to mute/unmute accordingly.
// It also switches the icons from unmuted to muted when it mutes the audio, and vice versa when it unmutes the audio. The colours of the background of the icons are also changed based upon the current state of mute/unmute
// A mute/unmute button is crucial for users for quick access to remove the sounds in the case that they might be in a place or situation where sound is undesirable.
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

// This code block allows for the user to fast forward or to return 10 seconds into the video. The function calls upon the current time of the video and adds or subtracts 10 seconds from it. For a check that the function is fired, the console will log a confirmation message
// This function and button is essential to a DIY arts and crafts site as users are able to return back to details that they might have missed or want to have a look at again without the need to re-loop the video from the beginning.
const backwardButton = document.querySelector("#return-backward-button");
console.log(backwardButton);
backwardButton.addEventListener("click", return10s);

function return10s() {
  myVideo.currentTime -= 10.0;
  myVideo.play();
  console.log("Skipped to: ", myVideo.currentTime);
}

const forwardButton = document.querySelector("#fast-forward-button");
console.log(forwardButton);
forwardButton.addEventListener("click", skip10s);

function skip10s() {
  myVideo.currentTime += 10.0;
  myVideo.play();
  console.log("Skipped to: ", myVideo.currentTime);
}

// This code calls upon the progress-bar-fill id in the html, changing the state of the progress bar as it runs a check on the current time elapsed in the video, converting that time into an integer, this integer is then used to update the progress bar fill in css styling.
// A progress bar provides a visual aid for the user to understand the progress of the video, one quick glance and the user is able to identify how much of the video has passed, or where in the video they are at.
myVideo.addEventListener("timeupdate", updateProgressBar);

const progressBarFill = document.querySelector("#progress-bar-fill");

function updateProgressBar() {
  const progress = (myVideo.currentTime / myVideo.duration) * 100;
  console.log(progress);
  progressBarFill.style.width = progress + "%";
}

// This code allows the user to enable fullscreen on the video using either the button or double clicking.
// If the video is not in fullscreen, the video will go into fullscreen when the fullscreen button is pressed or a double click is registered
// However, if the video is in fullscreen, the video will exit fullscreen when double clicked.
// fullscreen functionality is important to a site that has a video as the main focus of the page as it gives the user an option to focus solely on the main content of the site: The video.
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

// This code allows the volume to be increased or decreased when the button is clicked. The volume will increase/decrease on a 10% interval (0.1) from the value of 1 (maximum volume) to 0 (no volume)
// When the button is clicked, The function in the code collects the value of the current volume and if the value returned is within the parameters set to raise/lower the volume, it executes the code.
// This action can be repeated by repeatedly pressing the button until the value of volume hits the upper/lower limit as stated in the function
// A volume control is essential to users as it gives the user more control over how they want to view the video.
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

// This code allows the video to play at a certain timestamp when the button is pressed. The usage of multiple ids allows the creation of multiple timestamps.
// When the button is clicked, the code will scroll the user towards the video and play the video (if it's paused) at the timestamp stipulated.
// Timestamps is the most important part of a DIY/crafts website as it allows the user to repeat/skip to parts that they are specifically looking for, instead of having to sit through the video until
// it ends and rewinds before being able to look at the parts that they wanted to find.
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

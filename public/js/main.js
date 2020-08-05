// variable to store our three.js scene:
let glScene;
let currentTheme = 0;

function createScene() {
    // initialize three.js scene
    console.log("creating three.js scene");
    glScene = new Scene(window.innerWidth, window.innerHeight, "#535353");
}

// called after audio and gltf assets are loaded
function onLoadingFinished() {

    // change the div states
    document.getElementById("info").style.display = "none";
    document.getElementById("main").style.display = "block";

    // play mach1 audio
    Play();

    // play window video
    const windowVideo = document.getElementById("windowVideo");
    windowVideo.muted = true;
    windowVideo.loop = true;
    windowVideo.play();
    windowVideo.addEventListener("play", function () {
        this.currentTime = 3;
    }, false);

    // play and pause overlayed video
    const overlayedVideo = document.getElementById("overlayedVideo");
    overlayedVideo.muted = true;
    overlayedVideo.loop = false;
    overlayedVideo.play();
    overlayedVideo.pause();

    // rotate the camera view on each theme
    const duration = 3000;
    const easing = TWEEN.Easing.Cubic.InOut;

    // theme 1: rotate to left and face the window
    const theme1StartTime = 15000;
    const theme1MouthOpenMaxTime = 30000;

    setTimeout(() => {
        new TWEEN.Tween(glScene.initCamera.position).to({ x: -3.5 }, duration).easing(easing).start();
        new TWEEN.Tween(glScene.initCamera.position).to({ y: 1.3 }, duration).easing(easing).start();
        new TWEEN.Tween(glScene.initCamera.rotation).to({ y: THREE.Math.degToRad(90) }, duration).easing(easing).start();
    }, theme1StartTime - duration);

    setTimeout(() => {
        currentTheme = 1;
    }, theme1StartTime);

    // if the user has not opened the mouth
    setTimeout(() => {
        if (currentTheme == 1 && !glScene.hasMouthOpened) {
            glScene.playOverLayedVideo();
            glScene.hasMouthOpened = true;
        }
    }, theme1MouthOpenMaxTime);
}

document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.addEventListener("ended", function () {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = ""; // make it no longer playable
        document.getElementById("audioContainer").style.display = "none";
        const videoContainer = document.getElementById("videoContainer");
        videoContainer.style.display = "block";
        videoContainer.scrollIntoView({ behavior: "smooth" }); // auto scroll to bottom
        trackerMain();
    });
})
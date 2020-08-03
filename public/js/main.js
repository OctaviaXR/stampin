// variable to store our three.js scene:
let glScene;
let currentTheme = 0;

function createScene() {
    // initialize three.js scene
    console.log("creating three.js scene");
    glScene = new Scene(window.innerWidth, window.innerHeight, "#535353");
}

function onLoadingFinished() {
    // play the audio file
    Play();

    // play the video file after 5 seconds
    setTimeout(() => {
        const videoFile = document.getElementById("videoFile");
        videoFile.play();
        videoFile.muted = true; // mute audio
        videoFile.addEventListener("play", function () {
            this.currentTime = 3;
        }, false);
    }, 5000);

    // rotate the camera view on each theme
    const duration = 3000;
    const easing = TWEEN.Easing.Cubic.InOut;

    // theme 1: left
    setTimeout(() => {
        currentTheme = 1;
        new TWEEN.Tween(glScene.initCamera.rotation).to({ y: THREE.Math.degToRad(90) }, duration).easing(easing).start();
    }, 40000);

    // theme 2: front
    setTimeout(() => {
        currentTheme = 2;
        new TWEEN.Tween(glScene.initCamera.rotation).to({ y: THREE.Math.degToRad(0) }, duration).easing(easing).start();
    }, 65000);

    // theme 3: right
    setTimeout(() => {
        currentTheme = 3;
        new TWEEN.Tween(glScene.initCamera.rotation).to({ y: THREE.Math.degToRad(-90) }, duration).easing(easing).start();
    }, 175000);
}

function main() {
    trackerMain();
    createScene();
}

document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.addEventListener("ended", function () {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = ""; // make it no longer playable
        const videoContainer = document.getElementById("videoContainer");
        videoContainer.style.display = "block";
        videoContainer.scrollIntoView({ behavior: "smooth" }); // auto scroll to bottom
        main();
    });
})
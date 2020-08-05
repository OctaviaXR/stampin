// variable to store our three.js scene:
let glScene;
let currentTheme = 0;

function createScene() {
    // initialize three.js scene
    console.log("creating three.js scene");
    glScene = new Scene(window.innerWidth, window.innerHeight, "#535353");
}

// called after audio and gltf assets are loaded
// should load it when the web is loaded 
function onLoadingFinished() {

    // change the div states
    document.getElementById("info").style.display = "none";
    document.getElementById("main").style.display = "block";

    // play mach1 audio
    Play();

    // play window video
    const windowVideo = document.getElementById("windowVideo");
    windowVideo.play();
    windowVideo.muted = true;
    windowVideo.loop = true;
    windowVideo.addEventListener("play", function () {
        this.currentTime = 3;
    }, false);

    // rotate the camera view on each theme
    const duration = 3000;
    const easing = TWEEN.Easing.Cubic.InOut;

    // theme 1: left
    setTimeout(() => {
        currentTheme = 1;
        new TWEEN.Tween(glScene.initCamera.position).to({ x: -3.5 }, duration).easing(easing).start();
        new TWEEN.Tween(glScene.initCamera.position).to({ y: 1.3 }, duration).easing(easing).start();
        new TWEEN.Tween(glScene.initCamera.rotation).to({ y: THREE.Math.degToRad(90) }, duration).easing(easing).start();
    }, 12000);

    // if the user has not opened the mouth
    setTimeout(() => {
        if (currentTheme == 1 && !glScene.hasMouthOpened) {
            glScene.forceMouthOpen = true;
        }
    }, 30000);
}

//when the loading finished, don't play the audio file until the previous audio is played 
// play the audio file
// load the model while listening to the audioplayer 

// everything starts from here
// 1. below listener function is called
// 2. trackMain() function is called
// 3. createScene() function is called
// 4. onLoadingFinished() function is called
document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.addEventListener("ended", function () {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = ""; // make it no longer playable
        const videoContainer = document.getElementById("videoContainer");
        videoContainer.style.display = "block";
        videoContainer.scrollIntoView({ behavior: "smooth" }); // auto scroll to bottom
        trackerMain();
    });
})
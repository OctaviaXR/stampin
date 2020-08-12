// variable to store our three.js scene
let glScene;
let currentTheme = 0;

// called after audio and gltf assets are loaded
function onLoadingFinished() {

    // play mach1 audio
    Play();

    // start the scene
    glScene.init();
    glScene.animate();

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

    // fade in opacity
    const scene = document.getElementById("scene");
    new TWEEN.Tween(scene.style).to({ opacity: 1 }, duration).easing(easing).start();

    // theme 1: rotate to left and face the window
    const theme1StartTime = 14000;
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

    // handle fade out and end of the scene
    const sceneEndTime = 270000;//310000 - original time - 270000 is perfect!
    const fadeOutDuration = 2000;

    setTimeout(() => {
        new TWEEN.Tween(scene.style).to({ opacity: 0 }, fadeOutDuration).easing(easing).start();
    }, sceneEndTime - fadeOutDuration);

    // after fade out is done
    setTimeout(() => {
        console.log("the scene has ended");
        Stop(); // stop mach1 audio
        windowVideo.pause();
        overlayedVideo.pause();
        document.getElementById("guide").innerHTML = "";
        document.getElementById("videoContainer").style.display = "none";
        // document.getElementById("audioContainer").style.display = "block";
        // document.getElementById("info").style.display = "flex";
        document.getElementById("main").style.display = "none";
        document.getElementById("footer").style.display = "block";
        // const ending = document.getElementById('endingScene').style.display = "block";
        // ending.scrollIntoView({ behavior: "smooth" });//auto scroll to end

        // const intro = document.getElementById("intro");
        // intro.scrollIntoView({ behavior: "smooth" }); // auto scroll to top
    }, sceneEndTime);
}

// entry point
document.addEventListener('DOMContentLoaded', () => {
    // initialize three.js scene
    console.log("creating three.js scene");
    glScene = new Scene(window.innerWidth, window.innerHeight, "#535353");

    // detect when audio playback has ended
    // const audioPlayer = document.getElementById("audioPlayer");
    // audioPlayer.addEventListener("ended", function () {
    //     audioPlayer.pause();
    //     audioPlayer.currentTime = 0;

    //     // check if the browser is supported
    //     if (!checkSupport()) {
    //         return;
    //     }
    //     audioPlayer.src = ""; // make the player not playable

        // wait for all assets to be ready
        const assetsTimer = setInterval(function () {
            if (sound.isReady && glScene.isReady) {
                clearInterval(assetsTimer);
                // document.getElementById("footer").style.display = "none";
                const videoContainer = document.getElementById("videoContainer");
                videoContainer.style.display = "block";
                videoContainer.scrollIntoView({ behavior: "smooth" }); // auto scroll to bottom
                trackerMain(); // this will take a while (loading...)

                // wait for tracker to be ready
                const trackerTimer = setInterval(function () {
                    if (tracker.isReady) {
                        clearInterval(trackerTimer);
                        // document.getElementById("audioContainer").style.display = "none";
                        document.getElementById("info").style.display = "none";
                        document.getElementById("main").style.display = "block";
                        onLoadingFinished();
                    }
                }, 100);

            }
        }, 100);
    });


// })
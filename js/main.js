// variable to store our three.js scene:
let glScene;

function createScene() {
    // initialize three.js scene
    console.log("Creating three.js scene...");
    glScene = new Scene(window.innerWidth, window.innerHeight, "#535353");
    glScene.init();
    glScene.animate();
}

function onLoadingFinished() {
    // play the audio file
    Play();

    // rotate the camera view on each theme
    const duration = 2000;
    const easing = TWEEN.Easing.Cubic.InOut;

    // theme 1: left
    setTimeout(() => {
        new TWEEN.Tween(glScene.initCamera.rotation).to({ y: THREE.Math.degToRad(90) }, duration).easing(easing).start();
    }, 10000);

    // theme 2: front
    setTimeout(() => {
        new TWEEN.Tween(glScene.initCamera.rotation).to({ y: THREE.Math.degToRad(0) }, duration).easing(easing).start();
    }, 20000);

    // theme 3: right
    setTimeout(() => {
        new TWEEN.Tween(glScene.initCamera.rotation).to({ y: THREE.Math.degToRad(-90) }, duration).easing(easing).start();
    }, 30000);
}

document.addEventListener('DOMContentLoaded', () => {
    trackerMain();
    createScene();
})
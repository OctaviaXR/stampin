// variable to store our three.js scene:
let glScene;

function createScene() {
    // initialize three.js scene
    console.log("Creating three.js scene...");
    glScene = new Scene(window.innerWidth, window.innerHeight, "#535353");
    glScene.init();
    glScene.animate();
}

document.addEventListener('DOMContentLoaded', (event) => {
    trackerMain();
    createScene();
})
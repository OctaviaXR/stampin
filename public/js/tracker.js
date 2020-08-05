const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
let model, videoWidth, videoHeight, video, canvas;
let tracker = { isReady: false };

async function setupCamera() {
    video = document.getElementById("video");
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "user",
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
        },
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

const lerpAmount = 0.5;
window.nomalizedPosition = new THREE.Vector3(0.5, 0.5, 0.5);
window.nomalizedMouth = 0;

async function renderPrediction() {
    const predictions = await model.estimateFaces(video);

    if (predictions.length > 0) {
        predictions.forEach((prediction) => {

            // bounding box
            const boundingBoxLeftX = prediction.boundingBox.topLeft[0][0];
            const boundingBoxRightX = prediction.boundingBox.bottomRight[0][0];
            const boundingBoxTopY = prediction.boundingBox.topLeft[0][1];
            const boundingBoxBottomY = prediction.boundingBox.bottomRight[0][1];
            const nomalizedPositionZ = map(boundingBoxRightX - boundingBoxLeftX, 0, VIDEO_WIDTH, 0, 1);

            // center point
            const boundingBoxCenterX = boundingBoxLeftX + (boundingBoxRightX - boundingBoxLeftX) / 2;
            const boundingBoxCenterY = boundingBoxTopY + (boundingBoxBottomY - boundingBoxTopY) / 2;
            const nomalizedCenterX = 1 - (boundingBoxCenterX / VIDEO_WIDTH);
            const nomalizedCenterY = boundingBoxCenterY / VIDEO_HEIGHT;
            const nomalizedPositionX = nomalizedCenterX;
            const nomalizedPositionY = nomalizedCenterY;
            window.nomalizedPosition.lerp(new THREE.Vector3(nomalizedPositionX, nomalizedPositionY, nomalizedPositionZ), lerpAmount);

            // lips
            const lipsUpperInnerCenterY = prediction.annotations.lipsUpperInner[5][1];
            const lipsLowerInnerCenterY = prediction.annotations.lipsLowerInner[5][1];
            window.nomalizedMouth = lerp(window.nomalizedMouth, map(lipsLowerInnerCenterY - lipsUpperInnerCenterY, 0, VIDEO_HEIGHT / 4, 0, 1) / nomalizedPositionZ, lerpAmount);

            // calculate yaw, pitch, roll
            var pTop = new THREE.Vector3(prediction.mesh[10][0], prediction.mesh[10][1], prediction.mesh[10][2]);
            var pBottom = new THREE.Vector3(prediction.mesh[152][0], prediction.mesh[152][1], prediction.mesh[152][2]);
            var pLeft = new THREE.Vector3(prediction.mesh[234][0], prediction.mesh[234][1], prediction.mesh[234][2]);
            var pRight = new THREE.Vector3(prediction.mesh[454][0], prediction.mesh[454][1], prediction.mesh[454][2]);

            var pTB = pTop.clone().addScaledVector(pBottom, -1).normalize();
            var pLR = pLeft.clone().addScaledVector(pRight, -1).normalize();

            var yaw = radians_to_degrees(Math.PI / 2 - pLR.angleTo(new THREE.Vector3(0, 0, 1)));
            var pitch = radians_to_degrees(Math.PI / 2 - pTB.angleTo(new THREE.Vector3(0, 0, 1)));
            var roll = radians_to_degrees(Math.PI / 2 - pTB.angleTo(new THREE.Vector3(1, 0, 0)));

            if (yaw > parseFloat(controls.FOV)) {
                yaw = parseFloat(controls.FOV);
            }
            if (yaw < -parseFloat(controls.FOV)) {
                yaw = -parseFloat(controls.FOV);
            }
            if (pitch > parseFloat(controls.FOV)) {
                pitch = parseFloat(controls.FOV);
            }
            if (pitch < -parseFloat(controls.FOV)) {
                pitch = -parseFloat(controls.FOV);
            }
            if (roll > parseFloat(controls.FOV)) {
                roll = parseFloat(controls.FOV);
            }
            if (roll < -parseFloat(controls.FOV)) {
                roll = -parseFloat(controls.FOV);
            }
            window.yaw = yaw * parseFloat(controls.yawMultiplier);
            window.pitch = pitch * parseFloat(controls.pitchMultiplier);
            window.roll = roll * parseFloat(controls.rollMultiplier);
        });
    }
    if (!tracker.isReady) {
        console.log("tracker is ready");
        tracker.isReady = true;
    }
    requestAnimationFrame(renderPrediction);
}

async function trackerMain() {
    await tf.setBackend("webgl");
    await setupCamera();
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;
    canvas = document.getElementById("output");
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    canvas.style.display = "none"; // hide the canvas
    const canvasContainer = document.querySelector(".canvas-wrapper");
    canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;
    model = await facemesh.load({
        maxFaces: 1
    });
    renderPrediction();
}
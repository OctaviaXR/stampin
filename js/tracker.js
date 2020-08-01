window.modeTracker = "facetracker";
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

let model, ctx, videoWidth, videoHeight, video, canvas;

const mobile = isMobile();

async function setupCamera() {
    video = document.getElementById("video");

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "user",
            width: mobile ? undefined : VIDEO_WIDTH,
            height: mobile ? undefined : VIDEO_HEIGHT,
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
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

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
            const keypoints = prediction.scaledMesh;

            for (let i = 0; i < keypoints.length; i++) {
                const x = keypoints[i][0];
                const y = keypoints[i][1];

                ctx.fillStyle = "white";
                ctx.fillRect(x, y, 2, 2);

                if (parseInt(controls.nPoint) == i) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(x, y, 6, 6);
                }

                if (i == 10 || i == 152) {
                    ctx.fillStyle = "green";
                    ctx.fillRect(x, y, 6, 6);
                }
                if (i == 234 || i == 454) {
                    ctx.fillStyle = "yellow";
                    ctx.fillRect(x, y, 6, 6);
                }
            }

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
            yawOptimized = yaw * parseFloat(controls.yawMultiplier);
            pitchOptimized = pitch * parseFloat(controls.pitchMultiplier);
            rollOptimized = roll * parseFloat(controls.rollMultiplier);

            if (window.modeTracker == "facetracker") {
                window.yaw = yawOptimized;
                window.pitch = pitchOptimized;
                window.roll = rollOptimized;
            }
        });
    }
    requestAnimationFrame(renderPrediction);
}

async function trackerMain() {
    var info = document.getElementById("info");
    info.innerHTML = "loading...";
    document.getElementById("main").style.display = "none";
    document.getElementById("webcam").style.display = "none";

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

    ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = "#32EEDB";
    ctx.strokeStyle = "#32EEDB";

    model = await facemesh.load({
        maxFaces: 1
    });
    renderPrediction();

    // wait for loaded audio
    var timer = setInterval(function () {
        if (sound.isReady) {
            clearInterval(timer);
            info.innerHTML = "";
            info.style.display = "none";
            document.getElementById("main").style.display = "block";
            Play();
        }
    }, 1000);
}
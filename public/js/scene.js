class Scene {
    constructor(rendererWidth, rendererHeight, backgroundColor) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.001, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize(rendererWidth, rendererHeight);
        this.renderer.setClearColor(backgroundColor);
        document.getElementById("scene").appendChild(this.renderer.domElement);
        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
        this.fYaw = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.fPitch = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.fRoll = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.windowVideoName = "windowVideo";
        this.overlayedVideoName = "overlayedVideo";
        this.hasMouthOpened = false;

        // model
        const loader = new THREE.GLTFLoader();
        const url = "assets/models/airplane_cabin/scene.gltf";
        loader.load(url, (gltf) => {
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            gltf.scene.position.x += (gltf.scene.position.x - center.x);
            gltf.scene.position.y += (gltf.scene.position.y - center.y);
            gltf.scene.position.z += (gltf.scene.position.z - center.z);
            this.scene.add(gltf.scene);
            this.isReady = true;
            console.log("GLTF model is loaded");
        });
    }

    init() {
        // camera
        this.initCamera = new THREE.Object3D(); // object that has camera as child
        this.initCamera.position.set(-3.2, 1.1, 0.6);
        this.initCamera.rotation.set(0, 0, 0);
        this.initCamera.add(this.camera);
        this.scene.add(this.initCamera);

        // lighting
        this.light = new THREE.PointLight(0xFFFFFF, 2);
        this.light.position.set(this.initCamera.position.x, this.initCamera.position.y + 1, this.initCamera.position.z);
        this.scene.add(this.light);

        // window video
        this.addWindowVideoMesh(this.windowVideoName, true);

        // overlayed video
        this.addWindowVideoMesh(this.overlayedVideoName, false);

        // events
        let onWindowResize = () => {
            console.log("window resized");
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        };
        onWindowResize();

        // events
        window.addEventListener("resize", onWindowResize);
    }

    addWindowVideoMesh(name, visible) {
        const windowVideoWidth = 0.68;
        const windowVideoHeight = 0.68;
        const windowVideoPositionX = -4.05;
        const windowVideoPositionY = 1.357;
        const windowVideoPositionZ = 0.65;
        const windowVideoRotationYRad = THREE.Math.degToRad(90);
        const windowVideo = document.getElementById(name);
        const windowVideoTexture = new THREE.VideoTexture(windowVideo);
        windowVideoTexture.minFilter = THREE.LinearFilter;
        windowVideoTexture.magFilter = THREE.LinearFilter;
        windowVideoTexture.format = THREE.RGBFormat;
        windowVideoTexture.crossOrigin = "anonymous";
        const windowVideoMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(windowVideoWidth, windowVideoHeight),
            new THREE.MeshBasicMaterial({
                map: windowVideoTexture
            })
        );
        windowVideoMesh.position.set(windowVideoPositionX, windowVideoPositionY, windowVideoPositionZ);
        windowVideoMesh.rotation.set(0, windowVideoRotationYRad, 0);
        windowVideoMesh.name = name;
        windowVideoMesh.visible = visible;
        this.scene.add(windowVideoMesh);
    }

    playOverLayedVideo() {
        // make window video mesh invisible
        const windowVideoMesh = this.scene.getObjectByName(this.windowVideoName);
        windowVideoMesh.visible = false;

        // pause window video
        const windowVideo = document.getElementById(this.windowVideoName);
        windowVideo.pause();

        // make overlayed video mesh visible
        const overlayedVideoMesh = this.scene.getObjectByName(this.overlayedVideoName);
        overlayedVideoMesh.visible = true;

        // play overlayed video
        const overlayedVideo = document.getElementById(this.overlayedVideoName);
        overlayedVideo.play();
        overlayedVideo.addEventListener("play", function () {
            this.currentTime = 3;
        }, false);

        // called after overlayed video ends
        overlayedVideo.addEventListener("ended", function () {
            console.log("overlayed video playback has ended");
            overlayedVideoMesh.visible = false;
            overlayedVideo.pause();
            windowVideoMesh.visible = true;
            windowVideo.play();
        }, false);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        TWEEN.update();
        if (window.yaw != null) this.yaw = this.fYaw.filter(window.yaw);
        if (window.pitch != null) this.pitch = this.fPitch.filter(window.pitch);
        if (window.roll != null) this.roll = this.fRoll.filter(window.roll);

        // apply orientation to decode Mach1 Spatial to Stereo
        Decode(this.yaw, this.pitch, this.roll);

        // change camera position
        const cameraPostionXRange = 0.7;
        const cameraPostionYRange = 0.7;
        const cameraPostionZRange = 0.7;
        const cameraPostionX = window.nomalizedPosition.x * cameraPostionXRange - (cameraPostionXRange / 2);
        const cameraPostionY = (1 - window.nomalizedPosition.y) * cameraPostionYRange - (cameraPostionYRange / 2);
        const cameraPostionZ = (1 - window.nomalizedPosition.z) * cameraPostionZRange - (cameraPostionZRange / 2);
        this.camera.position.set(cameraPostionX, cameraPostionY, cameraPostionZ);

        // change camera rotation
        const cameraRotationXAmount = 0.5;
        const cameraRotationYAmount = 0.5;
        const cameraRotationZAmount = 0.5;
        const cameraRotationXDeg = this.pitch * cameraRotationXAmount;
        const cameraRotationYDeg = this.yaw * cameraRotationYAmount;
        const cameraRotationZDeg = this.roll * cameraRotationZAmount;
        this.camera.rotation.set(THREE.Math.degToRad(cameraRotationXDeg), THREE.Math.degToRad(-cameraRotationYDeg), THREE.Math.degToRad(cameraRotationZDeg));

        // if mouth is opened during the theme 1
        if (currentTheme == 1 && window.nomalizedMouth > 0.2 && !this.hasMouthOpened) {
            this.playOverLayedVideo();
            this.hasMouthOpened = true;

        }
        this.renderer.render(this.scene, this.camera);
    }
}
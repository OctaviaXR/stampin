class Scene {
    constructor(rendererWidth, rendererHeight, backgroundColor) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.001, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(rendererWidth, rendererHeight);
        this.renderer.setClearColor(backgroundColor);
        document.getElementById("3dview").appendChild(this.renderer.domElement);
        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
        this.fYaw = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.fPitch = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.fRoll = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.osc = new OSC();
        this.osc.open({ port: 9898 });
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

        // model
        const loader = new THREE.GLTFLoader();
        const url = "assets/models/airbus_a320_airplane_cabin/scene.gltf";
        loader.load(url, (gltf) => {
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            gltf.scene.position.x += (gltf.scene.position.x - center.x);
            gltf.scene.position.y += (gltf.scene.position.y - center.y);
            gltf.scene.position.z += (gltf.scene.position.z - center.z);
            this.scene.add(gltf.scene);
        });

        // events
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        TWEEN.update();
        if (window.yaw != null) this.yaw = this.fYaw.filter(window.yaw);
        if (window.pitch != null) this.pitch = this.fPitch.filter(window.pitch);
        if (window.roll != null) this.roll = this.fRoll.filter(window.roll);

        // Apply orientation to decode Mach1 Spatial to Stereo
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

        // Check and reconnect OSC
        // Apply orientation as output OSC messages
//         if (this.osc.status() == OSC.STATUS.IS_OPEN) {
//             /*
//             Receive OSC message with address "/orientation" and three float arguements
    
//             Yaw (left -> right | where rotating left is negative)
//             Pitch (down -> up | where rotating down is negative)
//             Roll (top-pointing-left -> top-pointing-right | where rotating top of object left is negative)
    
//             */
//              this.osc.send(new OSC.Message("/orientation", this.yaw, this.pitch, this.roll));
//         } else if (this.osc.status() == OSC.STATUS.IS_CLOSED) {
//             this.osc.open({ port: 9898 });
//         }
        this.renderer.render(this.scene, this.camera);
    }
}

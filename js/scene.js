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
        this.initCameraPosition = new THREE.Vector3(0, 0, 5);
        this.camera.position.set(this.initCameraPosition);

        // lighting
        this.light = new THREE.PointLight(0xFFFFFF, 1);
        this.light.position.set(0, 0, 5);
        this.scene.add(this.light);

        // room mesh
        const geometry = new THREE.SphereBufferGeometry(500, 60, 40);
        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale(-0.1, 0.1, 0.1);
        const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg');
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        // events
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (window.yaw != null) this.yaw = this.fYaw.filter(window.yaw);
        if (window.pitch != null) this.pitch = this.fPitch.filter(window.pitch);
        if (window.roll != null) this.roll = this.fRoll.filter(window.roll);

        // Apply orientation to decode Mach1 Spatial to Stereo
        Decode(this.yaw, this.pitch, this.roll);

        // change camera position
        const cameraPostionXRange = 50;
        const cameraPostionYRange = 50;
        const cameraPostionZRange = 50;
        const cameraPostionX = this.initCameraPosition.x + window.nomalizedPosition.x * cameraPostionXRange - (cameraPostionXRange / 2);
        const cameraPostionY = this.initCameraPosition.y + (1 - window.nomalizedPosition.y) * cameraPostionYRange - (cameraPostionYRange / 2);
        const cameraPostionZ = this.initCameraPosition.z + (1 - window.nomalizedPosition.z) * cameraPostionZRange - (cameraPostionZRange / 2);
        this.camera.position.set(cameraPostionX, cameraPostionY, cameraPostionZ);

        // change camera rotation
        const cameraRotationXDeg = this.pitch * 0.5;
        const cameraRotationYDeg = -this.yaw * 0.25;
        const cameraRotationZDeg = this.roll * 0.5;
        this.camera.rotation.set(THREE.Math.degToRad(cameraRotationXDeg), THREE.Math.degToRad(cameraRotationYDeg), THREE.Math.degToRad(cameraRotationZDeg));

        // Check and reconnect OSC
        // Apply orientation as output OSC messages
        if (this.osc.status() == OSC.STATUS.IS_OPEN) {
            /*
            Receive OSC message with address "/orientation" and three float arguements
    
            Yaw (left -> right | where rotating left is negative)
            Pitch (down -> up | where rotating down is negative)
            Roll (top-pointing-left -> top-pointing-right | where rotating top of object left is negative)
    
            */
            this.osc.send(new OSC.Message("/orientation", this.yaw, this.pitch, this.roll));
        } else if (this.osc.status() == OSC.STATUS.IS_CLOSED) {
            this.osc.open({ port: 9898 });
        }
        this.renderer.render(this.scene, this.camera);
    }
}
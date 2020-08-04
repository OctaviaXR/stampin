class Scene {
    constructor(rendererWidth, rendererHeight, backgroundColor) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.001, 1000);
        // this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer = new THREE.WebGLRenderer({ antialias: false }); //faster render
        this.renderer.setSize(rendererWidth, rendererHeight);
        this.renderer.setClearColor(backgroundColor);
        document.getElementById("3dview").appendChild(this.renderer.domElement);
        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
        this.fYaw = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.fPitch = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.fRoll = OneEuroFilter(60, 1.0, window.controls.oneEuroFilterBeta, 1.0);
        this.hasMouthOpened = false;

        // model
        const loader = new THREE.GLTFLoader();
        // var dracoLoader = new THREE.DRACOLoader(); // draco
        // dracoLoader.setDecoderPath("js/libs/draco/"); // draco
        // loader.setDRACOLoader(dracoLoader); // draco
        const url = "assets/models/airbus_a320_airplane_cabin/scene.gltf"; // original
        // const url = "assets/models/final-4/yiting-scene.gltf"; // draco
        loader.load(url, (gltf) => {

            const box = new THREE.Box3().setFromObject(gltf.scene); // original
            const center = box.getCenter(new THREE.Vector3()); // original
            gltf.scene.position.x += (gltf.scene.position.x - center.x); // original
            gltf.scene.position.y += (gltf.scene.position.y - center.y); // original
            gltf.scene.position.z += (gltf.scene.position.z - center.z); // original
            this.scene.add(gltf.scene);

            // start the scene
            this.init();
            this.animate();
            onLoadingFinished();
        });
    }

    init() {
        // camera
        this.initCamera = new THREE.Object3D(); // object that has camera as child
        this.initCamera.position.set(-3.2, 1.1, 0.6); // original
        // this.initCamera.position.set(-7.7, 4, 2); // draco
        this.initCamera.rotation.set(0, 0, 0);
        this.initCamera.add(this.camera);
        this.scene.add(this.initCamera);

        // lighting
        this.light = new THREE.PointLight(0xFFFFFF, 2);
        this.light.position.set(this.initCamera.position.x, this.initCamera.position.y + 1, this.initCamera.position.z);
        this.scene.add(this.light);

        // videos
        const videoFile = document.getElementById('videoFile');
        const videoFileLeft = document.getElementById('videoFileLeft');
        const videoFileLeft2 = document.getElementById('videoFileLeft2');
        const videoFileLeft3 = document.getElementById('videoFileLeft3');
        //theater vid - should replace the demo vid 

        // sky vid
        this.addVideoPlaneMeshes(videoFileLeft, 0.7, 0.7, -4.04, 1.32, 0.6, 0, Math.PI / 2, 0, false);

        //theater vid 

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

        if(currentTheme==3){
            this.addVideoPlaneMeshes(videoFile, 0.4, 0.2, -3.305, 1.42, -0.05, 0, 0, 0, true);
            this.camera.position.set(0,0.3,-0.2);
            // this.camera.zoom(1.2);
        }
        // if mouth is opened during the theme 1
        if (currentTheme == 1 && window.nomalizedMouth > 0.2 && !this.hasMouthOpened) {
            console.log("mouth is opened during the theme 1");
            this.hasMouthOpened = true;

            //should figure out the opacity of the video texture - create overlay effect would be better 
            // rain-window - hover on top + paintings 
       
            this.addVideoPlaneMeshes(videoFileLeft2,0.7,0.7, -4.02, 1.32, 0.637, 0, Math.PI / 2, 0, false);
            setTimeout(() => {
                this.addVideoPlaneMeshes(videoFileLeft3, 1.5, 1.5, -4.018, 1.29, 0.637, 0, Math.PI / 2, 0, false);
            },4000);
        }
        this.renderer.render(this.scene, this.camera);
    }



    // addVideoPlaneMeshes(videoFile,0.4,0.2,0,0,0,0,Math.PI/2,0,true);

    addVideoPlaneMeshes(video, w, h, posX, posY, posZ, rotX, rotY, rotZ, border) {

        // video plane mesh
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.needsUpdate;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
        // videoTexture.format = THREE.RGBAFormat;
        videoTexture.crossOrigin = "anonymous";

        const videoWidth = w;
        const videoHeight = h;

        // make planematerial
        var planeMaterial = new THREE.MeshBasicMaterial({ 
            map: videoTexture
            // opacity: 0.1
        })
            // opacity: 0.1
      

        const videoPlaneMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(videoWidth, videoHeight),
            planeMaterial
        );

        videoPlaneMesh.position.set(posX, posY, posZ);
        videoPlaneMesh.rotation.set(rotX, rotY, rotZ);

        this.scene.add(videoPlaneMesh);

        //create a border if it is true
        if (border) {
            // video frame plane mesh
            const videoFramePlaneMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(videoWidth + 0.02, videoHeight + 0.02),
                new THREE.MeshBasicMaterial({ color: 0xbebebe })
            );

            videoFramePlaneMesh.position.set(videoPlaneMesh.position.x, videoPlaneMesh.position.y, videoPlaneMesh.position.z - 0.001);

            this.scene.add(videoFramePlaneMesh);
        }


    }
}
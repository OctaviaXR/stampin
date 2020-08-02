// ------------------------
// Mach1 Spatial & Audio Handling

let m1Decode = null;
let m1DecodeModule = Mach1DecodeModule();
// initialize Mach1 Spatial module with initial setup settings
Mach1DecodeModule().then(function (m1DecodeModule) {
    m1Decode = new m1DecodeModule.Mach1Decode();
    m1Decode.setPlatformType(m1Decode.Mach1PlatformType.Mach1PlatformDefault);
    m1Decode.setDecodeAlgoType(m1Decode.Mach1DecodeAlgoType.Mach1DecodeAlgoSpatial);
    m1Decode.setFilterSpeed(0.9);
});

var audioFilesPath = "assets/audio/m1spatial/"
var audioFiles8 = ["T1.ogg", "T2.ogg", "T3.ogg", "T4.ogg", "B5.ogg", "B6.ogg", "B7.ogg", "B8.ogg"];

for (let i = 0; i < audioFiles8.length; i++) {
    audioFiles8[i] = audioFilesPath + audioFiles8[i];
}

let sound = new Mach1SoundPlayer();
sound.setup(audioFiles8);

function Decode(yaw, pitch, roll) {
    if (m1Decode != null && yaw != null && pitch != null && roll != null) {
        m1Decode.setFilterSpeed(controls.filterSpeed);
        m1Decode.beginBuffer();
        let decoded = m1Decode.decode(yaw, pitch, roll);
        m1Decode.endBuffer();

        sound.updateGains(decoded);

        var strDebug = "";
        decoded.forEach(function (d) {
            strDebug += d.toFixed(2) + " , ";
        });
    }
}

function Play() {
    sound.play();
}

function Stop() {
    sound.stop();
}

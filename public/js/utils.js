// ------------------------ 
controls = new (function () {
    this.nPoint = 468;
    this.yawMultiplier = 2;
    this.pitchMultiplier = 1;
    this.rollMultiplier = 1;
    this.FOV = 35;
    this.filterSpeed = 0.9;
    this.oneEuroFilterBeta = 0.06;
})();

// Given a value and an input range, map the value to an output range.
function map(value, inputMin, inputMax, outputMin, outputMax) {
    return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
}

// Linearly interpolate a value within a range.
function lerp(start, stop, amount) {
    return start + (stop - start) * amount;
}

// Convert radians to degrees
function radians_to_degrees(radians) {
    return radians * (180 / Math.PI);
}

//TODO: Apply isMobile returned bools to Device modes
function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}
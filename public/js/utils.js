// check if the browser is supported
function checkSupport() {
    if (AudioContext === false) {
        alert("The Web Audio API is not supported in this browser.\nPlease try it in the latest version of Chrome or Firefox.");
        return false;;
    }
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
    
            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
    
            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!getUserMedia) {
            alert("getUserMedia is not implemented in this browser.\nPlease try it in the latest version of Chrome or Firefox.");
            return false;
        }
        return true;
    }
    return true;
}

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
/*jshint esversion: 6 */
var Motion = pc.createScript('motion');

window.requested = false;

const requestIOSMotion = (cb) =>{
    const android = /Android/i.test(navigator.userAgent);
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                if (permissionState === 'granted') {
                    console.log("IOS orientation supported");
                    window.addEventListener('deviceorientation', cb);
                }
            })
                .catch(console.error);
        } else {
             console.log("Android orientation supported");
            window.addEventListener('deviceorientation',cb, false);
        }
    }
};

Motion.prototype.initialize = function() {
    const self = this;
    const sensorDataHandler = d => d&&self.app.fire('sensor', d);
    self.app.on("svelte",_=>{
        console.log("svelte connected");
        window.removeEventListener('deviceorientation',sensorDataHandler);
    });
    document.body.onclick = e => {
        if(window.requested) return;
        requestIOSMotion(sensorDataHandler);
        window.requested = true;
    };
};

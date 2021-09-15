/*jshint esversion: 6 */

var Tilt = pc.createScript('Tilt');

Tilt.attributes.add('maxAngle', {
    type: 'number',
    title: 'Max Angle',
    description: 'The maximum allowable tilt angle',
    default: 90,
    min: 0,
    max: 90,
});
Tilt.attributes.add('lerpSpeed',{type:'number', default: 0.07 });

Tilt.attributes.add('reverse', {
    type: 'boolean',
    default: false,
});

// initialize code called once per entity
Tilt.prototype.initialize = function() {
    const self = this;
    self.app.on('sensor',self.handleOrientation, this);
    self.origin = self.entity.getLocalEulerAngles().clone();
};

Tilt.prototype.handleOrientation = function (e) {
    const self = this;
    //when phone is portrait
    //gamma - y
    //beta - x
    //alpha - z

    //using beta, since this app only works on landscape
    const angle =  (e.beta * (window.orientation>0? 1: -1));
    const mappedAngle = angle.remap(-180,180, -self.maxAngle, self.maxAngle, true);
    self.offsetRot = new pc.Vec3(0,pc.math.clamp(-mappedAngle, -self.maxAngle, self.maxAngle),0);
};

Tilt.prototype.update = function (dt) {
    const self = this;

    if(!(self.origin && self.offsetRot)) return;
    const currentRot = self.entity.getLocalEulerAngles();
    const targetRot =  new pc.Vec3();
    targetRot.y = self.origin.y + self.offsetRot.y * (self.reverse?-1:1);
    const lerpRot = new pc.Vec3();
    lerpRot.lerp(currentRot, targetRot, self.lerpSpeed);
    self.entity.setLocalEulerAngles(lerpRot);

};

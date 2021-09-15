Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};
Number.prototype.remap = function(from1, to1, from2, to2, withinBounds) {
    const newval = (this - from1) / (to1 - from1) * (to2 - from2) + from2;
    if (!withinBounds) {
        return newval;
    }
    if (from2 < to2) {
        return newval.clamp(from2, to2)
    } else {
        return newval.clamp(to2, from2)
    }
}

export const MathHelper = {
    clamp: function (value, min, max) {
        if (value < min) {
            return min;
        }
        else if (value > max) {
            return max;
        }

        return value;
    },
    lerp: function (value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    }
}
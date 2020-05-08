export default class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    angle() {
        let x = Math.abs(this.x);
        let y = Math.abs(this.y);
    
        let a = Math.atan(y / x);
    
        if (this.x < 0) a = Math.PI - a;
        if (this.y < 0) a = 2*Math.PI - a;
    
        return a;
    }
    
    dot(v) {
        return this.x*v.x + this.y*v.y;
    }
    
    len() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    
    rot(theta) {
        const rmat = [[Math.cos(theta), -Math.sin(theta)],
                      [Math.sin(theta), Math.cos(theta)]];
        return new Vec2(this.x*rmat[0][0] + this.y*rmat[0][1],
                    this.x*rmat[1][0] + this.y*rmat[1][1]);
    }

    rot_towards(v, frac) {
        const target_angle = v.angle();
        if (!isNaN(target_angle)) {
            let angle_diff = target_angle - this.angle();

            if (angle_diff > Math.PI) angle_diff = 2*Math.PI - angle_diff;
            if (angle_diff < -Math.PI) angle_diff = 2*Math.PI + angle_diff;

            return this.rot(angle_diff * frac);
        } else {
            return new Vec2(this.x, this.y);
        }
    }
    
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    
    smul(s) {
        return new Vec2(this.x*s, this.y*s);
    }
    
    norm() {
        const l = this.len();
        return l == 0 ? new Vec2(0,0) : new Vec2(this.x / l, this.y / l);
    }

    dist_to(v) {
        return this.sub(v).len();
    }
    
    unit_to(v) {
        return v.sub(this).norm();
    }

    toString() {
        return `{x: ${this.x}, y: ${this.y}}`;
    }

}
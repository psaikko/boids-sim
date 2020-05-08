import Vec2 from './vec2.js'

export default class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
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
        return this.x*v.x + this.y*v.y + this.z*v.z;
    }
    
    len() {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }
    
    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    rot(theta) {
        /* todo */
        const rmat = [[Math.cos(theta), -Math.sin(theta)],
                      [Math.sin(theta), Math.cos(theta)]];
        return new Vec3(this.x*rmat[0][0] + this.y*rmat[0][1],
                    this.x*rmat[1][0] + this.y*rmat[1][1],
                    this.z);
    }
    
    rot_towards(v, frac) {
        // define new basis (i,j,k) of R^3 
        // with i parallel to v and j perp to this and v
        const i = v.norm();
        const j = this.cross(v).norm();
        const k = i.cross(j);

        // this parallel with v
        if (j.len() === 0) return new Vec3(this.x,this.y,this.z);

        // write this and v as linear combinations of i and k
        let v2 = new Vec2(v.len(), 0);
        // through manipulation of "this = ci + dk"
        const c = (this.x * k.y - this.y * k.x) / (i.x * k.y - i.y * k.x);
        const d = (this.y - i.y * c) / k.y;
        let this2 = new Vec2(c, d);

        // sanity check "this = ci + dk"    
        // console.log(this);
        // console.log(i.smul(c).add(k.smul(d)));

        this2 = this2.rot_towards(v2, frac);
        return i.smul(this2.x).add(k.smul(this2.y));
    }

    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    
    smul(s) {
        return new Vec3(this.x*s, this.y*s, this.z*s);
    }
    
    norm() {
        const l = this.len();
        return l == 0 ? new Vec3(0,0,0) : 
                        new Vec3(this.x / l, this.y / l, this.z / l);
    }

    dist_to(v) {
        return this.sub(v).len();
    }
    
    unit_to(v) {
        return v.sub(this).norm();
    }

    toString() {
        return `{x: ${this.x}, y: ${this.y}, z: ${this.z}}`;
    }

}
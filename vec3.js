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
    
    rot(theta) {
        /* todo */
        const rmat = [[Math.cos(theta), -Math.sin(theta)],
                      [Math.sin(theta), Math.cos(theta)]];
        return new Vec3(this.x*rmat[0][0] + this.y*rmat[0][1],
                    this.x*rmat[1][0] + this.y*rmat[1][1],
                    this.z);
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
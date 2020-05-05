let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let W = canvas.width;
let H = canvas.clientHeight;
let prevTime = (new Date()).getTime();
let n_boids = 100;
let boids = []
let max_v = 4;
let sight_radius = 100;

function init() {
    for (let i = 0; i < n_boids; ++i) {
        let x = Math.random() * W;
        let y = Math.random() * H;
        let vx = Math.random() - 0.5;
        let vy = Math.random() - 0.5;
        boids.unshift({x:x, y:y, v: {x:vx, y:vy}});
    }
}

function clamp(min, val, max) {
    return Math.min(Math.max(val, min), max);
}

function vec2_angle(v) {
    let x = Math.abs(v.x);
    let y = Math.abs(v.y);

    let a = Math.atan(y / x);

    if (v.x < 0) a = Math.PI - a;
    if (v.y < 0) a = 2*Math.PI - a;

    return a;
}

function vec2_dot(v, w) {
    return v.x*w.x + v.y*w.y;
}

function vec2_len(v) {
    return Math.sqrt(v.x*v.x + v.y*v.y);
}

function vec2_rot(v, theta) {
    const rmat = [[Math.cos(theta), -Math.sin(theta)],
                  [Math.sin(theta), Math.cos(theta)]];
    return {x: v.x*rmat[0][0] + v.y*rmat[0][1],
            y: v.x*rmat[1][0] + v.y*rmat[1][1]};
}

function vec2_add(v1, v2) {
    return {x: v1.x + v2.x, y: v1.y + v2.y};
}

function vec2_dist(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx*dx + dy*dy);
}

function unit_vector(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    return {x:dx/len, y:dy/len};
}

function update() {
    window.requestAnimationFrame(update);
    ctx.clearRect(0,0,W,H);

    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        ctx.beginPath();
        ctx.arc(boid.x, boid.y, 5, 0, Math.PI * 2)
        ctx.fill();
    }

    let centroid = {x:0, y:0};

    // Update positions and compute center
    boids.forEach(boid => {
        boid.x += boid.v.x;
        boid.y += boid.v.y;
        centroid.x += boid.x;
        centroid.y += boid.y;
    });

    centroid.x /= n_boids;
    centroid.y /= n_boids;

    // Add pull towards center
    let pull_force = 0.1;
    boids.forEach(boid => {
        let dir = unit_vector(boid, centroid);
        boid.v.x += dir.x * pull_force;
        boid.v.y += dir.y * pull_force;
    })

    // Add repulsion from other boids
    let boid_repel_force = 0.01;
    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        for (let j = 0; j < n_boids; ++j) {
            if (j != i) {
                let other = boids[j];
                let dir = unit_vector(other, boid);
                let dist = vec2_dist(boid, other);
                if (dist < 50) {
                    boid.v.x += dir.x * boid_repel_force;
                    boid.v.y += dir.y * boid_repel_force;
                }
            }
        }
    }

    // Add repulsion from edges
    let wall_repel_force = 1;
    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        [{x:boid.x, y:0},{x:boid.x, y:H},{x:0, y:boid.y},{x:W, y:boid.y}].forEach(wall => {
            let dir = unit_vector(wall, boid);
            let dist = vec2_dist(boid, wall);
            if (dist < 50) {
                boid.v.x += dir.x * wall_repel_force;
                boid.v.y += dir.y * wall_repel_force;
            }
        });
    }

    // Add velocity alignment force
    let align_force = 0.01;
    boids.forEach(boid => {
        let v_sum = {x:0, y:0};
        boids.forEach(other => {
            v_sum = vec2_add(v_sum, other.v);
        })
        console.log(v_sum);
        const boid_angle = vec2_angle(boid.v);
        const others_angle = vec2_angle(v_sum);

        let angle_diff = others_angle - boid_angle;
        if (angle_diff > Math.PI) angle_diff = 2*Math.PI - angle_diff;
        if (angle_diff < -Math.PI) angle_diff = 2*Math.PI + angle_diff;

        boid.v = vec2_rot(boid.v, angle_diff * align_force);
    })

    // Clamp max speed
    boids.forEach(boid => {
        boid.v.x = clamp(-max_v, boid.v.x, max_v);
        boid.v.y = clamp(-max_v, boid.v.y, max_v);
    });
}

init();
update();
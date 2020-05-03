let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let W = canvas.width;
let H = canvas.clientHeight;
let prevTime = (new Date()).getTime();
let n_boids = 20;
let boids = []
let max_v = 4;

function init() {
    for (let i = 0; i < n_boids; ++i) {
        let x = Math.random() * W;
        let y = Math.random() * W;
        let vx = Math.random() - 0.5;
        let vy = Math.random() - 0.5;
        boids.unshift({x:x, y:y, vx:vx, vy:vy});
    }
}

function vec_dist(from, to) {
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
        boid.x += boid.vx;
        boid.y += boid.vy;
        centroid.x += boid.x;
        centroid.y += boid.y;
    });

    centroid.x /= n_boids;
    centroid.y /= n_boids;

    // Add pull towards center
    let pull_force = 0.2;
    boids.forEach(boid => {
        let dir = unit_vector(boid, centroid);
        boid.vx += dir.x * pull_force;
        boid.vy += dir.y * pull_force;
    })

    // Add repulsion from other boids
    let boid_repel_force = 1;
    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        for (let j = 0; j < n_boids; ++j) {
            if (j != i) {
                let other = boids[j];
                let dir = unit_vector(other, boid);
                let dist = vec_dist(boid, other);
                boid.vx += dir.x * boid_repel_force / (dist);
                boid.vy += dir.y * boid_repel_force / (dist);
            }
        }
    }

    // Add repulsion from edges
    let wall_repel_force = 10;
    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        [{x:boid.x, y:0},{x:boid.x, y:H},{x:0, y:boid.y},{x:W, y:boid.y}].forEach(wall => {
            let dir = unit_vector(wall, boid);
            let dist = vec_dist(boid, wall);
            boid.vx += dir.x * wall_repel_force / (dist*dist);
            boid.vy += dir.y * wall_repel_force / (dist*dist);
        });
    }

    // Clamp max speed
    boids.forEach(boid => {
        boid.vx = Math.min(Math.max(boid.vx, -max_v), max_v);
        boid.vy = Math.min(Math.max(boid.vy, -max_v), max_v);
    });
}

init();
update();
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let W = canvas.width;
let H = canvas.clientHeight;
let prevTime = (new Date()).getTime();
let n_boids = 10;
let boids = []

function init() {
    for (let i = 0; i < n_boids; ++i) {
        let x = Math.random() * W;
        let y = Math.random() * W;
        let vx = Math.random() - 0.5;
        let vy = Math.random() - 0.5;
        boids.unshift({x:x, y:y, vx:vx, vy:vy});
    }
}

function unit_vector(from_x, from_y, to_x, to_y) {
    let dx = to_x - from_x;
    let dy = to_y - from_y;
    let len = Math.sqrt(dx*dx + dy*dy);
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
    let pull_force = 0.1;
    boids.forEach(boid => {
        let dir = unit_vector(boid.x, boid.y, centroid.x, centroid.y);
        boid.vx += dir.x * pull_force;
        boid.vy += dir.y * pull_force;
    })
}

init();
update();
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let W = canvas.width;
let H = canvas.clientHeight;
let prevTime = (new Date()).getTime();
let n_boids = 10;
let boids = []

function init() {
    for (let i = 0; i < n_boids; ++i) {
        let x = Math.random() * W | 0;
        let y = Math.random() * W | 0;
        let vx = Math.random() - 0.5;
        let vy = Math.random() - 0.5;
        boids.unshift({x:x, y:y, vx:vx, vy:vy});
    }
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

    boids.forEach(boid => {
        boid.x += boid.vx;
        boid.y += boid.vy;
    });
}

init();
update();
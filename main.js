let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let W = canvas.width;
let H = canvas.clientHeight;
let prevTime = (new Date()).getTime();
let n_boids = 100;
let boids = []
let max_v = 4;
let sight_radius = 100;

let boid_length = 5;
let boid_wingspan = 10;
let boid_wing_angle = 3*Math.PI/5;

let pull_force = 0.05;
let boid_repel_force = 0.01;
let align_force = 0.005;
let wall_repel_force = 1;

function new_boid() {
    let x = Math.random() * W;
    let y = Math.random() * H;
    let vx = Math.random() - 0.5;
    let vy = Math.random() - 0.5;
    return {x:x, y:y, v: {x:vx, y:vy}};
}

function n_setter(new_n) {
    if (new_n < n_boids) {
        while (n_boids > new_n) {
            boids.pop();
            n_boids--;
        }
    } else {
        while (n_boids < new_n) {
            boids.push(new_boid());
            n_boids++;
        }
    }
}

function hook_up_slider(slider_id, label_id, setter, min_v, init_v, max_v) {
    let slider = document.getElementById(slider_id);
    let label = document.getElementById(label_id);

    slider.min = min_v;
    slider.max = max_v;
    slider.step = (max_v - min_v) / 1000;
    slider.value = init_v;
    label.innerText = ""+init_v;

    slider.onchange = e => {
        setter(e.target.valueAsNumber);
        label.innerText = e.target.value;
    }
}

function init() {

    hook_up_slider("attr_slider", "attr_label", v => {pull_force = v}, 0, 0.05, 0.5);
    hook_up_slider("repel_slider", "repel_label", v => {boid_repel_force = v}, 0, 0.01, 0.1);
    hook_up_slider("align_slider", "align_label", v => {align_force = v}, 0, 0.005, 0.05);
    hook_up_slider("sight_slider", "sight_label", v => {sight_radius = v}, 0, 100, 1000);
    hook_up_slider("n_slider", "n_label", n_setter, 0, 100, 1000);

    for (let i = 0; i < n_boids; ++i)
        boids.unshift(new_boid());
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
    return {
        x: v1.x + v2.x, 
        y: v1.y + v2.y
    };
}

function vec2_smul(v, s) {
    return {
        x: v.x*s,
        y: v.y*s
    }
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
    if (len > 0) {
        return {
            x: dx / len, 
            y: dy / len
        };
    } else {
        return {
            x: 0,
            y: 0
        };
    }
}

function update() {
    window.requestAnimationFrame(update);
    ctx.clearRect(0,0,W,H);

    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        ctx.beginPath();

        const dir = unit_vector({x:0, y:0}, boid.v); 
        let head = vec2_add(boid, vec2_smul(dir, boid_length));
        let left = vec2_rot(dir, boid_wing_angle);

        left = vec2_smul(left, boid_wingspan)
        left = vec2_add(boid, left);

        let right = vec2_rot(dir, -boid_wing_angle);

        right = vec2_smul(right, boid_wingspan)
        right = vec2_add(boid, right);

        ctx.moveTo(boid.x, boid.y);
        ctx.lineTo(left.x, left.y);
        ctx.lineTo(head.x, head.y);
        ctx.lineTo(right.x, right.y);

        ctx.fill();
    }

    // Update positions
    boids.forEach(boid => {
        boid.x += boid.v.x;
        boid.y += boid.v.y;
    });

    // Add pull towards center
    boids.forEach(boid => {
        let centroid = {x: 0, y: 0};
        let n = 0;

        boids.forEach(other => {
            if (vec2_dist(other, boid) <= sight_radius) {
                centroid.x += other.x;
                centroid.y += other.y;
                n += 1;
            }
        });

        centroid.x /= n;
        centroid.y /= n;
        let dir = unit_vector(boid, centroid);
        
        boid.v.x += dir.x * pull_force;
        boid.v.y += dir.y * pull_force;
    })

    // Add repulsion from other boids
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
    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        [{x:boid.x, y:0},{x:boid.x, y:H},{x:0, y:boid.y},{x:W, y:boid.y}].forEach(wall => {
            let dir = unit_vector(wall, boid);
            let dist = vec2_dist(boid, wall);
            if (dist < 20) {
                boid.v.x += dir.x * wall_repel_force;
                boid.v.y += dir.y * wall_repel_force;
            }
        });
    }

    // Add velocity alignment force
    boids.forEach(boid => {
        let v_sum = {x:0, y:0};
        boids.forEach(other => {
            if (vec2_dist(other, boid) < sight_radius)
                v_sum = vec2_add(v_sum, other.v);
        })
        const boid_angle = vec2_angle(boid.v);
        const others_angle = vec2_angle(v_sum);

        if (!isNaN(others_angle)) {
            let angle_diff = others_angle - boid_angle;

            if (angle_diff > Math.PI) angle_diff = 2*Math.PI - angle_diff;
            if (angle_diff < -Math.PI) angle_diff = 2*Math.PI + angle_diff;

            boid.v = vec2_rot(boid.v, angle_diff * align_force);
        }
    })

    // Clamp max speed
    boids.forEach(boid => {
        boid.v.x = clamp(-max_v, boid.v.x, max_v);
        boid.v.y = clamp(-max_v, boid.v.y, max_v);
    });
}

init();
update();
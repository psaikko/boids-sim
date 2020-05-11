import * as THREE from './three.module.js'
import Vec3 from './vec3.js'
import Vec2 from './vec2.js'

let canvas = document.getElementById("canvas");
//let ctx = canvas.getContext('2d');
let W = canvas.width;
let H = canvas.clientHeight;
let D = W;
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
let wall_repel_force = 0.05;

function new_boid() {
    let px = Math.random() * W;
    let py = Math.random() * H;
    let pz = Math.random() * D;
    let vx = Math.random() - 0.5;
    let vy = Math.random() - 0.5;
    let vz = Math.random() - 0.5;
    return {
        p: new Vec3(px,py,pz),
        v: new Vec3(vx,vy,vz)
    };
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
/*
    hook_up_slider("attr_slider", "attr_label", v => {pull_force = v}, 0, 0.05, 0.5);
    hook_up_slider("repel_slider", "repel_label", v => {boid_repel_force = v}, 0, 0.01, 0.1);
    hook_up_slider("align_slider", "align_label", v => {align_force = v}, 0, 0.005, 0.05);
    hook_up_slider("sight_slider", "sight_label", v => {sight_radius = v}, 0, 100, 1000);
    hook_up_slider("n_slider", "n_label", n_setter, 0, 100, 1000);
*/
    for (let i = 0; i < n_boids; ++i)
        boids.unshift(new_boid());
}

function clamp(min, val, max) {
    return Math.min(Math.max(val, min), max);
}

let frame_i = 0;

function update() {
    frame_i++;
    window.requestAnimationFrame(update);
    ctx.clearRect(0,0,W,H);

    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        ctx.beginPath();

        const dir = new Vec2(boid.v.x, boid.v.y).norm(); 
        const p2 = new Vec2(boid.p.x, boid.p.y);

        let head = p2.add(dir.smul(boid_length));
        let left = dir.rot(boid_wing_angle);

        left = p2.add(left.smul(boid_wingspan))

        let right = dir.rot(-boid_wing_angle);

        right = p2.add(right.smul(boid_wingspan));

        ctx.moveTo(boid.p.x, boid.p.y);
        ctx.lineTo(left.x, left.y);
        ctx.lineTo(head.x, head.y);
        ctx.lineTo(right.x, right.y);

        const a = boid.p.z / D;
        
        ctx.fillStyle = `rgba(0,0,0,${a})`;
        ctx.fill();
    }

    // Update positions
    boids.forEach(boid => {
        boid.p = boid.p.add(boid.v);
    });

    // Add pull towards center
    boids.forEach(boid => {
        let centroid = new Vec3(0,0,0);
        let n = 0;

        boids.forEach(other => {
            if (other.p.dist_to(boid.p) <= sight_radius) {
                centroid = centroid.add(other.p);
                n += 1;
            }
        });

        centroid = centroid.smul(1 / n);
        let dir = boid.p.unit_to(centroid);
        
        boid.v = boid.v.add(dir.smul(pull_force));
    })
    
    // Add repulsion from other boids
    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        for (let j = 0; j < n_boids; ++j) {
            if (j != i) {
                let other = boids[j];
                let dir = other.p.unit_to(boid.p);
                let dist = boid.p.dist_to(other.p);
                if (dist < 50) {
                    boid.v = boid.v.add(dir.smul(boid_repel_force));
                }
            }
        }
    }

    // Add repulsion from edges
    for (let i = 0; i < n_boids; ++i) {
        let boid = boids[i];
        const walls = [
            new Vec3(boid.p.x, 0, boid.p.z), 
            new Vec3(boid.p.x, H, boid.p.z), 
            new Vec3(0, boid.p.y, boid.p.z), 
            new Vec3(W, boid.p.y, boid.p.z),
            new Vec3(boid.p.x, boid.p.y, 0),
            new Vec3(boid.p.x, boid.p.y, D)];
        walls.forEach(wall => {
            let dir = boid.p.unit_to(new Vec3(W/2,H/2,D/2));
            let dist = boid.p.dist_to(wall);
            if (dist < 100) {
                boid.v = boid.v.add(dir.smul(wall_repel_force));
            }
        });
    }

    // Add velocity alignment force
    boids.forEach((boid, i) => {
        
        let v_sum = new Vec3(0,0,0);
        boids.forEach(other => {
            if (other.p.dist_to(boid.p) < sight_radius)
                v_sum = v_sum.add(other.v);
        })

        boid.v = boid.v.rot_towards(v_sum, align_force);
    })

    // Clamp max speed
    boids.forEach(boid => {
        boid.v.x = clamp(-max_v, boid.v.x, max_v);
        boid.v.y = clamp(-max_v, boid.v.y, max_v);
        boid.v.z = clamp(-max_v, boid.v.z, max_v);

        boid.p.x = clamp(0, boid.p.x, W);
        boid.p.y = clamp(0, boid.p.y, H);
        boid.p.z = clamp(0, boid.p.z, D);
    });
}

//init();
//update();

var camera, scene, renderer;
var geometry, material, mesh;

init_three();
animate_three();

function init_three() {

    const fov = 70;
    const aspect = W/H;
    const near = 0.1;
    const far = 10;

	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 1;

	scene = new THREE.Scene();

	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    
    //material = new THREE.MeshNormalMaterial();
    material = new THREE.MeshPhongMaterial({color: 0xFF5599});

	mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);

	renderer = new THREE.WebGLRenderer( { canvas } );

}

function animate_three(time_ms) {

	requestAnimationFrame( animate_three );

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;

	renderer.render( scene, camera );

}
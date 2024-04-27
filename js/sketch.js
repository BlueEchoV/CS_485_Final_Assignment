const sprites_to_draw = new Array(2); 

sprites_to_draw[1] = new Array(0); //forground
sprites_to_draw[0] = new Array(0); //background and 

var img;

function preload() {
	    // $.getJSON( "Penguins/animationData.json", function( data ) {
		// Calls preload in here
		// THIS NEEDS TO CHANGE
		// new Image();
		// new Image();
		// new Image();
		// NOTE: NEW SPRITE BEING CALLED INSIDE OF SPRITE.JS
        // sprites_to_draw[1].push( new Sprite(data, 150 ,600, "idle") );
		// });
		img = loadImage('Penguins/TenderBud/idle/0.png');
	}

// var img = new Image();
// img.src = "boids_Image_Test.png";

const flock = [];

let alignSlider, cohesionSlider, separationSlider;

function setup() {
	resize();
	console.log("Width = " + window.innerWidth);
	// Becomes the target for all p5 drawings
	createCanvas(window.innerWidth, window.innerHeight);
	alignmentSlider = createSlider(0, 5, 1, 0.1);
	cohesionSlider = createSlider(0, 5, 1, 0.1);
	separationSlider = createSlider(0, 5, 1, 0.1);
	for (let i = 0; i < 100; i++) {
		flock.push(new Boid(img));
	}
	// console.log(flock);
}

function draw() {
	background(51);
	
	for (let boid of flock) {
		boid.edges();
		boid.flock(flock);
		boid.update();
		boid.show();
	}
}
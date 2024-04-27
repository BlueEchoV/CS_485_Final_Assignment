class Boid {
	constructor(spriteImages) {
		this.position = createVector(random(window.innerWidth), random(window.innerHeight));
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(2, 4));
		this.acceleration = createVector();
		// Makes them stronger or weaker
		this.maxForce = 0.2;
		this.maxSpeed = 4;
		this.img = spriteImages;
		// TODO: ADD A SPRITE TO THIS CLASS
		// this.sprite = new Sprite(spriteImages, this.position.x, this.position.y);
	}
	
	// Wrapping around
	edges() {
		if (this.position.x > window.innerWidth) {
			this.position.x = 0;
		} else if (this.position.x < 0) {
			this.position.x = window.innerWidth;
		}
		if (this.position.y > window.innerHeight) {
			this.position.y = 0;
		} else if (this.position.y < 0) {
			this.position.y = window.innerHeight;
		}
	}
	
	// Aligns the boids with ALL the other boids in a raduis around the boid
	align(boids) {
		// Gets the average velocity of all the boids in
		// some distance around the originating boid. 
	    let perceptionRadius = 50;
		// Steering force
		let steering = createVector();
		let total = 0;
		for (let other of boids) {
			let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
			if (other != this && d < perceptionRadius) {
				steering.add(other.velocity);
				total++;
			}
		}
		if (total > 0) {
			// Divide by the total velocities added to get the average
			steering.div(total);
			steering.setMag(this.maxSpeed);
			steering.sub(this.velocity);
			// limits the length (magnitude) of the vector to some max force
			steering.limit(this.maxForce);
		}
		// Return that force
		// Always return a vector, and if it didn't find anything, return 0,0
		return steering;
	}
	
	// Needs refactoring
	cohesion(boids) {
	    let perceptionRadius = 100;
		let steering = createVector();
		let total = 0;
		for (let other of boids) {
			let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
			if (other != this && d < perceptionRadius) {
				steering.add(other.position);
				total++;
			}
		}
		// Now what we have at this point is the average location
		if (total > 0) {
			steering.div(total);
			// Get direction vector by subtracting
			steering.sub(this.position);
			steering.setMag(this.maxSpeed);
			steering.sub(this.velocity);
			steering.limit(this.maxForce);
		}
		return steering;
	}
	
	// Needs refactoring
	separation(boids) {
	    let perceptionRadius = 100;
		let steering = createVector();
		let total = 0;
		for (let other of boids) {
			let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
			if (other != this && d < perceptionRadius) {
				// Calls the sub function to subtract two vectors
				// Get a vector that's pointing away from the local 
				// flock, make it inversly proportional to the distance,
				// then add it up
				let diff = p5.Vector.sub(this.position, other.position);
				diff.div(d);
				steering.add(diff);
				total++;
			}
		}
		// Now what we have at this point is the average location
		if (total > 0) {
			steering.div(total);
			// Get direction vector by subtracting
			steering.setMag(this.maxSpeed);
			steering.sub(this.velocity);
			steering.limit(this.maxForce);
		}
		return steering;
	}
	
	flock(boids) {
		let alignment = this.align(boids);
		let cohesion = this.cohesion(boids);
		let separation = this.separation(boids);
		
		alignment.mult(separationSlider.value());
		cohesion.mult(separationSlider.value());
		separation.mult(separationSlider.value());
		
		this.acceleration.add(alignment);
		this.acceleration.add(cohesion);
		this.acceleration.add(separation);
	}
	
	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
		// Resets the acceleration
		this.acceleration.mult(0);
	}
	
	show() {
		strokeWeight(15);
		stroke(255, 0, 0);
		image(this.img, this.position.x, this.position.y);
	}
}
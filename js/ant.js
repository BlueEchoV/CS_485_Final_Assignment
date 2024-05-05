class Ant{
	constructor(sprite_json,start_state, max_Speed){
		console.log("Inside constructor");
        this.sprite_json = sprite_json;

        this.root_e = "ant";

        this.cur_frame = 0;

        this.idle = false;

		this.state = start_state;

        this.count = 1;

        this.hp = 1;

		// Accleration
		this.acceleration_X = 0;
		this.acceleration_Y = 0;

		// Flocking varibles
        this.maxforce = .01;
		// MAKE SURE THIS IS DEFINED BEFORE WE CALL 
		// RANDOM_POS_X
        this.maxSpeed = max_Speed;
		this.perception = 75;

		this.enemy = true;
		this.small_enemy = true;
		
		// Alignment: Helps a boid to steer towards the 
		// average heading of its local flockmates.
		this.alignment_Scalar = 10.0;
		// Cohesion: Draws a boid towards the average 
		// position of nearby flockmates, promoting group cohesion.
		this.cohesion_Scalar = 10;
		// Separation: Drives a boid to move away from 
		// flockmates that are too close, preventing overcrowding.
		this.separation_Scalar = 10.0;
		
		// Random position
        this.x = 0;
        this.y = 0;
        this.random_Off_Screen_Spawn_Position();
		
		// Random velocity
        this.x_v = this.random_velo();
        this.y_v = this.random_velo();
    }

	random_Off_Screen_Spawn_Position() {
		// Generate a random zone to spawn the enemy in
		var zone = 4 * Math.random();
		
		// North
		if (zone < 1) {
			this.x = Math.random() * window.innerWidth;
			// inverted coordinate systemm
			this.y = -this.sprite_json[this.root_e][this.state][this.cur_frame]['w'];
		// South
		} else if (zone >= 1 && zone < 2) {
			this.x = Math.random() * window.innerWidth;
			this.y = 0;
		// East
		} else if (zone >= 2 && zone < 3) {
			this.x = window.innerWidth;
			this.y = Math.random() * window.innerHeight;
		// West
		} else {
			// Spawn the enemy off screen if it spawns in the west
			this.x = -this.sprite_json[this.root_e][this.state][this.cur_frame]['w'];
			this.y = Math.random() * window.innerHeight;
		}
	}
	
	edges(width, height) {
		if (this.x > width) {
			this.x = -this.sprite_json[this.root_e][this.state][this.cur_frame]['w'];
		} else if (this.x < -this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) {
			this.x = width;
		}
		if (this.y > height ) {
			this.y = -this.sprite_json[this.root_e][this.state][this.cur_frame]['h'];
		} else if (this.y < -this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) {
			this.y = height 
		}
	}
	
	draw(state){
        var ctx = canvas.getContext('2d');
       
		// Draw the sprite
		ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'], this.x, this.y ); // Draw the sprite

        this.count += 1;

        if(this.count % 3 == 0){
            this.cur_frame = this.cur_frame + 1;
            this.count = 1;
        }

        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
            //console.log(this.cur_frame);
            this.cur_frame = 0;
        }
        
		if(this.detect_on_screen())
			this.boid_behavior();
		else
			this.track_player(state['foreground_sprites']);

        

        this.update_animation();

        return false;
        
    }

    set_idle_state(){
        this.idle = true;
        this.x_v = 0;
        this.y_v = 0;
        
        const idle_state = ["idle","idleBackAndForth","idleBreathing","idleFall","idleLayDown","idleLookAround","idleLookDown","idleLookLeft","idleLookRight","idleLookUp","idleSit","idleSpin","idleWave"];

        const random = Math.floor(Math.random() * idle_state.length);
        // console.log(idle_state[random]);
        this.state = idle_state[random];
        this.cur_frame = 0;
    }

    flock(boids){
        this.align(boids);
        this.cohesion(boids);
        this.separation(boids);
    }

	align(boids){
		let perceptionRadius = this.perception;
		let total = 0;
		let steering_x = 0;
		let steering_y = 0;

		for(let other of boids){
			if(other.constructor.name == "Ant"){
				let a = this.x - other.x;
				let b = this.y - other.y;
				let d = Math.sqrt(a*a + b*b);

				if(other !== this && d < perceptionRadius){
					steering_x += other.x_v;
					steering_y += other.y_v;
					total++;
			}
			
			}
		}
		if(total > 0){
			steering_x /= total;
			steering_y /= total;

			// Adjust steering to average direction and subtract current velocity
			steering_x -= this.x_v;
			steering_y -= this.y_v;

			// Normalize and apply maxforce
			let mag = Math.sqrt(steering_x * steering_x + steering_y * steering_y);
			if (mag > this.maxforce) {
				// normalize 			
				steering_x /= mag;
				steering_y /= mag;
				steering_x *= this.maxforce;
				steering_y *= this.maxforce;
			}
			
			steering_x *= this.alignment_Scalar;
			steering_y *= this.alignment_Scalar;
			
			// Add steering force to acceleration
			this.acceleration_X += steering_x;
			this.acceleration_Y += steering_y;
		}
	}

	cohesion(boids){
		let perceptionRadius = 100;
		let steering_x = 0;
		let steering_y = 0;

		let total = 0;
		for(let other of boids){
			if(other.constructor.name == "Ant"){
				let a = this.x - other.x;
				let b = this.y - other.y;
				let d = Math.sqrt(a * a + b * b);

				if(other !== this && d < perceptionRadius){
					steering_x += other.x;
					steering_y += other.y;
					total++;
				}
			}	
		}
		if(total > 0){
			steering_x /= total;
			steering_y /= total;
			steering_x -= this.x;
			steering_y -= this.y;

			// Normalize and apply maxforce
			let mag = Math.sqrt(steering_x * steering_x + steering_y * steering_y);
			if (mag > this.maxforce) {
				// normalize 			
				steering_x /= mag;
				steering_y /= mag;
				steering_x *= this.maxforce;
				steering_y *= this.maxforce;
			}

			steering_x *= this.cohesion_Scalar;
			steering_y *= this.cohesion_Scalar;

			// Add steering force to acceleration
			this.acceleration_X += steering_x;
			this.acceleration_Y += steering_y;
		}
	}

	separation(boids){
		let perceptionRadius = this.perception;
		let total = 0;
		let steering_x = 0;
		let steering_y = 0;

		for(let other of boids){
			if(other.constructor.name == "Ant"){
				let a = this.x - other.x;
				let b = this.y - other.y;
				let d = Math.sqrt(a * a + b * b);

				if(other !== this && d < perceptionRadius && d > 0){ // Ensuring d is positive to avoid division by zero
					let diff_x = this.x - other.x;
					let diff_y = this.y - other.y;
					diff_x /= d; // Normalize the difference
					diff_y /= d;
					steering_x += diff_x;
					steering_y += diff_y;
					total++;
				}
			}
		}
		if(total > 0){
			steering_x /= total;
			steering_y /= total;

			// Normalize and apply maxforce
			let mag = Math.sqrt(steering_x * steering_x + steering_y * steering_y);
			if (mag > this.maxforce) {
				// normalize 			
				steering_x /= mag;
				steering_y /= mag;
				steering_x *= this.maxforce;
				steering_y *= this.maxforce;
			}
			
			steering_x *= this.separation_Scalar;
			steering_y *= this.separation_Scalar;
			
			// Add steering force to acceleration
			this.acceleration_X += steering_x;
			this.acceleration_Y += steering_y;
		}
	}

	/*
	show() {
		var ctx = canvas.getContext('2d');
		ctx.drawImage(this.img, this.x, this.y );
	}*/

    bound_hit(side){
            this.set_idle_state();
    } 

	random_velo() {
		// console.log("maxSpeed:", this.maxSpeed); 
		return (Math.random() * 2 * this.maxSpeed) - this.maxSpeed;
	}

    random_pos_x(){
        // var rand = Math.floor(Math.random() * (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']));
        var rand = Math.floor(Math.random() * (window.innerWidth));

        return rand;
    }

    random_pos_y(){
        // var rand = Math.floor(Math.random() * (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']));
        var rand = Math.floor(Math.random() * (window.innerHeight));

        return rand;
    }

    update_animation(){
        //Change animation correlated to the direction we're moving

        if(this.x_v > 0){
            this.state = "walk_E";
        }else if(this.x_v < 0){
            this.state = "walk_W";
		}


        //Check if our new animation will put us out of bounds, and if so set current frame to 0
        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
            this.cur_frame = 0;
        }
    }

	boid_behavior(){
		// Update velocity
		this.x_v += this.acceleration_X;
		this.y_v += this.acceleration_Y;

		// Clamp the velocity to maxSpeed
		let speed = Math.sqrt(this.x_v * this.x_v + this.y_v * this.y_v);
		if (speed > this.maxSpeed) {
			this.x_v = (this.x_v / speed) * this.maxSpeed;
			this.y_v = (this.y_v / speed) * this.maxSpeed;
		}

		// Update position
		this.x += this.x_v;
		this.y += this.y_v;

		// Reset acceleration to 0 after each update
		this.acceleration_X = 0;
		this.acceleration_Y = 0;
	}

	detect_on_screen(){
		
			 //Check if ant is on the screen
			 if( this.x <= (canvas.width) &&
				 (this.x + this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) >= 0 && 
				 this.y <= (canvas.height) && 
				 (this.y + this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) >= 0){
					return true;
			 } else {
				return false;
			 }
		 
	 }
}
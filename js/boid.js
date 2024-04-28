class Boid{
	constructor(image){
		console.log("Inside constructor");
        
        this.root_e = "TenderBud";

        this.cur_frame = 0;

        this.idle = false;

        this.count = 1;

		// Random position
        this.x = this.random_pos_x();
        this.y = this.random_pos_y();
		
		// Random velocity
        this.x_v = this.random_velo();
        this.y_v = this.random_velo();

		// Accleration
		this.acceleration_X = 0;
		this.acceleration_Y = 0;

		// Flocking varibles
        this.maxforce = 0.2;
        this.maxSpeed = 2;
		this.perception = 25;
		
		// Values
		this.alignment_Scalar = 1.0;
		this.cohesion_Scalar = 0.0;
		this.separation_Scalar = 0.0;
		
		// Image
		this.img = image;
    }
	
	edges(width, height) {
		if (this.x > width) {
			this.x = 0;
		} else if (this.x < 0) {
			this.x = width;
		}
		if (this.y > height) {
			this.y = 0;
		} else if (this.y < 0) {
			this.y = height;
		}
	}
	
	update() {
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
	
	// Testing
	draw(){
        var ctx = canvas.getContext('2d');
            
        ctx.drawImage(this.img, this.x, this.y );

		//Screen border checks
		// Toroidal
		//If we're not idle, then we should be moving!
		this.x += this.x_v;
		this.y += this.y_v;

		this.x_v += this.acceleration_X;
		this.y_v += this.acceleration_Y;

		this.acceleration_X = 0;
		this.acceleration_Y = 0;

		//limit x magnitude to a max of maxForce
		if(this.x_v < -this.maxforce){
			this.x_v = -this.maxforce;
		} else if(this.x_v > this.maxforce){
			this.x_v = this.maxforce;
		}

		//limit y magnitude to a max of maxForce
		if(this.y_v < -this.maxforce){
			this.y_v = -this.maxforce;
		} else if(this.y_v > this.maxforce){
			this.y_v = this.maxforce;
		}

		if(this.x_v > 0 || this.y_v > 0){
			this.idle = false;
		}

        if(this.idle == false){ 
            //If we have no velocity and no key inputs, set ourselves to idle. By checking for key input it allows us to keep playing movement animations at screen border to create cleaner gameplay
            if(this.x_v == 0 && this.y_v == 0 && state['key_change'] == false){
                this.set_idle_state();
            }
        }
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
        // this.cohesion(boids);
        // this.separation(boids);
    }

	align(boids){
		let perceptionRadius = this.perception;
		let total = 0;
		let steering_x = 0;
		let steering_y = 0;

		for(let other of boids){
			let a = this.x - other.x;
			let b = this.y - other.y;
			let d = Math.sqrt(a*a + b*b);

			if(other !== this && d < perceptionRadius){
				steering_x += other.x_v;
				steering_y += other.y_v;
				total++;
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
				steering_x = (steering_x / mag) * this.maxforce;
				steering_y = (steering_y / mag) * this.maxforce;
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
			let a = this.x - other.x;
			let b = this.y - other.y;
			let d = Math.sqrt(a * a + b * b);

			if(other !== this && d < perceptionRadius){
				steering_x += other.x;
				steering_y += other.y;
				total++;
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
				steering_x = (steering_x / mag) * this.maxforce;
				steering_y = (steering_y / mag) * this.maxforce;
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
		if(total > 0){
			steering_x /= total;
			steering_y /= total;

			// Normalize and apply maxforce
			let mag = Math.sqrt(steering_x * steering_x + steering_y * steering_y);
			if (mag > this.maxforce) {
				steering_x = (steering_x / mag) * this.maxforce;
				steering_y = (steering_y / mag) * this.maxforce;
			}
			
			steering_x *= this.separation_Scalar;
			steering_y *= this.separation_Scalar;
			
			// Add steering force to acceleration
			this.acceleration_X += steering_x;
			this.acceleration_Y += steering_y;
		}
	}

	
    flock(boids){
       this.align(boids);
       this.cohesion(boids);
       this.separation(boids);
    }
	
	show() {
		var ctx = canvas.getContext('2d');
		ctx.drawImage(this.img, this.x, this.y );
	}

    bound_hit(side){
            this.set_idle_state();
    } 

    random_velo(){
        var rand = Math.floor(Math.random() * 2);
        // console.log(rand);
        if(rand == 0){
            return 10;
        } else if (rand == 1){
            return -10;
        }
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
        if(this.x_v > 0 && this.y_v < 0){
            this.state = "walk_NE";
        } else if (this.x_v < 0 && this.y_v < 0){
            this.state = "walk_NW";
        } else if (this.x_v < 0 && this.y_v > 0){
             this.state = "walk_SW";
        } else if (this.x_v > 0 && this.y_v > 0){
            this.state = "walk_SE";
        } else if(this.x_v > 0 && this.y_v == 0){
            this.state = "walk_E";
        }else if(this.x_v < 0 && this.y_v == 0){
            this.state = "walk_W";
        }else if(this.y_v > 0 && this.x_v == 0){
            this.state = "walk_S";
        }else if(this.y_v < 0 && this.x_v == 0){
            this.state = "walk_N";
        }

        //Check if our new animation will put us out of bounds, and if so set current frame to 0
        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
            this.cur_frame = 0;
        }
    }
}

// Archived:


//    constructor(sprite_json, start_state){
//        this.sprite_json = sprite_json;
//        
//        this.state = start_state;
//        this.root_e = "TenderBud";
//
//        this.cur_frame = 0;
//
//        this.cur_bk_data = null;
//
//        this.x_v = this.random_velo();
//        this.y_v = this.random_velo();
//
//        this.x_a = 0;
//        this.y_a = 0;
//
//        this.idle = false;
//
//        this.count = 1;
//
//        this.x = this.random_pos_x();
//        this.y = this.random_pos_y();
//
//        this.maxforce = 1.0;
//        this.maxSpeed = 300;
//		this.perception = 300;
//
//    }

//    draw(state){
//        var ctx = canvas.getContext('2d');
//        //console.log(state['key_change']);
//
//        /*if(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] == null){
//            console.log("loading");
//            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] = new Image();
//            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src = 'Penguins/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
//        }*/
//
//        if( this.cur_bk_data != null){
//            ctx.putImageData(this.cur_bk_data , (this.x - this.x_v) , (this.y - this.y_v));
//        }
//
//        this.cur_bk_data = ctx.getImageData(this.x, this.y, 
//            this.sprite_json[this.root_e][this.state][this.cur_frame]['w'], 
//            this.sprite_json[this.root_e][this.state][this.cur_frame]['h']);
//
//            
//        ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'], this.x, this.y );
//
//        this.count += 1;
//
//        if(this.count % 3 == 0){
//            this.cur_frame = this.cur_frame + 1;
//            this.count = 1;
//        }
//            
//
//        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
//            // console.log(this.cur_frame);
//            this.cur_frame = 0;
//        }
//
//		this.update_animation();
//		
//		//Screen border checks
//		
//		// Toroidal
//
//		if(this.x >= (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) ){//Right
//			this.x = 1;
//		}
//		if(this.x <= 0){
//			this.x = window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']-1;
//		}
//		if(this.y >= (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) ){ //Bottom
//			this.y = 1;
//		}
//		if(this.y <= 0){
//			this.y = window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']-1;
//		}
//		
//		//If we're not idle, then we should be moving!
//		this.x += this.x_v;
//		this.y += this.y_v;
//
//		this.x_v += this.x_a;
//		this.y_v += this.y_a;
//
//		this.x_a = 0;
//		this.y_a = 0;
//
//		//limit x magnitude to a max of maxForce
//		if(this.x_v < -this.maxforce){
//			this.x_v = -this.maxforce;
//		} else if(this.x_v > this.maxforce){
//			this.x_v = this.maxforce;
//		}
//
//		//limit y magnitude to a max of maxForce
//		if(this.y_v < -this.maxforce){
//			this.y_v = -this.maxforce;
//		} else if(this.y_v > this.maxforce){
//			this.y_v = this.maxforce;
//		}
//
//		if(this.x_v > 0 || this.y_v > 0){
//			this.idle = false;
//		}
//
//        if(this.idle == false){ 
//            //If we have no velocity and no key inputs, set ourselves to idle. By checking for key input it allows us to keep playing movement animations at screen border to create cleaner gameplay
//            if(this.x_v == 0 && this.y_v == 0 && state['key_change'] == false){
//                this.set_idle_state();
//            }
//        }
//        return false;
//        
//    }
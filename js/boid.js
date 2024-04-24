class boid{
    constructor(sprite_json, start_state){
        this.sprite_json = sprite_json;
        
        this.state = start_state;
        this.root_e = "TenderBud";

        this.cur_frame = 0;

        this.cur_bk_data = null;

        this.x_v = this.random_velo();
        this.y_v = this.random_velo();

        this.x_a = 0;
        this.y_a = 0;

        this.idle = false;

        this.count = 1;

        this.x = this.random_pos_x();
        this.y = this.random_pos_y();

        this.maxforce = 0.5;
        this.maxSpeed = 10;

    }

    draw(state){
        var ctx = canvas.getContext('2d');
        //console.log(state['key_change']);

        /*if(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] == null){
            console.log("loading");
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] = new Image();
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src = 'Penguins/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
        }*/

        if( this.cur_bk_data != null){
            ctx.putImageData(this.cur_bk_data , (this.x - this.x_v) , (this.y - this.y_v));
        }

        this.cur_bk_data = ctx.getImageData(this.x, this.y, 
            this.sprite_json[this.root_e][this.state][this.cur_frame]['w'], 
            this.sprite_json[this.root_e][this.state][this.cur_frame]['h']);

            
        ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'], this.x, this.y );

        this.count += 1;

        if(this.count % 3 == 0){
            this.cur_frame = this.cur_frame + 1;
            this.count = 1;
        }
            

        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
            console.log(this.cur_frame);
            this.cur_frame = 0;
        }

        
        

        
            this.update_animation();
            
            //Screen border checks
            
            if(this.x >= (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) ){//Right
                this.x_v = -this.x_v
                this.y_v = this.y_v
            }
            if(this.x <= 0){ //Left
                this.x_v = -this.x_v
                this.y_v = this.y_v
            }
            if(this.y >= (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) ){ //Bottom
                this.x_v = this.x_v
                this.y_v = -this.y_v
            }
            if(this.y <= 0){ //Top
                this.x_v = this.x_v
                this.y_v = -this.y_v
            }

            /*
            if(this.x >= (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) ){//Right
                this.x = 1;
            }
            if(this.x <= 0){ //Left
                this.x = window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']-1;
            }
            if(this.y >= (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) ){ //Bottom
                this.y = 1;
            }
            if(this.y <= 0){ //Top
                this.y = window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']-1;
            }*/
            
            //If we're not idle, then we should be moving!
            this.x += this.x_v;
            this.y += this.y_v;

            this.x_v += this.x_a;
            this.y_v += this.y_a;

            this.x_a = 0;
            this.y_a = 0;

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
        console.log(idle_state[random]);
        this.state = idle_state[random];
        this.cur_frame = 0;
        
        
    }

    flock(boids){
        
        this.align(boids);
        this.cohesion(boids);
        this.separation(boids);
    }



    align(boids){
        let perceptionRadius = 300;
        let total = 0;
        let steering_x = 0;
        let steering_y = 0;

        for(let other of boids){
            var a = this.x-other.x;
            var b = this.y-other.y;
            var d = Math.sqrt( a*a + b*b );

            if(other != this && d < perceptionRadius){
                steering_x += other.x_v;
                steering_y += other.y_v;
                total++;
            }
            
        }
        if(total > 0){
            steering_x /= total;
            steering_y /= total;
            
            if(steering_x < 0)
                steering_x = -this.maxSpeed;
            else 
                steering_x = this.maxSpeed;
            if(steering_y < 0)
                steering_y = -this.maxSpeed;
            else
                steering_y = this.maxSpeed;


            steering_x -= this.x_v
            steering_y -= this.y_v

            

            //limit x magnitude to a max of maxForce
            if(steering_x < -this.maxforce){
                steering_x = -this.maxforce;
            } else if(steering_x > this.maxforce){
                steering_x = this.maxforce;
            }

            //limit y magnitude to a max of maxForce
            if(steering_y < -this.maxforce){
                steering_y = -this.maxforce;
            } else if(steering_y > this.maxforce){
                steering_y = this.maxforce;
            }
        }
        //return steering_x,steering_y;
        this.x_a += steering_x;
        this.y_a += steering_y;
    }

    cohesion(boids){
        let perceptionRadius = 300;
        let total = 0;
        let steering_x = 0;
        let steering_y = 0;

        for(let other of boids){
            var a = this.x-other.x;
            var b = this.y-other.y;
            var d = Math.sqrt( a*a + b*b );

            if(other != this && d < perceptionRadius){
                steering_x += other.x;
                steering_y += other.y;
                total++;
            }
            
        }
        if(total > 0){
            steering_x /= total;
            steering_y /= total;
            steering_x -= this.x
            steering_y -= this.y

            if(steering_x < 0)
                steering_x = -this.maxSpeed;
            else 
                steering_x = this.maxSpeed;
            if(steering_y < 0)
                steering_y = -this.maxSpeed;
            else
                steering_y = this.maxSpeed;

            steering_x -= this.x_v
            steering_y -= this.y_v

            

            //limit x magnitude to a max of maxForce
            if(steering_x < -this.maxforce){
                steering_x = -this.maxforce;
            } else if(steering_x > this.maxforce){
                steering_x = this.maxforce;
            }

            //limit y magnitude to a max of maxForce
            if(steering_y < -this.maxforce){
                steering_y = -this.maxforce;
            } else if(steering_y > this.maxforce){
                steering_y = this.maxforce;
            }
        }
        //return steering_x,steering_y;
        this.x_a += steering_x;
        this.y_a += steering_y;
    }

    separation(boids){
        let perceptionRadius = 150;
        let total = 0;
        let steering_x = 0;
        let steering_y = 0;

        for(let other of boids){
            var a = this.x-other.x;
            var b = this.y-other.y;
            var d = Math.sqrt( a*a + b*b );

            if(other != this && d < perceptionRadius){
                var diff_x = this.x - other.x;
                var diff_y = this.y - other.y;

                diff_x /= d;
                diff_y /= d;

                steering_x += diff_x;
                steering_y += diff_y;
                total++;
            }
            
        }
        if(total > 0){
            steering_x /= total;
            steering_y /= total;

            if(steering_x < 0)
                steering_x = -this.maxSpeed;
            else 
                steering_x = this.maxSpeed;
            if(steering_y < 0)
                steering_y = -this.maxSpeed;
            else
                steering_y = this.maxSpeed;

            steering_x -= this.x_v
            steering_y -= this.y_v

            

            //limit x magnitude to a max of maxForce
            if(steering_x < -this.maxforce){
                steering_x = -this.maxforce;
            } else if(steering_x > this.maxforce){
                steering_x = this.maxforce;
            }

            //limit y magnitude to a max of maxForce
            if(steering_y < -this.maxforce){
                steering_y = -this.maxforce;
            } else if(steering_y > this.maxforce){
                steering_y = this.maxforce;
            }
        }
        //return steering_x,steering_y;
        this.x_a += steering_x;
        this.y_a += steering_y;
    }


    bound_hit(side){
            this.set_idle_state();
    } 

    random_velo(){
        var rand = Math.floor(Math.random() * 2);
        console.log(rand);
        if(rand == 0){
            return 10;
        } else if (rand == 1){
            return -10;
        }
    }

    random_pos_x(){
        var rand = Math.floor(Math.random() * (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']));

        return rand;
    }

    random_pos_y(){
        var rand = Math.floor(Math.random() * (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']));

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
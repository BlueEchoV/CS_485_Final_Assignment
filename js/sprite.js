class Sprite {
    constructor(sprite_json, x, y, start_state){
        // console.log("yo");
        this.sprite_json = sprite_json;
        this.x = x;
        this.y = y;
        this.state = start_state;
        this.root_e = "player";

        this.cur_frame = 0;

        this.cur_bk_data = null;

        this.x_v = 0;
        this.y_v = 0;

        this.projectile_speed = 10;

        this.set_v = 5;

        this.idle = false;

        this.count = 1;

        this.points = 0;

        this.ammo = 0;
        // Milliseconds
        this.ammo_CD = 750;
        this.ammo_Current_CD = 0;

        this.rock_Current_Fire_Interval = 0;
        // In milliseconds
        this.rock_Fire_Interval = 50;
        this.fire_Projectile = false;
    }

    draw(state){
        var ctx = canvas.getContext('2d');
        //console.log(state['key_change']);
        
        /*if(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] == null){
            console.log("loading");
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] = new Image();
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src = 'Penguins/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
        }*/
        
		/*
        if( this.cur_bk_data != null){
            ctx.putImageData(this.cur_bk_data , (this.x - this.x_v) , (this.y - this.y_v));
        }

        this.cur_bk_data = ctx.getImageData(this.x, this.y, 
                        this.sprite_json[this.root_e][this.state][this.cur_frame]['w'], 
                        this.sprite_json[this.root_e][this.state][this.cur_frame]['h']);
	   */             
            
        ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'], this.x, this.y );

        this.count += 1;

        if(this.count % 10 == 0){
            this.cur_frame = this.cur_frame + 1;
            this.count = 1;
        }

        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
            //console.log(this.cur_frame);
            this.cur_frame = 0;
        }

        //If key input, move and update our animations based on velocity
        if(state['key_change'] == true){
            this.move(state['key_press']);
            this.update_animation();
        } else { //If no key input, then we shouldn't be moving
            this.x_v = 0;
            this.y_v = 0;
        }

        // *****************PROJECTILE*****************
        // rock_Current_Fire_Interval is how fast the rocks fire when spacebar is held down
        if (this.rock_Current_Fire_Interval <= 0) {
            if (spacebar_Pressed) {
                this.fire_Projectile = true;
                this.rock_Current_Fire_Interval = this.rock_Fire_Interval;
            }
        } else {
            // console.log("rock_Current_Fire_Interval", rock_Current_Fire_Interval);
            this.rock_Current_Fire_Interval -= delta_Time;
            this.fire_Projectile = false;
        }
        // Passed in through the dictionary
        if(this.fire_Projectile){
            if (this.ammo > 0) {
                this.fire_projectile(state);
                // console.log("Rock read");
                this.ammo -= 1;
            }
        }
        if (this.ammo_Current_CD <= 0) {
            // console.log("ammo_Current_CD", this.ammo_Current_CD);
            console.log("ammo", this.ammo);
            this.ammo += 1;
            this.ammo_Current_CD = this.ammo_CD;
        } else {
            this.ammo_Current_CD -= delta_Time;
        }
        // ********************************************

        if(this.idle == false){
            //Screen border checks
            if(this.x >= (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) ){//Right
                if(state['key_press']["RIGHT"] != null){ //These checks allow us to keep moving at the screen border, without leaving the screen.
                    this.x_v = 0;
                }
            }
            if(this.x <= 0){ //Left
                if(state['key_press']["LEFT"] != null){
                    this.x_v = 0;
                }
            }
            if(this.y >= (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) ){ //Bottom
                if(state['key_press']["DOWN"] != null){
                    this.y_v = 0;
                }
            }
            if(this.y <= 0){ //Top
                if(state['key_press']["UP"] != null){
                    this.y_v = 0;
                }
            }
            
            //If we're not idle, then we should be moving!
            this.x = this.x + this.x_v;
            this.y = this.y + this.y_v;
                
            //If we have no velocity and no key inputs, set ourselves to idle. By checking for key input it allows us to keep playing movement animations at screen border to create cleaner gameplay
            if(this.x_v == 0 && this.y_v == 0 && state['key_change'] == false){
                this.set_idle_state();
            }
        }

        this.detect_collision(state['foreground_sprites']);

        return false;
        
    }

    set_idle_state(){
        this.idle = true;
        this.x_v = 0;
        this.y_v = 0;
        
        const idle_state = ["idle"];

        const random = Math.floor(Math.random() * idle_state.length);
        console.log(idle_state[random]);
        this.state = "idle";
        this.cur_frame = 0;
    }

    fire_projectile(state){
        var x = state["mouse_coords"]["x"];
        var y = state["mouse_coords"]["y"];

        var angle = Math.atan2(y - this.y, x-this.x);
        var proj_x_v = Math.cos(angle);
        var proj_y_v = Math.sin(angle);

        state["foreground_sprites"].push( new projectile(state["rock_data"], "move", this.x,this.y, this.projectile_speed*proj_x_v, this.projectile_speed*proj_y_v) );

        //console.log(angle + " " + proj_x_v + " " + proj_y_v);
    }

    bound_hit(side){
            this.set_idle_state();
    } 

    move(key){
            this.idle = false;

            if(key["UP"] != null){
                this.y_v = -this.set_v;
            } else if (key["DOWN"] != null){
                this.y_v = this.set_v;
            } else {
                this.y_v = 0;
            }

            if(key["RIGHT"] != null){
                this.x_v = this.set_v;
            } else if (key["LEFT"] != null) {
                this.x_v = -this.set_v;
            } else {
                this.x_v = 0;
            }
    }

    detect_collision(others){
       for(var i = 0; i < others.length; i++){
            //Check if collided with any sprites
            if( this.x <= (others[i].x + others[i].sprite_json[others[i].root_e][others[i].state][others[i].cur_frame]['w']) &&
                (this.x + this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) >= others[i].x && 
                this.y <= (others[i].y + others[i].sprite_json[others[i].root_e][others[i].state][others[i].cur_frame]['h']) && 
                (this.y + this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) >= others[i].y){
                    
                    //If collided with enemy spider
                    if(others[i].enemy){
                        // console.log("you died LOL");
                    }
                    if(others[i].constructor.name == "Boid"){
                        others.splice(i, 1);
                        this.points += 1;
                    }
            }
        }
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

}

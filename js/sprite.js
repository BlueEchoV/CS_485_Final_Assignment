//Parent Sprit Classa
class Sprite {
    constructor(sprite_json, x, y, start_state){
        this.sprite_json = sprite_json;
        this.x = x;
        this.y = y;
        this.state = start_state;
        this.root_e = "TenderBud";

        this.cur_frame = 0;

        this.cur_bk_data = null;

        this.x_v = 0;
        this.y_v = 0;

        

        this.idle = false;

        this.count = 1;
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

        //If key input, move and update our animations based on velocity
        if(state['key_change'] == true){
            this.move(state['key_press']);
            this.update_animation();
        } else { //If no key input, then we shouldn't be moving
            this.x_v = 0;
            this.y_v = 0;
        }

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

    bound_hit(side){
            this.set_idle_state();
    } 

    move(key){
            this.idle = false;

            if(key["UP"] != null){
                this.y_v = -10;
            } else if (key["DOWN"] != null){
                this.y_v = 10;
            } else {
                this.y_v = 0;
            }

            if(key["RIGHT"] != null){
                this.x_v = 10;
            } else if (key["LEFT"] != null) {
                this.x_v = -10;
            } else {
                this.x_v = 0;
            }

            

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

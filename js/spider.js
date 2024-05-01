class spider{
    constructor(sprite_json, start_state){
        this.sprite_json = sprite_json;

        this.state = start_state;
        this.root_e = "spider";

        this.cur_frame = 0;

        this.cur_bk_data = null;

        this.x_v = 0;
        this.y_v = 0;

        this.set_v = 1; //speed of the object

        this.count = 1;

        this.x = this.random_pos_x();
        this.y = this.random_pos_y();

        this.enemy = true; //declare this ogject as an enemy to the player, can add more attributes like damage, health, etc later

    }

    draw(state){
        var ctx = canvas.getContext('2d');

        

        if( this.cur_bk_data != null){
            ctx.putImageData(this.cur_bk_data , (this.x - this.x_v) , (this.y - this.y_v));
        }

        this.cur_bk_data = ctx.getImageData(this.x, this.y, 
            this.sprite_json[this.root_e][this.state][this.cur_frame]['w'], 
            this.sprite_json[this.root_e][this.state][this.cur_frame]['h']);

            
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

        //Move towards player
        this.track_player(state['foreground_sprites']);


        


            //If we're not idle, then we should be moving!
            this.x += this.x_v;
            this.y += this.y_v;


        this.update_animation();
        
        

        return false;
        
    }



    bound_hit(side){
            this.set_idle_state();
    } 



    random_pos_x(){
        var rand = Math.floor(Math.random() * (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']));

        return rand;
    }

    random_pos_y(){
        var rand = Math.floor(Math.random() * (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']));

        return rand;
    }

    track_player(sprites){
        //Move towards x coordinate of main actor
        for(var sprite of sprites){
            if(sprite.constructor.name == "Sprite"){

                if(this.x == sprite.x){
                    this.x_v = 0;
                    //console.log("3")
                } else if(this.x < sprite.x){
                    //console.log("4")
                    this.x_v = this.set_v;
                } else {
                    this.x_v = -this.set_v;
                }
        
                //Move towards y coordinate of main actor
                if(this.y == sprite.y){
                    //console.log("1")
                    this.y_v = 0;
                }else if(this.y < sprite.y){
                    //console.log("2")
                    this.y_v = this.set_v;
                } else {
                    this.y_v = -this.set_v;
                }
            }

            
        }
        
    }

    update_animation(){
        //Change animation correlated to the direction we're moving
        
        /*
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
        }*/
        

        //Check if our new animation will put us out of bounds, and if so set current frame to 0
        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
            this.cur_frame = 0;
        }
    }
}
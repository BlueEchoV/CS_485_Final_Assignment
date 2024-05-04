class projectile{
    constructor(sprite_json, start_state, x, y, x_v, y_v){
        this.sprite_json = sprite_json;

        this.state = start_state;
        this.root_e = "rock";

        this.cur_frame = 0;

        this.cur_bk_data = null;

        this.x = x;
        this.y = y;

        this.x_v = x_v;
        this.y_v = y_v;

        this.set_v = 1; //speed of the object

        this.count = 1;

        this.damage = 1;
    }

    draw(state){
        var ctx = canvas.getContext('2d');

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

        //If we're not idle, then we should be moving!
        this.x += this.x_v;
        this.y += this.y_v;

        this.check_bounds(state);

        //check if colliding with enemy
        this.detect_collision(state['foreground_sprites']);


        this.update_animation();

        return false;
        
    }

    bound_hit(side){
            this.set_idle_state();
    } 

    check_bounds(state){
        //Screen border checks
        if(this.x >= (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) ){//Right
            this.delete_self(state);
        }
        if(this.x <= 0){ //Left
            this.delete_self(state);
        }
        if(this.y >= (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) ){ //Bottom
            this.delete_self(state);
        }
        if(this.y <= 0){ //Top
            this.delete_self(state);
        }
    }

    delete_self(state){
        for(var i = 0; i < state["foreground_sprites"].length; i++){
            if(state["foreground_sprites"][i] == this){
                state["foreground_sprites"].splice(i, 1);
                console.log("deleted projectile");
            }
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
                        others[i].hp -= this.damage;
                        console.log("boss HP", others[i].hp);
                        if(!others[i].small_enemy){ //don't delete rock if small enemy
                            others.splice(others.indexOf(this),1); //delete self
                        }
                        if (others[i].hp <= 0) {
                            others.splice(i, 1); //delete enemy  
                        }
                     }
                     
             }
         }
     }

    update_animation(){
        // Check if our new animation will put us out of bounds, and if so set current frame to 0
        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
            this.cur_frame = 0;
        }
    }
}
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
		this.test_bool = true;
		this.is_idle = false;
        
		// For preloading the images like in the previous project
        this.images_Loaded = false;
        this.total_Images = 0;
        this.loaded_Images = 0;

        this.pre_load_Images();
    }

	pre_load_Images() {
		console.log("Inside preload_images");
		for (var state_Key in this.sprite_json[this.root_e]) {
			var frames = this.sprite_json[this.root_e][state_Key];
			for (var i = 0; i < frames.length; i++) {
				var image_Path = 'Penguins/' + this.root_e + '/' + state_Key + '/' + i + '.png';
				this.total_Images++;
				var image = new Image();
				// Binds the current instance of the Sprite class 'this' to the on_Image_Load functoin, 
				// ensuring that when the image finishes loading and the function is called, it executes 
				// with the correct context. This allows the fnuction to access and manipulate the
				// properties of the Sprite instance (all the variables in on_Image_Load())
				image.onload = this.on_Image_Load.bind(this);
				image.src = image_Path;
				frames[i].img = image;
			}
		}
	}

    on_Image_Load() {
        this.loaded_Images++;
        if (this.loaded_Images == this.total_Images) {
            this.all_Images_Loaded();
        }
    }

    all_Images_Loaded() {
        this.images_Loaded = true;
		console.log("Total Images: " + this.total_Images);
        console.log('All sprite images have been loaded.');
    }
	
	set_x_v(new_x) {
		this.x_v = new_x;
	}
	set_y_v(new_y) {
		this.y_v = new_y;
	}
	set_state(new_state) {
		this.state = new_state;
	}

    draw(new_state){
		if (this.images_Loaded) {
			if (new_state == 'idle' && !this.is_idle) {
				this.cur_frame = 0;
				this.set_idle_state()
				this.is_idle = true;
			} else if (new_state != 'idle') {
					if (this.state != new_state) {
						 this.cur_frame = 0;
						 this.state = new_state;
						 this.is_idle = false;
				}
			}

			// .log(this.sprite_json[this.root_e][this.state][this.cur_frame]['img']);
		   var ctx = canvas.getContext('2d');
			// console.log(this.sprite_json[this.root_e][this.state][this.cur_frame]['w']);
		   //  console.log(state['key_change']);

			// NOTE: Need to preload the images instead. This is causing a ton of flickering of the images
			//if(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] == null){
			//    console.log("Trying to access: " + this.state);
			//    console.log(this.sprite_json[this.root_e][this.state][this.cur_frame]['img']);
			//    this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] = new Image();
			//    this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src = 'Penguins/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
			//	console.log(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src);
			//}

			if( this.cur_bk_data != null){
				ctx.putImageData(this.cur_bk_data , (this.x - this.x_v) , (this.y - this.y_v));
			}

			this.cur_bk_data = ctx.getImageData(this.x, this.y, 
							this.sprite_json[this.root_e][this.state][this.cur_frame]['w'], 
							this.sprite_json[this.root_e][this.state][this.cur_frame]['h']);
		
			// Redraws the context here so the background doesn't shift with the image
			// context.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'], this.x, this.y );

			this.cur_frame = this.cur_frame + 1;
			if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
				// console.log(this.cur_frame);
				this.cur_frame = 0;
			}

			if ((this.x + this.x_v) > (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) ){
				this.bound_hit('E');
				this.x = window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w'] ;
				console.log("bound_hit('E')");
			} else if((this.x + this.x_v) < 0){
				this.bound_hit('W');
				this.x = 0;
			console.log("bound_hit('W')");
			} else {
				this.x += this.x_v;
			}
				
			if((this.y + this.y_v) > (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']) ){
				this.bound_hit('S');
				this.y = window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h'];
				console.log("bound_hit('S')");
			}else if((this.y + this.y_v) < 0){
				this.bound_hit('N');
				this.y = 0;
				console.log("bound_hit('N')");
			}else{
				this.y = this.y + this.y_v;
			}

			return false;
		}
    }

    set_idle_state(){
        this.x_v = 0;
        this.y_v = 0;
        const idle_state = ["idle","idleBackAndForth","idleBreathing","idleFall","idleLayDown","idleLookAround","idleLookDown","idleLookLeft","idleLookRight","idleLookUp","idleSit","idleSpin","idleWave"];
        const random = Math.floor(Math.random() * idle_state.length);
        console.log(idle_state[random]);
		this.state = idle_state[random];
		// const idle_state = "idle";
        // this.state = idle_state;
    }

    bound_hit(side){
		if (side == 'E') {
			if (this.x_v > 0) {
				this.x_v = 0;
			}
		} else if (side == 'W') {
			if (this.x_v < 0) {
				this.x_v = 0;
			}
		}
		
		if (side == 'N') {
			if (this.y_v < 0) {
				this.y_v = 0;
			}
		} else if (side == 'S') {
			if (this.y_v > 0) {
				this.y_v = 0;
			}
		}
   } 


}
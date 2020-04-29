class Panel extends paper.Layer{
	constructor(x,y,width,height,toggleOn,slideAccel,fill,toggleOffCallback) {
	    super();
	    this.applyMatrix=false;
	    this.xPosition=0;//root for dummy variable
	    this.yPosition=0;//root for dummy variable
	    this.width=width;
	    this.height=height;
	    this.slideAccel=slideAccel;
	    this.slideVel=[0,0];
	    this.animating=false;
	    this.toggleOn=toggleOn;
	    this.toggleOffCallback=toggleOffCallback;
		this.bg = new paper.Path.Rectangle({
        	point: [0, 0],
        	size: [width, height],
        	fillColor: fill,
        });
        this.addChild(this.bg);
        this.position.x += x;
        this.position.y += y;
        if(!toggleOn){
            this.x=(slideAccel[0]==0)?0:-Math.sign(slideAccel[0])*width;
            this.y=(slideAccel[1]==0)?0:-Math.sign(slideAccel[1])*height;
        }
	}
	
	update(){
		if(this.animating){
		    //update x
		    this.slideVel[0]+=((this.toggleOn)?1:-1)*this.slideAccel[0];
		    var targetX=((this.toggleOn)?0:-Math.sign(this.slideAccel[0])*this.width);
		    var reachedX=false;
	        if(this.slideAccel[0]!=0 && Math.sign(this.x-targetX)==Math.sign(this.x+this.slideVel[0]-targetX)){//keep animating
	            this.x+=this.slideVel[0];
	        }else{
	            this.x=targetX;
	            this.slideVel[0]=0;
	            reachedX=true;
	        }
	        //update y
	        this.slideVel[1]+=((this.toggleOn)?1:-1)*this.slideAccel[1];
		    var targetY=((this.toggleOn)?0:-Math.sign(this.slideAccel[1])*this.height);
		    var reachedY=false;
	        if(this.slideAccel[1]!=0 && Math.sign(this.y-targetY)==Math.sign(this.y+this.slideVel[1]-targetY)){//keep animating
	            this.y+=this.slideVel[1];
	        }else{
	            this.y=targetY;
	            this.slideVel[1]=0;
	            reachedY=true;
	        }
	        //check if reached destination
	        if(reachedX && reachedY){
	            this.animating=false;
	            if(this.toggleOn==false && this.toggleOffCallback){
	                this.toggleOffCallback();
	            }
	        }
		}
	}
	get toggle(){
	    return this.toggleOn;
	}
	set toggle(value){
	    if(value != this.toggleOn){
	        this.toggleOn=value;
	        this.animating=true;
	    }
	}
	get x(){
	    return this.xPosition;
	}
	set x(value){
	    this.position.x += value-this.xPosition;
	    this.xPosition=value;
	}
}
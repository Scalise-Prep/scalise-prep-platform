class Scrollbar extends paper.Group{
	constructor(sliderWidth,color) {
	    super();
	    this.applyMatrix=false;
	    this.slider;
	    this.sliderWidth=sliderWidth;
	    this.sliderHeight;
	    this.windowHeight;
	    this.color=color;
	    this.slidePercentDummyVar=0;
	    this.activeDummy=true;
	    this.animating=true;
	    this.fadeRate=0.85;
	    this.mouseOver=false;
	}
	update(){
	    if(this.active && this.animating && this.mouseOver==false){
	        if(this.opacity>0.05){
	            this.opacity*=this.fadeRate;
	        }else{
	            this.opacity=0;
	            this.animating=false;
	        }
	    }
	}
	redraw2Screen(sliderHeight,windowHeight){
	    //remove old slider
	    if(this.slider){
	        this.slider.remove();
	    }
	    
	    //draw new slider
        this.sliderHeight=sliderHeight;
        this.windowHeight=windowHeight;
        var sliderSize=new paper.Size(this.sliderWidth,sliderHeight);
        var sliderRadius=new paper.Size(this.sliderWidth/2, this.sliderWidth/2);
	    this.slider = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0, 0), sliderSize), sliderRadius);
        this.slider.fillColor = this.color;
        this.slider.opacity=0.35;
        this.addChild(this.slider);
        
        //add mouse events
	    this.slider.onMouseEnter=this.mouseEnterHandler.bind(this);
	    this.slider.onMouseLeave=this.mouseLeaveHandler.bind(this);
	}
	mouseEnterHandler(event){
	    this.mouseOver=true;
	    this.opacity=1;
	    this.animating=true;
	}
	mouseLeaveHandler(event){
	    this.mouseOver=false;
	}
	get slidePercent(){
	    return this.slidePercentDummyVar;
	}
	set slidePercent(value){
	    this.slidePercentDummyVar=value;
	    this.slider.bounds.centerY=this.sliderHeight/2+(this.windowHeight-this.sliderHeight)*value;
	}
	get active(){
	    return this.activeDummy;
	}
	set active(value){
	    this.activeDummy=value;
	    if(value){
	        this.visible=true;
	    }else{
	        this.visible=false;
	    }
	}
}
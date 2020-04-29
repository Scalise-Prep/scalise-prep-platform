class FadeTag extends paper.Group{
	constructor(x,y,width,height,bgColor,bgOpacity,textString,font,fontSize,fontColor,fadeRate=0.925,fadeDelay=500,fadeInterval=20) {
	    super();
		this.applyMatrix=false;
		this.translate(new paper.Point(x,y));
		this.fadeRate=fadeRate;
		this.fadeDelay=fadeDelay;
		this.fadeInterval=fadeInterval;
		
		this.bg = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(width, height));
        this.bg.fillColor = bgColor;
        this.bg.opacity = bgOpacity;
        this.addChild(this.bg);
		
		if(textString.length){
    		this.text = new paper.PointText();
    		this.text.fontFamily=font;
    		this.text.justification='center';
    		this.text.fontSize=fontSize;
            this.text.content=textString;
            this.text.fillColor = fontColor;
            this.text.bounds.centerX=this.bg.bounds.centerX;
            this.text.bounds.centerY=this.bg.bounds.centerY;
            this.addChild(this.text);  
		}
        
        this.timer = setInterval(this.update.bind(this), 20);//updates the time value every 20 ms
	}
	update(){
	    if(this.fadeDelay>0){
	        this.fadeDelay-=this.fadeInterval;
	    }else if(this.opacity>=0.15){
	        this.opacity*=this.fadeRate;
	    }else{
	        clearInterval(this.timer);
            this.timer=null;
            this.remove();
	    }
	}
}
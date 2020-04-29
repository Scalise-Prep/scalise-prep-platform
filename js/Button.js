class Button extends paper.Group{
	constructor(myId,x,y,width,height,textString,fillColors,font,fontSize,fontColors,clickCallback,mouseDownCallback,mouseEndCallback,toggleOffBgColor="#FFFFFF") {
	    super();
	    this.myId=myId;
		this.mouseIsDown=false;
		this.transformContent = false;
		this.translate(new paper.Point(x,y));
		this.toggleDummy=true;
		this.toggleOffBgColor=toggleOffBgColor;
		
		this.setColors(fillColors,fontColors);
		
		this.clickCallback=clickCallback;
		this.mouseDownCallback=mouseDownCallback;
		this.mouseEndCallback=mouseEndCallback;
		
		this.bg = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(width, height));
        this.bg.fillColor = this.bgColorMain;
        this.addChild(this.bg);
        if(fillColors.length==0){
            this.bg.opacity=0;
        }
		
		this.text = new paper.PointText();
		this.text.fontFamily=font;
		this.text.justification='center';
		this.text.fontSize=fontSize;
        this.text.content=textString;
        this.text.fillColor = this.fontColorMain;
        this.text.position=[width/2,height/2];
        this.addChild(this.text);        
		
		//add mouse event callbacks
		this.onMouseEnter=this.mouseEnterListener;
		this.onMouseDown=this.mouseDownListener;
		this.onMouseUp=this.mouseUpListener;
		this.onMouseLeave = this.mouseLeaveListener;
		this.onClick = this.clickListener;
	}
	
	setColors(fillColors,fontColors){
	    if(fillColors.length==0){
		    this.bgColorMain="#FFFFFF"
    		this.bgColorOver=this.bgColorMain;
    		this.bgColorActive=this.bgColorMain;
		}else{
    		this.bgColorMain=fillColors[0];
    		this.bgColorOver=fillColors[1];
    		this.bgColorActive=fillColors[2];
		}
		this.fontColorMain=fontColors[0];
		this.fontColorOver=fontColors[1];
		this.fontColorActive=fontColors[2];
		
		if(this.toggle && this.bg && this.text){
		    this.bg.fillColor = this.bgColorMain;
		    this.text.fillColor = this.fontColorMain;
		}
	}
	mouseEnterListener(event){
	    if(!this.toggle){
	        return
	    }
		this.bg.fillColor = this.bgColorOver;
		this.text.fillColor = this.fontColorOver;
		document.body.style.cursor = "pointer";
	}
	mouseDownListener(event){
	    if(!this.toggle){
	        return
	    }
		this.bg.fillColor=this.bgColorActive;
		this.text.fillColor=this.fontColorActive;
		this.mouseIsDown=true;
		if(this.mouseDownCallback != null){
			this.mouseDownCallback(this.myId);
		}
	}
	mouseLeaveListener(event){
	    if(!this.toggle){
	        return
	    }
		this.bg.fillColor = this.bgColorMain;
		this.text.fillColor = this.fontColorMain;
		if(this.mouseIsDown && this.mouseEndCallback != null){
			this.mouseEndCallback(this.myId);
		}
		this.mouseIsDown=false;
		document.body.style.cursor = "default";
	}
	mouseUpListener(event){
	    if(!this.toggle){
	        return
	    }
		this.bg.fillColor = this.bgColorOver;
		this.text.fillColor = this.fontColorOver;
		if(this.mouseIsDown && this.mouseEndCallback != null){
			this.mouseEndCallback(this.myId);
		}
		this.mouseIsDown=false;
	}
	clickListener(event){
	    if(!this.toggle){
	        return
	    }
		if(this.clickCallback!=null){
			this.clickCallback(this.myId);
		}
	}
	
	get toggle(){
	    return this.toggleDummy;
	}
	set toggle(value){
	    if(value==this.toggleDummy){
	        return
	    }
	    if(value){
    		this.bg.fillColor = this.bgColorMain;
		    this.text.fillColor = this.fontColorMain;
		    this.text.opacity=1;
	    }else{
	        if(this.mouseIsDown){//treat this as a mouse end event
    	        if(this.mouseEndCallback != null){
    			    this.mouseEndCallback(this.myId);
    	        }
    	        this.mouseIsDown=false;
    		}
    		document.body.style.cursor = "default";
	        this.bg.fillColor = this.toggleOffBgColor;
		    this.text.fillColor = "#898989";
		    this.text.opacity=0.5;
	    }
		this.toggleDummy=value;
	}
}
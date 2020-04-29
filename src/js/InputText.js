class InputText extends paper.Group{
	constructor(defaultString,width,height,rounding,padding,fontFamily,fontSize,fontColor,selectedStrokeColor,highlightColor,justify,maxChars,password,multiline) {
	    super();
	    this.applyMatrix=false;
	    this.width=width;
	    this.height=height;
	    this.activeDummy=false;
	    this.stringDummy="";
	    this.cursorPosDummy=0;
	    this.bgStrokeColorActive=selectedStrokeColor;
	    this.bgStrokeColorInactive="#FFFFFF";
	    this.defaultString=defaultString;
	    this.mouseDownCursorPos=-1;
	    this.selectedChars=[-1,-1];
	    this.highlightColor=highlightColor;
	    this.maxChars=maxChars;
	    this.isPassword=password;
	    
	    
	    //draw background box
	    this.bg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(width, height)),[rounding,rounding]);
        this.bg.fillColor = "#EEEEEE";
        this.addChild(this.bg);
        
	    //construct text
	    if(multiline){
	        this.text = new MultilineText(defaultString,width-2*padding,justify,fontFamily,fontSize,fontColor,1);
	        this.text.bounds.centerX=width/2;
            this.text.bounds.top=this.bg.bounds.top+padding;
            this.addChild(this.text);
	    }else{
	        this.text = new paper.PointText();
		    this.text.fontFamily=fontFamily;
		    this.text.justification=justify;
		    this.text.fontSize=fontSize;
            this.text.fillColor = fontColor;
            this.text.content="X";
            this.addChild(this.text);
            this.text.position.x=width/2;
            this.text.position.y=height/2;
	    }
	    this.string="";
	    
	    //cursor
        this.cursor = new paper.Path.Line([0,0.2*height], [0,0.8*height]);
        this.cursor.opacity=0.4;
        this.cursor.visible=false;
        this.addChild(this.cursor);
        this.cursor.strokeColor = 'black';
	    
	    //add event listeners
	    this.onMouseDown=this.mouseDownHandler.bind(this);
	    this.onMouseUp=this.mouseUpHandler.bind(this);
	    this.onDoubleClick=this.doubleClickHandler.bind(this);
	    this.keyDownCallback=this.onKeyDown.bind(this);
	    this.mouseDownWindowCallback=this.onMouseDownWindow.bind(this);
	    window.addEventListener('mousedown', this.mouseDownWindowCallback);
	    window.addEventListener('keydown', this.keyDownCallback);
	}
	mouseDownHandler(event){
	    this.mouseDownCursorPos=this.getCursorFromX(this.globalToLocal(event.point).x);
	}
	mouseUpHandler(event){
	    var mouseUpCursorPos=this.getCursorFromX(this.globalToLocal(event.point).x);
	    if(this.mouseDownCursorPos>-1 && this.mouseDownCursorPos!=mouseUpCursorPos){
	        this.selectedChars=[Math.min(this.mouseDownCursorPos,mouseUpCursorPos-1),Math.max(this.mouseDownCursorPos,mouseUpCursorPos-1)];
	    }else{
		    this.cursorPos=mouseUpCursorPos;
		    this.selectedChars=[-1,-1];
	    }
	    this.active=true;
	}
	doubleClickHandler(event){
	    if(this.string.length>0){
	        this.selectedChars=[0,this.string.length-1];
	    }
	}
	getCursorFromX(x){
	    if(this.string.length==0){
	        return 0;
	    }
	    for(var i=0;i<this.string.length;i++){
	        var charLeftX=this.getRHSofNthChar(i-1);
	        var charRightX=this.getRHSofNthChar(i);
	        var charCenterX=(charLeftX+charRightX)/2;
	        if(x<charCenterX){
	            return i;
	        }
	    }
	    return this.string.length;
	}
	onKeyDown(event){
	    if(this.active){
    	    if(event.metaKey || event.ctrlKey){//special
                if(event.keyCode==65 && this.string.length>0){//command-A (select all)
                    this.selectedChars = [0,this.string.length-1];
                }
                
    	    }else if(event.keyCode==27){//esc
    	        if(this.selectedChars[0]>-1){
    	            this.selectedChars=[-1,-1];
    	            this.cursorPos=0;
    	        }
    	    }else if(event.keyCode==37){//left arrow
    	        if(this.selectedChars[0]>-1){
    	            this.cursorPos=this.selectedChars[0];
    	        }else{
    	            this.cursorPos=Math.max(0,this.cursorPos-1);
    	        }
    	    }else if(event.keyCode==39){//right arrow
        	    if(this.selectedChars[0]>-1){
        	        this.cursorPos=this.selectedChars[1]+1;
        	    }else{
    	            this.cursorPos=Math.min(this.string.length,this.cursorPos+1);
        	    }
    	    }else if(event.keyCode==32 || (event.keyCode>=48 && event.keyCode<=90) || (event.keyCode>=96 && event.keyCode<=111) || (event.keyCode>=186 && event.keyCode<=222)){
    	        if(event.keyCode==32){//space
    	            event.preventDefault();
    	        }
    	        
    	        if(this.selectedChars[0]>-1){
    	            this.string=this.string.slice(0,this.selectedChars[0])+event.key+((this.selectedChars[1]+1<this.string.length)?this.string.slice(this.selectedChars[1]+1,this.string.length):"");
    	            this.cursorPos=Math.max(0,this.selectedChars[0]+1);
    	        }else if(this.string.length<this.maxChars){
        	        this.string=this.string.slice(0,this.cursorPos)+event.key+((this.cursorPos<this.string.length)?this.string.slice(this.cursorPos,this.string.length):"");
        	        this.cursorPos++;
    	        }
    	    }else if(event.keyCode==8 || event.keyCode==46){//backspace || delete
    	        if(this.string.length>0){
    	            if(this.selectedChars[0]>-1){
        	            this.string=this.string.slice(0,this.selectedChars[0])+((this.selectedChars[1]+1<this.string.length)?this.string.slice(this.selectedChars[1]+1,this.string.length):"");
        	            this.cursorPos=Math.max(0,this.selectedChars[0]);
        	        }else if(this.cursorPos>0){
        	            this.string=this.string.slice(0,this.cursorPos-1)+((this.cursorPos<this.string.length)?this.string.slice(this.cursorPos,this.string.length):"");
        	            this.cursorPos=Math.max(0,this.cursorPos-1);
        	        }
    	        }
    	    }
	    }
	}
	onMouseDownWindow(event){//any time mouseDown on window, regardles of location
	    var cursorPos=this.parent.globalToLocal([event.x,event.y]);
	    if(!cursorPos.isInside(this.bounds)){
	        this.active=false;
	    }
	    this.selectedChars=[-1,-1];
	}
	getRHSofNthChar(n){
	    if(n==-1){//technically this is LHS of 0th char
	        return this.text.bounds.left;
	    }
	    var clone=this.text.clone();
	    clone.visible=false;
	    clone.content=clone.content.slice(0,n+1);
	    clone.bounds.left=this.text.bounds.left;
	    var returnValue=clone.bounds.right;
	    clone.remove();
	    clone=null;
	    return returnValue;
	}
	get selectedChars(){
	    return this.selectedCharsDummy;
	}
	set selectedChars(value){
	    this.selectedCharsDummy=value;
	    if(value[0]>-1){
	        var a=this.getRHSofNthChar(value[0]-1);
	        var b=this.getRHSofNthChar(value[1]);
	        this.highlighter = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(a,0.2*this.height), new paper.Size(b-a, 0.6*this.height)));
            this.highlighter.fillColor = this.highlightColor;
            this.highlighter.opacity=0.25;
            this.addChild(this.highlighter);
            this.cursor.visible=false;
	    }else{
	        if(this.highlighter){
	            this.highlighter.remove();
	            this.highlighter=null;
	        }
	    }
	}
	get cursorPos(){
	    return this.cursorPosDummy;
	}
	set cursorPos(value){
	    this.cursorPosDummy=value;
	    this.cursor.position.x=this.getRHSofNthChar(value-1);
	    if(this.string.length>0 || this.active){
	        this.cursor.visible=true;
	    }
	    this.selectedChars=[-1,-1];
	}
	get string(){
	    return this.stringDummy;
	}
	set string(value){
	    this.stringDummy=value;
	    if(value.length>0){
	        if(this.isPassword){
	            this.text.content="*".repeat(value.length);
	        }else{
	            this.text.content=value;
	        }
	        this.text.opacity=1;
	    }else{
	        this.text.content=this.defaultString;
	        this.text.opacity=0.5;
	    }
	}
	get active(){
		return this.activeDummy
	}
	set active(value){
		if(this.activeDummy!=value){
			this.activeDummy=value;
			this.bg.strokeColor=(value)?this.bgStrokeColorActive:this.bgStrokeColorInactive;
		}
		if(value==false){
		    this.cursor.visible=false;
		    this.selectedChars=[-1,-1];
		}else{
		    if(this.cursor.visible==false && this.selectedChars[0]==-1 && this.selectedChars[1]==-1){
		        this.cursorPos=0;
	            this.cursor.visible=true;
		    }
		    //unfocus video
            window.dispatchEvent(new CustomEvent('requestVideoUnfocus'));
		}
	}
	remove(){
	    window.removeEventListener('keydown', this.keyDownCallback);
	    window.removeEventListener('mousedown', this.mouseDownWindowCallback);
	    super.remove();
	}
}
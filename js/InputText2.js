class InputText2 extends paper.Group{
	constructor(defaultString,width,numRows,padding,fontFamily,fontSize,fontColor,selectedStrokeColor,highlightColor,justify,maxChars,password) {
	    super();
	    this.applyMatrix=false;
	    this.width=width;
	    this.numRows=numRows;
	    this.padding=padding;
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
	    this.justification=justify;
	    this.myFontFamily=fontFamily;
	    this.myFontSize=fontSize;
	    
	    //construct text
	    this.lineSpacing=1;
	    if(numRows>1){
	        //get line height
	        var temp = new paper.PointText();
		    temp.fontFamily=fontFamily;
		    temp.fontSize=fontSize;
            temp.content="X";
            this.lHeight=temp.bounds.height;
            //construct multilineText
	        this.text = new MultilineText("X",width-2*padding,justify,fontFamily,fontSize,fontColor,this.lineSpacing);
	        this.text.bounds.centerX=width/2;
            this.text.bounds.top=padding;
            this.addChild(this.text);
	    }else{
	        this.text = new paper.PointText();
		    this.text.fontFamily=fontFamily;
		    this.text.justification=justify;
		    this.text.fontSize=fontSize;
            this.text.fillColor = fontColor;
            this.text.content="X";
            this.lHeight=this.text.bounds.height;
            this.addChild(this.text);
            this.text.position.x=width/2;
            this.text.position.y=this.lHeight/2+padding;
	    }
	    this.string="";
	    
	    //draw background box
	    this.bg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(width, (numRows+1)*padding+numRows*this.lHeight+(numRows-1)*this.lineSpacing)),[this.lHeight/2+padding,this.lHeight/2+padding]);
        this.bg.fillColor = "#EEEEEE";
        this.addChild(this.bg);
        this.bg.sendToBack();
	    
	    //cursor
        this.cursor = new paper.Path.Line([0,padding], [0,this.lHeight+padding]);
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
	    this.active=false;
	    this.selectedChars=[-1,-1];
	}
	getRHSofNthChar(n){
	    if(n==-1){//technically this is LHS of 0th char
	        if(this.numRows==1){
	            return this.text.bounds.left;
	        }else{
	            var topRowString=this.text.getStringInRow(0);
	            var topRow = new paper.PointText();
	            this.addChild(topRow);
	            topRow.visible=false;
		        topRow.fontFamily=this.myFontFamily;
		        topRow.justification=this.justification;
		        topRow.fontSize=this.myFontSize;
                topRow.content=topRowString;
                if(this.justification=="left"){
                    topRow.bounds.left=this.text.bounds.left;
                }else if(this.justification=="right"){
                    topRow.bounds.right=this.text.bounds.right;
                }else{//center
                    topRow.bounds.centerX=this.text.bounds.centerX;
                }
	            var returnValue=topRow.bounds.left;
        	    topRow.remove();
        	    topRow=null;
        	    return returnValue;
	        }
	    }
	    if(this.numRows==1){
	        var clone=this.text.clone();
	        clone.visible=false;
	        clone.content=clone.content.slice(0,n+1);
	        clone.bounds.left=this.text.bounds.left;
	        var returnValue=clone.bounds.right;
    	    clone.remove();
    	    clone=null;
	    }else{
	        console.log("multiline");
	        var rowIndex=this.text.getCharacterRow(n);
	        var rowString=this.text.getStringInRow(rowIndex);
	        //create a single line text that matches the current row
	        var row = new paper.PointText();
	        row.visible=false;
	        this.addChild(row);
		    row.fontFamily=this.myFontFamily;
		    row.justification=this.justification;
		    row.fontSize=this.myFontSize;
            row.content=rowString;
            if(this.justification=="left"){
                row.bounds.left=this.text.bounds.left;
            }else if(this.justification=="right"){
                row.bounds.right=this.text.bounds.right;
            }else{//center
                row.bounds.centerX=this.text.bounds.centerX;
            }
            //check if given character is the last in the row (or, the line breaking space after the last character)
            var charIndexInRow=n-this.text.getStringBeforeRow(rowIndex).length;
            console.log(n);
            console.log(rowIndex);
            console.log(this.text.getStringBeforeRow(rowIndex).length);
            console.log(charIndexInRow+" "+(rowString.length-1));
            if(charIndexInRow<rowString.length-1){
                console.log("a");
	            var clone=row.clone();
    	        clone.visible=false;
    	        clone.content=clone.content.slice(0,charIndexInRow+1);
    	        clone.bounds.left=row.bounds.left;
    	        var returnValue=clone.bounds.right;
        	    clone.remove();
        	    clone=null;
            }else{
                console.log("b");
                var returnValue=row.bounds.right;
	        }
	        row.remove();
        	row=null;
	    }
	    return returnValue;
	}
	get selectedChars(){
	    return this.selectedCharsDummy;
	}
	set selectedChars(value){
	    if(this.highlighter){
            this.highlighter.remove();
            this.highlighter=null;
        }
	    this.selectedCharsDummy=value;
	    if(value[0]>-1){
	        var a=this.getRHSofNthChar(value[0]-1);
	        var b=this.getRHSofNthChar(value[1]);
	        this.highlighter = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(a,this.padding), new paper.Size(b-a, this.lHeight+this.padding)));
            this.highlighter.fillColor = this.highlightColor;
            this.highlighter.opacity=0.25;
            this.addChild(this.highlighter);
            this.cursor.visible=false;
	    }
	}
	get cursorPos(){
	    return this.cursorPosDummy;
	}
	set cursorPos(value){
	    this.cursorPosDummy=value;
	    this.cursor.position.x=this.getRHSofNthChar(value-1);
	    if(this.string.length>0){
	        this.cursor.visible=true;
	    }else{
	        this.cursor.visible=false;
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
		}
	}
	remove(){
	    window.removeEventListener('keydown', this.keyDownCallback);
	    window.removeEventListener('mousedown', this.mouseDownWindowCallback);
	    super.remove();
	}
}
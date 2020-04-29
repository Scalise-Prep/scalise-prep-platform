class SuperText extends paper.Group{
	constructor(string,defaultString,width,padding,rounding,align,fontFamily,fontSize,fontColor,highlightColor,bgColor,activeStrokeColor,editable,maxChars,maxLines,isPassword,lineSpacingCoefficient=1.08,loseFocusCallback=null) {
	    super();
	    this.applyMatrix=false;
	    //store input parameters
	    this.stringDummy=string;
	    this.defaultString=defaultString;
	    this.padding=padding;
	    width=width-2*padding[0];
	    this.width=width;
	    this.align=align;
	    this.myFontFamily=fontFamily;
	    this.myFontSize=fontSize;
	    this.fontColor=fontColor;
	    this.highlightColor=highlightColor;
	    this.maxLines=maxLines;
	    this.editable=editable;
	    this.maxChars=maxChars;
	    this.isPassword=isPassword;
	    this.loseFocusCallback=loseFocusCallback;
	    //Internal variables
	    this.lineSpacingCoefficient=lineSpacingCoefficient;//distance between lines of multiline text, normalized by the height of a single line
	    this.lineHandles=[];
	    this.lineContainer=new paper.Group();
	    this.addChild(this.lineContainer);
	    this.lineContainer.applyMatrix=false;
	    this.lineStrings=[];
	    this.forcedLineBreaks=[];
	    this.cursorPosDummy=0;
	    this.mouseDownChar=-1;
	    this.lastMouseUpChar=0;
	    this.bg;
	    this.selectedCharsDummy=[-1,-1];
	    this.highlightContainer=new paper.Group();
	    this.addChild(this.highlightContainer);
	    this.highlightContainer.applyMatrix=false;
	    this.foregroundContainer=new paper.Group();
	    this.addChild(this.foregroundContainer);
	    this.foregroundContainer.applyMatrix=false;
	    this.isShiftDown=false;
	    //calculate the height of a single line
	    var dummyText=this.createBasicText("X");
	    dummyText.visible=false;
	    this.myLineHeight=dummyText.bounds.height;
	    dummyText.remove();
        dummyText=null;
        this.activeDummy=false;
		this.bgStrokeColorActive=activeStrokeColor;
		this.bgStrokeColorInactive=bgColor;
		this.bgColor=bgColor;
		
		//draw background
		if(this.bgColor){
    	    if(this.align=="center"){
    		    var bgLeft=-width/2-padding[0];
    		}else if(this.align=="right"){
    		    var bgLeft=-width-padding[0];
    		}else{//"left" or justify, which still is fixed to the left bound
    		    var bgLeft=-padding[0];
    		}
    	    this.bg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(bgLeft,-padding[1]), new paper.Size(width+2*padding[0], 2*padding[1]+this.myLineHeight*(1+this.lineSpacingCoefficient*(this.maxLines-1)))),[rounding,rounding]);
            this.bg.fillColor = (this.bgColor)?this.bgColor:"#000000";
            this.bg.opacity=(this.bgColor)?1:0;
            this.addChild(this.bg);
            this.bg.sendToBack();
		}

	    //draw cursor
	    if(this.editable){
            this.cursor = new paper.Path.Line([0,0], [0,this.myLineHeight]);
            this.cursor.opacity=0.4;
            this.cursor.visible=false;
            this.addChild(this.cursor);
            this.cursor.strokeColor = 'black';
	    }
	    
	    //add event listeners
	    this.onMouseEnter=this.mouseEnterListener.bind(this);
	    this.onMouseDown=this.mouseDownHandler.bind(this);
	    this.onMouseMove=this.mouseMoveHandler.bind(this);
	    this.onMouseUp=this.mouseUpHandler.bind(this);
		this.onMouseLeave = this.mouseLeaveListener.bind(this);
		this.onDoubleClick=this.doubleClickHandler.bind(this);
	    this.keyDownCallback=this.onKeyDown.bind(this);
	    window.addEventListener('keydown', this.keyDownCallback);
	    this.keyUpCallback=this.onKeyUp.bind(this);
	    window.addEventListener('keyup', this.keyUpCallback);
	    this.mouseDownWindowCallback=this.onMouseDownWindow.bind(this);
	    window.addEventListener('mousedown', this.mouseDownWindowCallback);
	    this.videoChangeStatusCallback=this.onVideoChangeStatus.bind(this);
	    window.addEventListener('videoChangeStatus', this.videoChangeStatusCallback.bind(this), false);
	    
	    this.string=this.string;//render the text
	    
	    //draw foreground (prevents mouseout from triggering on children)
	    if(this.align=="center"){
		    var fgLeft=-width/2-padding[0];
		}else if(this.align=="right"){
		    var fgLeft=-width-padding[0];
		}else{//"left" or justify, which still is fixed to the left bound
		    var fgLeft=-padding[0];
		}
	    this.fg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(fgLeft,-padding[1]), new paper.Size(width+2*padding[0], 2*padding[1]+this.myLineHeight*(1+this.lineSpacingCoefficient*(this.maxLines-1)))),[rounding,rounding]);
        this.fg.fillColor="#FF0000";
        this.fg.opacity = 0;
        this.foregroundContainer.addChild(this.fg);
	}
	
	mouseEnterListener(event){
	    if(this.editable){
		    document.body.style.cursor = "text";
	    }
	}
	mouseLeaveListener(event){
	    if(this.editable){
		    document.body.style.cursor = "default";
	    }
	    if(this.mouseDownChar>-1){
    	    this.mouseDownChar=-1;
	    }
	}
	mouseDownHandler(event){
	    if(this.editable){
	        this.mouseDownChar=this.getCharIndexFromPoint(this.globalToLocal(event.point));
	        this.selectedChars=[-1,-1];
	    }
	}
	mouseMoveHandler(event){
	    if(this.editable && this.mouseDownChar>-1){
	        var currentMouseChar = this.getCharIndexFromPoint(this.globalToLocal(event.point));
	        if(currentMouseChar!=this.mouseDownChar){
	            this.selectedChars=[Math.min(this.mouseDownChar,currentMouseChar),Math.max(this.mouseDownChar,currentMouseChar)-1];
	            this.cursor.visible=false;
	        }
	    }
	}
	mouseUpHandler(event){
	    if(this.editable){
	        var mouseUpCursorPos=this.getCharIndexFromPoint(this.globalToLocal(event.point));
	        if(this.isShiftDown && this.lastMouseUpChar!=mouseUpCursorPos){//shift-click selecting text
	            this.selectedChars=[Math.min(this.lastMouseUpChar,mouseUpCursorPos),Math.max(this.lastMouseUpChar,mouseUpCursorPos)-1];
	            this.cursor.visible=false;
	        }else if(this.mouseDownChar>-1 && mouseUpCursorPos!=this.mouseDownChar){
	            this.selectedChars=[Math.min(this.mouseDownChar,mouseUpCursorPos),Math.max(this.mouseDownChar,mouseUpCursorPos)-1];
	            this.cursor.visible=false;
	        }else{
	            this.cursorPos=mouseUpCursorPos;
	            this.cursor.visible=true;
	        }
    	    this.active=true;
    	    this.mouseDownChar=-1;
    	    this.lastMouseUpChar=mouseUpCursorPos;
	    }
	}
	doubleClickHandler(event){
	    if(this.editable && this.string.length>0){
	        this.selectedChars=[0,this.string.length-1];
	    }
	}
	onMouseDownWindow(event){//any time mouseDown on window, regardles of location
	    //console.log('Window Mouse Down'+Date.now());
	    var cursorPos=this.parent.globalToLocal([event.x,event.y]);
	    if(!cursorPos.isInside(this.bounds)){
	        //console.log('not inside bounds');
	        this.active=false;
	    }
	    this.selectedChars=[-1,-1];
	}
	onVideoChangeStatus(event){
	    this.active=false;
	    this.selectedChars=[-1,-1];
	}
	onKeyDown(event){
	    if(!this.editable){
	        return;
	    }
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
    	    }else if(event.keyCode==16){//shift
    	        this.isShiftDown=true;    
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
    	    }else if(event.keyCode==38){//up arrow
    	        if(this.selectedChars[0]>-1){
    	            this.cursorPos=this.selectedChars[0];
    	        }
    	        this.cursorPos=this.getCharIndexFromPoint(new paper.Point(this.cursor.bounds.centerX,this.cursor.bounds.centerY-this.myLineHeight*this.lineSpacingCoefficient));
    	    }else if(event.keyCode==40){//down arrow
        	    if(this.selectedChars[0]>-1){
        	        this.cursorPos=this.selectedChars[0];
        	    }
    	        this.cursorPos=this.getCharIndexFromPoint(new paper.Point(this.cursor.bounds.centerX,this.cursor.bounds.centerY+this.myLineHeight*this.lineSpacingCoefficient));
    	    }else if((event.keyCode==13 && this.maxLines>1) || event.keyCode==32 || (event.keyCode>=48 && event.keyCode<=90) || (event.keyCode>=96 && event.keyCode<=111) || (event.keyCode>=186 && event.keyCode<=222)){
    	        if(event.keyCode==32){//space
    	            event.preventDefault();
    	        }
    	        var toInsert=(event.keyCode==13)?"\n":event.key;
    	        if(this.selectedChars[0]>-1){
    	            this.string=this.string.slice(0,this.selectedChars[0])+toInsert+((this.selectedChars[1]+1<this.string.length)?this.string.slice(this.selectedChars[1]+1,this.string.length):"");
    	            this.cursorPos=Math.max(0,this.selectedChars[0]+1);
    	        }else if(this.string.length<this.maxChars){
    	            var oldStringLength=this.string.length;
        	        this.string=this.string.slice(0,this.cursorPos)+toInsert+((this.cursorPos<this.string.length)?this.string.slice(this.cursorPos,this.string.length):"");
        	        if(this.string.length!=oldStringLength){
        	            this.cursorPos++;
        	        }
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
    	        event.preventDefault();
    	    }
	    }
	}
	onKeyUp(event){
	    if(event.keyCode==16){//shift
	        this.isShiftDown=false;    
	    }
	}
	getCharIndexFromPoint(point){
	    if(this.string.length==0){
	        return 0;
	    }
	    var line=Math.floor(point.y/(this.myLineHeight*this.lineSpacingCoefficient));
	    line=Math.max(0,Math.min(line,this.lineStrings.length-1));//handle clicking above line0 or below lastLine
	    var nCharsBeforeLine=this.getCharsBeforeLine(line).length;
	    var charCorrectionCount=((this.forcedLineBreaks[line])?-1:0);//to make up for the extra "-" on forced line breaks
	    for(var i=0;i<this.lineStrings[line].length+charCorrectionCount;i++){
	        var charIndex=nCharsBeforeLine+i;
	        var bounds=this.getBoundsOfNthChar(charIndex);
	        if(point.x<bounds.centerX){
	            return charIndex;
	        }
	    }
	    return nCharsBeforeLine+this.lineStrings[line].length+charCorrectionCount;//handle clicking to the right of the last character in the line
    }
    getCharsBeforeLine(line){
        var returnValue="";
        if(this.string.length==0){
            return returnValue;
        }
        for(var i=0;i<Math.min(line,this.lineStrings.length);i++){
            if(this.forcedLineBreaks[i]){//forced line break -> do not include last "-" character or an extra space for the line break
                returnValue=returnValue+this.lineStrings[i].slice(0,this.lineStrings[i].length-1);
            }else{
                returnValue=returnValue+this.lineStrings[i]+" ";
            }
        }
        return returnValue;
    }
    getBoundsOfNthChar(n){
        if(this.string.length==0){
            var tempString=this.createBasicText("");
            return tempString.bounds;
        }
        //find which line the character is in, and which character index within that line
        var line=this.getLineIndexFromCharIndex(n);
        var charIndexInLine=n-this.getCharsBeforeLine(line).length;
        //create dummy text of just that character
        if(charIndexInLine==this.lineStrings[line].length){//handle nth character being the line break
            var dummyText = this.createBasicText("");
            dummyText.bounds.left=this.lineHandles[line][this.lineHandles[line].length-1].bounds.right;
        }else if(this.align=="justify" || (line<this.lineStrings.length-1 && (this.align=="justifyLeft" || this.align=="justifyCenter" || this.align=="justifyRight"))){
            var words=this.lineStrings[line].split(" ");
            if(words.length==1){//only a single word in the line... characters justified
                var dummyText = this.lineHandles[line][charIndexInLine].clone();
            }else{//words justified
                var tempCharIndex=0;
                for(var i=0;i<this.lineHandles[line].length;i++){
                    tempCharIndex+=this.lineHandles[line][i].content.length;
                    if(charIndexInLine<tempCharIndex){//the given character is in the ith word
                        var wordCharIndex=charIndexInLine-(tempCharIndex-this.lineHandles[line][i].content.length);
                        var dummyText = this.cloneNthCharInText(this.lineHandles[line][i],wordCharIndex);
                        break
                    }
                    tempCharIndex+=1;
                    if(charIndexInLine<tempCharIndex){//the given character is the space character directly after the ith word
                        //clone the last character in the ith word, create a dummyChar space with the left side at the right side of the cloned character
                        var clone = this.cloneNthCharInText(this.lineHandles[line][i],this.lineHandles[line][i].content.length-1);
                        var dummyText = this.createBasicText(" ");
                        dummyText.bounds.left=clone.bounds.right;
                        //remove the cloned character
                        clone.remove();
                        clone=null;
                        break
                    }
                }
            }
        }else{//only a single text entry in the array
            var dummyText = this.cloneNthCharInText(this.lineHandles[line][0],charIndexInLine);
        }
        //return bounds of the dummy text, cleanup, and return
        var returnValue=dummyText.bounds;
	    dummyText.remove();
        dummyText=null;
        return returnValue;
    }
    cloneNthCharInText(textHandle,charIndex){
        var cloneA = textHandle.clone();
        cloneA.visible=false;
        cloneA.content=cloneA.content.slice(charIndex);
        cloneA.bounds.right=textHandle.bounds.right;
        var cloneB = cloneA.clone();
        cloneB.visible=false;
        cloneB.content=cloneB.content[0];
        cloneB.bounds.left=cloneA.bounds.left;
        this.lineContainer.addChild(cloneB);
        cloneA.remove();
        cloneA=null;
        return cloneB;
    }
    getLineIndexFromCharIndex(char){
        var charCount=0;
        if(this.string.length==0){
            return 0;
        }
        for(var i=0;i<this.lineStrings.length;i++){
            if(this.forcedLineBreaks[i]){
                charCount+=this.lineStrings[i].length-1;//don't include last artificial - or any extra hard line break
            }else{
                charCount+=this.lineStrings[i].length+1;//add one for linebreak/space character at end of the line
            }
            if(char<charCount){
                return i;
            }
        }
        return i;
    }
    topOfLine(line){
        return line*this.myLineHeight*this.lineSpacingCoefficient;
    }
	renderText(){
	    //determine which strings go on which lines
	    this.lineStrings=[];
	    this.forcedLineBreaks=[];
	    var stringToUse=(this.string.length>0)?this.string:this.defaultString;
	    if(this.isPassword && this.string.length>0){
	        stringToUse="*".repeat(stringToUse.length);
	    }
	    var split=stringToUse.split(/[\s\n]/);
	    var startWord=0;
	    var currentWord=0;
	    var charactersOnPreviousLines=0;
	    var testText=this.createBasicText(split[startWord]);
	    testText.visible=false;
	    var singleCharacterWarningThrown=false;
	    while(currentWord<split.length){
	        this.forcedLineBreaks[this.forcedLineBreaks.length]=false;
	        if(startWord==currentWord && testText.bounds.width>this.width){//single word is too wide for a line of text, split it
	            var splitIndex=split[currentWord].length+1;
	            while(testText.bounds.width>this.width){
	                if(splitIndex==1){//down to a single character, still doesn't fit in given width. Rather than throwing an error, make this a single character line
	                    if(singleCharacterWarningThrown==false){
	                        singleCharacterWarningThrown=true;
	                        console.warn("SuperText.js: width set too narrow for a single character.");
	                    }
	                    break
	                }
	                splitIndex--;
	                testText.content=split[currentWord].slice(0,splitIndex)+"-";
	            }
	            this.lineStrings[this.lineStrings.length]=testText.content;//store the current line of characters
	            charactersOnPreviousLines+=testText.content.length;
	            this.forcedLineBreaks[this.forcedLineBreaks.length-1]=true;//record that this was a forced line break
	            split[startWord]=split[startWord].slice(splitIndex);//chop off the current line's characters from the current word of split
	            testText.content=split[startWord];//update testText for the next line
	        }else{//at least one full word fits on this line!
	            //testText.content is currently the first word on this line
	            var nextBreak=stringToUse[charactersOnPreviousLines+testText.content.length];
	            var testContent=" "+split[currentWord+1];
	            testText.content=testText.content+testContent;//append the next word to test
	            while(testText.bounds.width<this.width && nextBreak!="\n"){//the line still fits within width! (and no \n linebreak)
	                currentWord++;//save the progress before testing the next word
	                nextBreak=stringToUse[charactersOnPreviousLines+testText.content.length];
	                testText.content=testText.content+" "+split[currentWord+1];//append the next word to test
	            }
	            var newText=split.slice(startWord,currentWord+1).join(" ");
	            this.lineStrings[this.lineStrings.length]=newText;//save the current line
	            charactersOnPreviousLines+=newText.length+1;//+1 for extra space or \n at end of line
	            startWord=currentWord+1;//update startWord and currentWord
	            currentWord=startWord;
	            testText.content=split[startWord];//update testText for the next line
	        }
	    }
	    //remove any old lines of text
	    for(var i=0;i<this.lineHandles.length;i++){
            for(var j=0;j<this.lineHandles[i].length;j++){
                this.lineHandles[i][j].remove();
            }
            this.lineHandles[i]=[];
	    }
	    this.lineHandles=[];
	    //create the actual lines of text
	    for(var i=0;i<this.lineStrings.length;i++){
	        this.lineHandles[i]=[];
	        if(this.align=="justify" || (i<this.lineStrings.length-1 && (this.align=="justifyLeft" || this.align=="justifyCenter" || this.align=="justifyRight"))){
	            var words=this.lineStrings[i].split(" ");
	            if(words.length==1){//only a single word in the line... justify characters
                    testText.content=words[0];
	                var sumCharacterWidths=testText.bounds.width;
	                var spaceWidth=(this.width-sumCharacterWidths)/(words[0].length-1);
    	            for(var j=0;j<words[0].length;j++){
    	                this.lineHandles[i][j]=this.createBasicText(words[0][j]);
    	                this.lineHandles[i][j].bounds.top=this.topOfLine(i);
    	                if(j==0){
    	                    this.lineHandles[i][j].bounds.left=0;
    	                }else{
    	                    this.lineHandles[i][j].bounds.left=this.lineHandles[i][j-1].bounds.right+spaceWidth;//place the next character after a custom-width space
    	                }
    	            }
                }else{//justify words
                    var sumCharacterWidths=0;
    	            for(var j=0;j<words.length;j++){
    	                this.lineHandles[i][j]=this.createBasicText(words[j]);
    	                this.lineHandles[i][j].bounds.top=this.topOfLine(i);
    	                sumCharacterWidths+=this.lineHandles[i][j].bounds.width;
    	            }
    	            var spaceWidth=(this.width-sumCharacterWidths)/(words.length-1);
    	            this.lineHandles[i][0].bounds.left=0;//left-justify the first word
    	            for(var j=1;j<words.length;j++){
    	                this.lineHandles[i][j].bounds.left=this.lineHandles[i][j-1].bounds.right+spaceWidth;//place the next word after a custom-width space
    	            }
                }
	        }else{
	            this.lineHandles[i][0]=this.createBasicText(this.lineStrings[i]);
	            this.lineHandles[i][0].bounds.top=this.topOfLine(i);
	            if(this.align=="left"){
	                this.lineHandles[i][0].bounds.left=0;
	            }else if(this.align=="right"){
	                this.lineHandles[i][0].bounds.right=0;
	            }else if(this.align=="center"){
	                this.lineHandles[i][0].bounds.centerX=0;
	            }else if(this.align=="justifyLeft"){//last line of text - left align
	                this.lineHandles[i][0].bounds.left=0;
	            }else if(this.align=="justifyRight"){//last line of text - right align
	                this.lineHandles[i][0].bounds.right=this.width;
	            }else{//this.align=="justifyCenter"... last line of text - center align
	                this.lineHandles[i][0].bounds.centerX=this.width/2;
	            }
	        }
	    }
	    
	    //redraw background (only if it is a transparent background for hit tests, otherwise it already exists)
	    if(!(this.bgColor)){
    	    if(this.bg){
    	        this.bg.remove();
    	    }
    	    if(this.align=="center"){
    		    var bgLeft=-this.width/2-this.padding[0];
    		}else if(this.align=="right"){
    		    var bgLeft=-this.width-this.padding[0];
    		}else{//"left" or justify, which still is fixed to the left bound
    		    var bgLeft=-this.padding[0];
    		}
    	    this.bg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(this.bounds.left,this.bounds.top), new paper.Size(this.bounds.width, this.bounds.height)),[0,0]);
            this.bg.fillColor = "#EEEEEE";
            this.bg.opacity=0;
            this.addChild(this.bg);
            this.bg.sendToBack();
            //also redraw FG (prevents mouseout from triggering on children)
            if(this.fg){
    	        this.fg.remove();
    	    }
    	    this.fg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(bgLeft,-this.padding[1]), new paper.Size(this.width+2*this.padding[0], 2*this.padding[1]+this.myLineHeight*(1+this.lineSpacingCoefficient*(this.maxLines-1)))),[this.rounding,this.rounding]);
            this.fg.fillColor="#FF0000";
            this.fg.opacity = 0;
            this.foregroundContainer.addChild(this.fg);
	    }
	    
	    //cleanup
	    testText.remove();
	    if(this.cursor){
	        this.cursor.bringToFront();
	    }
	}
	createBasicText(string){
	    var line = new paper.PointText();
	    this.lineContainer.addChild(line);
	    line.fontFamily=this.myFontFamily;
		line.justification=this.justification;
		line.fontSize=this.myFontSize;
        line.fillColor = this.fontColor;
        line.content=string;
        return line;
	}
	setFontColor(value){
	    this.fontColor=value;
	    for(var i=0;i<this.lineHandles.length;i++){
	        for(var j=0;j<this.lineHandles[i].length;j++){
	            this.lineHandles[i][j].fillColor=value;
	        }
	    }
	}
	get cursorPos(){
	    return this.cursorPosDummy;
	}
	set cursorPos(value){
	    this.cursorPosDummy=value;
	    this.cursor.bounds.centerX=this.getBoundsOfNthChar(value).left;
	    this.cursor.bounds.top=this.topOfLine(this.getLineIndexFromCharIndex(value));
	    this.cursor.visible=true;
	    this.selectedChars=[-1,-1];
	}
	get string(){
	    return this.stringDummy;
	}
	set string(value){
	    if(value.length>this.maxChars){//if a string is entered with too many characters, don't update
	        return;
	    }
	    var oldString=this.stringDummy;
	    this.stringDummy=value;
	    this.lineContainer.opacity=(value.length>0)?1:0.4;
	    this.renderText();
	    if(this.lineStrings.length>this.maxLines){//if too many lines are entered, revert to previous string
	        this.string=oldString;
	    }
	}
	get content(){
		return this.string
	}
	set content(value){
	    this.string=value;
	}
	get active(){
		return this.activeDummy
	}
	set active(value){
	    if(!this.editable){
	        return;
	    }
		if(this.activeDummy!=value){
			this.activeDummy=value;
			this.bg.strokeColor=(value)?this.bgStrokeColorActive:this.bgStrokeColorInactive;
			if(value==false && this.loseFocusCallback){
			    this.loseFocusCallback();
			}
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
	get selectedChars(){
	    return this.selectedCharsDummy;
	}
	set selectedChars(value){
	    if(this.editable && (this.selectedCharsDummy[0]!=value[0] || this.selectedCharsDummy[1]!=value[1])){
	        //clear any old highlights
	        this.highlightContainer.removeChildren();
	        if(value[0]>-1){
	            //iterate through all the lines
	            var firstLine=this.getLineIndexFromCharIndex(value[0]);
	            var lastLine=this.getLineIndexFromCharIndex(value[1]);
	            for(var i=0;i<lastLine-firstLine+1;i++){
	                var firstCharIndex=(i==0)?value[0]:this.getCharsBeforeLine(firstLine+i).length;//otherwise, first char in line
	                var lastCharIndex=(i==lastLine-firstLine)?value[1]:this.getCharsBeforeLine(firstLine+i+1).length-1;//otherwise, last char in line
	                var firstCharBounds=this.getBoundsOfNthChar(firstCharIndex);
	                var lastCharBounds=this.getBoundsOfNthChar(lastCharIndex);
	                var highlight = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(firstCharBounds.left,firstCharBounds.top), new paper.Size(lastCharBounds.right-firstCharBounds.left, firstCharBounds.bottom-firstCharBounds.top)));
                    highlight.fillColor = this.highlightColor;
                    highlight.opacity=0.25;
                    this.highlightContainer.addChild(highlight);
	            }
	            this.cursor.visible=false;
	        }
	        this.selectedCharsDummy=value;
	    }
	}
	remove(){
	    window.removeEventListener('keydown', this.keyDownCallback);
	    window.removeEventListener('keyup', this.keyUpCallback);
	    window.removeEventListener('mousedown', this.mouseDownWindowCallback);
	    window.removeEventListener('videoChangeStatus', this.videoChangeStatusCallback.bind(this), false);
	    super.remove();
	}
	get numLines(){
	    return this.lineStrings.length;
	}
}
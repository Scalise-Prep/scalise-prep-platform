class MultilineText extends paper.Group{
	constructor(string,width,justify,fontFamily,fontSize,fillColor,interlineSpacing) {
	    super();
	    this.applyMatrix=false;
	    this.string="";
	    this.width=width;
	    this.justification=justify;
	    this.fontFamily=fontFamily;
	    this.fontSize=fontSize;
	    this.fillColor=fillColor;
	    this.lines=[];
	    this.interlineSpacing=interlineSpacing;
	    
	    this.content=string;
	}
	get content(){
	    return this.string;
	}
	set content(value){
	    this.string=String(value);
	    
	    //delete any old lines
	    for(var i=0;i<this.lines.length;i++){
	        this.lines[i].remove();
	    }
	    this.lines=[];
	    
	    //split the string into lines under the given width
	    var split=this.string.split(" ");
	    var startWord=0;
	    var endWord=1;
	    var testLine=this.newLine("");
	    while(true){
	        if(split[endWord]=="\n"){
	            this.lines[this.lines.length]=this.newLine(split.slice(startWord,endWord).join(" "));
	            startWord=endWord+1;
	            endWord=startWord+1;
	            continue;
	        }
	        testLine.content=split.slice(startWord,endWord+1).join(" ");
	        if(testLine.bounds.width>this.width){//next word doesn't fit, so line break before the last word
	            this.lines[this.lines.length]=this.newLine(split.slice(startWord,endWord).join(" "));
	            startWord=endWord;
	        }
	        endWord++;
            if(endWord>split.length){
                this.lines[this.lines.length]=this.newLine(split.slice(startWord,endWord).join(" "));
                break;
            }
	    }
	    testLine.remove();
	    testLine=null;
	    for(var i=0;i<this.lines.length;i++){
	        this.addChild(this.lines[i]);
	        if(this.justification=="left"){
	            this.lines[i].bounds.left=0;
	        }else if(this.justification=="right"){
	            this.lines[i].bounds.right=0;
	        }
	        if(i>0){
	            this.lines[i].bounds.top=this.lines[i-1].bounds.bottom+this.interlineSpacing;
	        }
	    }
	}
	getStringInRow(row){
	    if(row<this.lines.length){
	        return this.lines[row].content
	    }
	    return null
	}
	getStringBeforeRow(row){
	    var returnString="";
	    for(var i=0;i<row;i++){
	        if(i>=this.lines.length){
	            break
	        }
	        returnString=returnString+((i==0)?"":" ")+this.getStringInRow(i);
	    }
	    return returnString
	}
	getCharacterRow(charIndex){
	    var currentString="";
	    for(var i=0;i<this.lines.length;i++){
	        currentString=currentString+" "+this.getStringInRow(i);
	        if(charIndex<currentString.length){
	            return i
	        }
	    }
	    if(charIndex==currentString.length){
	        return this.lines.length-1;
	    }
	    return false
	}
	newLine(string){
	    var line = new paper.PointText();
	    line.fontFamily=this.fontFamily;
		line.justification=this.justification;
		line.fontSize=this.fontSize;
        line.fillColor = this.fillColor;
        line.content=string;
        return line;
	}
}
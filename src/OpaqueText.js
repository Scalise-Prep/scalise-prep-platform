class OpaqueText extends paper.Group{
	constructor(string,font,fontSize,fillColor,minOpacity,maxOpacity) {
	    super();
	    //this.applyMatrix=false;
	    var cursorX=0;
	    for(var i=0;i<string.length;i++){
	        var text=new paper.PointText();
	        text.fontFamily=font;
	        text.justification="left";
	        text.fontSize=fontSize;
	        text.content=string[i];
	        text.fillColor=fillColor;
	        text.bounds.top=0;
	        text.bounds.left=cursorX;
	        text.opacity=minOpacity+Math.random()*(maxOpacity-minOpacity);
	        this.addChild(text); 
	        
	        cursorX=text.bounds.right;
	    } 
	}
}
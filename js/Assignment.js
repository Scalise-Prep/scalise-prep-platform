class Assignment extends paper.Layer{
	constructor(canvasWidth,margin,colors,json) {
	    super();
	    this.applyMatrix=false;
        
        //title
        
        //possible video if in json
        
        //text body
		//content title
		this.title = new paper.PointText();
		this.title.fontFamily="underwood";
		this.title.justification='center';
		this.title.fontSize=36;
        this.title.content=json.title;
        this.title.fillColor = colors[1];
        this.title.position.x += canvasWidth/2;
        this.title.position.y += margin+this.title.bounds.height/2;
        this.addChild(this.title);
        if(json.videoSrc){
            this.videoX=canvasWidth*0.25/2;
            this.videoY=this.title.bounds.bottom+margin;
            this.videoW=canvasWidth*0.75;
            this.videoH=(canvasWidth*0.75)*(960/1449);
            //video background box
            this.videoBG = new paper.Path.Rectangle(new paper.Point(this.videoX,this.videoY), new paper.Size(this.videoW,this.videoH));
            this.videoBG.fillColor = "#000000";
            this.addChild(this.videoBG);
            //request video iteself
            window.dispatchEvent(new CustomEvent('requestVideoLoad',{detail: {"src":"zoom_0.mp4","type":"video/mp4"}}));
        }else{
            //content placeholder box
            this.contentPlaceholder = new paper.Path.Rectangle(new paper.Point(canvasWidth/4,this.title.bounds.bottom+margin), new paper.Size(canvasWidth/2,0.75*canvasWidth/2));
            this.contentPlaceholder.fillColor = "#EEEEEE";
            this.addChild(this.contentPlaceholder);
            //content placeholder text
    		this.contentPlaceholderText = new paper.PointText();
    		this.contentPlaceholderText.fontFamily="underwood";
    		this.contentPlaceholderText.justification='center';
    		this.contentPlaceholderText.fontSize=36;
            this.contentPlaceholderText.content="Content will go here.";
            this.contentPlaceholderText.fillColor = "#898989";
            this.contentPlaceholderText.position.x += canvasWidth/2;
            this.contentPlaceholderText.bounds.centerY = this.contentPlaceholder.bounds.centerY;
            this.addChild(this.contentPlaceholderText);
        }
	}
	update(){
	    
	}
	panelsOpenCompleteCallback(){
	    var videoDisplayRequest={"x":this.videoX, "y":this.videoY, "width":this.videoW, "height":this.videoH,"visibility":"visible"};
    	window.dispatchEvent(new CustomEvent('requestVideoDisplay',{detail: videoDisplayRequest}));
	}
}
class VideoAssignment extends paper.Layer{
	constructor(canvasWidth,margin,colors,json,stateJson) {
	    super();
	    this.json=json;
	    this.applyMatrix=false;
	    console.log(stateJson);
        
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
        
        //prompt image (optional)
        if(json.promptImageURL){
            var imageWidth=0.5*canvasWidth;
            var imageHeight=8*imageWidth/11;
            this.promptImage=new RasterLoader("promptImage"+i,json.promptImageURL,imageWidth,imageHeight,0,null,0);
        	this.addChild(this.promptImage);
            this.promptImage.bounds.centerX=canvasWidth/2;
        	this.promptImage.bounds.top=this.title.bounds.bottom+margin;
        }
        
        //Video (optional)
        if(json.videoSrc){
            //Begin Loading Video
            this.videoX=canvasWidth*0.5/2;
            this.videoY=margin+((json.promptImageURL)?this.promptImage.bounds.bottom:this.title.bounds.bottom);
            this.videoW=canvasWidth*0.5;
            this.videoH=(canvasWidth*0.5)*(960/1449);
            //video background box
            this.videoBG = new paper.Path.Rectangle(new paper.Point(this.videoX,this.videoY), new paper.Size(this.videoW,this.videoH));
            this.videoBG.fillColor = "#000000";
            this.addChild(this.videoBG);
            //request video iteself
            window.dispatchEvent(new CustomEvent('requestVideoLoad',{detail: {"src":this.json.videoSrc,"type":"video/mp4"}}));
        }
        
        //Main Prompt
        if(json.prompt){
            this.prompt = new MultilineText(json.prompt,2*canvasWidth/3,"left","helveticaNeueLight",24,colors[2],3);
            this.addChild(this.prompt);
            this.prompt.bounds.left=canvasWidth/6;
            this.prompt.bounds.top=margin+((json.videoSrc)?this.videoY+this.videoH:((json.promptImageURL)?this.promptImage.bounds.bottom:this.title.bounds.bottom));
        }
        
        //Link button (optional)
        if(json.linkURLs){
            this.linkButton=new Button("link",0,0,300,40,this.json.linkURLs[0].label,["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",24,["#CB6D51","#54c896","#000000"],function(){window.open(this.json.linkURLs[0].url, '_blank');}.bind(this),null,null);
            this.linkButton.bounds.centerX=canvasWidth/2;
            this.addChild(this.linkButton);
            if(json.prompt){
                this.linkButton.bounds.top=margin+this.prompt.bounds.bottom;
            }else if(json.videoSrc){
                this.linkButton.bounds.top=margin+this.videoY+this.videoH;
            }else{
                this.linkButton.bounds.top=this.title.bounds.bottom+margin;
            }
        }
        
        //Iteratively load the questions
        this.promptHandles=new Array(json.questions.length);
        this.answerHandles=new Array();
        for(var i=0;i<json.questions.length;i++){
            //question prompt text
            this.promptHandles[i] = new MultilineText(json.questions[i].prompt,2*canvasWidth/3,"left","helveticaNeueLight",(json.questions[i].skipResponse)?24:21,(json.questions[i].skipResponse)?colors[1]:colors[0],3);
            this.addChild(this.promptHandles[i]);
            this.promptHandles[i].bounds.left=canvasWidth/6;
            if(i==0){
                if(json.linkURLs){
                    this.promptHandles[i].bounds.top=margin+this.linkButton.bounds.bottom;
                }else if(json.prompt){
                    this.promptHandles[i].bounds.top=margin+this.prompt.bounds.bottom;
                }else if(json.videoSrc){
                    this.promptHandles[i].bounds.top=margin+this.videoY+this.videoH;
                }else{
                    this.promptHandles[i].bounds.top=this.title.bounds.bottom+margin;
                }
            }else{
                this.promptHandles[i].bounds.top=(json.questions[i-1].skipResponse)?this.promptHandles[i-1].bounds.bottom+margin:this.answerHandles[this.answerHandles.length-1].bounds.bottom+((json.questions[i].skipResponse)?2:1)*margin;
            }
            
            //response text
            if(!json.questions[i].skipResponse){
                var responseString=(stateJson && stateJson.responseStrings && stateJson.responseStrings.length>i)?stateJson.responseStrings[i]:"";
                this.answerHandles[this.answerHandles.length] = new SuperText(responseString,"Answer",2*canvasWidth/3,[25,11],25,"left","helveticaNeueLight",21,"#000000",colors[0],"#EEEEEE",colors[1],true,10000,json.questions[i].numLines,false,1.08,this.saveAssignment.bind(this));
                this.addChild(this.answerHandles[this.answerHandles.length-1]);
                this.answerHandles[this.answerHandles.length-1].bounds.left=canvasWidth/6;
                this.answerHandles[this.answerHandles.length-1].bounds.top=this.promptHandles[i].bounds.bottom+margin;
            }
        }
        
        //Add the submit button
        this.submitButton=new Button("submit",canvasWidth/2-100,this.answerHandles[this.answerHandles.length-1].bounds.bottom+margin,200,50,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",36,["#CB6D51","#54c896","#000000"],this.submitAssignment.bind(this),null,null);
        this.addChild(this.submitButton);
        
        //Add background white panel to define page size
        this.bottomMargin = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(canvasWidth,this.submitButton.bounds.bottom+margin));
        this.bottomMargin.fillColor = "#FFFFFF";
        this.addChild(this.bottomMargin);
        this.bottomMargin.sendToBack();
        
        //add timers and event listeners
        this.saveInterval = setInterval(this.saveAssignment.bind(this), 60*1000);//save every minute
	}
	submitAssignment(){
	    this.submitButton.toggle=false;
	    window.dispatchEvent(new CustomEvent('submitAssignment',{ detail: this.json.id}));
	}
	saveAssignment(){
	    window.dispatchEvent(new CustomEvent('saveAssignment',{ detail: this.json.id}));
	}
	getStateJson(){
	    var returnJson={"responseStrings":[]};
	    for(var i=0;i<this.answerHandles.length;i++){
	        returnJson.responseStrings[i]=this.answerHandles[i].string;
	    }
	    return returnJson;
	}
	update(){
	    
	}
	panelsOpenCompleteCallback(){
	    if(this.json.videoSrc){
    	    var videoDisplayRequest={"x":this.videoX, "y":this.videoY, "width":this.videoW, "height":this.videoH,"visibility":"visible"};
        	window.dispatchEvent(new CustomEvent('requestVideoDisplay',{detail: videoDisplayRequest}));
	    }
	}
	remove(){
	    clearInterval(this.saveInterval);
	    super.remove();
	}
}
class ErrorLogAssignment extends paper.Layer{
	constructor(canvasWidth,margin,colors,json,stateJson) {
	    super();
	    this.json=json;
	    this.applyMatrix=false;
	    this.canvasWidth=canvasWidth;
	    this.margin=margin;
        
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
        
        //Main Prompt (optional)
        if(json.prompt){
            this.prompt = new MultilineText(json.prompt,canvasWidth/2,"left","helveticaNeueLight",24,colors[2],3);
            this.addChild(this.prompt);
            this.prompt.bounds.left=canvasWidth/4;
            this.prompt.bounds.top=margin+((json.videoSrc)?this.videoY+this.videoH:this.title.bounds.bottom);
        }
        
        //Iteratively load the questions
        this.questionTitleHandles=new Array(json.questions.length);
        this.yourAnswerHandles=new Array(json.questions.length);
        this.correctAnswerHandles=new Array(json.questions.length);
        this.typeOfQuestionHandles=new Array(json.questions.length);
        this.reasonMissedHandles=new Array(json.questions.length);
        this.explanationCheckBoxHandles=new Array(json.questions.length);
        this.explanationTextHandles=new Array(json.questions.length);
        for(var i=0;i<json.questions.length;i++){
            //question title text
            this.questionTitleHandles[i] = new paper.PointText();
    		this.questionTitleHandles[i].fontFamily="underwood";
    		this.questionTitleHandles[i].justification='left';
    		this.questionTitleHandles[i].fontSize=32;
            this.questionTitleHandles[i].content=json.questions[i].title;
            this.questionTitleHandles[i].fillColor = colors[0];
            this.addChild(this.questionTitleHandles[i]);
            this.questionTitleHandles[i].bounds.left=canvasWidth/4;
            if(i==0){
                if(json.prompt){
                    this.questionTitleHandles[i].bounds.top=margin+this.prompt.bounds.bottom;
                }else{
                    this.questionTitleHandles[i].bounds.top=this.title.bounds.bottom+margin;
                }
            }else{
                this.questionTitleHandles[i].bounds.top=2*margin+this.reasonMissedHandles[i-1].bounds.bottom;
            }
            //your answer text
            this.yourAnswerHandles[i] = new paper.PointText();
    		this.yourAnswerHandles[i].fontFamily="helveticaNeueLight";
    		this.yourAnswerHandles[i].justification='left';
    		this.yourAnswerHandles[i].fontSize=24;
            this.yourAnswerHandles[i].content="Your answer: "+json.questions[i].yourAnswer;
            this.yourAnswerHandles[i].fillColor = colors[1];
            this.addChild(this.yourAnswerHandles[i]);
            this.yourAnswerHandles[i].bounds.left=canvasWidth/4;
            this.yourAnswerHandles[i].bounds.top=this.questionTitleHandles[i].bounds.bottom+margin;
            //correct answer text
            this.correctAnswerHandles[i] = new paper.PointText();
    		this.correctAnswerHandles[i].fontFamily="helveticaNeueLight";
    		this.correctAnswerHandles[i].justification='left';
    		this.correctAnswerHandles[i].fontSize=24;
            this.correctAnswerHandles[i].content="Correct answer: "+json.questions[i].correctAnswer;
            this.correctAnswerHandles[i].fillColor = colors[0];
            this.addChild(this.correctAnswerHandles[i]);
            this.correctAnswerHandles[i].bounds.left=canvasWidth/4;
            this.correctAnswerHandles[i].bounds.top=this.yourAnswerHandles[i].bounds.bottom+margin;
            
            //Add the video request button
            if(json.questions[i].videoURL){
                this.videoExplainButton=new Button("videoExplain",canvasWidth/4,this.correctAnswerHandles[i].bounds.bottom+margin,175,50,"Watch Video",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",24,["#CB6D51","#54c896","#000000"],this.requestVideo.bind(this,i),null,null);
                this.addChild(this.submitButton);
            }
            
            //explanation checkbox
            var checkboxSize=15;
            var explanationWanted=(stateJson && stateJson.responses.length>i)?stateJson.responses[i].explanationWanted:false;
            this.explanationCheckBoxHandles[i]=new CheckBox("explanation",3*canvasWidth/4-checkboxSize,this.yourAnswerHandles[i].bounds.top,15,colors,this.saveAssignment.bind(this));
            this.explanationCheckBoxHandles[i].selected=explanationWanted;
            this.addChild(this.explanationCheckBoxHandles[i]);
    		this.explanationTextHandles[i] = new paper.PointText();
    		this.explanationTextHandles[i].fontFamily="helveticaNeueLight";
    		this.explanationTextHandles[i].justification='right';
    		this.explanationTextHandles[i].fontSize=16;
            this.explanationTextHandles[i].content="WOULD LIKE TUTOR HELP";
            this.explanationTextHandles[i].fillColor = colors[2];
            this.explanationTextHandles[i].bounds.right = this.explanationCheckBoxHandles[i].bounds.left-margin;
            this.explanationTextHandles[i].bounds.center.y=this.explanationCheckBoxHandles[i].bounds.center.y;
            this.addChild(this.explanationTextHandles[i]);

            //question type text
            var typeOfQuestion=(stateJson && stateJson.responses.length>i)?stateJson.responses[i].typeOfQuestion:"";
            this.typeOfQuestionHandles[i] = new SuperText(typeOfQuestion,"Question type?",0.31*canvasWidth,[25,11],25,"left","helveticaNeueLight",21,"#000000",colors[0],"#EEEEEE",colors[1],true,10000,1,false,1.08,this.saveAssignment.bind(this));
            this.addChild(this.typeOfQuestionHandles[i]);
            this.typeOfQuestionHandles[i].bounds.right=3*canvasWidth/4;
            this.typeOfQuestionHandles[i].bounds.top=this.explanationTextHandles[i].bounds.bottom+margin/2;
            //response text
            var reasonMissed=(stateJson && stateJson.responses.length>i)?stateJson.responses[i].reasonMissed:"";
            this.reasonMissedHandles[i] = new SuperText(reasonMissed,"Reason missed?",0.31*canvasWidth,[25,11],25,"left","helveticaNeueLight",21,"#000000",colors[0],"#EEEEEE",colors[1],true,10000,3,false,1.08,this.saveAssignment.bind(this));
            this.addChild(this.reasonMissedHandles[i]);
            this.reasonMissedHandles[i].bounds.right=3*canvasWidth/4;
            this.reasonMissedHandles[i].bounds.top=this.typeOfQuestionHandles[i].bounds.bottom+margin/2;
            
            //top line
            if(i<json.questions.length-1){
                var from = new paper.Point(canvasWidth/4, this.reasonMissedHandles[i].bounds.bottom+margin);
                var to = new paper.Point(3*canvasWidth/4,  this.reasonMissedHandles[i].bounds.bottom+margin);
                var path = new paper.Path.Line(from, to);
                path.strokeWidth=1;
                path.opacity=0.25;
                path.strokeColor = colors[2];
                this.addChild(path);
            }
        }
        
        //Add the submit button
        this.submitButton=new Button("submit",canvasWidth/2-100,this.reasonMissedHandles[this.reasonMissedHandles.length-1].bounds.bottom+margin,200,50,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",36,["#CB6D51","#54c896","#000000"],this.submitAssignment.bind(this),null,null);
        this.addChild(this.submitButton);
        
        //Add background white panel to define page size
        this.bottomMargin = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(canvasWidth,this.submitButton.bounds.bottom+margin));
        this.bottomMargin.fillColor = "#FFFFFF";
        this.addChild(this.bottomMargin);
        this.bottomMargin.sendToBack();
        
        //Add foreground grey panel for video explainations
        this.fg = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(canvasWidth,this.submitButton.bounds.bottom+margin));
        this.fg.fillColor = "#000000";
        this.fg.opacity=0.50;
        this.addChild(this.fg);
        this.fg.visible=false;
        this.fg.onClick = this.hideVideo.bind(this);
	}
	requestVideo(questionIndex){
	    this.fg.visible=true;
	    var videoSrc=this.json.questions[questionIndex].videoURL;
	    //load the video
	    window.dispatchEvent(new CustomEvent('requestVideoLoad',{detail: {"src":videoSrc,"type":"video/mp4"}}));
        //display the Video
        this.videoX=this.canvasWidth*0.5/2;
        this.videoW=this.canvasWidth*0.5;
        this.videoH=(this.canvasWidth*0.5)*(960/1449);
        this.videoY=(questionIndex<this.json.questions.length-1)?this.questionTitleHandles[questionIndex].bounds.top:this.reasonMissedHandles[questionIndex].bounds.bottom-this.videoH;
        var videoDisplayRequest={"x":this.videoX, "y":this.videoY, "width":this.videoW, "height":this.videoH,"visibility":"visible"};
        window.dispatchEvent(new CustomEvent('requestVideoDisplay',{detail: videoDisplayRequest}));
	}
	hideVideo(event){
	    window.dispatchEvent(new CustomEvent('requestVideoHide'));
	    this.fg.visible=false;
	}
	submitAssignment(){
	    this.submitButton.toggle=false;
	    window.dispatchEvent(new CustomEvent('submitAssignment',{ detail: this.json.id}));
	}
	saveAssignment(){
	    window.dispatchEvent(new CustomEvent('saveAssignment',{ detail: this.json.id}));
	}
	getStateJson(){
	    var returnJson={"responses":[]};
	    for(var i=0;i<this.json.questions.length;i++){
	        returnJson.responses[i]={"typeOfQuestion":this.typeOfQuestionHandles[i].string,"reasonMissed":this.reasonMissedHandles[i].string,"explanationWanted":this.explanationCheckBoxHandles[i].selected};
	    }
	    return returnJson;
	}
	update(){
	    
	}
	panelsOpenCompleteCallback(){
        
	}
}
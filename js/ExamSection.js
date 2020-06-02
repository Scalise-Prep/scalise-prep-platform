class ExamSection extends paper.Layer{
	constructor(assignmentId,sectionId,canvasWidth,margin,colors,json,examCallback) {
	    super();
	    this.assignmentId=assignmentId;
	    this.myId=sectionId;
	    this.applyMatrix=false;
	    this.state="available";
	    this.json=json;
	    this.height=canvasWidth/4;
	    this.canvasWidth=canvasWidth;
	    this.colors=colors;
	    this.margin=margin;
	    this.startTimeStamp=Math.floor(Date.now()/1000);
	    this.examCallback=examCallback;
	    this.lastRenderedState=null;
	    this.currentQuestion=0;
	    this.lastAnswerTimeStamp;
	    
	    this.recordedAnswers=new Array(json.numQs);
	    this.checkboxStates=new Array(json.numQs);
	    this.answerTimeStamps=new Array(json.numQs);
        
        this.render();
	}
	
	render(forceFullRender=false){
	    if(this.lastRenderedState!=this.state || forceFullRender){
    	    this.removeChildren();
            
            //background box
            this.contentPlaceholder = new paper.Path.Rectangle(new paper.Point(100,0), new paper.Size(this.canvasWidth-200,this.height));
            this.contentPlaceholder.fillColor = "#FFFFFF";
            this.addChild(this.contentPlaceholder);
            
            //draw top line
            var from = new paper.Point(100, 0);
            var to = new paper.Point(this.canvasWidth-100, 0);
            var path = new paper.Path.Line(from, to);
            path.strokeWidth=1;
            path.opacity=0.25;
            path.strokeColor = this.colors[2];
            this.addChild(path);
	    }
        
        if(this.state=="active"){
            if(this.lastRenderedState!="active" || forceFullRender){
                //title
        		this.title = new paper.PointText();
        		this.title.fontFamily="underwood";
        		this.title.justification='left';
        		this.title.fontSize=36;
                this.title.content=this.json.title;
                this.title.fillColor = this.colors[0];
                this.title.bounds.left = 100+this.margin;
                this.title.bounds.top=this.margin;
                this.addChild(this.title);
                
                //timer
                this.timer = new paper.PointText();
        		this.timer.fontFamily="helveticaNeueLight";
        		this.timer.justification='left';
        		this.timer.fontSize=24;
        		var timeLimitInMins=Math.round(this.json.timeLimit/60);
        		this.timer.content=timeLimitInMins+" minutes remaining.";
                this.timer.fillColor = this.colors[2];
                this.timer.bounds.left = 100+this.margin;
                this.addChild(this.timer);
                this.timer.bounds.top=this.title.bounds.bottom+this.margin;
                
                //submit button
                this.submitButton=new Button("submit",100+this.margin,this.timer.bounds.bottom+this.margin,200,50,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",36,["#CB6D51","#54c896","#000000"],function(){this.examCallback(this.myId,"submit");}.bind(this),null,null);
                this.addChild(this.submitButton);
                
                //Current Question
                this.answerPanel=new paper.Group();
                this.answerPanel.applyMatrix=false;
                this.addChild(this.answerPanel);
                //Number
        		this.qNum = new paper.PointText();
        		this.qNum.fontFamily="helveticaNeueLight";
        		this.qNum.justification='left';
        		this.qNum.fontSize=36;
                this.qNum.content="Q"+(this.currentQuestion+1)+":";
                this.qNum.fillColor = this.colors[2];
                this.qNum.bounds.left = 0;
                this.qNum.bounds.top=this.margin;
                this.answerPanel.addChild(this.qNum);
                //Answer choices
                var numAnswerChoices=this.json.answerChoices.length;
                var answerChoices=this.json.answerChoices[this.currentQuestion%numAnswerChoices];//(this.currentQuestion%2==0)?["A","B","C","D","E"]:["F","G","H","J","K"];
                this.answerButtonHandles=new Array(answerChoices.length);
                for(var i=0;i<this.answerButtonHandles.length;i++){
                    var xPos=(i==0)?this.qNum.bounds.right+this.margin:this.answerButtonHandles[i-1].bounds.right+this.margin;
                    var buttonBGColorArray=(i==this.recordedAnswers[this.currentQuestion])?["#E3F6EE","#E3F6EE","#DDDDDD"]:["#FAF2EF","#E3F6EE","#DDDDDD"];
                    var buttonFontColorArray=(i==this.recordedAnswers[this.currentQuestion])?["#54c896","#54c896","#000000"]:["#CB6D51","#54c896","#000000"];
                    this.answerButtonHandles[i]=new Button("answer"+i,xPos,this.qNum.bounds.top,50,50,answerChoices[i],buttonBGColorArray,"helveticaNeueLight",32,buttonFontColorArray,this.answerButtonCallback.bind(this),null,null);
                    this.answerPanel.addChild(this.answerButtonHandles[i]);
                }
                //Annotation checkboxes
                this.checkboxHandles=[];
                var unsureCheckboxLeft=this.answerButtonHandles[this.answerButtonHandles.length-1].bounds.right+this.margin/2;
                var unsureCheckboxTop=this.margin;
                var checkboxSize=12.5;
                var checkboxSpacing=(50-3*checkboxSize)/2;
                for(var i=0;i<this.json.checkboxes.length;i++){
                    this.checkboxHandles[i]=new CheckBox(i,unsureCheckboxLeft,unsureCheckboxTop+i*(checkboxSize+checkboxSpacing),checkboxSize,this.colors,function(){this.recordCheckboxes();this.requestSave();}.bind(this));
                    this.answerPanel.addChild(this.checkboxHandles[i]);
                    var checkText = new paper.PointText();
                    checkText.fontFamily="helveticaNeueLight";
                    checkText.justification='left';
                    checkText.fontSize=16;
                    checkText.content=this.json.checkboxes[i];
                    checkText.fillColor = this.colors[2];
                    checkText.bounds.left = unsureCheckboxLeft+checkboxSize+checkboxSpacing;
                    checkText.bounds.centerY=this.checkboxHandles[i].bounds.centerY;
                    this.answerPanel.addChild(checkText);
                    this.checkboxHandles[i].selected=(this.checkboxStates[this.currentQuestion] && this.checkboxStates[this.currentQuestion][i])?true:false;
                }
                
                //skip button
                this.skipButton=new Button("skip",this.answerPanel.bounds.right+this.margin,0,65,30,"SKIP",[buttonBGColorArray[1],buttonBGColorArray[0],buttonBGColorArray[2]],"helveticaNeueLight",24,[buttonFontColorArray[1],buttonFontColorArray[0],buttonFontColorArray[2]],this.skipButtonCallback.bind(this),null,null);
                this.skipButton.bounds.bottom=this.answerButtonHandles[0].bounds.bottom;
                this.answerPanel.addChild(this.skipButton);
                
                //array of question numbers
                this.questionNumberContainer=new paper.Group();
                this.questionNumberContainer.applyMatrix=false;
                this.addChild(this.questionNumberContainer);
                this.questionHandles=new Array(this.json.numQs);
                var buttonSize=30;
                var qsPerRow=15;
                for(var q=0;q<this.json.numQs;q++){
                    var row=Math.floor(q/qsPerRow);
                    var col=q%qsPerRow;
                    var xPos=this.canvasWidth-100-this.margin/2-(this.margin/2+buttonSize)*(qsPerRow-col);
                    var yPos=this.answerButtonHandles[0].bounds.bottom+this.margin+(this.margin/2+buttonSize)*row;
                    var buttonBGColorArray=(q==this.currentQuestion)?["#FFFFFF","#FAF2EF","#DDDDDD"]:((this.recordedAnswers[q]==null)?["#FFFFFF","#E3F6EE","#DDDDDD"]:["#FFFFFF","#EEEEEE","#DDDDDD"]);
                    var buttonFontColorArray=(q==this.currentQuestion)?[this.colors[1],this.colors[1],"#000000"]:((this.recordedAnswers[q]==null)?[this.colors[0],this.colors[0],"#000000"]:[this.colors[2],this.colors[2],"#000000"]);
                    var opac=(q==this.currentQuestion || this.recordedAnswers[q]==null)?1:0.5;
                    this.questionHandles[q]=new Button("q"+q,xPos,yPos,buttonSize,buttonSize,(q+1).toString(),buttonBGColorArray,"helveticaNeueLight",24,buttonFontColorArray,this.numberButtonCallback.bind(this),null,null);
                    this.questionHandles[q].opacity=opac;
                    this.questionNumberContainer.addChild(this.questionHandles[q]);
                }
                
                //align the answer panel
                this.answerPanel.bounds.right=this.questionNumberContainer.bounds.right;
            }
            var timeRemaining=this.json.timeLimit-(Math.floor(Date.now()/1000)-this.startTimeStamp);
    		if(timeRemaining>60){//more than one minute remaining
                this.timer.content=Math.round(timeRemaining/60)+" minutes remaining.";
    		}else if(timeRemaining>0){//less than one minute remaining
    		    this.timer.content=Math.round(timeRemaining)+" seconds remaining.";
    		    this.timer.fillColor = this.colors[1];
	        }else{
	            this.examCallback(this.myId,"timesUp");
	        }
        }else if(this.state=="available"){
            //title
    		this.title = new paper.PointText();
    		this.title.fontFamily="underwood";
    		this.title.justification='center';
    		this.title.fontSize=36;
            this.title.content=this.json.title;
            this.title.fillColor = this.colors[0];
            this.title.position.x += this.canvasWidth/2;
            this.title.bounds.top=this.margin;
            this.addChild(this.title);
            
            //start button
            this.startButton=new Button("start",this.canvasWidth/2-100,this.height/2-25,200,50,"START",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",36,["#CB6D51","#54c896","#000000"],function(){this.startTimeStamp=Math.floor(Date.now()/1000);this.lastAnswerTimeStamp=this.startTimeStamp;this.examCallback(this.myId,"start");}.bind(this),null,null);
            this.addChild(this.startButton);
            
            //fine print
            this.finePrint = new paper.PointText();
    		this.finePrint.fontFamily="helveticaNeueLight";
    		this.finePrint.justification='center';
    		this.finePrint.fontSize=24;
            this.finePrint.content="You will have "+Math.round(this.json.timeLimit/60)+" minutes to complete this section. Section will end when you click submit or run out of time.";
            this.finePrint.fillColor = this.colors[2];
            this.finePrint.position.x += this.canvasWidth/2;
            this.addChild(this.finePrint);
            this.finePrint.bounds.top=this.height-(0.5*this.height-this.startButton.bounds.height/2)/2-this.finePrint.bounds.height/2;
        }else if(this.state=="unavailable"){
            //title
    		this.title = new paper.PointText();
    		this.title.fontFamily="underwood";
    		this.title.justification='center';
    		this.title.fontSize=36;
            this.title.content=this.json.title;
            this.title.fillColor = this.colors[2];
            this.title.position.x += this.canvasWidth/2;
            this.title.bounds.top=this.margin;
            this.addChild(this.title);
            
            //start button
            this.startButton=new Button("start",this.canvasWidth/2-100,this.height/2-25,200,50,"START",[this.colors[2],this.colors[2],this.colors[2]],"underwood",36,["#DDDDDD","#DDDDDD","#DDDDDD"],null,null,null);
            this.addChild(this.startButton);
            
            //fine print
            this.finePrint = new paper.PointText();
    		this.finePrint.fontFamily="helveticaNeueLight";
    		this.finePrint.justification='center';
    		this.finePrint.fontSize=24;
            this.finePrint.content="Complete the active section before starting this one.";
            this.finePrint.fillColor = this.colors[2];
            this.finePrint.position.x += this.canvasWidth/2;
            this.addChild(this.finePrint);
            this.finePrint.bounds.top=this.height-(0.5*this.height-this.startButton.bounds.height/2)/2-this.finePrint.bounds.height/2;
        }else if(this.state=="complete"){
            //title
    		this.title = new paper.PointText();
    		this.title.fontFamily="underwood";
    		this.title.justification='center';
    		this.title.fontSize=36;
            this.title.content=this.json.title;
            this.title.fillColor = this.colors[2];
            this.title.position.x += this.canvasWidth/2;
            this.title.bounds.top=this.margin;
            this.addChild(this.title);
            
            //fine print
            this.finePrint = new paper.PointText();
    		this.finePrint.fontFamily="helveticaNeueLight";
    		this.finePrint.justification='center';
    		this.finePrint.fontSize=24;
            this.finePrint.content="You completed this section! Nice work!";
            this.finePrint.fillColor = this.colors[2];
            this.finePrint.position.x += this.canvasWidth/2;
            this.addChild(this.finePrint);
            this.finePrint.bounds.top=0.5*this.height-this.finePrint.bounds.height/2;
        }
        this.lastRenderedState=this.state;
	}
	answerButtonCallback(buttonId){
	    this.recordCheckboxes();
	    this.recordedAnswers[this.currentQuestion]=parseInt(buttonId.slice(6),10);
	    var currTime=Math.floor(Date.now()/1000);
	    if(this.answerTimeStamps[this.currentQuestion]){
	        this.answerTimeStamps[this.currentQuestion]=this.answerTimeStamps[this.currentQuestion]+(currTime-this.lastAnswerTimeStamp);
	    }else{
	        this.answerTimeStamps[this.currentQuestion]=currTime-this.lastAnswerTimeStamp;
	    }
	    this.lastAnswerTimeStamp=currTime;
	    if(this.currentQuestion<this.json.numQs-1){
	        this.currentQuestion++;
	    }
	    this.requestSave();
	    this.render(true);
	}
	skipButtonCallback(buttonId){
	    this.recordCheckboxes();
	    var currTime=Math.floor(Date.now()/1000);
	    if(this.answerTimeStamps[this.currentQuestion]){
	        this.answerTimeStamps[this.currentQuestion]=this.answerTimeStamps[this.currentQuestion]+(currTime-this.lastAnswerTimeStamp);
	    }else{
	        this.answerTimeStamps[this.currentQuestion]=currTime-this.lastAnswerTimeStamp;
	    }
	    this.lastAnswerTimeStamp=currTime;
	    if(this.currentQuestion<this.json.numQs-1){
	        this.currentQuestion++;
	    }else{
	        this.currentQuestion=0;
	    }
	    this.requestSave();
	    this.render(true);
	}
	numberButtonCallback(buttonId){
	    this.recordCheckboxes();
	    this.currentQuestion=parseInt(buttonId.slice(1),10);
	    this.requestSave();
	    this.render(true);
	}
	recordCheckboxes(){
	    this.checkboxStates[this.currentQuestion]=[];//this.unsureCheckbox.selected,this.hardCheckbox.selected,this.feedbackCheckbox.selected];
	    for(var i=0;i<this.checkboxHandles.length;i++){
	        this.checkboxStates[this.currentQuestion][i]=this.checkboxHandles[i].selected
	    }
	}
	requestSave(){
	    window.dispatchEvent(new CustomEvent('saveAssignment',{ detail: this.assignmentId}));
	}
}
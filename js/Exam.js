class Exam extends paper.Layer{
	constructor(canvasWidth,margin,colors,json,stateJson) {
	    super();
	    this.applyMatrix=false;
	    this.json=json;
	    this.canvasWidth=canvasWidth;
	    this.margin=margin;
	    this.colors=colors;
	    
	    this.buttonBgReady=["#FAF2EF","#E3F6EE","#DDDDDD"];
	    this.buttonBgSelected=["#E3F6EE","#E3F6EE","#DDDDDD"];
	    this.buttonBgUnselected=["#f8f8f8","#E3F6EE","#DDDDDD"];
	    this.buttonFgReady=["#CB6D51","#54c896","#000000"];
	    this.buttonFgSelected=["#54c896","#54c896","#000000"];
	    this.buttonFgUnselected=["#DDDDDD","#54c896","#000000"];
	    this.timerIntervalIdentifier;
	    this.lastAnswerTimeStamp=Math.floor(Date.now()/1000);
	    this.outOfTimeFlag=false;

	    this.activeSection=-1;
	    if(stateJson){
	        this.stateJson=stateJson;
	        this.sectionsRemaining=0;
	        for(var i=0;i<stateJson.sections.length;i++){
    	        if(stateJson.sections[i].state=="active"){
    	            this.activeSection=i;
    	            this.sectionsRemaining++;
    	            this.lastAnswerTimeStamp=Math.floor(Date.now()/1000);
    	        }else if(stateJson.sections[i].state=="available"){
    	            this.sectionsRemaining++;
    	        }
	        }
	    }else{
	        this.sectionsRemaining=json.sections.length;
	        this.stateJson={"sections":[]};
	        for(var i=0;i<this.json.sections.length;i++){
    	        this.stateJson.sections[i]={"topic":this.json.sections[i].topic,"state":"available","startTimeStamp":null,"recordedAnswers":new Array(this.json.sections[i].numQs),"checkboxStates":new Array(this.json.sections[i].numQs),"answerTimeStamps":new Array(this.json.sections[i].numQs)};
    	        for(var j=0;j<this.stateJson.sections[i].checkboxStates.length;j++){
        	        this.stateJson.sections[i].checkboxStates[j]=new Array(this.json.sections[i].checkboxes.length);
        	    }
	        }
	    }
	    
	    this.render();
	}
	render(){
	    this.removeChildren();
	    if(this.timerIntervalIdentifier){
	        clearInterval(this.timerIntervalIdentifier);
	        this.timerIntervalIdentifier=null;
	    }
	    //title
		this.title = new paper.PointText();
		this.title.fontFamily="underwood";
		this.title.justification='center';
		this.title.fontSize=36;
        this.title.content=this.json.title;
        this.title.fillColor = this.colors[1];
        this.title.position.x += this.canvasWidth/2;
        this.title.position.y += this.margin+this.title.bounds.height/2;
        this.addChild(this.title);
        if(this.outOfTimeFlag){
            //display error message
            this.prompt = new paper.PointText();
    		this.prompt.fontFamily="helveticaNeueLight";
    		this.prompt.justification='center';
    		this.prompt.fontSize=21;
            this.prompt.content="You ran out of time on this section. Don't worry, your answers were saved!";
            this.prompt.fillColor = this.colors[2];
            this.prompt.position.x += this.canvasWidth/2;
            this.addChild(this.prompt);
            this.prompt.bounds.top=this.title.bounds.bottom+this.margin;
            
            //submit button
	        this.submitButton=new Button("submit",0,0,200,50,"OK",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",32,["#CB6D51","#54c896","#000000"],function(){this.outOfTimeFlag=false;this.render();}.bind(this),null,null);
            this.submitButton.bounds.top=this.prompt.bounds.bottom+this.margin;
            this.submitButton.bounds.centerX=this.canvasWidth/2;
            this.addChild(this.submitButton);
	    }else if(this.activeSection==-1 && this.sectionsRemaining>0){//list the available sections
            //prompt
            this.prompt = new paper.PointText();
    		this.prompt.fontFamily="underwood";
    		this.prompt.justification='center';
    		this.prompt.fontSize=24;
            this.prompt.content=this.json.prompt;
            this.prompt.fillColor = this.colors[2];
            this.prompt.position.x += this.canvasWidth/2;
            this.addChild(this.prompt);
            this.prompt.bounds.top=this.title.bounds.bottom+this.margin;
            
            //iteratively add the exam sections
            this.sectionHandles=new Array(this.json.sections.length);
            for(var i=0;i<this.json.sections.length;i++){
                //construct an empty group for this assignment
                this.sectionHandles[i]=new paper.Group();
                this.sectionHandles[i].applyMatrix=false;
                this.addChild(this.sectionHandles[i]);
                
                //start button
                var buttonTitle=(this.stateJson.sections[i].state=="complete")?"COMPLETE":"START";
                var startButton=new Button("start",0,0,150,40,buttonTitle,["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",24,["#CB6D51","#54c896","#000000"],this.startSection.bind(this,i),null,null,"#EEEEEE");
                startButton.bounds.centerX=this.canvasWidth/2;
                this.sectionHandles[i].addChild(startButton);
                if(this.stateJson.sections[i].state=="complete"){
                    startButton.toggle=false;
                }
                
                //section title
        		var sectionTitle = new paper.PointText();
        		sectionTitle.fontFamily="underwood";
        		sectionTitle.justification='right';
        		sectionTitle.fontSize=24;
                sectionTitle.content=this.json.sections[i].title;
                sectionTitle.fillColor = (this.stateJson.sections[i].state=="complete")?this.colors[2]:this.colors[0];
                sectionTitle.bounds.right = startButton.bounds.left-this.margin;
                sectionTitle.bounds.centerY = startButton.bounds.centerY;
                this.sectionHandles[i].addChild(sectionTitle);
                
                //fine print
                var finePrint = new paper.PointText();
        		finePrint.fontFamily="helveticaNeueLight";
        		finePrint.justification='left';
        		finePrint.fontSize=20;
        		if(this.stateJson.sections[i].state=="complete"){
        		    finePrint.content="You're done with this section.";
        		}else{
        		    finePrint.content="("+Math.round(this.json.sections[i].timeLimit/60)+" minute time limit)";
        		}
                finePrint.fillColor = this.colors[2];
                finePrint.bounds.left=startButton.bounds.right+this.margin;
                finePrint.bounds.centerY=startButton.bounds.centerY;
                this.sectionHandles[i].addChild(finePrint);

                //position
                this.sectionHandles[i].bounds.y=((i==0)?this.prompt.bounds.bottom+2*this.margin:this.sectionHandles[i-1].bounds.bottom+2*this.margin);
                
                //divider line
                if(i<this.json.sections.length-1){
                    var from = new paper.Point(0, 0);
                    var to = new paper.Point(this.prompt.bounds.width, 0);
                    var path = new paper.Path.Line(from, to);
                    path.strokeColor = this.colors[0];
                    path.opacity=0.25;
                    this.addChild(path);
                    path.bounds.centerX=this.canvasWidth/2;
                    path.bounds.top=this.sectionHandles[i].bounds.bottom+this.margin;
                }
            }
            
            //footer margin
            this.footer = new paper.Path.Rectangle(new paper.Point(0,this.sectionHandles[this.sectionHandles.length-1].bounds.bottom), new paper.Size(this.canvasWidth,this.margin));
            this.addChild(this.footer);
	    }else if(this.activeSection==-1){//all sections are complete
	        //"complete" message
            this.completeMessage = new paper.PointText();
    		this.completeMessage.fontFamily="underwood";
    		this.completeMessage.justification='center';
    		this.completeMessage.fontSize=32;
            this.completeMessage.content="You completed the exam. Nice job!";
            this.completeMessage.fillColor = this.colors[0];
            this.completeMessage.bounds.centerX = this.canvasWidth/2;
            this.addChild(this.completeMessage);
            this.completeMessage.bounds.top=this.title.bounds.bottom+this.margin;
            
            //Add the submit button
            this.submitButton=new Button("submit",this.canvasWidth/2-100,this.completeMessage.bounds.bottom+this.margin,200,50,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",32,["#CB6D51","#54c896","#000000"],this.submitAssignment.bind(this),null,null);
            this.addChild(this.submitButton);
	        //scroll to top of page
            window.dispatchEvent(new CustomEvent('updateScrollBar'));//update scroll bar
	    }else{//there is a section active
	        //time display
	        this.timer = new paper.PointText();
    		this.timer.fontFamily="helveticaNeueLight";
    		this.timer.justification='center';
    		this.timer.fontSize=24;
    		var timeLimitInMins=Math.round(this.json.sections[this.activeSection].timeLimit/60);
    		this.timer.content="";
            this.timer.fillColor = this.colors[2];
            this.timer.bounds.centerX = this.canvasWidth/2;
            this.addChild(this.timer);
            this.timer.bounds.top=this.title.bounds.bottom+this.margin;
            this.updateTimer(false);
            this.timerIntervalIdentifier = setInterval(this.updateTimer.bind(this), 500);//updates the time value every half second
	        
	        //answer choices (and checkboxes)
	        this.bubbleSheetContainer=new paper.Group();
            this.bubbleSheetContainer.applyMatrix=false;
            this.addChild(this.bubbleSheetContainer);
	        var numQs=this.json.sections[this.activeSection].numQs;
	        var rowsInCol0=Math.ceil(numQs/2);
	        this.questionHandles=new Array(numQs);
	        this.answerHandles=new Array(numQs);
	        this.checkboxHandles=new Array(numQs);
	        this.logTimeHandles=new Array(numQs);
	        var answerChoices = this.json.sections[this.activeSection].answerChoices;
	        for(var i=0;i<numQs;i++){
	            var col=i>rowsInCol0-1;//Column 0 or 1
	            var row=i-col*(rowsInCol0);
	            
	            //construct an empty group for this question
                this.questionHandles[i]=new paper.Group();
                this.questionHandles[i].applyMatrix=false;
                this.bubbleSheetContainer.addChild(this.questionHandles[i]);
	            
	            var questionLabel = new paper.PointText();
        		questionLabel.fontFamily="helveticaNeueLight";
        		questionLabel.justification='left';
        		questionLabel.fontSize=32;
        		questionLabel.content=(i+1).toString();
                questionLabel.fillColor = this.colors[2];
                this.questionHandles[i].addChild(questionLabel);
                
                //answers
	            var answers=answerChoices[i%answerChoices.length];
	            this.answerHandles[i]=new Array(answers.length);
	            var answerButtonSize=45;
	            for(var j=0;j<answers.length;j++){
	                if(this.stateJson && this.stateJson.sections[this.activeSection].recordedAnswers[i]!=null){
	                    if(this.stateJson.sections[this.activeSection].recordedAnswers[i]==j){
	                        var buttonBGColorArray=this.buttonBgSelected;
	                        var buttonFontColorArray=this.buttonFgSelected;
	                    }else{
	                        var buttonBGColorArray=this.buttonBgUnselected;
	                        var buttonFontColorArray=this.buttonFgUnselected;
	                    }
	                }else{
	                    var buttonBGColorArray=this.buttonBgReady;
	                    var buttonFontColorArray=this.buttonFgReady;
	                }
                    this.answerHandles[i][j]=new Button("question"+i+"answer"+j,0,0,answerButtonSize,answerButtonSize,answers[j],buttonBGColorArray,"helveticaNeueLight",32,buttonFontColorArray,this.answerClicked.bind(this,i,j),null,null);
                    this.answerHandles[i][j].bounds.left=(j==0)?questionLabel.bounds.right+this.margin:this.answerHandles[i][j-1].bounds.right+this.margin/4;
                    this.answerHandles[i][j].bounds.centerY=questionLabel.bounds.centerY;
                    this.questionHandles[i].addChild(this.answerHandles[i][j]);
                }
                
                //checkboxes
                var checkboxContainer= new paper.Group();
                checkboxContainer.applyMatrix=false;
                this.questionHandles[i].addChild(checkboxContainer);
                var checkboxJson=this.json.sections[this.activeSection].checkboxes;
                var checkboxSpacing=5;
                var checkboxSize=(answerButtonSize-checkboxSpacing*(checkboxJson.length-1))/checkboxJson.length;
                this.checkboxHandles[i]=new Array(checkboxJson.length);
                for(var j=0;j<checkboxJson.length;j++){
                    this.checkboxHandles[i][j]=new CheckBox(i+","+j,0,0,checkboxSize,this.colors,this.checkboxClicked.bind(this,i,j));
                    checkboxContainer.addChild(this.checkboxHandles[i][j]);
                    this.checkboxHandles[i][j].bounds.top=this.answerHandles[i][this.answerHandles[i].length-1].bounds.top+j*(checkboxSize+checkboxSpacing);
                    var checkText = new paper.PointText();
                    checkText.fontFamily="helveticaNeueLight";
                    checkText.justification='left';
                    checkText.fontSize=14;
                    checkText.content=checkboxJson[j];
                    checkText.fillColor = this.colors[2];
                    checkText.bounds.left = this.checkboxHandles[i][j].bounds.right+checkboxSpacing;
                    checkText.bounds.centerY=this.checkboxHandles[i][j].bounds.centerY;
                    checkboxContainer.addChild(checkText);
                    this.checkboxHandles[i][j].selected=(this.stateJson.sections[this.activeSection].checkboxStates[i][j])?true:false;
                }
                checkboxContainer.bounds.left=this.answerHandles[i][this.answerHandles[i].length-1].bounds.right+this.margin/2;
                
                //log time button
                this.logTimeHandles[i]=new Button("log time"+i,0,0,2*answerButtonSize,answerButtonSize,"LOG TIME",["#f9fdfc","#E3F6EE","#DDDDDD"],"helveticaNeueLight",18,["#54c896","#54c896","#000000"],this.logTime.bind(this,i,true),null,null);
                this.logTimeHandles[i].bounds.left=checkboxContainer.bounds.right+checkboxSpacing;
                this.logTimeHandles[i].bounds.centerY=questionLabel.bounds.centerY;
                this.questionHandles[i].addChild(this.logTimeHandles[i]);
                
                //positioning
                if(col){
                    this.questionHandles[i].bounds.left = this.canvasWidth/2+25;
                }else{
                    this.questionHandles[i].bounds.right = this.canvasWidth/2-25;
                }
                this.questionHandles[i].bounds.top=(row==0)?this.timer.bounds.bottom+2*this.margin:this.questionHandles[i-1].bounds.bottom+this.margin/2;
	        }
	        
	        //divider line
            var from = new paper.Point(0, 0);
            var to = new paper.Point(0, this.bubbleSheetContainer.bounds.height);
            var path = new paper.Path.Line(from, to);
            path.strokeColor = this.colors[2];
            path.opacity=0.2;
            path.bounds.centerX=this.canvasWidth/2;
            path.bounds.top=this.bubbleSheetContainer.bounds.top;
            this.bubbleSheetContainer.addChild(path);
	        
	        //submit button
	        this.submitButton=new Button("submit",0,0,200,50,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",32,["#CB6D51","#54c896","#000000"],this.submitCurrentSection.bind(this),null,null);
            this.submitButton.bounds.top=this.bubbleSheetContainer.bounds.bottom+this.margin;
            this.submitButton.bounds.centerX=this.canvasWidth/2;
            this.addChild(this.submitButton);
            
            //footer margin
            this.footer = new paper.Path.Rectangle(new paper.Point(0,this.submitButton.bounds.bottom), new paper.Size(this.canvasWidth,this.margin));
            this.addChild(this.footer);
	    }
	}
	
	answerClicked(questionId,answerId){
	    this.logTime(questionId);
	    //update the recorded answer
	    if(this.stateJson.sections[this.activeSection].recordedAnswers[questionId]==answerId){
	        this.stateJson.sections[this.activeSection].recordedAnswers[questionId]=null;
	        var selected=false;
	    }else{
	        this.stateJson.sections[this.activeSection].recordedAnswers[questionId]=answerId;
	        var selected=true;
	    }
	    //recolor the buttons
	    for(var answer=0;answer<this.answerHandles[questionId].length;answer++){
	        if(selected){
	            if(answer==answerId){
	                this.answerHandles[questionId][answer].setColors(this.buttonBgSelected,this.buttonFgSelected);
	            }else{
	                this.answerHandles[questionId][answer].setColors(this.buttonBgUnselected,this.buttonFgUnselected);
	            }
	        }else{
	            this.answerHandles[questionId][answer].setColors(this.buttonBgReady,this.buttonFgReady);
	        }
	    }
	    this.saveProgress();
	}
	checkboxClicked(questionId,checkboxId){
	    this.stateJson.sections[this.activeSection].checkboxStates[questionId][checkboxId]=!this.stateJson.sections[this.activeSection].checkboxStates[questionId][checkboxId];
	
	    this.saveProgress();
	}
	logTime(questionId,saveProgress=false){
	    var currTime=Math.floor(Date.now()/1000);
	    if(this.stateJson.sections[this.activeSection].answerTimeStamps[questionId] && !isNaN(this.stateJson.sections[this.activeSection].answerTimeStamps[questionId])){
	        this.stateJson.sections[this.activeSection].answerTimeStamps[questionId]+=currTime-this.lastAnswerTimeStamp;
	    }else{
	        this.stateJson.sections[this.activeSection].answerTimeStamps[questionId]=currTime-this.lastAnswerTimeStamp;
	    }
	    this.lastAnswerTimeStamp=currTime;
	    if(this.stateJson.sections[this.activeSection].answerTimeStamps[questionId]>60){
	        var logTimeString=Math.floor(this.stateJson.sections[this.activeSection].answerTimeStamps[questionId]/60)+" m "+Math.round(this.stateJson.sections[this.activeSection].answerTimeStamps[questionId]%60)+" s";
	    }else{
	        var logTimeString=this.stateJson.sections[this.activeSection].answerTimeStamps[questionId]+" s";
	    }
	    var fadeTag=new FadeTag(this.logTimeHandles[questionId].bounds.x,this.logTimeHandles[questionId].bounds.y,this.logTimeHandles[questionId].bounds.width,this.logTimeHandles[questionId].bounds.height,"#f9fdfc",1,logTimeString,"helveticaNeueLight",18,this.colors[0]);
	    this.questionHandles[questionId].addChild(fadeTag);
	    //console.log("time logged for question #"+questionId+": "+this.stateJson.sections[this.activeSection].answerTimeStamps[questionId]);
	    
	    if(saveProgress){
	        this.saveProgress();
	    }
	}
	startSection(sectionId){
	    console.log("starting section "+sectionId);
	    this.activeSection=sectionId;
	    this.stateJson.sections[this.activeSection].state="active";
	    this.stateJson.sections[this.activeSection].startTimeStamp=Math.floor(Date.now()/1000);
	    this.lastAnswerTimeStamp=this.stateJson.sections[this.activeSection].startTimeStamp;
	    this.render();

	    this.saveProgress();
	}
	updateTimer(outOfTimeHandling=true){
	    var timeRemaining=this.json.sections[this.activeSection].timeLimit-(Math.floor(Date.now()/1000)-this.stateJson.sections[this.activeSection].startTimeStamp);
	    if(timeRemaining>60){
	        this.timer.content=this.json.sections[this.activeSection].title+" ("+(Math.floor(timeRemaining/60)+1)+" minutes remaining)";
	    }else if(timeRemaining>0){
	        this.timer.content=this.json.sections[this.activeSection].title+" ("+timeRemaining+" second"+((timeRemaining>1)?"s":"")+" remaining)";
	    }else{
	        this.timer.content="Out of time.";
	        if(outOfTimeHandling){
	            this.outOfTimeHandler();
	        }
	    }
	}
	outOfTimeHandler(){
	    this.outOfTimeFlag=true;
	    
	    this.submitCurrentSection();
	}
	submitCurrentSection(){
	    this.stateJson.sections[this.activeSection].state="complete";
	    this.stateJson.sections[this.activeSection].completeTimeStamp=Math.floor(Date.now()/1000);
	    this.activeSection=-1;
	    this.sectionsRemaining--;
	    this.render();
	    window.dispatchEvent(new CustomEvent('updateScrollBar'));//update scroll bar to the top of page
	    this.saveProgress();
	}
	
	saveProgress(){
	    window.dispatchEvent(new CustomEvent('saveAssignment',{ detail: this.json.id}));
	}
	submitAssignment(){
	    this.submitButton.toggle=false;
	    window.dispatchEvent(new CustomEvent('submitAssignment',{ detail: this.json.id}));
	}
	
	getStateJson(){
	    return this.stateJson;
	}
	update(){
	    //this method is not used currently, but it is still called by the Engine.js
	}
	panelsOpenCompleteCallback(){
	    //this method is not used currently, but it is still called by the Engine.js
	}
	remove(){
	    super.remove();
	    if(this.timerIntervalIdentifier){
	        clearInterval(this.timerIntervalIdentifier);
	        this.timerIntervalIdentifier=null;
	    }
	}
}
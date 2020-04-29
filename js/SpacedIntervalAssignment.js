class SpacedIntervalAssignment extends paper.Layer{
	constructor(canvasWidth,margin,colors,json,credentials) {
	    //console.log(json);
	    super();
	    this.applyMatrix=false;
	    this.canvasWidth=canvasWidth;
	    this.margin=margin;
	    this.colors=colors;
	    this.json=json;
	    this.credentials=credentials;
	    
	    this.currentQuestion=0;
	    this.incorrectCount=0;
	    
	    this.render();
	}
	render(){
	    this.removeChildren();
	    var currentDate = new Date();
	    
	    //text body
		//content title
		this.title = new paper.PointText();
		this.title.fontFamily="underwood";
		this.title.justification='center';
		this.title.fontSize=36;
        this.title.content="Spaced Interval Assignment ("+(currentDate.getMonth()+1)+"/"+currentDate.getDate()+")";
        this.title.fillColor = this.colors[1];
        this.title.position.x += this.canvasWidth/2;
        this.title.position.y += this.margin+this.title.bounds.height/2;
        this.addChild(this.title);
        if(this.currentQuestion<this.json.flashcards.length){
            //Current question text
            this.currQText = new paper.PointText();
    		this.currQText.fontFamily="helveticaNeueLight";
    		this.currQText.justification='center';
    		this.currQText.fontSize=21;
    		//console.log(this.json.flashcards[this.currentQuestion]);
            this.currQText.content=(this.json.flashcards.length-this.currentQuestion)+" questions remaining out of "+this.json.flashcards.length+" total. Drawn from "+this.json.flashcards[this.currentQuestion].assignmentTitle+((1)?', '+this.json.flashcards[this.currentQuestion].sectionTitle:'');
            this.currQText.fillColor = this.colors[2];
            this.currQText.bounds.centerX = this.canvasWidth/2;
            this.currQText.bounds.top = this.title.bounds.bottom+this.margin;
            this.addChild(this.currQText);
            
            //Prompt
            this.promptText = new paper.PointText();
    		this.promptText.fontFamily="helveticaNeueLight";
    		this.promptText.justification='center';
    		this.promptText.fontSize=24;
            this.promptText.content='Please answer Question #'+(this.json.flashcards[this.currentQuestion].questionId+1)+' from the excerpt below:';
            this.promptText.fillColor = this.colors[0];
            this.promptText.bounds.centerX = this.canvasWidth/2;
            this.promptText.bounds.top = this.currQText.bounds.bottom+this.margin;
            this.addChild(this.promptText);
            
            //answer options
            this.answerPanel=new paper.Group();
            this.addChild(this.answerPanel);
            var buttonSize=50;
            this.answerButtonHandles=new Array(this.json.flashcards[this.currentQuestion].answers.length);
            for(var i=0;i<this.json.flashcards[this.currentQuestion].answers.length;i++){
                var buttonBGColorArray=["#FAF2EF","#E3F6EE","#DDDDDD"];
                var buttonFontColorArray=["#CB6D51","#54c896","#000000"];
                this.answerButtonHandles[i]=new Button("answer"+i,i*(buttonSize+this.margin),0,buttonSize,buttonSize,this.json.flashcards[this.currentQuestion].answers[i],buttonBGColorArray,"helveticaNeueLight",32,buttonFontColorArray,this.answerClickCallback.bind(this,i),null,null);
                this.answerPanel.addChild(this.answerButtonHandles[i]);
            }
            this.answerPanel.bounds.centerX=this.canvasWidth/2;
            this.answerPanel.bounds.top=this.promptText.bounds.bottom+this.margin;
            
            //Feedback
            this.feedbackText = new paper.PointText();
    		this.feedbackText.fontFamily="helveticaNeueLight";
    		this.feedbackText.justification='center';
    		this.feedbackText.fontSize=24;
            this.feedbackText.content=' ';
            this.feedbackText.fillColor = this.colors[2];
            this.feedbackText.bounds.centerX = this.canvasWidth/2;
            this.feedbackText.bounds.top = this.answerPanel.bounds.bottom+this.margin;
            this.addChild(this.feedbackText);
            
            //optional prompt image(s)
            if(this.json.flashcards[this.currentQuestion].promptImages){
                this.promptImageHandles=new Array(this.json.flashcards[this.currentQuestion].promptImages.length);
                for(var i=0;i<this.json.flashcards[this.currentQuestion].promptImages.length;i++){
                    this.promptImageHandles[i]=new RasterLoader("promptImage"+i,this.json.flashcards[this.currentQuestion].promptImages[i].url,this.json.flashcards[this.currentQuestion].promptImages[i].width,this.json.flashcards[this.currentQuestion].promptImages[i].height,0,null,0);
        		    this.addChild(this.promptImageHandles[i]);
        		    this.promptImageHandles[i].bounds.centerX=this.canvasWidth/2;
        		    this.promptImageHandles[i].bounds.top=(i==0)?this.feedbackText.bounds.bottom:this.promptImageHandles[i-1].bounds.bottom;
                }
    		}
            
            //Add background white panel to define page size
            var bottomOfAssignment=(this.promptImageHandles)?this.promptImageHandles[this.promptImageHandles.length-1].bounds.bottom+this.margin:this.answerPanel.bounds.bottom+this.margin;
            this.bottomMargin = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(this.canvasWidth,bottomOfAssignment));
            this.bottomMargin.fillColor = "#FFFFFF";
            this.addChild(this.bottomMargin);
            this.bottomMargin.sendToBack();
        }else{//no more questions to display
            //All done text
            this.allDoneText = new paper.PointText();
    		this.allDoneText.fontFamily="helveticaNeueLight";
    		this.allDoneText.justification='center';
    		this.allDoneText.fontSize=21;
            this.allDoneText.content="Nice job! You are all done for today!";
            this.allDoneText.fillColor = this.colors[0];
            this.allDoneText.bounds.centerX = this.canvasWidth/2;
            this.allDoneText.bounds.top = this.title.bounds.bottom+this.margin;
            this.addChild(this.allDoneText);
            //submit button
    	    var buttonBGColorArray=["#FAF2EF","#E3F6EE","#DDDDDD"];
            var buttonFontColorArray=["#CB6D51","#54c896","#000000"];
            this.exitButton=new Button("exit",0,0,110,50,"EXIT",buttonBGColorArray,"underwood",32,buttonFontColorArray,this.exit.bind(this),null,null);
            this.exitButton.bounds.centerX=this.allDoneText.bounds.centerX;
            this.exitButton.bounds.top=this.allDoneText.bounds.bottom+this.margin;
            this.addChild(this.exitButton);
        }
	}
	answerClickCallback(answerIndex){
	    if(answerIndex==this.json.flashcards[this.currentQuestion].correct){//correct
	        for(var i=0;i<this.answerButtonHandles.length;i++){
	            if(i==answerIndex){
	                this.answerButtonHandles[i].setColors(["#E3F6EE","#E3F6EE","#E3F6EE"],["#54c896","#54c896","#54c896"]);
	                this.answerButtonHandles[i].clickCallback=null;
	            }else{
	                this.answerButtonHandles[i].toggle=false;
	            }
	        }
	        this.feedbackText.content='Correct! What can you tell me about how this problem felt?';
            this.feedbackText.fillColor = this.colors[0];
            this.removePromptImages();
            this.displayCheckboxes();
            this.submitFlashcardToServer(this.json.flashcards[this.currentQuestion].id, true);
	    }else{//incorrect
	        if(this.incorrectCount==0){//give one more chance
	            this.answerButtonHandles[answerIndex].toggle=false;
	            this.feedbackText.content='Not quite, try one more time.';
                this.feedbackText.fillColor = this.colors[1];
                this.incorrectCount++;
                this.submitFlashcardToServer(this.json.flashcards[this.currentQuestion].id, false);
	        }else{//incorrect 2x in a row
	            this.feedbackText.content='Not quite. What can you tell me about what you found hard on this problem?';
                this.feedbackText.fillColor = this.colors[1];
                for(var i=0;i<this.answerButtonHandles.length;i++){
                    this.answerButtonHandles[i].clickCallback=null;
                    if(i==answerIndex){
                        this.answerButtonHandles[i].setColors(["#FAF2EF","#FAF2EF","#FAF2EF"],["#CB6D51","#CB6D51","#CB6D51"]);
                    }else{
                        this.answerButtonHandles[i].toggle=false;
                    }
                }
                this.removePromptImages();
                this.displayCheckboxes();
	        }
	    }
	}
	displayCheckboxes(){
	    //remove old content
	    if(this.checkboxHandles){
	        for(var i=0;i<this.checkboxHandles.length;i++){
	            this.checkboxHandles[i].remove();
	        }
	    }
	    if(this.checkboxSubmitButton){
	        this.checkboxSubmitButton.remove();
	    }
	    
	    if(this.json.flashcards[this.currentQuestion].checkboxTemplate){
	        var checkboxesJson=this.json.flashcards[this.currentQuestion].checkboxTemplate.checkboxes;
    	    //generate check boxes
    	    this.checkboxHandles=new Array(checkboxesJson.length);
    	    var checkboxSize=15;
    	    var checkboxContainer=new paper.Group();
    	    this.addChild(checkboxContainer);
    	    for(var i=0;i<this.checkboxHandles.length;i++){
    	        //checkbox
    	        this.checkboxHandles[i]=new CheckBox(i,0,i*(checkboxSize+this.margin),checkboxSize,this.colors,this.checkboxClickCallback.bind(this,i),true);
    	        checkboxContainer.addChild(this.checkboxHandles[i]);
    	        //text
    	        var txt = new paper.PointText();
        		txt.fontFamily="helveticaNeueLight";
        		txt.justification='left';
        		txt.fontSize=21;
                txt.content=checkboxesJson[i].content;
                txt.fillColor = this.colors[0];
                txt.bounds.left = this.checkboxHandles[i].bounds.right+this.margin;
                txt.bounds.centerY = this.checkboxHandles[i].bounds.centerY;
                checkboxContainer.addChild(txt);
    	    }
    	    
    	    //submit button
    	    var buttonBGColorArray=["#FAF2EF","#E3F6EE","#DDDDDD"];
            var buttonFontColorArray=["#CB6D51","#54c896","#000000"];
            this.checkboxSubmitButton=new Button("checkboxSubmit",0,0,150,50,"SUBMIT",buttonBGColorArray,"underwood",32,buttonFontColorArray,this.submitCheckboxes.bind(this),null,null);
            this.checkboxSubmitButton.bounds.centerX=checkboxContainer.bounds.centerX;
            this.checkboxSubmitButton.bounds.top=checkboxContainer.bounds.bottom+this.margin;
            checkboxContainer.addChild(this.checkboxSubmitButton);
    	    
    	    //positioning
    	    checkboxContainer.bounds.centerX=this.canvasWidth/2;
    	    checkboxContainer.bounds.top=this.feedbackText.bounds.bottom+this.margin;
	    }else{
	        this.submitCheckboxes.bind(this);
	    }
	}
	checkboxClickCallback(answerIndex){
	    if(this.json.flashcards[this.currentQuestion].checkboxTemplate && this.json.flashcards[this.currentQuestion].checkboxTemplate.radioBox && this.checkboxHandles[answerIndex].selected){//radio checkbox, toggle all other checkboxes off
	        for(var i=0;i<this.checkboxHandles.length;i++){
	            if(i!=answerIndex){
	                this.checkboxHandles[i].selected=false;
	            }
	        }
	    }
	}
	submitCheckboxes(){
	    //iterate through checkboxes, checking for any holds
	    var holdOn=0;
	    var checkboxIds=new Array(0);
	    var userText=new Array(0);
	    for(var i=0;i<this.checkboxHandles.length;i++){
	        if(this.checkboxHandles[i].selected){
	            checkboxIds.push(i);
	            userText.push('');//!!!!!placeholder empty string, when user custom input textboxes are added, come back and update this line to pull that content
	            if(this.json.flashcards[this.currentQuestion].checkboxTemplate.checkboxes[i].holdIfChecked){
	                holdOn=1;
	            }
	        }
	    }
	    if(checkboxIds.length>0){//at least one checkbox was checked
    	    //submit checkbox responses to server
    	    var xmlhttp = new XMLHttpRequest();
            var params = JSON.stringify({
                username: this.credentials.username,
                password: this.credentials.password,
                flashcardId: this.json.flashcards[this.currentQuestion].id,
                checkboxTemplateId: this.json.flashcards[this.currentQuestion].checkboxTemplate.templateId,
                checkedBoxes: checkboxIds,
                userText: userText,
                hold: holdOn,
                timeStamp: Math.floor(Date.now()/1000)
            });
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    //console.log("flashcard checkbox submitted to server...");
                    //console.log(this.responseText);
                }
            };
            xmlhttp.open("POST", "cgi-bin/flashcardCheckboxResponse.py", true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send(params);
	    }else{
	        //console.log("no flashcard checkboxes were checked, so none were submitted to the server.");
	    }
	    
	    //increment to next question
	    this.currentQuestion++;
	    this.incorrectCount=0;
	    this.render();
	}
	removePromptImages(){
	    if(this.promptImageHandles){
    	    for(var i=0;i<this.promptImageHandles.length;i++){
    	        this.promptImageHandles[i].remove();
    	    }
	    }
	    this.promptImageHandles=null;
	}
	submitFlashcardToServer(flashcardId, isCorrect){
	    var xmlhttp = new XMLHttpRequest();
        var params = JSON.stringify({
            username: this.credentials.username,
            password: this.credentials.password,
            flashcardId: flashcardId,
            isCorrect: isCorrect,
        });
        
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //console.log("flashcard submitted to server...");
                //console.log(this.responseText);
            }
        };
        xmlhttp.open("POST", "cgi-bin/flashcardResponse.py", true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(params);
	}
	exit(){
	    if(this.exitButton){
	        this.exitButton.toggle=false;
	    }
	    window.dispatchEvent(new CustomEvent('submitAssignment',{ detail: this.json.id}));
	}
	panelsOpenCompleteCallback(){
	}
	update(){
	}
	remove(){
	    super.remove();
	}
}
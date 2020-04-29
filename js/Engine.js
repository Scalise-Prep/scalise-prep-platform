class Engine extends paper.Layer{
	constructor(credentials,width,height,colors,json) {
	    super();
	    this.applyMatrix=false;
	    this.credentials=credentials;
	    this.colors=colors;
		this.json=json;//JSON.parse(jsonString);
		this.assignmentResponses=[];//an (possibly empty) array containing json files with the responses from complete and partially-complete assignmnets
		this.currentAssignmentId=null;
		this.currentFlashcard=0;
		this.width=width;
		this.height=height;
		this.oldWindowWidth=1280;
		
		//record all assignResponses in array
		this.storeAssignResponses();
		
		//handle any existing localStorage saved assignments
		for (var key in localStorage){
		    if(key.length>10 && key.substr(0,10)=="assignment"){
    		    var assignmentId=parseInt(key.substr(10));
                var savedJson=JSON.parse(localStorage.getItem(key));
                var timeStamp=(savedJson.timeStamp)?savedJson.timeStamp:0;
                //check if any assignments match this assignmentId
                for(var i=0;i<this.json.assignments.length;i++){//iterate through all assignments
                    if(this.json.assignments[i].id==assignmentId && (this.assignmentResponses.length<i-1 || (!this.assignmentResponses[i]) || (!this.assignmentResponses[i].timeStamp) || this.assignmentResponses[i].timeStamp<timeStamp)){//compare assignmentIds and timeStamps
                        ////console.log("Found unsaved assignment on localStorage, saving to database");
                        this.assignmentResponses[i]=savedJson;//replace assignmentResponses with localStorage saved file
                    }
                }
                this.trySaveAssignmentState2ServerByJSON(false,assignmentId,'active',JSON.stringify(savedJson),timeStamp,false)//save to server
            }
		}
		
		var panelVelocity=5;
		this.margin=20;
		this.contentLayer = new paper.Layer();//for holding focused items (video lectures, problem sets, etc)
		this.addChild(this.contentLayer);
		var profilePanelWidth=width/4;
		this.profilePanel = new Panel(-1,-1,profilePanelWidth+2,height+2,true,[panelVelocity,0],"#FFFFFF",null);
		this.addChild(this.profilePanel);
		this.assignmentPanel = new Panel(width/4,-1,3*width/4+1,height+2,true,[-panelVelocity*3,0],"#FFFFFF",this.panelsOpenCompleteCallback.bind(this));
		this.addChild(this.assignmentPanel);
		
		//Construct the profile menu
		//picture
        this.profilePic = new paper.Raster("images/owlCartoon.png");
        this.profilePic.visible=false;
        this.profilePic.onLoad = function() {
            this.profilePanel.addChild(this.profilePic);
		    this.profilePic.scale(200/this.profilePic.bounds.height);
            this.profilePic.translate(new paper.Point(0.5*width/4,this.profilePic.bounds.height/2));
            this.profilePic.visible=true;
        }.bind(this);
		//picture (old code, can remove)
		/*this.profilePic = new paper.Raster('profilePic');
		this.profilePanel.addChild(this.profilePic);
		this.profilePic.scale(150/this.profilePic.bounds.height);
        this.profilePic.translate(new paper.Point(0.5*width/4,this.profilePic.bounds.height/2+this.margin));*/
        //name
        this.profileName = new paper.PointText();
		this.profileName.fontFamily="underwood";
		this.profileName.justification='center';
		this.profileName.fontSize=24;
        this.profileName.content=this.json.user.name;
        this.profileName.fillColor = "#898989";
        this.profileName.position.x += 0.5*width/4;
        this.profileName.bounds.top=210;
        this.profilePanel.addChild(this.profileName);
        //boundary line
		var tempPath = new paper.Path();
		tempPath.strokeColor = "#54c896";
		tempPath.add(new paper.Point(width/4, this.margin));
		tempPath.add(new paper.Point(width/4, height-this.margin));
		tempPath.opacity=0.25;
		this.profilePanel.addChild(tempPath);
		//bar displays
		//first find the earliest and highest scores for each topic
		var baselineScores={};
	    var earliestDates={};
	    var highScores={};
		if(this.json.hasOwnProperty('examScores')){
		    for(var examIndex=0;examIndex<this.json.examScores.length;examIndex++){
    		    var topics=Object.keys(this.json.examScores[examIndex].sectionScaleScores);
    		    for(var i=0;i<topics.length;i++){
    		        var timeStamp=this.json.examScores[examIndex].completionTimeStamp;
    		        var sectionScaledScore=this.json.examScores[examIndex].sectionScaleScores[topics[i]];
    		        if(highScores[topics[i]]){//already found a score for this topic
    		            if(earliestDates[topics[i]]>timeStamp){
    		                earliestDates[topics[i]]=timeStamp;
    		                baselineScores[topics[i]]=sectionScaledScore;
    		            }
    		            if(highScores[topics[i]]<sectionScaledScore){
    		                highScores[topics[i]]=sectionScaledScore;
    		            }
    		        }else{//no score found for this topic, create new entry
    		            earliestDates[topics[i]]=timeStamp;
    		            baselineScores[topics[i]]=sectionScaledScore;
    		            highScores[topics[i]]=sectionScaledScore;
    		        }
		        }
		    }
		}
		//calculate composite score
		this.scoreBarKeys=["english","math","reading","science"];//the list of non-composite score bars to display
		var compositeScore=0;
		var categoriesWithScores=0;
		for(var i=0;i<this.scoreBarKeys.length;i++){
		    if(highScores[this.scoreBarKeys[i]]){
		        compositeScore+=highScores[this.scoreBarKeys[i]];
		        categoriesWithScores++;
		    }else{
		        baselineScores[this.scoreBarKeys[i]]=null;
		        highScores[this.scoreBarKeys[i]]=0;
		    }
		}
		compositeScore=compositeScore/Math.max(1,categoriesWithScores);
		//construct the score bars
		var barWidth=0.6*profilePanelWidth;
		var barHeight=15;
		var barLeft=(profilePanelWidth-barWidth)/2;
		this.barLeft=barLeft;
		this.totalScoreBar= new BarDisplayUI("SCORE",barWidth,barHeight,"#EEEEEE",colors[0],compositeScore,36,null,2);
		this.totalScoreBar.bounds.top=this.profileName.bounds.bottom+barHeight;
		this.totalScoreBar.bounds.centerX=this.profileName.bounds.centerX;
		this.profilePanel.addChild(this.totalScoreBar);
		//divider bar
		var tempPath = new paper.Path();
		tempPath.strokeColor = "#54c896";
		tempPath.add(new paper.Point(barLeft, this.totalScoreBar.bounds.bottom+0.75*barHeight));
		tempPath.add(new paper.Point(barLeft+barWidth, this.totalScoreBar.bounds.bottom+0.75*barHeight));
		tempPath.opacity=0.25;
		this.profilePanel.addChild(tempPath);
		//other score bars
		this.scoreBarHandles=[];
		for(var i=0;i<this.scoreBarKeys.length;i++){
		    this.scoreBarHandles[i]=new BarDisplayUI(this.scoreBarKeys[i].toUpperCase(),barWidth,barHeight,"#EEEEEE",colors[0],highScores[this.scoreBarKeys[i]],36,baselineScores[this.scoreBarKeys[i]])
		    this.scoreBarHandles[i].bounds.top=(i==0)?tempPath.bounds.bottom+0.75*barHeight:this.scoreBarHandles[i-1].bounds.bottom+barHeight;
    		this.scoreBarHandles[i].bounds.centerX=this.profileName.bounds.centerX;
    		this.profilePanel.addChild(this.scoreBarHandles[i]);
		}

		//Construct the assignments section
		//title
		this.assignmentsText = new paper.PointText();
		this.assignmentsText.fontFamily="underwood";
		this.assignmentsText.justification='center';
		this.assignmentsText.fontSize=32;
		this.assignmentsText.content="X";
		this.assignmentsText.fillColor = "#898989";
		this.assignmentsText.bounds.centerX = 0.5*(3*width/4);
		this.assignmentsText.position.y += this.margin+this.assignmentsText.bounds.height/2;
        this.assignmentPanel.addChild(this.assignmentsText);
        //Construct the flashcard object
		this.flashcard=new Flashcard(650,650*3/5,this.margin*1.5,this.loadNewFlashcard.bind(this),this.submitCurrentFlashcard.bind(this));
		this.flashcard.bounds.left=0.5*(3*width/4-600);
		this.flashcard.bounds.top=this.assignmentsText.bounds.bottom+this.margin;
		this.assignmentPanel.addChild(this.flashcard);
		//populate assignments
		this.assignmentLinksContainer = new paper.Group();
		this.assignmentLinksContainer.applyMatrix=false;
		this.assignmentLinksContainer.bounds.top=(this.currentFlashcard<this.json.flashcards.length)?this.flashcard.bounds.bottom+2*this.margin:this.assignmentsText.bounds.bottom+this.margin;
		this.assignmentPanel.addChild(this.assignmentLinksContainer);
        this.populateAssignments(this.json.assignments);
		//Load the first flashcard
		this.loadNewFlashcard();
		
        //construct the menu buttons
        var buttonWidth=100;
        var logoHeight=55;
        var helpButton=new Button("help",0,0,buttonWidth,logoHeight,"ASK A TUTOR",[],"helveticaNeueLight",16,[colors[2],colors[0],"#000000"],function(){window.dispatchEvent(new CustomEvent('requestPopup',{ detail: "QuestionFormLoggedIn"}));}.bind(this),null,null);
        var logoutButton=new Button("logout",0,0,buttonWidth,logoHeight,"LOGOUT",[],"helveticaNeueLight",16,[colors[2],colors[0],"#000000"],this.logout.bind(this),null,null);
		window.dispatchEvent(new CustomEvent('requestMenuButtons',{detail:{"buttonHandles":[helpButton,logoutButton]}}));
        
		//start the update loop
		var interval = setInterval(this.update.bind(this), 15);//call the main update loop every n ms
		
		//listeners
        this.submitAssignmentCallback=this.submitAssignmentHandler.bind(this);
        window.addEventListener('submitAssignment', this.submitAssignmentCallback);
        this.saveAssignmentCallback=this.saveAssignmentHandler.bind(this);
        window.addEventListener('saveAssignment', this.saveAssignmentCallback);
        window.onunload=this.onunloadCallback.bind(this);
	}
	populateAssignments(){
	    //unload any old assignments
	    if(this.assignmentButtons){
    	    for(var i=0;i<this.assignmentButtons.length;i++){
    	        this.assignmentButtons[i].remove();
    	    }
	    }
	    this.assignmentButtons=new Array(this.json.assignments.length);
	    
	    //load the new assignments
	    this.assignmentsText.content=(this.json.assignments.length==0 && this.json.flashcards.length==0)?"YOU'RE ALL DONE FOR TODAY!":"YOU HAVE WORK TO DO!";
		//populate the assignment links
		var assignmentButtonHeight=90;
		if(this.json.assignments.length>0){
    		if(this.json.assignments[0].type=='SpacedInterval'){
    		    var sia=this.json.assignments.shift();
    		    this.json.assignments.sort(this.GetSortOrder("start"));
    		    this.json.assignments.sort(this.GetSortOrder("due"));
    		    this.json.assignments.unshift(sia);
    		}else{
    		    this.json.assignments.sort(this.GetSortOrder("start"));
    		    this.json.assignments.sort(this.GetSortOrder("due"));
    		}
		}
		for(var i=0;i<this.json.assignments.length;i++){
		    if(this.json.assignments[i].type=="SpacedInterval"){
		        var assignmentTitle="Daily Spaced Interval Assignment";
		        var d = new Date();
                d.setHours(23);
                d.setMinutes(59);
                d.setSeconds(0);
                d.setMilliseconds(0);
		        var assignDue=d.getTime()/1000;
		    }else{
		        var assignmentTitle=this.json.assignments[i].title;
		        var assignDue=this.json.assignments[i].due;
		    }
		    var pos=i;//(this.json.assignments.length-1-i);
		    this.assignmentButtons[i]=new AssignmentButton(i,this.barLeft,pos*assignmentButtonHeight,3*this.width/4-2*this.barLeft,assignmentButtonHeight,assignmentTitle,["#FFFFFF","#FAF2EF","#FAF2EF"],"underwood",21,["#54c896","#CB6D51","#2E3136"],this.openPanels.bind(this),null,null,assignDue,this.json.assignments[i].imageURL);
		    this.assignmentLinksContainer.addChild(this.assignmentButtons[i]);
		}
	}
	GetSortOrder(prop) {  
        return function(a, b) {  
            if (a[prop] > b[prop]) {  
                return 1;  
            } else if (a[prop] < b[prop]) {  
                return -1;  
            }  
            return 0;  
        }  
    }  
	storeAssignResponses(){
	    this.assignmentResponses=[];//clear any old responses
		if(this.json.assignResponse){
		    for(var i=0;i<this.json.assignResponse.length;i++){
		        if(this.json.assignResponse[i]){
		            this.assignmentResponses[i]=this.json.assignResponse[i];
		        }
		    }
		}
	}
	onunloadCallback(){
	    this.trySaveAssignmentState2Server(false);
	}
	submitAssignmentHandler(event){//for submit buttons on assignments
	    this.lastSubmittedAssignmentId=this.json.assignments[this.currentAssignmentId].id;
	    if(this.assignmentButtons[this.currentAssignmentId]){
	        this.assignmentButtons[this.currentAssignmentId].markAsComplete();
	    }
	    this.closeCurrentAssignment(true);
	    var allAssignmentsComplete=true;
	    for(var i=0;i<this.assignmentButtons.length;i++){
	        if(this.assignmentButtons[i].isComplete==false){
	            allAssignmentsComplete=false;
	        }
	    }
	    if(allAssignmentsComplete && (this.json.flashcards.length==0 || this.currentFlashcard>=this.json.flashcards.length)){
	        this.assignmentsText.content="YOU'RE ALL DONE FOR TODAY!";
	    }
	}
	saveAssignmentHandler(event){//for incrementally saving partial progress on assignment, without submitting or closing assignment
		    if(this.assignment){
    		    //get state json
    		    var stateJson = this.assignment.getStateJson();
    		    stateJson.timeStamp=Math.round(+new Date()/1000);
    		    var jsonString = JSON.stringify(stateJson);
    		    //get assignment id
    		    if(this.json.assignments[this.currentAssignmentId]){
        		    var assignmentId = this.json.assignments[this.currentAssignmentId].id;
        		    //save to localStorage
        		    localStorage.setItem("assignment"+assignmentId, jsonString);
    		    }
		    }
		    //This line was for saving to the server instead of to localStorage//this.trySaveAssignmentState2Server(false);
	}
	logout(){
	    this.trySaveAssignmentState2Server(false);
	    document.body.style.cursor = "default";
	    window.dispatchEvent(new CustomEvent('requestVideoHide'));
	    var requestDetail={pageRequest:"HomePage"};
	    window.dispatchEvent(new CustomEvent('requestPage',{ detail: requestDetail}));
	}
	trySaveAssignmentState2Server(assignmentCompleted){
	    if(this.assignment && (typeof this.assignment.getStateJson === "function")){
	        //check for assignment stored state json
		    if(typeof this.assignment.getStateJson === "function"){
		        var stateJson = this.assignment.getStateJson();
		        stateJson.timeStamp=Math.round(+new Date()/1000);
		        //update client stored state json
		        this.assignmentResponses[this.currentAssignmentId] = stateJson;
		        //check if assignment is an Exam
		        if(assignmentCompleted && this.assignment.json && this.assignment.json.type=="Exam"){
		            var updateScoresOnReturn=true;
		        }else{
		            var updateScoresOnReturn=false;
		        }
		        this.trySaveAssignmentState2ServerByJSON(assignmentCompleted,this.json.assignments[this.currentAssignmentId].id,(assignmentCompleted)?"complete":"active",JSON.stringify(stateJson),stateJson.timeStamp,updateScoresOnReturn);
		    }
	    }
	}
	trySaveAssignmentState2ServerByJSON(assignmentCompleted,assignmentId,assignmentStatus,assignmentResponseString,timeStamp,updateScoresOnReturn){
	    //start XHTTP: update database stored state json
	    this.saveAssignmentXhttp = new XMLHttpRequest();
        var params = JSON.stringify({
            username: this.credentials.username,
            password: this.credentials.password,
            assignmentId: assignmentId,
            assignmentStatus: assignmentStatus,
            assignmentResponse: assignmentResponseString,
            timeStamp: timeStamp,
        });
        this.saveAssignmentXhttp.onreadystatechange = function(assignmentId,updateScores) {
            if (this.saveAssignmentXhttp.readyState == 4 && this.saveAssignmentXhttp.status == 200) {
                console.log("Assignment #"+assignmentId+" saved. Response: "+this.saveAssignmentXhttp.responseText);
                localStorage.removeItem("assignment"+assignmentId);//clear localStorage save, since it is now either saved to server or it is out of date
                var updateJson=JSON.parse(this.saveAssignmentXhttp.responseText);
                if(updateScores && updateJson.content.wasGraded){
                    var compositeBaselineScore=0;
                    var compositeTopScore=0;
                    var categoriesWithScores=0;
                    for(var i=0;i<this.scoreBarKeys.length;i++){
                        var newScore=updateJson.content.grade.sectionScaleScores[this.scoreBarKeys[i]];
                        if(newScore && newScore>this.scoreBarHandles[i].targetScore){
                            this.scoreBarHandles[i].updateScore(newScore,(this.scoreBarHandles[i].baselineScore)?this.scoreBarHandles[i].baselineScore:newScore);
                        }
                        if(this.scoreBarHandles[i].targetScore>0){
                            categoriesWithScores++;
                            compositeBaselineScore+=this.scoreBarHandles[i].baselineScore;
                            compositeTopScore+=this.scoreBarHandles[i].targetScore;
                        }
                    }
                    compositeTopScore=compositeTopScore/Math.max(1,categoriesWithScores);
                    compositeBaselineScore=compositeBaselineScore/Math.max(1,categoriesWithScores);
                    this.totalScoreBar.updateScore(compositeTopScore,compositeBaselineScore);
                }
                if(updateJson.content && updateJson.content.assignContent){
                    console.log('After saving assignment #'+assignmentId+', new assignments were detected.');
                    console.log('lastSubmittedAssignmentId = '+this.lastSubmittedAssignmentId+', currentAssignmentId = '+this.json.assignments[this.currentAssignmentId].id);
                    if(this.lastSubmittedAssignmentId==assignmentId && ((!this.currentAssignmentId) || this.json.assignments[this.currentAssignmentId].id==assignmentId)){
                        this.json.assignments=updateJson.content.assignContent.assignments;
                        this.json.assignResponse=updateJson.content.assignContent.assignResponse;
                        this.populateAssignments();
                        this.storeAssignResponses();
                    }
                }
            }
        }.bind(this,assignmentId,updateScoresOnReturn);
        this.saveAssignmentXhttp.open("POST", "cgi-bin/assignmentResponse.py", true);
        this.saveAssignmentXhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //console.log('submitting assignment to server with the following params:');
        //console.log(params);
        this.saveAssignmentXhttp.send(params);
        //end XHTTP
	}
	back2Menu(buttonId){//called when the "back" button is clicked on an assignment
		this.closeCurrentAssignment(false);
	}
	closeCurrentAssignment(assignmentCompleted){//!!!!! here
	    if(this.assignmentPanel.toggle==false){
		    this.trySaveAssignmentState2Server(assignmentCompleted);
		    //toggle the assignment panel off
	    	this.assignmentPanel.toggle=true;
	    	this.profilePanel.toggle=true;
	    	document.body.style.cursor = "default";
	    	window.dispatchEvent(new CustomEvent('requestVideoHide'));
	    }
	}
	submitCurrentFlashcard(flashcardId, isCorrect){
	    var xmlhttp = new XMLHttpRequest();
        var params = JSON.stringify({
            username: this.credentials.username,
            password: this.credentials.password,
            flashcardId: flashcardId,
            isCorrect: isCorrect,
        });
        
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //console.log(this.responseText);
            }
        };
        xmlhttp.open("POST", "cgi-bin/flashcardResponse.py", true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(params);
	}
	loadNewFlashcard(){
		if(this.json.flashcards.length>0 && this.currentFlashcard<this.json.flashcards.length){
			this.flashcard.setContent(this.json.flashcards[this.currentFlashcard].id, this.json.flashcards[this.currentFlashcard].title,this.json.flashcards[this.currentFlashcard].prompt,this.json.flashcards[this.currentFlashcard].answers,this.json.flashcards[this.currentFlashcard].correct,this.json.flashcards[this.currentFlashcard].imageURL);
			this.currentFlashcard++;
			return true;
		}else{
			this.flashcard.visible=false;
			var allAssignmentsComplete=true;
    	    for(var i=0;i<this.assignmentButtons.length;i++){
    	        if(this.assignmentButtons[i].isComplete==false){
    	            allAssignmentsComplete=false;
    	        }
    	    }
			if(allAssignmentsComplete){
			    this.assignmentsText.content="YOU'RE ALL DONE FOR TODAY!";
			}else if(this.json.flashcards.length>0){
			    this.assignmentsText.content="GOOD WORK! KEEP GOING.";
			}
			this.assignmentLinksContainer.bounds.top=this.assignmentsText.bounds.bottom+this.margin;
			return false;
		}
	}
	openPanels(buttonId){
		if(this.assignmentPanel.toggle){
		    this.loadAssignment(buttonId);
	    	this.assignmentPanel.toggle=false;
	    	this.profilePanel.toggle=false;
	    	document.body.style.cursor = "default";
	    }
	}
	panelsOpenCompleteCallback(){
	    if(this.assignment){
	        this.assignment.panelsOpenCompleteCallback();
	    }
	}
	loadAssignment(assignmentId){
	    //reset the contentLayer
	    this.contentLayer.remove();
	    this.contentLayer = new paper.Layer();
		this.addChild(this.contentLayer);
		this.contentLayer.sendToBack();
	    
	    //construct a new assignment
	    this.currentAssignmentId=assignmentId;
	    var stateJson=(this.assignmentResponses.length>this.currentAssignmentId && Object.keys(this.assignmentResponses[this.currentAssignmentId]).length>0)?this.assignmentResponses[this.currentAssignmentId]:null;//possible saved state json
	    if(this.json.assignments[assignmentId].hasOwnProperty('type') && this.json.assignments[assignmentId].type=="VideoAssignment"){
	        this.assignment=new VideoAssignment(this.width,this.margin,this.colors,this.json.assignments[assignmentId],stateJson);
	    }else if(this.json.assignments[assignmentId].hasOwnProperty('type') && this.json.assignments[assignmentId].type=="Exam"){
	        this.assignment=new Exam(this.width,this.margin,this.colors,this.json.assignments[assignmentId],stateJson);
	    }else if(this.json.assignments[assignmentId].hasOwnProperty('type') && this.json.assignments[assignmentId].type=="ErrorLog"){
	        this.assignment=new ErrorLogAssignment(this.width,this.margin,this.colors,this.json.assignments[assignmentId],stateJson);
	    }else if(this.json.assignments[assignmentId].hasOwnProperty('type') && this.json.assignments[assignmentId].type=="SpacedInterval"){
	        this.assignment=new SpacedIntervalAssignment(this.width,this.margin,this.colors,this.json.assignments[assignmentId],this.credentials);
	    }else{
	        this.assignment=new Assignment(this.width,this.margin,this.colors,this.json.assignments[assignmentId]);
	    }
	    //add the assignment and "BACK" button to the contentLayer, and update the scroll bar
	    this.contentLayer.addChild(this.assignment);
	    this.back2MenuButton=new Button("backToMenu",0,0,100,50,"BACK",["#EEEEEE","#FAF2EF","#E3F6EE"],"underwood",24,["#898989","#CB6D51","#54c896"],this.back2Menu.bind(this),null,null);
		this.contentLayer.addChild(this.back2MenuButton);
		window.dispatchEvent(new CustomEvent('updateScrollBar'));//update scroll bar
	}
	update(){
		this.profilePanel.update();
		this.assignmentPanel.update();
		this.flashcard.update();
		if(this.assignment){//assignment is still loaded
		    this.assignment.update();
    		if(this.assignmentPanel.toggle){//panels are closed or in the process of closing
    		    this.assignment.opacity=0;//0.8*this.assignment.opacity;
    		    if(this.assignment.opacity<0.01){
    		        this.assignment.remove();
    		        this.contentLayer.remove();
    		        this.assignment=null;
    		        window.dispatchEvent(new CustomEvent('updateScrollBar'));//update scroll bar
    		    }
    		}
		}
	}
	remove(){
	    window.removeEventListener('submitAssignment', this.submitAssignmentCallback, false);
	    window.addEventListener('saveAssignment', this.saveAssignmentCallback);
	    super.remove();
	}
}
class QuestionForm extends paper.Group{
	constructor(colors,username) {
	    super();
	    this.applyMatrix=false;
	    this.width=600;
	    this.height=435;
	    this.pivot=[0,0];
	    this.margin=25;
	    this.username=username;
	    //bg
	    this.bg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-this.width/2,-this.height/2), new paper.Size(this.width, this.height)),[25,25]);
        this.bg.fillColor = "#FFFFFF";
        this.bg.shadowColor=colors[2];
        this.bg.shadowBlur=50;
        this.bg.shadowOffset=new paper.Point(1,3);
        this.addChild(this.bg);
	    //title
        this.titleText = new paper.PointText();
		this.titleText.fontFamily="underwood";
		this.titleText.justification='center';
		this.titleText.fontSize=42;
        this.titleText.fillColor = colors[1];
        this.titleText.content="ASK A TUTOR";
        this.titleText.position=[0,-this.height/2+25+this.titleText.bounds.height/2];
        this.addChild(this.titleText);
        //message input text
        this.messageInputText=new SuperText("","What is your question?",550,[25,11],25,"left","helveticaNeueLight",24,"#000000",colors[0],"#EFEFEF",colors[1],true,1000,7,false);
        this.addChild(this.messageInputText);
        this.messageInputText.bounds.centerX=0;
        this.messageInputText.bounds.top=this.titleText.bounds.bottom+this.margin;
        this.messageInputText.active=true;
        //add submit button
        //button itself
        this.submitButton=new Button("messageSubmit",-75,this.messageInputText.bounds.bottom+this.margin,150,30,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",24,["#CB6D51","#54c896","#000000"],this.submitForm.bind(this),null,null);
        this.addChild(this.submitButton);
        //response text
        this.feedbackText = new paper.PointText();
		this.feedbackText.fontFamily="helveticaNeueLight";
		this.feedbackText.justification='center';
		this.feedbackText.fontSize=18;
        this.feedbackText.fillColor = colors[2];
        this.feedbackText.content="";
        this.feedbackText.bounds.centerX=this.submitButton.bounds.centerX;
        this.feedbackText.bounds.top=this.submitButton.bounds.bottom+10;
        this.addChild(this.feedbackText);
        
        //close button X
        this.closeButton=new Button("close",-this.width/2+12.5,-this.height/2+12.5,25,25,"X",["#FFFFFF","#FFFFFF","#FFFFFF"],"underwood",24,[colors[2],colors[1],colors[0]],function(){window.dispatchEvent(new CustomEvent('requestClosePopup'));},null,null);
        this.addChild(this.closeButton);
        
        //listeners
        this.keyDownCallback=this.onKeyDown.bind(this);
        window.addEventListener('keydown', this.keyDownCallback);
        this.xhttpCallback=this.xhttpReturn.bind(this);
        window.addEventListener("xhttpReturn", this.xhttpCallback, false);
	}
	submitForm(){//for submit help feedback form
	    if(this.messageInputText.string.length==0){
	        this.feedbackText.content="You must enter a message.";
	        this.messageInputText.active=true;
	        return;
	    }
	    this.submitButton.toggle=false;
	    this.feedbackText.content="";
	    this.sendXHTTP();
	}
	sendXHTTP(){
	    this.submitButton.toggle=false;
	    this.feedbackText.content="Sending your message. Please hold!";
	    this.xhttp = new XMLHttpRequest();
        var params = JSON.stringify({
            name: this.username,
            subject: 'Scalise Prep, logged in help panel',
            message: this.messageInputText.string
        });
        this.xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                ////console.log(this.responseText);
                var json=JSON.parse(this.responseText);
                json.httpDispatcher="messageForm";
                window.dispatchEvent(new CustomEvent('xhttpReturn',{ detail: json}));
            }
        };
        this.xhttp.open("POST", "cgi-bin/contact.py", true);
        this.xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        this.xhttp.send(params);
	}
	onKeyDown(event){
	    /*if(event.keyCode==13){//enter
	        this.submitForm();
	    }*/
	}
	xhttpReturn(event){
	    if(event.detail.httpDispatcher=="messageForm" && event.detail.success==true){
	        this.feedbackText.content="Submitted! Your tutor will email you shortly.";
	        this.submitButton.toggle=true;
	        this.messageInputText.string="";
	    }
	}
	remove(){
	    window.removeEventListener('keydown', this.keyDownCallback);
	    window.removeEventListener("xhttpReturn", this.xhttpCallback, false);
	    this.messageInputText.remove();
	    super.remove();
	}
}
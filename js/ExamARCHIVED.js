class Exam extends paper.Layer{
	constructor(canvasWidth,margin,colors,json,stateJson) {
	    super();
	    this.applyMatrix=false;
	    this.activeSection=-1;
	    this.json=json;
	    this.canvasWidth=canvasWidth;
	    this.margin=margin;
	    this.colors=colors;
        
		//title
		this.title = new paper.PointText();
		this.title.fontFamily="underwood";
		this.title.justification='center';
		this.title.fontSize=36;
        this.title.content=json.title;
        this.title.fillColor = colors[1];
        this.title.position.x += canvasWidth/2;
        this.title.position.y += margin+this.title.bounds.height/2;
        this.addChild(this.title);
        //prompt
        this.prompt = new paper.PointText();
		this.prompt.fontFamily="underwood";
		this.prompt.justification='center';
		this.prompt.fontSize=24;
        this.prompt.content=json.prompt;
        this.prompt.fillColor = colors[2];
        this.prompt.position.x += canvasWidth/2;
        this.addChild(this.prompt);
        this.prompt.bounds.top=this.title.bounds.bottom+margin;
        
        //iteratively add the exam sections
        this.sectionHandles=new Array(json.sections.length);
        var activeSectionId=-1;//keep track of any section that stateJson indicates was already activated
        var completeCount=0;
        for(var i=0;i<json.sections.length;i++){
            this.sectionHandles[i]=new ExamSection(this.json.id,i,canvasWidth,margin,colors,json.sections[i],this.sectionCallback.bind(this));
            this.addChild(this.sectionHandles[i]);
            this.sectionHandles[i].bounds.y=((i==0)?this.prompt.bounds.bottom+margin:this.sectionHandles[i-1].bounds.bottom);
            
            if(stateJson && stateJson.sections.length>i){
                this.sectionHandles[i].startTimeStamp=stateJson.sections[i].startTimeStamp;
                this.sectionHandles[i].recordedAnswers=stateJson.sections[i].recordedAnswers;
                this.sectionHandles[i].checkboxStates=stateJson.sections[i].checkboxStates;
                if(stateJson.sections[i].state=="complete"){
                    this.sectionHandles[i].state="complete";
                    this.sectionHandles[i].render(true);
                    completeCount++;
                }else if(stateJson.sections[i].state=="active"){
                    activeSectionId=i;
                }
            }
        }
        if(activeSectionId>-1){
            this.sectionCallback(activeSectionId,"start");
        }
        
        //footer margin
        this.footer = new paper.Path.Rectangle(new paper.Point(0,this.sectionHandles[this.sectionHandles.length-1].bounds.bottom), new paper.Size(canvasWidth,margin));
        this.addChild(this.footer);
        
        //if completed all sections, render opaque cover
        if(completeCount>=json.sections.length){
            this.renderOpaqueCover();
        }
        
	}
	sectionCallback(id,message){
	    if(message=="start"){
	        this.activeSection=id;
	    }else{
	        this.activeSection=-1;
	    }
	    var completeCount=0;
	    for(var i=0;i<this.sectionHandles.length;i++){
	        if(this.sectionHandles[i].state=="complete"){
	            completeCount++;
	        }else{
    	        if(message=="start"){
    	            this.sectionHandles[i].state=(i==id)?"active":"unavailable";
    	        }else{//message=="submit" || message=="times up"
    	            if(i==id){
    	                this.sectionHandles[i].state="complete";
    	                completeCount++;
    	            }else{
    	                this.sectionHandles[i].state="available";
    	            }
    	        }
    	        this.sectionHandles[i].render();
	        }
	    }
	    window.dispatchEvent(new CustomEvent('saveAssignment',{ detail: this.json.id}));
	    if(completeCount>=this.sectionHandles.length){//all sections are complete, update render
	        this.renderOpaqueCover();
	    }
	}
	renderOpaqueCover(){
	    //footer margin
        this.opaque = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(this.bounds.width,this.bounds.height));
        this.opaque.fillColor="#FFFFFF";
        this.opaque.opacity=0.9;
        this.addChild(this.opaque);
        
        //"complete" message
        this.completeMessage = new paper.PointText();
		this.completeMessage.fontFamily="underwood";
		this.completeMessage.justification='center';
		this.completeMessage.fontSize=36;
        this.completeMessage.content="You completed the exam. Nice job!";
        this.completeMessage.fillColor = this.colors[0];
        this.completeMessage.bounds.centerX = this.canvasWidth/2;
        this.addChild(this.completeMessage);
        this.completeMessage.bounds.top=this.title.bounds.bottom+this.margin;
        
        //Add the submit button
        this.submitButton=new Button("submit",this.canvasWidth/2-100,this.completeMessage.bounds.bottom+this.margin,200,50,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",36,["#CB6D51","#54c896","#000000"],this.submitAssignment.bind(this),null,null);
        this.addChild(this.submitButton);
        
        //scroll to top of page
        window.dispatchEvent(new CustomEvent('updateScrollBar'));//update scroll bar
	}
	submitAssignment(){
	    this.submitButton.toggle=false;
	    window.dispatchEvent(new CustomEvent('submitAssignment',{ detail: this.json.id}));
	}
	getStateJson(){
	    var returnJson={"sections":[]};
	    for(var i=0;i<this.json.sections.length;i++){
	        returnJson.sections[i]={"topic":this.json.sections[i].topic,"state":this.sectionHandles[i].state,"startTimeStamp":this.sectionHandles[i].startTimeStamp,"recordedAnswers":this.sectionHandles[i].recordedAnswers,"checkboxStates":this.sectionHandles[i].checkboxStates,"answerTimeStamps":this.sectionHandles[i].answerTimeStamps};
	    }
	    return returnJson;
	}
	update(){
	    if(this.activeSection>-1){
	        this.sectionHandles[this.activeSection].render();
	    }
	}
	panelsOpenCompleteCallback(){
	    //this method is not used currently, but it is still called by the Engine.js
	}
}
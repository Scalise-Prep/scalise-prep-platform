class Flashcard extends paper.Group{
	constructor(width,height,margin,getNewFlashcardFxn,submitFlashcardFxn) {
	    super();
	    this.applyMatrix=false;
	    this.pivot=[0,0];
	    this.animating=false;
	    this.selectedIndex=0;
	    this.correctIndex=0;
	    this.correctText="";
	    this.width=width;
	    this.height=height;
	    this.margin=margin;
	    this.buttonContainer=new paper.Layer();
	    this.buttonContainer.applyMatrix=false;
	    this.buttons=[];//array of answer button handles
	    this.animationState="promptOut";
	    this.rotDummy=0;//dummy variable root for rotation of the flashcard (in units of pi, so for a full rotation this.rot=2)
	    this.rotationRate=0.125;
	    this.opacityRate=0.2;
	    this.slideAccel=15;
	    this.slideVel=0;
	    this.slideDistTot=0;
	    this.getNewFlashcardFxn=getNewFlashcardFxn;
	    this.submitFlashcardFxn=submitFlashcardFxn;
	    this.buttonSpacing=10;//space in between answer buttons
	    this.titleColorDefault="#898989";
	    this.titleColorCorrect="#54c896";
	    this.titleColorIncorrect="#CB6D51";
	    this.promptColorDefault="#CB6D51";
	    
	    //draw the background
	    this.bg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-width/2,-height/2), new paper.Size(width, height)),new paper.Size(20,20));
        this.bg.fillColor = "#FFFFFF";
        this.bg.shadowColor="#CCCCCC";
        this.bg.shadowBlur=25;
        this.bg.shadowOffset=new paper.Point(2,10);
        this.addChild(this.bg);
        
        //add lines
        this.numLines=10;
        this.lineSpacing=height/(this.numLines+2);
        for(var i=0;i<this.numLines;i++){
        	var yPos=(i+2)*this.lineSpacing-height/2;
        	var tempPath = new paper.Path();
        	tempPath.strokeColor = (i==0)?"#CB6D51":"#54c896";
        	tempPath.add(new paper.Point(-width/2+1, yPos));
        	tempPath.add(new paper.Point(width/2-1, yPos));
        	tempPath.opacity=0.25;
        	this.addChild(tempPath);
        }
        
        //add text
        //title
        this.titleText = new paper.PointText();
		this.titleText.fontFamily="underwood";
		this.titleText.justification='center';
		this.titleText.fontSize=36;
        this.titleText.fillColor = this.titleColorDefault;
        this.titleText.content="X";
        var textHeight=this.titleText.bounds.height;
        this.titleText.position=[0,(2*this.lineSpacing-textHeight)/2+textHeight/2-height/2];
        this.titleText.content="";
        this.addChild(this.titleText);
        //prompt
        this.promptText=new SuperText("XYZ","",width-2*margin,[0,0],0,"center","helveticaNeueLight",21,this.promptColorDefault,"#FF0000",null,"#00FF00",false,10000,7,false,1.3);
        this.promptText.bounds.centerX=0;
        this.promptText.bounds.centerY=0;
        this.addChild(this.promptText);
        
        this.addChild(this.buttonContainer);
        this.randomSpin();
	}
	
	setContent(flashcardId, title, prompt, answers, correct, promptImageUrl=null){
	    this.flashcardId=flashcardId;
		this.titleText.content=(title)?title:"";
		this.promptText.content=prompt;
		this.promptText.bounds.centerX=0;
        this.promptText.bounds.centerY=((this.promptText.numLines%2)?-0.5*this.lineSpacing:-this.lineSpacing)-5;//!!!!!need to line up 0 position with a bg line if you want it to come out evenly spaced
		//populate answer buttons
		this.removeButtons();//first clear any old buttons
		var buttonWidth=110;
		var buttonHeight=50;
		var buttonTop=(this.numLines+0.5)*this.lineSpacing-buttonHeight/2-this.height/2;
		for(var i=0;i<answers.length;i++){
			var buttonX=this.width/2;
			this.buttons[i]=new Button(i,0,0,buttonWidth,buttonHeight,answers[i],["#EEEEEE","#FAF2EF","#E3F6EE"],"underwood",18,["#2E3136","#CB6D51","#54c896"],this.buttonClickHandler.bind(this),null,null);
		    this.buttons[i].translate(new paper.Point(i*(buttonWidth+this.buttonSpacing),buttonTop));
		    this.buttonContainer.addChild(this.buttons[i]);
		    this.buttonContainer.bounds.centerX=0;
		}
		//unload any previous image
		if(this.promptImage){
		    this.promptImage.remove();
		    this.promptImage=null;
		}
		//load optional image
		console.log(promptImageUrl+", "+title);
		if(promptImageUrl){
		    this.promptText.bounds.top=(title)?this.titleText.bounds.bottom:this.titleText.bounds.top;
		    console.log(this.promptText.bounds.bottom);
		    var hgt=(buttonTop-this.promptText.bounds.bottom);
		    this.promptImage=new RasterLoader("promptImage",promptImageUrl,this.width,hgt,0,null,0);
		    this.addChild(this.promptImage);
		    this.promptImage.bounds.centerX=this.titleText.bounds.centerX;
		    this.promptImage.bounds.top=-48;//this.promptText.bounds.bottom;
		    console.log(this.promptImage.bounds.top);
		}
		
		//store prompt text
		this.correctIndex=correct;
		this.correctText=answers[correct];
	}
	removeButtons(){
		for(var i=0;i<this.buttons.length;i++){
			this.buttons[i].remove();
		}
		this.buttons=[];//clear handles
	}
	buttonClickHandler(buttonId){
		if (this.animationState=="promptOut"){
			this.selectedIndex=buttonId;
			this.submitFlashcardFxn(this.flashcardId,this.selectedIndex==this.correctIndex);
			this.animating=true;
		}else if(this.animationState=="cardOut"){
			this.animating=true;
		}
	}
	update(){
		if(this.animating){
			if(this.animationState=="promptOut"){//transition from prompt to answer
				if(this.rot+this.rotationRate<0.5){
		    		this.rot+=this.rotationRate;
		    	}else{
		    		this.rotation*=-1;
		    		this.rot=0.5;
		    		if(this.selectedIndex==this.correctIndex){
		    			this.setContent(null,"Correct!","The answer was: \n"+this.correctText,["continue"],0);
		    			this.titleText.fillColor = this.titleColorCorrect;
		    			this.promptText.setFontColor(this.titleColorCorrect);
		    		}else{
		    			this.setContent(null,"Incorrect.","The answer was: \n"+this.correctText,["continue"],0);
		    			this.titleText.fillColor = this.titleColorIncorrect;
		    			this.promptText.setFontColor(this.titleColorIncorrect);
		    		}
		    		this.animationState="answerIn";
		    	}
			}else if(this.animationState=="answerIn"){
				if(this.rot-this.rotationRate>0){
		    		this.rot-=this.rotationRate;
		    	}else{
		    		this.halfRotationComplete=false;
		    		this.animating=false;
		    		this.rot=0;
		    		this.animationState="cardOut";
		    	}
			}else if(this.animationState=="cardOut"){
				if(this.opacity-this.opacityRate>0){
					this.opacity-=this.opacityRate;
					this.slideVel+=this.slideAccel;
					this.translate([this.slideVel,0]);
					this.slideDistTot+=this.slideVel;
				}else{
					this.slideVel=0;
					this.opacity=0;
					this.titleText.fillColor = this.titleColorDefault;
					this.promptText.setFontColor(this.promptColorDefault);
					var n=(1/this.opacityRate);
					var slideDist=this.slideAccel*n*(n+1)/2
					this.translate([-this.slideDistTot,0]);
					this.slideDistTot=0;
					this.getNewFlashcardFxn();
					this.randomSpin();
					this.animationState="cardIn";
				}
			}else if(this.animationState=="cardIn"){
				if(this.opacity+this.opacityRate<1){
					this.opacity+=this.opacityRate;
				}else{
					this.opacity=1;
					this.animating=false;
					this.animationState="promptOut";
				}
			}
		}
	}
	randomSpin(){
		this.rotation=1*(Math.random()-0.5);
	}
	get rot(){
		return this.rotDummy;
	}
	set rot(value){
		this.rotDummy=value;
		if(value<0.499){
			this.scaling=[Math.cos(value*Math.PI),1];
			this.visible=true;
		}else{
			this.scaling=[Math.cos(0.499*Math.PI),1];
			this.visible=false;
		}
	}
}
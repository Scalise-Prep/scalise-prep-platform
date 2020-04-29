class Flashcard extends paper.Group{
	constructor(x,y,width,height,margin,getNewFlashcardFxn) {
	    super();
	    this.applyMatrix=false;
	    this.animating=false;
	    this.promptHandles=[];
	    this.selectedIndex=0;
	    this.correctIndex=0;
	    this.correctText="";
	    this.x=x;
	    this.y=y;
	    this.width=width;
	    this.height=height;
	    this.numLines=8;
	    this.lineSpacing=(height/(this.numLines+2));
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
	    this.buttonSpacing=10;//space in between answer buttons
	    this.titleColorDefault="#898989";
	    this.titleColorCorrect="#54c896";
	    this.titleColorIncorrect="#CB6D51";
	    this.promptColorDefault="#CB6D51";
	    
	    //draw the background
	    this.bg = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(width, height)),new paper.Size(20,20));
        this.bg.fillColor = "#FFFFFF";
        this.bg.shadowColor="#CCCCCC";
        this.bg.shadowBlur=25;
        this.bg.shadowOffset=new paper.Point(2,10);
        this.addChild(this.bg);
        
        //add lines
        for(var i=0;i<this.numLines;i++){
        	var yPos=(i+2)*this.lineSpacing;
        	var tempPath = new paper.Path();
        	tempPath.strokeColor = (i==0)?"#CB6D51":"#54c896";
        	tempPath.add(new paper.Point(1, yPos));
        	tempPath.add(new paper.Point(width-1, yPos));
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
        this.titleText.position=[width/2,(2*this.lineSpacing-textHeight)/2+textHeight/2];
        this.titleText.content="";
        this.addChild(this.titleText);
        //prompt
        var numTextLines=3;
        for(var i=0;i<numTextLines;i++){
        	this.promptHandles[i]=new paper.PointText();
        	this.promptHandles[i].fontFamily="underwood";
        	this.promptHandles[i].justification="center";
        	this.promptHandles[i].fontSize=30;
        	this.promptHandles[i].fillColor=this.promptColorDefault;
        	this.promptHandles[i].content="X";
        	this.promptHandles[i].position=[width/2,height/2+this.promptHandles[i].bounds.height/2-this.lineSpacing*(numTextLines-i-1)];
        	this.promptHandles[i].content="";
        	this.addChild(this.promptHandles[i]);
        }
        
        this.addChild(this.buttonContainer);
        this.translate(new paper.Point(x,y));
        this.randomSpin();
	}
	
	setContent(title,prompt,answers,correct){
		//clear prompt text areas
		for(var i=0;i<this.promptHandles.length;i++){
			this.promptHandles[i].content="";	
		}
	    
		this.titleText.content=(title)?title:"";
		this.promptHandles[1].content=prompt;
		var textWidth=this.promptHandles[1].bounds.width;
		var widthPct=textWidth/(this.width-2*this.margin);
		if(widthPct>1){//multiline prompt detected
			this.promptHandles[1].content="";
			var numLines=Math.ceil(widthPct);
			var splits=prompt.split(" ");
			var charPerLine=Math.ceil(prompt.length/numLines);
			var wordIndex=0;
			for(var line=0;line<numLines-1;line++){
				var charCount=0;
				for(var word=wordIndex;word<splits.length;word++){
					if(charCount+splits[word].length>charPerLine){
						this.promptHandles[line].content=splits.slice(wordIndex,word).join(" ");
						wordIndex=word;
						break;
					}
					charCount+=splits[word].length+1;//add the current word to the character count (+1 for the added space)
				}
			}
			this.promptHandles[line].content=splits.slice(wordIndex,splits.length).join(" ");
		}
		//populate answer buttons
		this.removeButtons();//first clear any old buttons
		var buttonWidth=120;
		var buttonHeight=50;
		for(var i=0;i<answers.length;i++){
			var buttonX=this.width/2;
			this.buttons[i]=new Button(i,0,0,buttonWidth,buttonHeight,answers[i],["#EEEEEE","#FAF2EF","#E3F6EE"],"underwood",24,["#2E3136","#CB6D51","#54c896"],this.buttonClickHandler.bind(this),null,null);
		    this.buttons[i].translate(new paper.Point(i*(buttonWidth+this.buttonSpacing),(this.numLines)*this.lineSpacing-buttonHeight/2));
		    this.buttonContainer.addChild(this.buttons[i]);
		    this.buttonContainer.bounds.centerX=this.width/2;
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
		    			this.setContent("Correct!","The answer was: "+this.correctText,["continue"],0);
		    			this.titleText.fillColor = this.titleColorCorrect;
		    			this.promptHandles[1].fillColor=this.titleColorCorrect;
		    		}else{
		    			this.setContent("Incorrect.","The answer was: "+this.correctText,["continue"],0);
		    			this.titleText.fillColor = this.titleColorIncorrect;
		    			this.promptHandles[1].fillColor=this.titleColorIncorrect;
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
					this.promptHandles[1].fillColor=this.promptColorDefault;
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
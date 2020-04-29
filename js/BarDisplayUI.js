class BarDisplayUI extends paper.Group{
	constructor(title,width,height,backFillColor,frontFillColor,score,maxScore,baselineScore=null,precision=0) {
	    super();
	    this.applyMatrix=false;
	    this.width=width;
		this.height=height;
		this.backFillColor=backFillColor;
		this.frontFillColor=frontFillColor;
		this.maxScore=maxScore;
		this.scoreDummy=0;
		this.baselineScore=baselineScore;
		this.targetScore=this.scoreDummy;
		this.animationRate=0.25;
		this.precision=precision;
		
		var rectangle = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(width, height));
		this.r=Math.min(width,height)/2;
        var radius = new paper.Size(this.r,this.r);
        this.bg = new paper.Path.Rectangle(rectangle, radius);
        this.bg.fillColor = backFillColor;
        this.addChild(this.bg);
        
        //create baseline
        this.baseline = new paper.Path();
        this.baseline.visible=false;
		this.baseline.strokeColor = "#000000";
		this.baseline.add(new paper.Point(0, 0));
		this.baseline.add(new paper.Point(0, 2*this.r));
		this.baseline.opacity=0.25;
		this.baseline.bounds.centerX=this.r;
		this.addChild(this.baseline);
		//baseline text
		this.baselineText = new paper.PointText();
		this.baselineText.visible=false;
		this.baselineText.content="0";
		this.baselineText.fontFamily="helveticaNeueLight";
		this.baselineText.justification='center';
		this.baselineText.fontSize=16;
        this.baselineText.fillColor = frontFillColor;
        this.baselineText.bounds.top=this.bg.bounds.bottom;
        this.addChild(this.baselineText);
		//positioning
        if((baselineScore || baselineScore==0) && baselineScore<score){
    		this.baseline.bounds.centerX=this.r+(width-2*this.r)*baselineScore/maxScore;
    		this.baseline.visible=true;
    		this.baselineText.content=baselineScore.toString();
    		this.baselineText.bounds.centerX = this.baseline.bounds.centerX;
    		this.baselineText.visible=true;
        }
        
        this.circleR=2*this.r;
        //left circle
        this.leftCircle = new paper.Shape.Circle(new paper.Point(0,0), this.circleR);
        this.leftCircle.strokeWidth=2;
        this.leftCircle.strokeColor="#000000";
        this.addChild(this.leftCircle);
        this.leftCircle.opacity=0;
        this.leftCircle.bounds.centerX=this.r;
        this.leftCircle.bounds.centerY=this.r;
        //right circle
        this.rightCircle = new paper.Shape.Circle(new paper.Point(0,0), this.circleR);
        this.rightCircle.strokeWidth=2;
        this.rightCircle.strokeColor="#000000";
        this.addChild(this.rightCircle);
        this.rightCircle.opacity=0;
        this.rightCircle.bounds.centerX=width-this.r;
        this.rightCircle.bounds.centerY=this.r;
        
        //score display
        this.scoreCircle=new paper.Group();
        this.addChild(this.scoreCircle);
        //scoreText
		this.scoreText = new paper.PointText();
		this.scoreText.fontFamily="underwood";
		this.scoreText.justification='center';
		this.scoreText.fontSize=18;
        this.scoreText.content=(new Array(maxScore.toString().length + 1).join('X'))+((precision>0)?'.':'')+(new Array(precision + 1).join('X'));
        this.scoreText.fillColor = frontFillColor;
        this.scoreText.bounds.centerX = 0;
        this.scoreText.bounds.centerY=0;
        this.scoreCircle.addChild(this.scoreText);
        //score circle background
        var widthFactor=0.925;
        if(this.scoreText.bounds.width<2*widthFactor*this.circleR){
            this.scoreCircleBG = new paper.Shape.Circle(new paper.Point(0,0), this.circleR);
        }else{
            var rectangle = new paper.Rectangle(new paper.Point(-(this.scoreText.bounds.width+(1-widthFactor)*this.circleR)/2, -this.circleR), new paper.Point((this.scoreText.bounds.width+(1-widthFactor)*this.circleR)/2, this.circleR));
            var radius = new paper.Size(this.circleR, this.circleR);
            this.scoreCircleBG = new paper.Path.Rectangle(rectangle, radius);
        }
        this.scoreText.content="";
        this.scoreCircleBG.fillColor = backFillColor;
        this.scoreCircleBG.strokeColor = frontFillColor;
        this.scoreCircleBG.strokeWidth=2;
        this.scoreCircle.addChild(this.scoreCircleBG);
        this.scoreCircle.bounds.centerY=this.bg.bounds.centerY;
        this.scoreText.bringToFront();
        
        //title
		this.titleText = new paper.PointText();
		this.titleText.fontFamily="helveticaNeueLight";
		this.titleText.justification='center';
		this.titleText.fontSize=16;
        this.titleText.content=title;
        this.titleText.fillColor = frontFillColor;
        this.titleText.bounds.left = this.bg.bounds.left;
        this.titleText.bounds.bottom=this.bg.bounds.top;
        this.addChild(this.titleText);
        
        this.updateScore(score,this.baselineScore);
	}
	updateScore(scoreValue,baselineScoreValue){//sets the baseline and score values, initiates animation of score to new score
	    this.targetScore=scoreValue;
	    this.baselineScore=baselineScoreValue;
	    if(this.animationInterval==null){
	        this.animationInterval = setInterval(this.animateSlider.bind(this), 15);//call the main update loop every n ms
	    }
	}
	animateSlider(){
	    var delta=this.targetScore-this.score;
	    if(Math.abs(delta)/this.maxScore<0.001){
	        this.score=this.targetScore;
	        clearInterval(this.animationInterval);
	        this.animationInterval=null;
	    }else{
	        this.score+=this.animationRate*delta;
	    }
	}
	get score(){
	    return this.scoreDummy;
	}
	set score(value){
	    if(this.fg){
	        this.fg.remove();
	    }
	    var pct=value/this.maxScore;
	    this.scoreCircle.bounds.centerX=this.circleR+(this.width-2*this.r)*pct;
	    var precisionFactor=Math.pow(10,this.precision);
        this.scoreText.content=(value==this.targetScore)?(Math.round(value*precisionFactor)/precisionFactor).toString():(Math.round(value)).toString();
        
	    var rectangle = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(this.scoreCircle.bounds.centerX, this.height));
        var radius = new paper.Size(this.r,this.r);
        this.fg = new paper.Path.Rectangle(rectangle, radius);
        this.fg.fillColor = this.frontFillColor;
        this.addChild(this.fg);
        if(this.baselineScore || this.baselineScore==0){
            this.baseline.bounds.centerX=this.r+(this.width-2*this.r)*this.baselineScore/this.maxScore;
    		this.baselineText.content=this.baselineScore.toString();
    		this.baselineText.bounds.centerX = this.baseline.bounds.centerX;
            if(this.baselineScore<value){//this.baseline.bounds.right<this.scoreCircle.bounds.centerX){
                this.baseline.visible=true;
                this.baselineText.visible=true;
                this.baseline.bringToFront();
            }else{
                this.baseline.visible=false;
                this.baselineText.visible=false;
            }
        }
        this.scoreCircle.bringToFront();
        
        if(this.scoreCircle.bounds.left>this.titleText.bounds.width){
            this.titleText.bounds.left = this.bg.bounds.left;
        }else{
            this.titleText.bounds.right = this.bg.bounds.right;
        }
        
		this.scoreDummy=value;
	}
}
class AssignmentButton extends paper.Group{
	constructor(myId,x,y,width,height,textString,fillColors,font,fontSize,fontColors,clickCallback,mouseDownCallback,mouseEndCallback,due,imageURL=null) {
	    super();
	    this.applyMatrix=false;
	    this.isComplete=false;
	    this.colors=fontColors;
	    //add the main button
	    this.button = new Button(myId,0,0,width,height,textString,fillColors,font,fontSize,fontColors,clickCallback,mouseDownCallback,mouseEndCallback);
	    this.addChild(this.button);
	    this.width=width;
	    this.height=height;
		
        //add upper line path
        this.myPath = new paper.Path();
        this.myPath.strokeColor = fontColors[0];
        this.myPath.add(new paper.Point(0, 0));
        this.myPath.add(new paper.Point(width, 0));
        this.myPath.opacity=0.2;
        this.addChild(this.myPath);
        this.myPath2 = new paper.Path();
        this.myPath2.strokeColor = fontColors[0];
        this.myPath2.add(new paper.Point(0, height));
        this.myPath2.add(new paper.Point(width, height));
        this.myPath2.opacity=0.2;
        this.addChild(this.myPath2);
        
        //add due date message
        if(due!=null){
            var dueDate = new Date(due*1000);
            var currTimeStamp= new Date().getTime()/1000;
            this.dueText = new paper.PointText();
    		this.dueText.fontFamily="helveticaNeueLight";
    		this.dueText.justification='right';
    		this.dueText.fontSize=14;
    		if(currTimeStamp<due){
                this.dueText.content="DUE: "+(dueDate.getMonth()+1)+"/"+dueDate.getDate()+" at "+((dueDate.getHours()>12)?dueDate.getHours()-12:dueDate.getHours())+((dueDate.getMinutes()==0)?"":":"+((dueDate.getMinutes()<10)?"0":"")+dueDate.getMinutes())+((dueDate.getHours()<12)?"am":"pm");
    		}else{
    		    this.dueText.content="OVERDUE";
    		}
            this.dueText.fillColor = "#000000";
            this.dueText.opacity=0.5;
            this.dueText.bounds.right = width;
            this.addChild(this.dueText);
            this.dueText.bounds.centerY=height/2;
        }
        
        if(imageURL){
            this.myImage = new paper.Raster(imageURL);
            this.myImage.visible=false;
            this.myImage.onLoad = function() {
                this.addChild(this.myImage);
    		    this.myImage.scale(this.height/this.myImage.bounds.height);
                this.myImage.bounds.left=0;
                this.myImage.bounds.top=0;
                this.myImage.visible=true;
            }.bind(this);
        }

        this.bounds.top=y;
        this.bounds.left=x;
	}
	markAsComplete(){
	    this.isComplete=true;
	    if(this.dueText){
	        this.dueText.visible=false;
	    }
	    
	    this.checkBox = new CheckBox("checkBox",this.bounds.width-15,(this.bounds.height-15)/2,15,[this.colors[0],null,"#898989"],null,false);
	    this.checkBox.selected=true;
	    this.addChild(this.checkBox);
	    
	    this.button.toggle=false;
	    
	    this.myPath.strokeColor="#898989";
	    this.myPath2.strokeColor="#898989";
	    
	    this.myPath3 = new paper.Path();
        this.myPath3.strokeColor = this.colors[0];
        this.myPath3.add(new paper.Point(this.button.text.bounds.left, this.bounds.height/2));
        this.myPath3.add(new paper.Point(this.button.text.bounds.right, this.bounds.height/2));
        this.addChild(this.myPath3);
	}
}
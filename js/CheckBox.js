class CheckBox extends paper.Group{
	constructor(myId,x,y,size,colors,clickCallback,interactive=true) {
	    super();
	    this.myId=myId;
		this.mouseIsDown=false;
		this.applyMatrix=false;
		this.translate(new paper.Point(x,y));
		this.colors=colors;
		this.clickCallback=clickCallback;

		this.selectedDummy=false;
		
		//bg
		var rect = new paper.Rectangle(new paper.Point(0,0), new paper.Size(size, size));
		var radius = new paper.Size(0.15*size, 0.15*size);
		this.bg=new paper.Path.Rectangle(rect, radius);
        this.bg.fillColor = "#EEEEEE";
        this.bg.strokeColor=this.colors[2];
        this.bg.strokeWidth=0.05*size;
        this.addChild(this.bg);

        //checkMark
        this.checkMark=new paper.Path();
        this.checkMark.strokeColor = colors[0];
        this.checkMark.strokeWidth=0.1*size;
        this.checkMark.add(new paper.Point(0.15*size, 0.6*size));
        this.checkMark.add(new paper.Point(0.4*size, 0.85*size));
        this.checkMark.add(new paper.Point(0.85*size, 0.15*size));
        this.addChild(this.checkMark);
        this.checkMark.visible=false;
		
		//add mouse event callbacks
		if(interactive){
		    this.onClick = this.clickListener;
		}
	}
	
	clickListener(event){
	    this.selected=!this.selected;
		if(this.clickCallback!=null){
			this.clickCallback(this.myId);
		}
	}
	get selected(){
	    return this.selectedDummy;
	}
	set selected(value){
	    this.selectedDummy=value;
	    this.checkMark.visible=value;
	    this.bg.strokeColor=(value)?this.colors[0]:this.colors[2];
	}
}
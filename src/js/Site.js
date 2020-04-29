class Site extends paper.Layer{
	constructor(canvasWidth,canvasHeight) {
	    super();
	    this.applyMatrix=false;
	    
	    //disable backspace key form triggering a back page event
	    window.onkeydown = function (event) {
            if (event.keyCode == 8 || event.keyCode == 46) { 
                event.preventDefault();   // turn off browser transition to the previous page 
            }; 
        };    

	    this.width=canvasWidth;//the initial width of the canvas. Will always be scaled automatically to fit screen width
	    this.padding=10;
	    this.colors=["#54c896","#CB6D51","#898989"];//main,highlight,gray
	    this.scrollDummy=0;
	    this.fixedHeader=true;
	    this.pageContainer=new paper.Layer();
	    this.pageContainer.applyMatrix=false;
	    this.addChild(this.pageContainer);
	    this.popupContainer=new paper.Layer();
	    this.popupContainer.applyMatrix=false;
	    this.addChild(this.popupContainer);
	    this.lastVideoState="hidden";//records whether video was displayed before popup request
	    
	    //grab the video tag
	    this.video = document.getElementById("video");
	    this.videoBoundsDummy=new paper.Rectangle(0,0,0,0);
	    this.source = document.createElement('source');//create an empty source for the video
	    this.video.appendChild(this.source);
	    this.video.addEventListener('play', function(event){window.dispatchEvent(new CustomEvent('videoChangeStatus'));});
	    this.video.addEventListener('pause', function(event){window.dispatchEvent(new CustomEvent('videoChangeStatus'));});

	    //construct the popup container (will be moved to the front later, but we need to construct it now in case of an early popup request)
        this.popupHaze = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(this.width, window.innerHeight/(this.scaling.y))));
        this.popupHaze.applyScaling=false;
        this.popupHaze.fillColor = "#FFFFFF";
        this.popupHaze.opacity=0.5;
        this.popupHaze.onClick=function(e){this.popupContainer.visible=false;if(this.popup){this.popup.remove();this.popup=null;}}.bind(this);
        this.popupContainer.addChild(this.popupHaze);
        this.popupContainer.visible=false;
        
	    //construct the header
	    this.header=new Header(this.width,this.padding,40,this.colors[2],this.colors[0],function(){window.dispatchEvent(new CustomEvent('scrollJumpRequest',{detail:0}));});
	    this.addChild(this.header);
	    
	    //construct the scrollbar
	    this.scrollbarWidth=10;
	    this.scrollbar=new Scrollbar(this.scrollbarWidth,"#000000");
	    this.scrollbar.translate([canvasWidth-this.scrollbarWidth-2,0]);
	    this.scrollbar.onMouseDrag=this.scrollbarHandler.bind(this);
	    window.addEventListener('wheel', this.wheelHandler.bind(this), false);

	    //handle screen resizing
	    this.oldWindowWidth=canvasWidth;
	    this.sizeToWindow();
		window.addEventListener('resize', this.windowResizeHandler.bind(this), false);

		//frame-by-frame animation loop
		var interval = setInterval(this.update.bind(this), 15);//call the main update loop every n ms
		
		//listen for requests from the loaded page
		window.addEventListener("requestPopup", this.requestPopup.bind(this), false);
		window.addEventListener("requestClosePopup", this.requestClosePopup.bind(this), false);
		window.addEventListener("scrollJumpRequest", this.scrollJumpHandler.bind(this), false);
		window.addEventListener("requestPage", this.requestPage.bind(this), false);
		window.addEventListener("requestVideoLoad", this.requestVideoLoad.bind(this), false);
		window.addEventListener("requestVideoDisplay", this.requestVideoDisplay.bind(this), false);
		window.addEventListener("requestVideoUnfocus",this.requestVideoUnfocus.bind(this), false);
		window.addEventListener("requestVideoHide", this.requestVideoHide.bind(this), false);
		window.addEventListener("updateScrollBar", this.updateScrollBar.bind(this), false);
		window.addEventListener("setCredentials", this.setCredentials.bind(this), false);
		
		//load the first page
		this.pageContainer.translate([0,this.headerHeight]);
		this.loadPage(new HomePage(this.width,[50,25],this.colors));
		
		//move the popup container to the front
		this.popupContainer.bringToFront();
	}
	requestClosePopup(event){
	    this.popupContainer.visible=false;
	    if(this.popup){
	        this.popup.remove();
	        this.popup=null;
	    }
	    this.video.style.visibility=this.lastVideoState;//restore state of video player
	}
	requestVideoLoad(event){
        this.video.setAttribute('src', event.detail.src);
	}
	setCredentials(event){
        this.credentials=JSON.parse(event.detail);
	}
	requestVideoDisplay(event){
	    //request the actual url separately in a different event, so that it can be loaded/displayed asunchronously
	    this.videoBounds=new paper.Rectangle(event.detail.x, event.detail.y, event.detail.width, event.detail.height);
	    this.video.style.visibility=event.detail.visibility;//"visible" or "hidden"
	    if(event.detail.visibility=="hidden"){
	        this.video.pause();
	    }
	}
	requestVideoUnfocus(event){
	    this.video.blur();
	}
	requestVideoHide(event){
	    this.video.style.visibility="hidden";
	    this.video.pause();
	}
	requestPage(event){
	    //delete any old pages
	    if(this.page){
	        this.page.remove();//remove from the paper.js hierarchy
	    }
	    //delete any old popups
	    if(this.popup){
	        this.popup.remove();
	    }
	    this.popupContainer.visible=false;
	    
	    if(event.detail.pageRequest=="HomePage"){
	        this.header.scaliseText.visible=true;
	        this.header.prepText.visible=true;
	        this.loadPage(new HomePage(this.width,[50,25],this.colors));
	    }else if(event.detail.pageRequest=="SignupProfilePage"){
	        this.header.scaliseText.visible=false;
	        this.header.prepText.visible=false;
	        window.dispatchEvent(new CustomEvent('requestMenuButtons',{detail:{"buttonHandles":[]}}));
	        this.loadPage(new SignupProfilePage(this.credentials,this.width,this.colors,event.detail.content));
	    }else if(event.detail.pageRequest=="Engine"){
	        this.header.scaliseText.visible=true;
	        this.header.prepText.visible=true;
	        this.loadPage(new Engine(this.credentials,this.width,800,this.colors,event.detail.content));
	    }
	}
	loadPage(page){
	    //delete any old pages
	    if(this.page){
	        this.page.remove();//remove from the paper.js hierarchy
	    }
	    
	    //load new page
	    this.page=page;
	    this.page.pivot=[0,0];
	    this.pageContainer.addChild(this.page);

	    //update scroll
	    this.updateScrollBar(null);
	}
	updateScrollBar(event){
	    this.scrollDummy=0;
	    this.sizeScrollbar2Window();
	}
	requestPopup(event){
	    if(event.detail=="QuestionFormLoggedIn"){
	        this.loadPopup(new QuestionForm(this.colors,this.credentials.username));
	    }else{
	        this.loadPopup(eval("new "+event.detail+"(this.colors)"));
	    }
	}
	loadPopup(popup){
	    //delete any old popups
	    if(this.popup){
	        this.popup.remove();
	    }
	    //pause and hide any videos
	   this.lastVideoState=this.video.style.visibility;//record state of video player
	   this.video.style.visibility="hidden";//"visible" or "hidden"
	   this.video.pause();

	    //load new popup
	    this.popup=popup;
	    this.popup.position.x=this.width/2;
	    this.popup.position.y=(window.innerHeight/this.scaling.y)/2;
	    this.popupContainer.addChild(this.popup);
	    this.popupContainer.visible=true;
	}
	update(){
	    this.scrollbar.update();
	}
	windowResizeHandler(event){
		this.sizeToWindow();
	}
	sizeToWindow(){//keeps the canvas scaled appropriately to fit the window width
		this.scale(window.innerWidth/this.oldWindowWidth,[0,0]);
		this.oldWindowWidth=window.innerWidth;
		
		//update the scrollbar
		this.sizeScrollbar2Window();
		
		//update any popup
		if(this.popup){
		    this.popup.position.y=(window.innerHeight/this.scaling.y)/2;
		}
		this.popupHaze.bounds.height=window.innerHeight/(this.scaling.y);
		
		//update the video tag
		this.videoBounds=this.videoBounds;//update the video position
	}
	get videoBounds(){
	    return this.videoBoundsDummy;
    }
    set videoBounds(value){
	    this.videoBoundsDummy=value;
	    this.video.width=this.videoBoundsDummy.width*window.innerWidth/this.width;//this.videoWidth*window.innerWidth/this.width;
		this.video.height=this.videoBoundsDummy.height*window.innerWidth/this.width;//this.videoAspectRatio*this.video.width;
		this.video.style.left = String(this.videoBoundsDummy.left*window.innerWidth/this.width)+"px";//String((window.innerWidth-this.video.width)/2)+"px";
		this.video.style.top=String((this.header.bounds.bottom-this.scrollDummy+this.videoBoundsDummy.top)*this.scaling.x)+"px";//String(this.header.bounds.bottom-this.scrollDummy*this.scaling.x)+"px";
        this.video.style.position = "absolute";
    }
	sizeScrollbar2Window(){
	    //handle scrollbar rescaling
		this.scrollbar.redraw2Screen((window.innerHeight/this.scaling.y)*(window.innerHeight/this.scaling.y-this.headerHeight)/this.pageHeight,window.innerHeight/this.scaling.y);
		this.scroll=this.scroll;//to move the freshly-redrawn scrollbar to the correct height
	}
	wheelHandler(event){
	    if(this.popupContainer.visible==false){
    	    this.scroll+=event.deltaY*this.scaling.y;
    	    this.scrollbar.opacity=1;
    	    this.scrollbar.animating=true;
	    }
	}
	scrollbarHandler(event){
	    var delta=this.pageHeight*event.delta.y/window.innerHeight;
	    this.scroll+=delta;
	}
	scrollJumpHandler(event){
	    this.scroll=event.detail;
	    this.scrollbar.opacity=1;
	    this.scrollbar.animating=true;
	}
	get scroll(){
	    return this.scrollDummy;
	}
	set scroll(value){
	    var maxScroll=this.pageHeight-(window.innerHeight/this.scaling.x-this.headerHeight);
	    if(maxScroll<=0){//window is larger than the content size, so hide the scrollbars
	        this.scrollDummy=0;
	        this.scrollbar.active=false;
	        this.header.position.y=0;
	        if(this.page){
	            this.page.position.y=0;
	        }
	        return
	    }
	    this.scrollbar.active=true;
	    if(value<0){
	        this.scrollDummy=0;
	    }else if(value>maxScroll){
	        this.scrollDummy=maxScroll;
	    }else{
	        this.scrollDummy=value;
	    }
	    this.scrollbar.slidePercent=this.scrollDummy/maxScroll;
	    if(this.fixedHeader==false){
	        this.header.position.y=-this.scrollDummy;
	    }
	    
	    if(this.page){
            this.page.position.y=-this.scrollDummy;
        }
        if(this.video){
            this.videoBounds=this.videoBounds;//reposition video
        }
	}
	get headerHeight(){
	    return this.header.height;
	}
	get pageHeight(){
	    if(this.page){
	        return this.page.bounds.height;
	    }else{
	        return 1;
	    }
	}
}

class Header extends paper.Group{
	constructor(width,padding,fontSize,color1,color2) {
	    super();
	    this.pivot=[0,0];
	    this.applyMatrix=false;
	    this.padding=padding;
	    this.logoHeight=55;
	    this.heightDummy=2*padding+this.logoHeight;
	    this.width=width;
        
        //render the background gradient
        this.drawBG();

        //construct the logo group
        //make the container
        this.logoGroup=new paper.Group();
        this.logoGroup.applyMatrix=false;
        this.logoGroup.translate([0,padding]);
        this.addChild(this.logoGroup);
        //add transparent bg for hit tests
        this.logoBG = new paper.Path.Rectangle(new paper.Point(this.width/2-this.logoHeight,0), new paper.Size(2*this.logoHeight,this.logoHeight));
        this.logoBG.fillColor = "#FFFFFF";
        this.logoBG.opacity=0;
        this.logoGroup.addChild(this.logoBG);
        //add mouse events
	    this.logoGroup.onClick=this.clickLogoHandler.bind(this);
	    this.logoGroup.onMouseEnter=this.mouseEnterLogoHandler.bind(this);
	    this.logoGroup.onMouseLeave=this.mouseLeaveLogoHandler.bind(this);
	    //load the logo image
	    this.logo = new paper.Raster("images/owl.png");
        this.logo.visible=false;
        this.logo.onLoad = function() {
            this.logo.scaling=this.logoHeight/this.logo.bounds.height;
            this.logoGroup.addChild(this.logo);
            this.logo.position=([this.width/2,this.logoHeight/2]);
            this.logo.visible=true;
        }.bind(this);
        //render text
        //SCALISE
        this.scaliseText = new paper.PointText();
		this.scaliseText.fontFamily="underwood";
		this.scaliseText.justification='right';
		this.scaliseText.fontSize=fontSize;
        this.scaliseText.fillColor = color1;
        this.scaliseText.content="SCALISE";
        var textWidth=this.scaliseText.bounds.width;
        this.scaliseText.position=[width/2-textWidth/2-this.logoHeight/2-padding,this.logoHeight/2];
        this.logoGroup.addChild(this.scaliseText);
        //PREP
        this.prepText = new paper.PointText();
		this.prepText.fontFamily="underwood";
		this.prepText.justification='left';
		this.prepText.fontSize=fontSize;
        this.prepText.fillColor = color2;
        this.prepText.content="PREP";
        textWidth=this.prepText.bounds.width;
        this.prepText.position=[width/2+textWidth/2+this.logoHeight/2+padding,this.logoHeight/2];
        this.logoGroup.addChild(this.prepText);
        
        //listen for requests from the loaded page
		window.addEventListener("requestMenuButtons", this.loadButtons.bind(this), false);
        
        //draw menu buttons
        //create container group
        var buttonPanelCenterX=(this.prepText.bounds.right+this.width)/2;
        var buttonPanelWidth=this.width-this.prepText.bounds.right-2*this.padding;
        this.buttons=new paper.Group();
        this.buttons.applyMatrix=false;
        this.buttons.translate([buttonPanelCenterX,this.padding+1]);
        this.addChild(this.buttons);
	}
	loadButtons(event){
	    this.buttons.removeChildren();
	    var sumWidth=0;
	    for(var i=0;i<event.detail.buttonHandles.length;i++){
	        sumWidth+=event.detail.buttonHandles[i].bounds.width;
	    }
	    for(var i=0;i<event.detail.buttonHandles.length;i++){
	        this.buttons.addChild(event.detail.buttonHandles[i]);
	        event.detail.buttonHandles[i].bounds.left=(i==0)?-sumWidth/2:event.detail.buttonHandles[i-1].bounds.right;
	    }
	}
	drawBG(){
	    if(this.bg){
	        this.bg.remove();
	    }
	    //to draw a sharp background:
	    this.bg = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(this.width,this.heightDummy));
        this.bg.fillColor = "#FFFFFF";
        this.bg.opacity=0.95;
	    //To draw a gradient background:
	    /*this.bg = new paper.Path.Rectangle({
            topLeft: [0,0],
            bottomRight: [this.width,this.heightDummy],
            fillColor: {
                gradient: {
                    stops: [['white',0.8], [new paper.Color(1, 1, 1,0),1]]
                },
                origin: [0,0],
                destination: [0,this.heightDummy]
            }
        });*/
        this.addChild(this.bg);
        this.bg.sendToBack();
	}
	clickLogoHandler(event){
	    window.dispatchEvent(new CustomEvent('scrollJumpRequest',{detail:0}));
	}
	mouseEnterLogoHandler(event){
	    document.body.style.cursor = "pointer";
	}
	mouseLeaveLogoHandler(event){
	    document.body.style.cursor = "default";
	}
	toggleBackground(value){
	    this.bg.visible=value;
	}
	get height(){
	    return this.heightDummy;
	}
	set height(value){
	    this.heightDummy=value;
	    this.drawBG();
	}
}
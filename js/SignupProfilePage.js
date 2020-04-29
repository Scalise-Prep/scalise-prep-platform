class SignupProfilePage extends paper.Group{
	constructor(credentials,canvasWidth,colors,todoJson) {
	    super();
	    this.applyMatrix=false;
	    this.credentials=credentials;
	    this.todoJson=todoJson;//hold onto this for the next page load
	    
	    //title text
	    this.welcomeTitleText = new paper.PointText();
		this.welcomeTitleText.fontFamily="underwood";
		this.welcomeTitleText.justification='center';
		this.welcomeTitleText.fontSize=42;
        this.welcomeTitleText.fillColor = colors[1];
        this.welcomeTitleText.content="Welcome to the program!";
        this.welcomeTitleText.position=[canvasWidth/2,25];
        this.addChild(this.welcomeTitleText);
        //welcome body text
        var welcomeMessage=`We're excited to work with you! Before we get started, please take a moment to tell us a little about yourself so we can get to know you better. (Sidenote: we are huge privacy advocates. Any info you provide will be used ONLY to make a better product and never sold or used for advertising.)`;
        this.welcomeText = new MultilineText(welcomeMessage,canvasWidth-2*100,"center","helveticaNeueLight",21,colors[2],1);
        this.welcomeText.bounds.left=100;
        this.welcomeText.bounds.top=this.welcomeTitleText.bounds.bottom+10;
        this.addChild(this.welcomeText);
        //Grade
        this.gradeInputText=new InputText("What grade are you in?",343,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.gradeInputText);
        this.gradeInputText.bounds.left=100;
        this.gradeInputText.bounds.top=this.welcomeText.bounds.bottom+25;
        this.gradeInputText.active=true;
        //State
        this.stateInputText=new InputText("Taken the ACT before?",343,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.stateInputText);
        this.stateInputText.bounds.left=100+343+25;
        this.stateInputText.bounds.top=this.gradeInputText.bounds.top;
        //Month you're planning to take the ACT for the first time (if applicable)
        this.actInputText=new InputText("Highest ACT math score so far?",343,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.actInputText);
        this.actInputText.bounds.left=100+(343+25)*2;
        this.actInputText.bounds.top=this.gradeInputText.bounds.top;
        //Your goal score for the ACT
        this.scoreInputText=new InputText("Goal ACT math score?",343,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.scoreInputText);
        this.scoreInputText.bounds.left=100;
        this.scoreInputText.bounds.top=this.gradeInputText.bounds.bottom+10;
        //Favorite subject?
        this.favSubjectInputText=new InputText("Favorite school subject?",343,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.favSubjectInputText);
        this.favSubjectInputText.bounds.left=100+343+25;
        this.favSubjectInputText.bounds.top=this.scoreInputText.bounds.top;
        //Least favorite subject
        this.leastSubjectInputText=new InputText("Least favorite school subject?",343,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.leastSubjectInputText);
        this.leastSubjectInputText.bounds.left=100+(343+25)*2;
        this.leastSubjectInputText.bounds.top=this.scoreInputText.bounds.top;
        //University you'd be psyched to get into:
        this.univInputText=new InputText("A university you'd be psyched to get into?",343*1.5,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",50,false,false);
        this.addChild(this.univInputText);
        this.univInputText.bounds.centerX=canvasWidth/2;
        this.univInputText.bounds.top=this.favSubjectInputText.bounds.bottom+10;
        
        //add submit button
        this.submitButton=new Button("submitProfile",canvasWidth/2-75,this.univInputText.bounds.bottom+10+15,150,30,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",24,["#CB6D51","#54c896","#000000"],this.submitForm.bind(this),null,null);
        this.addChild(this.submitButton);
        //add skip button
        this.submitButton=new Button("skipProfile",canvasWidth/2+75+10+15,this.submitButton.bounds.top,30,30,"skip",["#FFFFFF","#FFFFFF","#FFFFFF"],"helveticaNeueLight",21,[colors[2],colors[1],"#000000"],this.skipForm.bind(this),null,null);
        this.addChild(this.submitButton);
        
        //event listeners
        this.keyDownCallback=this.onKeyDown.bind(this);
        window.addEventListener('keydown', this.keyDownCallback);
	}
	onKeyDown(event){
	    if(event.keyCode==9){//tab
	        if(event.shiftKey){//shift tab -> reverse
	            if(this.gradeInputText.active){
	                event.preventDefault();
	            }else if(this.stateInputText.active){
	                this.gradeInputText.active=true;
	                this.stateInputText.active=false;
	                this.actInputText.active=false;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.actInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=true;
	                this.actInputText.active=false;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.scoreInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=true;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.favSubjectInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=false;
	                this.scoreInputText.active=true;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.leastSubjectInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=false;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=true;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.univInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=false;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=true;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }
	        }else{//plain tab -> forward
	            if(this.gradeInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=true;
	                this.actInputText.active=false;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.stateInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=true;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.actInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=false;
	                this.scoreInputText.active=true;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.scoreInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=false;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=true;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.favSubjectInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=false;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=true;
	                this.univInputText.active=false;
	                event.preventDefault();
	            }else if(this.leastSubjectInputText.active){
	                this.gradeInputText.active=false;
	                this.stateInputText.active=false;
	                this.actInputText.active=false;
	                this.scoreInputText.active=false;
	                this.favSubjectInputText.active=false;
	                this.leastSubjectInputText.active=false;
	                this.univInputText.active=true;
	                event.preventDefault();
	            }else if(this.univInputText.active){
	                event.preventDefault();
	            }
	        }
	    }else if(event.keyCode==13){//enter
	        this.submitForm();
	    }
	}
	submitForm(event){
	    //first submit info to cgi server
	    this.submitButton.toggle=false;
	    this.xhttp = new XMLHttpRequest();
	    var params = JSON.stringify({
            username: this.credentials.username,
            password: this.credentials.password,
            grade: this.gradeInputText.string,
            state: this.stateInputText.string,
            actDate: this.actInputText.string,
            goalActScore: this.scoreInputText.string,
            favSubject: this.favSubjectInputText.string,
            leastFavSubject: this.leastSubjectInputText.string,
            goalUniversity: this.univInputText.string
        });
        this.xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
            }
        };
        this.xhttp.open("POST", "cgi-bin/signupProfile.py", true);
        this.xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        this.xhttp.send(params);
	    //then load the Engine page
	    this.loadNextPage();
	}
	skipForm(event){
	    //just request the Engine page
	    this.loadNextPage();
	}
	loadNextPage(){
	    var myJson = JSON.parse('{ "pageRequest":"Engine"}');
	    myJson.content=this.todoJson;
	    window.dispatchEvent(new CustomEvent('requestPage',{ detail: myJson}));
	}
	remove(){
	    window.removeEventListener('keydown', this.keyDownCallback);
	    this.gradeInputText.remove();
	    this.stateInputText.remove();
	    this.actInputText.remove();
	    this.scoreInputText.remove();
	    this.favSubjectInputText.remove();
	    this.leastSubjectInputText.remove();
	    this.univInputText.remove();
	    super.remove();
	}
}
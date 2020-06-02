class HomePage extends paper.Group{
	constructor(canvasWidth,padding,colors) {
	    super();
	    this.applyMatrix=false;
	    this.defaultString="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        
        this.aboutContainer=new paper.Group();
        this.aboutContainer.applyMatrix=false;

        //home panel
        this.homeSectionHeight=650;
        this.homeContainer=new paper.Group();
        this.homeContainer.applyMatrix=false;
        this.homeContainer.pivot=[0,0];
        this.addChild(this.homeContainer);
        this.homeBG = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(canvasWidth, this.homeSectionHeight+padding[1])));
        this.homeBG.fillColor = "#FFFFFF";
        this.homeContainer.addChild(this.homeBG);
        //add text
        var textWidth=2*(canvasWidth-3*padding[0])/3;
        var homeTextString="The ACT tests college-readiness - so why not use your study time to get more ready? At ScalisePrep, as you raise your scores to get in the door, you'll also shore up the foundational skills you'll need once you get there and master a studying framework to use on the many more tests in your future.\n\nSo, don't just prepare. Prepare to Learn!"  //"Private test prep can be exhorbitantly expensive. Let's change that.\n\nAt Scalise Prep, we are developing a platform to give the experience of elite private tutoring without the expense of an elite private tutor.";
        this.homeText = new MultilineText(homeTextString,textWidth,"center","underwood",32,colors[2],3);
        this.homeText.position=[padding[0]+this.homeText.bounds.width/2,padding[1]+(this.homeSectionHeight)/2];
        this.homeContainer.addChild(this.homeText);
        //add athena picture
        this.athena = new paper.Raster("images/athena.svg");
        this.athena.visible=false;
        this.athena.onLoad = function() {
            this.athena.scaling=this.homeSectionHeight/this.athena.bounds.height;
            this.homeContainer.addChild(this.athena);
            this.athena.sendToBack();
            this.homeBG.sendToBack();
            this.athena.bounds.top=padding[1];
            this.athena.bounds.right=canvasWidth-padding[0];
            this.athena.visible=true;
        }.bind(this);
        //add olive branch pictures
        this.branches = new paper.Raster("images/oliveBranches.svg");
        this.branches.visible=false; //start invisible until loaded
        this.branches.onLoad = function() {
            this.branchesContainerTop=new paper.Group();
            this.branchesContainerTop.applyMatrix=false;
            this.homeContainer.addChild(this.branchesContainerTop);
            this.branches.scaling=50/this.branches.height;
            this.branchesContainerTop.addChild(this.branches);
            this.branches.bounds.top=110;//85;
            this.branches.position.x=this.homeText.position.x;
            this.branches.visible=true;
            //add olive branch lines
            var lineLength = 200;
            var path = new paper.Path.Line([padding[0],135], [padding[0]+lineLength,135]);//110
            path.strokeColor = colors[0];
            this.branchesContainerTop.addChild(path);
            var path2 = new paper.Path.Line([padding[0]+this.homeText.bounds.width-lineLength,135], [padding[0]+this.homeText.bounds.width,135]);
            path2.strokeColor = colors[0];
            this.branchesContainerTop.addChild(path2);
            
            this.branchesContainerLower=this.branchesContainerTop.clone(); //cloning olive branch to place in another place (below intro blurb)
            this.branchesContainerLower.rotation=180;
            this.branchesContainerLower.bounds.bottom=this.homeSectionHeight-110+2*padding[1];
            
            this.branchesContainerAbout=this.branchesContainerTop.clone(); //cloning olive branch to place in another place (below course features)
            this.aboutContainer.addChild(this.branchesContainerAbout);
            this.branchesContainerAbout.bounds.centerY=0;
            this.branchesContainerAbout.bounds.centerX=canvasWidth/2;
            
            this.branchesContainerAboutLower=this.branchesContainerTop.clone(); //cloning olive branch to place in another place (below meet tutor)
            this.aboutContainer.addChild(this.branchesContainerAboutLower);
            this.aboutContainer.bringToFront();
            this.branchesContainerAboutLower.rotation=180;
            this.branchesContainerAboutLower.bounds.centerY=this.aboutBG.bounds.height;
            this.branchesContainerAboutLower.bounds.centerX=canvasWidth/2;
            
            this.branchesContainerFAQLower=this.branchesContainerAbout.clone(); //cloning olive branch to place in another place (below FAQ)
            this.faqContainer.addChild(this.branchesContainerFAQLower);
            this.branchesContainerFAQLower.bounds.centerY=this.faqContainer.bounds.height;
            this.branchesContainerFAQLower.bounds.centerX=canvasWidth/2;
        }.bind(this);
        //add buttons
        this.signupButton=new Button("signup",800,515,200,50,"SIGN UP",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",36,["#CB6D51","#54c896","#000000"],function(){window.dispatchEvent(new CustomEvent('requestPopup',{ detail: "SignupForm"}));}.bind(this),null,null);
        this.homeContainer.addChild(this.signupButton);
        this.loginButton=new Button("login",1010,515,200,50,"LOG IN",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",36,["#CB6D51","#54c896","#000000"],function(){window.dispatchEvent(new CustomEvent('requestPopup',{ detail: "LoginForm"}));}.bind(this),null,null);
        this.homeContainer.addChild(this.loginButton);

        //products panel
        //construct panel
        this.productsSectionHeight=1200;
        this.productsContainer=new paper.Group();
        this.productsContainer.applyMatrix=false;
        this.productsContainer.pivot=[0,0];
        this.productsContainer.position.y=this.homeContainer.bounds.bottom;
        this.addChild(this.productsContainer);
        this.productsBG = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(canvasWidth, this.productsSectionHeight)));
        this.productsBG.fillColor = "#FFFFFF";
        this.productsContainer.addChild(this.productsBG);
        //title
        this.productsTitleText = new paper.PointText();
		this.productsTitleText.fontFamily="underwood";
		this.productsTitleText.justification='center';
		this.productsTitleText.fontSize=42;
        this.productsTitleText.fillColor = colors[1];
        this.productsTitleText.content="COURSE FEATURES";
        this.productsTitleText.position=[canvasWidth/2,70];
        this.productsContainer.addChild(this.productsTitleText);
        this.productsTitleBG = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,this.productsTitleText.bounds.top-2), new paper.Size(canvasWidth, this.productsTitleText.bounds.height)));
        this.productsTitleBG.fillColor = colors[1];
        this.productsTitleBG.opacity= 0.01;
        this.productsContainer.addChild(this.productsTitleBG);
        //add body text
        textWidth=canvasWidth-padding[0]-this.productsTitleText.bounds.left;
        this.product1titlestring = "ASK A TUTOR:"
        this.product2titlestring = "SMART-PROCTORED REAL ACT EXAMS:"
        this.product3titlestring = "INTERACTIVE VIDEO LECTURES:"
        this.product4titlestring = "SPACED-INTERVAL ERROR REVIEW:"
        this.product1string = "Our ACT platform was designed by veteran instructor Dr. Karina Scalise to replicate the elite private tutoring experience. Part of that experience is being able to ask your tutor anything at any time. Which is exactly what you can do with our ''Ask a Tutor'' button. Press it from anywhere on the platform and send a question to our team of expert tutors. Not only will you get your question answered, but over time our students most-asked questions help us keep improving our instruction to answer your questions before you even think to ask.\n\n\n";
        this.product2string = "Our digital bubble sheets look awfully like your standard paper ones. But looks can be deceiving. Not only do these mighty sheets automatically time your tests and grade your answers, they measure exactly where you spent your time and let you flag your thoughts about each problem as you go. With this high resolution data, we can diagnose exactly where your trouble spots lie so your prep time gets spent working on the material that will help you most.\n\n";
        this.product3string = "Sitting around watching a long video isn't much fun, unless it's of the Hollywood variety (or at least has a respectable number of Youtube views). So we've dispensed with the long video format entirely. Our lectures consist of bite sized amounts of instruction interspersed with questions that will keep you constantly on your toes, trying out your new knowledge and applying what you've learned.\n\n\n";
        this.product4string = "Mistakes are test prep gold. We treasure them! By finding the patterns in your mistakes, you can develop habits to prevent them on test day. This is why we coach you through an error analysis of missed problems after every practice test.\n\nOnce you master a missed problem, we want to make sure it stays that way. So our spaced interval tracker will have you keep retrying it at longer and longer intervals until you're such a pro you'll never forget how to do it again.\n";
        this.productsTitleText1 = new MultilineText(this.product1titlestring,textWidth,"left","helveticaNeueLight",24,colors[0],1);
        this.productsTitleText1.bounds.left=this.productsTitleText.bounds.left;
        this.productsTitleText1.bounds.top=this.productsTitleText.bounds.bottom+padding[1];
        this.productsContainer.addChild(this.productsTitleText1);
        this.productsText1 = new MultilineText(this.product1string,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.productsText1.bounds.left=this.productsTitleText.bounds.left;
        this.productsText1.bounds.top=this.productsTitleText1.bounds.bottom+padding[1]/2;
        this.productsContainer.addChild(this.productsText1);
        this.productsTitleText2 = new MultilineText(this.product2titlestring,textWidth,"left","helveticaNeueLight",24,colors[0],1);
        this.productsTitleText2.bounds.left=this.productsTitleText.bounds.left;
        this.productsTitleText2.bounds.top=this.productsText1.bounds.bottom+padding[1];
        this.productsContainer.addChild(this.productsTitleText2);
        this.productsText2 = new MultilineText(this.product2string,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.productsText2.bounds.left=this.productsTitleText.bounds.left;
        this.productsText2.bounds.top=this.productsTitleText2.bounds.bottom+padding[1]/2;
        this.productsContainer.addChild(this.productsText2);
        this.productsTitleText3 = new MultilineText(this.product3titlestring,textWidth,"left","helveticaNeueLight",24,colors[0],1);
        this.productsTitleText3.bounds.left=this.productsTitleText.bounds.left;
        this.productsTitleText3.bounds.top=this.productsText2.bounds.bottom+padding[1];
        this.productsContainer.addChild(this.productsTitleText3);
        this.productsText3 = new MultilineText(this.product3string,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.productsText3.bounds.left=this.productsTitleText.bounds.left;
        this.productsText3.bounds.top=this.productsTitleText3.bounds.bottom+padding[1]/2;
        this.productsContainer.addChild(this.productsText3);
        this.productsTitleText4 = new MultilineText(this.product4titlestring,textWidth,"left","helveticaNeueLight",24,colors[0],1);
        this.productsTitleText4.bounds.left=this.productsTitleText.bounds.left;
        this.productsTitleText4.bounds.top=this.productsText3.bounds.bottom+padding[1];
        this.productsContainer.addChild(this.productsTitleText4);
        this.productsText4 = new MultilineText(this.product4string,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.productsText4.bounds.left=this.productsTitleText.bounds.left;
        this.productsText4.bounds.top=this.productsTitleText4.bounds.bottom+padding[1]/2;
        this.productsContainer.addChild(this.productsText4);
        //add products.tutor picture
        this.productsTutor = new paper.Raster("images/productTutor.svg");
        this.productsTutor.visible=false;
        this.productsTutor.onLoad = function() {
            this.productsTutor.scaling=200/this.productsTutor.bounds.height;
            this.productsContainer.addChild(this.productsTutor);
            this.productsTutor.bounds.top=this.productsTitleText1.bounds.top;
            //this.productsTutor.bounds.centerY=this.productsText1.bounds.centerY;
            this.productsTutor.bounds.centerX=this.productsTitleText.bounds.left/2;
            this.productsTutor.visible=true;
        }.bind(this);
        //add products.exam picture
        this.productsExam = new paper.Raster("images/productExam.svg");
        this.productsExam.visible=false;
        this.productsExam.onLoad = function() {
            this.productsExam.scaling=140/this.productsExam.bounds.height;
            this.productsContainer.addChild(this.productsExam);
            this.productsExam.bounds.top=this.productsTitleText2.bounds.top;
            //this.productsExam.bounds.centerY=this.productsText2.bounds.centerY;
            this.productsExam.bounds.centerX=this.productsTitleText.bounds.left/2;
            this.productsExam.visible=true;
        }.bind(this);
        //add products.video picture
        this.productsVideo = new paper.Raster("images/productVideos.svg");
        this.productsVideo.visible=false;
        this.productsVideo.onLoad = function() {
            this.productsVideo.scaling=180/this.productsVideo.bounds.height;
            this.productsContainer.addChild(this.productsVideo);
            this.productsVideo.bounds.top=this.productsTitleText3.bounds.top;
            //this.productsVideo.bounds.centerY=this.productsText3.bounds.centerY;
            this.productsVideo.bounds.centerX=this.productsTitleText.bounds.left/2;
            this.productsVideo.visible=true;
        }.bind(this);
        //add products.flashcard picture
        this.productsFlashcard = new paper.Raster("images/productFlashcard.svg");
        this.productsFlashcard.visible=false;
        this.productsFlashcard.onLoad = function() {
            this.productsFlashcard.scaling=140/this.productsFlashcard.bounds.height;
            this.productsContainer.addChild(this.productsFlashcard);
            this.productsFlashcard.bounds.top=this.productsTitleText4.bounds.top;
            //this.productsFlashcard.bounds.centerY=this.productsText4.bounds.centerY;
            this.productsFlashcard.bounds.centerX=this.productsTitleText.bounds.left/2;
            this.productsFlashcard.visible=true;
        }.bind(this);
        //add a submit button
        this.signupButton2=new Button("signup2",canvasWidth/2-75,this.productsText4.bounds.bottom+15,150,40,"SIGN UP",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",28,["#CB6D51","#54c896","#000000"],function(){window.dispatchEvent(new CustomEvent('requestPopup',{ detail: "SignupForm"}));}.bind(this),null,null);
        this.productsContainer.addChild(this.signupButton2);
        
        //about panel
        //construct panel
        this.aboutSectionHeight=610; //height of about section
        this.aboutContainer.pivot=[0,0];
        this.aboutContainer.position.y=this.productsContainer.bounds.bottom;
        this.addChild(this.aboutContainer);
        this.aboutBG = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(canvasWidth, this.aboutSectionHeight)));
        this.aboutBG.fillColor = "#FFFFFF";
        this.aboutContainer.addChild(this.aboutBG);
        //title -- Meet your Tutor
        this.aboutTitleText = new paper.PointText();
		this.aboutTitleText.fontFamily="underwood";
		this.aboutTitleText.justification='center';
		this.aboutTitleText.fontSize=42;
        this.aboutTitleText.fillColor = colors[1];
        this.aboutTitleText.content="MEET YOUR TUTOR";
        this.aboutTitleText.position=[canvasWidth/2,75];
        this.aboutContainer.addChild(this.aboutTitleText);
        //add body text
        var aboutString1=`Hi, I'm Karina. Or Dr. Scalise if we're being formal.\n\nI've been coaching college-bound students since I was a Harvard undergrad myself (an ancient time, before smart phones, Netflix or Insta). I graduated in 2006, went on to get my PhD at Columbia and continued to study the neurobiology of learning. I taught test prep, math, and science throughout. Which is all to say, I've been teaching this stuff for a good long while!\n\nAnd what's my philosophy after all this time? Well, most students see the ACT as a painful rite of passage standing between them and all the fun, err I mean "educational fulfillment," of college. And, okay, to some extent it is. But it's also a great chance to get ready for college itself. After all the ACT was designed to test your college readiness skills. Why not use your study time to actually improve them?`;
        var aboutString2=`That's what I've designed this course to do. We'll find the gaps in your knowledge and fill them in ("combinations and permutations" anybody?). We'll also learn problem solving strategies and study skills that you can use the next time you need to learn something new. Yes, your score will go up. But just as important as improving your college admissions odds, you'll be ready to hit the ground running once you get there.\n\nDon't just prepare. Prepare to learn!`;
        textWidth=canvasWidth-2*padding[0]-padding[1]-300;
        this.aboutText = new MultilineText(aboutString1,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.aboutText.bounds.left=padding[0]+padding[1]+300;
        this.aboutText.bounds.top=this.aboutTitleText.bounds.bottom+padding[1];
        this.aboutContainer.addChild(this.aboutText);
        
        textWidth=canvasWidth-2*padding[0]-padding[1];
        this.aboutText2 = new MultilineText(aboutString2,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.aboutText2.bounds.left=padding[0]+padding[1];
        this.aboutText2.bounds.top=this.aboutText.bounds.bottom+padding[1];
        this.aboutContainer.addChild(this.aboutText2);
        
        //add about picture
        this.krs = new paper.Raster("images/krs.jpg");
        this.krs.visible=false;
        this.krs.onLoad = function() {
            this.krs.scaling=300/this.krs.bounds.height;
            this.aboutContainer.addChild(this.krs);
            this.krs.bounds.bottom=this.aboutText.bounds.bottom;//+padding[1];
            this.krs.bounds.left=padding[0];
            this.krs.visible=true;
        }.bind(this);
        
        //FAQ panel
        //construct panel
        this.faqSectionHeight=460; //height of section
        this.faqContainer=new paper.Group();
        this.faqContainer.applyMatrix=false;
        this.faqContainer.bounds.top=this.aboutContainer.bounds.bottom;
        this.addChild(this.faqContainer);
        this.faqContainer.pivot=[0,0];
        this.faqContainer.position.y=this.aboutContainer.bounds.bottom;
        this.addChild(this.faqContainer);
        this.faqBG = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(canvasWidth, this.faqSectionHeight)));
        this.faqBG.fillColor = "#FFFFFF";
        this.faqContainer.addChild(this.faqBG);
        //title -- FAQ
        this.faqTitleText = new paper.PointText();
		this.faqTitleText.fontFamily="underwood";
		this.faqTitleText.justification='center';
		this.faqTitleText.fontSize=42;
        this.faqTitleText.fillColor = colors[1];
        this.faqTitleText.content="FAQ";
        this.faqTitleText.position=[canvasWidth/2,75];
        this.faqContainer.addChild(this.faqTitleText);
        //add body text
        this.faq1titlestring = "1) How do I sign up?";
        //this.faq2titlestring = "2) What is the course pricing?";
        this.faq3titlestring = "2) Can I participate in the closed beta development of this product?";
        this.faq1string = "We are currently in closed beta but if you'd like to be notified when we launch publically, just fill in the contact form below with subject 'waitlist'. (Feel free to include a message if you're feeling chatty -- we love to hear from you -- but it's not necessary to be added to the list.)";
        //this.faq2string = "...";
        this.faq3string = "Yes! We have an awesome team of students interested in getting a head start using our platform while also shaping it to become the first ever test prep course to be loved by students everywhere. ;) If this sounds like you, contact us with subject 'beta' to learn more and get involved.";
        this.faqTitleText1 = new MultilineText(this.faq1titlestring,textWidth,"left","helveticaNeueLight",24,colors[0],1);
        this.faqTitleText1.bounds.left=(this.faqBG.bounds.right-this.faqBG.bounds.left-textWidth)/2;//padding[0];
        this.faqTitleText1.bounds.top=this.faqTitleText.bounds.bottom + padding[1];
        this.faqContainer.addChild(this.faqTitleText1);
        this.faqText1 = new MultilineText(this.faq1string,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.faqText1.bounds.left=this.faqTitleText1.bounds.left;
        this.faqText1.bounds.top=this.faqTitleText1.bounds.bottom+padding[1]/2;
        this.faqContainer.addChild(this.faqText1);
        /*
        this.faqTitleText2 = new MultilineText(this.faq2titlestring,textWidth,"left","helveticaNeueLight",24,colors[0],1);
        this.faqTitleText2.bounds.left=this.faqTitleText1.bounds.left;
        this.faqTitleText2.bounds.top=this.faqText1.bounds.bottom+padding[1];
        this.faqContainer.addChild(this.faqTitleText2);
        this.faqText2 = new MultilineText(this.faq2string,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.faqText2.bounds.left=this.faqTitleText1.bounds.left;
        this.faqText2.bounds.top=this.faqTitleText2.bounds.bottom+padding[1]/2;
        this.faqContainer.addChild(this.faqText2);
        */
        this.faqTitleText3 = new MultilineText(this.faq3titlestring,textWidth,"left","helveticaNeueLight",24,colors[0],1);
        this.faqTitleText3.bounds.left=this.faqTitleText1.bounds.left;
        //this.faqTitleText3.bounds.top=this.faqText2.bounds.bottom+padding[1];
        this.faqTitleText3.bounds.top=this.faqText1.bounds.bottom+padding[1];
        this.faqContainer.addChild(this.faqTitleText3);
        this.faqText3 = new MultilineText(this.faq3string,textWidth,"left","helveticaNeueLight",18,colors[2],1);
        this.faqText3.bounds.left=this.faqTitleText1.bounds.left;
        this.faqText3.bounds.top=this.faqTitleText3.bounds.bottom+padding[1]/2;
        this.faqContainer.addChild(this.faqText3);
        //add a submit button
        this.signupButton3=new Button("signup3",canvasWidth/2-75,this.faqText3.bounds.bottom+30,150,40,"SIGN UP",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",28,["#CB6D51","#54c896","#000000"],function(){window.dispatchEvent(new CustomEvent('requestPopup',{ detail: "SignupForm"}));}.bind(this),null,null);
        this.faqContainer.addChild(this.signupButton3);
        
        //Contact Panel
        //construct panel
        this.contactSectionHeight=650;
        this.contactContainer=new paper.Group();
        this.contactContainer.applyMatrix=false;
        this.contactContainer.pivot=[0,0];
        this.contactContainer.bounds.top=this.faqContainer.bounds.bottom;
        this.addChild(this.contactContainer);
        this.contactContainer.sendToBack();
        this.contactBG = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0), new paper.Size(canvasWidth, this.contactSectionHeight)));
        this.contactBG.fillColor = "#FFFFFF";
        this.contactContainer.addChild(this.contactBG);
        //title
        this.contactTitleText = new paper.PointText();
		this.contactTitleText.fontFamily="underwood";
		this.contactTitleText.justification='center';
		this.contactTitleText.fontSize=42;
        this.contactTitleText.fillColor = colors[1];
        this.contactTitleText.content="CONTACT US";
        this.contactTitleText.position=[canvasWidth/2,100];
        this.contactContainer.addChild(this.contactTitleText);
        //Contact Form
        //form
        //name input text
        this.contactNameInputText=new InputText("Name",(canvasWidth-2*padding[0]-padding[1])/2,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",100,false,false);
        this.contactContainer.addChild(this.contactNameInputText);
        this.contactNameInputText.bounds.left=padding[0];
        this.contactNameInputText.bounds.top=this.contactTitleText.bounds.bottom+padding[1];
        //email input text
        this.contactEmailInputText=new InputText("Email",(canvasWidth-2*padding[0]-padding[1])/2,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",100,false,false);
        this.contactContainer.addChild(this.contactEmailInputText);
        this.contactEmailInputText.bounds.right=canvasWidth-padding[0];
        this.contactEmailInputText.bounds.top=this.contactNameInputText.bounds.top;
        //subject input text
        this.contactSubjectInputText=new InputText("Subject",canvasWidth-2*padding[0],50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",200,false,false);
        this.contactContainer.addChild(this.contactSubjectInputText);
        this.contactSubjectInputText.bounds.left=padding[0];
        this.contactSubjectInputText.bounds.top=this.contactNameInputText.bounds.bottom+padding[1];
        //message input text
        this.contactMessageInputText=new SuperText("","Message",canvasWidth-2*padding[0],[25,11],25,"left","helveticaNeueLight",24,"#000000",colors[0],"#EEEEEE",colors[1],true,10000,7,false);
        this.contactContainer.addChild(this.contactMessageInputText);
        this.contactMessageInputText.bounds.left=padding[0];
        this.contactMessageInputText.bounds.top=this.contactSubjectInputText.bounds.bottom+padding[1];
        //add submit button
        this.contactButton=new Button("contact",canvasWidth/2-75,this.contactMessageInputText.bounds.bottom+35,150,30,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",24,["#CB6D51","#54c896","#000000"],this.submitContactForm.bind(this),null,null,"#EFEFEF");
        this.contactContainer.addChild(this.contactButton);
        //response text
        this.contactFeedbackText = new paper.PointText();
		this.contactFeedbackText.fontFamily="helveticaNeueLight";
		this.contactFeedbackText.justification='center';
		this.contactFeedbackText.fontSize=18;
        this.contactFeedbackText.fillColor = colors[2];
        this.contactFeedbackText.content="";
        this.contactFeedbackText.bounds.centerX=this.contactButton.bounds.centerX;
        this.contactFeedbackText.bounds.top=this.contactButton.bounds.bottom+10;
        this.contactContainer.addChild(this.contactFeedbackText);
        
        //load menu buttons
        var buttonWidth=100;
        var logoHeight=55;
        var productsButton=new Button("products",0,0,buttonWidth,logoHeight,"FEATURES",[],"helveticaNeueLight",16,[colors[2],colors[0],"#000000"],this.scrollJumpHandler.bind(this),null,null);
        var aboutButton=new Button("about",0,0,0.85*buttonWidth,logoHeight,"ABOUT",[],"helveticaNeueLight",16,[colors[2],colors[0],"#000000"],this.scrollJumpHandler.bind(this),null,null);
        var faqButton=new Button("faq",0,0,0.6*buttonWidth,logoHeight,"FAQ",[],"helveticaNeueLight",16,[colors[2],colors[0],"#000000"],this.scrollJumpHandler.bind(this),null,null);
        var contactButton=new Button("contact",0,0,buttonWidth,logoHeight,"CONTACT",[],"helveticaNeueLight",16,[colors[2],colors[0],"#000000"],this.scrollJumpHandler.bind(this),null,null);
		window.dispatchEvent(new CustomEvent('requestMenuButtons',{detail:{"buttonHandles":[productsButton,aboutButton,faqButton,contactButton]}}));
        //add listeners
        this.keyDownCallback=this.onKeyDown.bind(this);
        window.addEventListener('keydown', this.keyDownCallback);
        this.xhttpCallback=this.xhttpReturn.bind(this);
        window.addEventListener("xhttpReturn", this.xhttpCallback, false);
	}
	scrollJumpHandler(event){
	    if(event=="home"){
	        var scrollValue=0;
	    }else if(event=="products"){
	       var scrollValue=this.productsContainer.bounds.top;
	    }else if(event=="about"){
	        var scrollValue=this.aboutContainer.bounds.top;
	    }else if(event=="faq"){
	        var scrollValue=this.faqContainer.bounds.top-25;
	    }else if(event=="contact"){
	        var scrollValue=this.contactContainer.bounds.top-25;
	        this.contactNameInputText.active=true;//set the focus on the first element of the contact form
	    }
	    window.dispatchEvent(new CustomEvent('scrollJumpRequest',{detail:scrollValue}));
	}
	onKeyDown(event){
	    if(event.keyCode==9){//tab
	        if(event.shiftKey){//shift tab -> reverse
	            if(this.contactMessageInputText.active){
	                this.contactMessageInputText.active=false;
	                this.contactSubjectInputText.active=true;
	                event.preventDefault();
	            }else if(this.contactSubjectInputText.active){
	                this.contactSubjectInputText.active=false;
	                this.contactEmailInputText.active=true;
	                event.preventDefault();
	            }else if(this.contactEmailInputText.active){
	                this.contactEmailInputText.active=false;
	                this.contactNameInputText.active=true;
	                event.preventDefault();
	            }else if(this.contactNameInputText.active){
	                event.preventDefault();
	            }
	        }else{//plain tab -> forward
	            if(this.contactNameInputText.active){
	                this.contactNameInputText.active=false;
	                this.contactEmailInputText.active=true;
	                event.preventDefault();
	            }else if(this.contactEmailInputText.active){
	                this.contactEmailInputText.active=false;
	                this.contactSubjectInputText.active=true;
	                event.preventDefault();
	            }else if(this.contactSubjectInputText.active){
	                this.contactSubjectInputText.active=false;
	                this.contactMessageInputText.active=true;
	                event.preventDefault();
	            }else if(this.contactMessageInputText.active){
	                event.preventDefault();
	            }
	        }
	    }else if(event.keyCode==13){//enter
	        if(this.contactNameInputText.active || this.contactEmailInputText.active || this.contactSubjectInputText.active){
	            this.submitContactForm();
	        }
	    }
	}
	xhttpReturn(event){
	    if(event.detail.httpDispatcher=="signupForm" && event.detail.success==true){
	        event.detail.pageRequest="SignupProfilePage";
	        window.dispatchEvent(new CustomEvent('requestPage',{ detail: event.detail}));
	    }else if(event.detail.httpDispatcher=="loginForm" && event.detail.success==true){
	        //amplitude.getInstance().logEvent('login');
	        event.detail.pageRequest="Engine";
	        window.dispatchEvent(new CustomEvent('requestPage',{ detail: event.detail}));
	    }else if(event.detail.httpDispatcher=="contactForm"){
	        if(event.detail.success==true){
	            this.contactFeedbackText.content="Message received. Thank you!";
	            this.contactNameInputText.string="";
	            this.contactEmailInputText.string="";
	            this.contactSubjectInputText.string="";
	            this.contactMessageInputText.string="";
	        }else{
	            this.contactFeedbackText.content="There was an error with this form. Please contact scalise.dominic@gmail.com";
	        }
	        this.contactButton.toggle=true;
	    }
	}
	submitContactForm(){
	    if(this.contactNameInputText.string.length==0){
	        this.contactFeedbackText.content="You must enter a name.";
	        this.contactNameInputText.active=true;
	        this.contactEmailInputText.active=false;
	        this.contactSubjectInputText.active=false;
	        this.contactMessageInputText.active=false;
	        return;
	    }else if(this.contactEmailInputText.string.length==0){
	        this.contactFeedbackText.content="You must enter an email.";
	        this.contactNameInputText.active=false;
	        this.contactEmailInputText.active=true;
	        this.contactSubjectInputText.active=false;
	        this.contactMessageInputText.active=false;
	        return;
	    }else if(this.contactSubjectInputText.string.length==0){
	        this.contactFeedbackText.content="You must enter a subject.";
	        this.contactNameInputText.active=false;
	        this.contactEmailInputText.active=false;
	        this.contactSubjectInputText.active=true;
	        this.contactMessageInputText.active=false;
	        return;
	    }else if(this.contactMessageInputText.string.length==0){
	        this.contactFeedbackText.content="You must enter a message.";
	        this.contactNameInputText.active=false;
	        this.contactEmailInputText.active=false;
	        this.contactSubjectInputText.active=false;
	        this.contactMessageInputText.active=true;
	        return;
	    }
	    this.contactButton.toggle=false;
	    this.contactFeedbackText.content="";
	    this.sendContactXHTTP();
	}
	sendContactXHTTP(){
	    this.contactFeedbackText.content="Sending message. Please wait!";
	    this.xhttpContact = new XMLHttpRequest();
        var params = JSON.stringify({
          name: this.contactNameInputText.string,
          email: this.contactEmailInputText.string,
          subject: this.contactSubjectInputText.string,
          message: this.contactMessageInputText.string,
        });
        this.xhttpContact.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var json=JSON.parse(this.responseText);
            json.httpDispatcher="contactForm";
            window.dispatchEvent(new CustomEvent('xhttpReturn',{ detail: json}));
          }
        };
        this.xhttpContact.open("POST", "cgi-bin/contact.py", true);
        this.xhttpContact.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        this.xhttpContact.send(params);
	}
	remove(){
	    window.removeEventListener('keydown', this.keyDownCallback);
	    window.removeEventListener("xhttpReturn", this.xhttpCallback, false);
	    this.contactNameInputText.remove();
	    this.contactEmailInputText.remove();
	    this.contactSubjectInputText.remove();
	    this.contactMessageInputText.remove();
	    super.remove();
	}
}

class SignupForm extends paper.Group{
	constructor(colors) {
	    super();
	    this.applyMatrix=false;
	    this.width=500;
	    this.height=500;
	    this.pivot=[0,0];
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
        this.titleText.content="SIGN UP";
        this.titleText.position=[0,-this.height/2+25+this.titleText.bounds.height/2];
        this.addChild(this.titleText);
        
        //referral explanation text
        this.referralExplainText = new paper.PointText();
		this.referralExplainText.fontFamily="helveticaNeueLight";
		this.referralExplainText.justification='center';
		this.referralExplainText.fontSize=18;
        this.referralExplainText.fillColor = colors[0];
        this.referralExplainText.content="Sign up is currently by invitation only.\nTo inquire about an invite, use our contact form!";
        this.referralExplainText.bounds.centerX=0;
        this.referralExplainText.bounds.centerY=-150;
        this.addChild(this.referralExplainText);
        //referral code input text
        this.referralInputText=new InputText("Referral Code",450,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.referralInputText);
        this.referralInputText.bounds.centerX=0;
        this.referralInputText.bounds.centerY=-85;
        this.referralInputText.active=true;
        //username input text
        this.usernameInputText=new InputText("Username",450,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.usernameInputText);
        this.usernameInputText.bounds.centerX=0;
        this.usernameInputText.bounds.centerY=-15;
        //email input text
        this.emailInputText=new InputText("Email",450,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",50,false,false);
        this.addChild(this.emailInputText);
        this.emailInputText.bounds.centerX=0;
        this.emailInputText.bounds.centerY=55;
        //password input text
        this.passwordInputText=new InputText("Password",450,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,true,false);
        this.addChild(this.passwordInputText);
        this.passwordInputText.bounds.centerX=0;
        this.passwordInputText.bounds.centerY=125;
        //add submit button
        this.submitButton=new Button("signupSubmit",-75,this.passwordInputText.bounds.bottom+25,150,30,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",24,["#CB6D51","#54c896","#000000"],this.submitForm.bind(this),null,null,"#EFEFEF");
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
	submitForm(){
	    if(this.referralInputText.string.length==0){
	        this.feedbackText.content="You must enter a valid referral code.";
	        this.usernameInputText.active=false;
	        this.emailInputText.active=false;
	        this.passwordInputText.active=false;
	        this.referralInputText.active=true;
	        return;
	    }else if(this.usernameInputText.string.length==0){
	        this.feedbackText.content="You must enter a username.";
	        this.usernameInputText.active=true;
	        this.emailInputText.active=false;
	        this.passwordInputText.active=false;
	        this.referralInputText.active=false;
	        return;
	    }else if(this.emailInputText.string.length==0){
	        this.feedbackText.content="You must enter an email.";
	        this.usernameInputText.active=false;
	        this.emailInputText.active=true;
	        this.passwordInputText.active=false;
	        this.referralInputText.active=false;
	        return;
	    }else if(this.passwordInputText.string.length<8){
	        this.feedbackText.content="Your password must contain at least 8 characters.";
	        this.usernameInputText.active=false;
	        this.emailInputText.active=false;
	        this.passwordInputText.active=true;
	        this.referralInputText.active=false;
	        return;
	    }
	    //moderately validate email something@something
	    const expression = /\S+@\S+\.\S/
	    if(expression.test(this.emailInputText.string.toLowerCase())==false){
	        this.feedbackText.content="You must enter a valid email address.";
	        this.usernameInputText.active=false;
	        this.emailInputText.active=true;
	        this.passwordInputText.active=false;
	        this.referralInputText.active=false;
	        return;
	    }
	    this.submitButton.toggle=false;
	    this.feedbackText.content="";
	    this.sendXHTTP();
	}
	sendXHTTP(){
	    this.feedbackText.content="Signing up. Please wait!";
	    this.xhttp = new XMLHttpRequest();
        var params = JSON.stringify({
          username: this.usernameInputText.string,
          email: this.emailInputText.string,
          password: this.passwordInputText.string,
          referralCode: this.referralInputText.string,
          timezoneOffset: new Date().getTimezoneOffset()
        });
        window.dispatchEvent(new CustomEvent('setCredentials',{ detail: params}));
        this.xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //console.log(this.responseText);
                var json=JSON.parse(this.responseText);
                json.httpDispatcher="signupForm";
                window.dispatchEvent(new CustomEvent('xhttpReturn',{ detail: json}));
            }
        };
        this.xhttp.open("POST", "cgi-bin/signup.py", true);
        this.xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        this.xhttp.send(params);
	}
	onKeyDown(event){
	    if(event.keyCode==9){//tab
	        if(event.shiftKey){//shift tab -> reverse
	            if(this.passwordInputText.active){
	                this.passwordInputText.active=false;
	                this.emailInputText.active=true;
	                this.usernameInputText.active=false;
	                this.referralInputText.active=false;
	                event.preventDefault();
	            }else if(this.emailInputText.active){
	                this.passwordInputText.active=false;
	                this.emailInputText.active=false;
	                this.usernameInputText.active=true;
	                this.referralInputText.active=false;
	                event.preventDefault();
	            }else if(this.usernameInputText.active){
	                this.passwordInputText.active=false;
	                this.emailInputText.active=false;
	                this.usernameInputText.active=false;
	                this.referralInputText.active=true;
	                event.preventDefault();
	            }else if(this.referralInputText.active){
	                event.preventDefault();
	            }
	        }else{//plain tab -> forward
	            if(this.referralInputText.active){
	                this.referralInputText.active=false;
	                this.usernameInputText.active=true;
	                this.emailInputText.active=false;
	                this.passwordInputText.active=false;
	                event.preventDefault();
	            }else if(this.usernameInputText.active){
	                this.referralInputText.active=false;
	                this.usernameInputText.active=false;
	                this.emailInputText.active=true;
	                this.passwordInputText.active=false;
	                event.preventDefault();
	            }else if(this.emailInputText.active){
	                this.referralInputText.active=false;
	                this.usernameInputText.active=false;
	                this.emailInputText.active=false;
	                this.passwordInputText.active=true;
	                event.preventDefault();
	            }else if(this.passwordInputText.active){
	                event.preventDefault();
	            }
	        }
	    }else if(event.keyCode==13){//enter
	        this.submitForm();
	    }
	}
	xhttpReturn(event){
	    if(event.detail.httpDispatcher=="signupForm"){
	        if(event.detail.success==false){
    	        if(event.detail.failureMode=="username"){
    	            this.feedbackText.content="Username is already taken. Try again.";
    	            this.usernameInputText.active=true;
	                this.emailInputText.active=false;
	                this.passwordInputText.active=false;
	                this.referralInputText.active=false;
    	        }else{
    	            this.feedbackText.content="Invalid referral code.";
    	            this.usernameInputText.active=false;
	                this.emailInputText.active=false;
	                this.passwordInputText.active=false;
	                this.referralInputText.active=true;
    	        }
    	        this.submitButton.toggle=true;
	        }else{
	            this.feedbackText.content="Success! Logging in.";
	        }
	    }
	}
	remove(){
	    window.removeEventListener("xhttpReturn", this.xhttpCallback, false);
	    window.removeEventListener('keydown', this.keyDownCallback);
	    this.usernameInputText.remove();
	    this.passwordInputText.remove();
	    super.remove();
	}
}

class LoginForm extends paper.Group{
	constructor(colors) {
	    super();
	    this.applyMatrix=false;
	    this.width=500;
	    this.height=290;
	    this.pivot=[0,0];
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
        this.titleText.content="LOG IN";
        this.titleText.position=[0,-this.height/2+25+this.titleText.bounds.height/2];
        this.addChild(this.titleText);
        //username input text
        this.usernameInputText=new InputText("Username",450,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,false,false);
        this.addChild(this.usernameInputText);
        this.usernameInputText.bounds.centerX=0;
        this.usernameInputText.bounds.top=this.titleText.bounds.bottom+20;
        this.usernameInputText.active=true;
        //password input text
        this.passwordInputText=new InputText("Password",450,50,25,0,"helveticaNeueLight",24,"#000000",colors[1],colors[0],"center",25,true,false);
        this.addChild(this.passwordInputText);
        this.passwordInputText.bounds.centerX=0;
        this.passwordInputText.bounds.top=this.usernameInputText.bounds.bottom+10;
        //add submit button
        //button itself
        this.submitButton=new Button("loginSubmit",-75,0,150,30,"SUBMIT",["#FAF2EF","#E3F6EE","#DDDDDD"],"underwood",24,["#CB6D51","#54c896","#000000"],this.submitForm.bind(this),null,null,"#EFEFEF");
        this.submitButton.bounds.top=this.passwordInputText.bounds.bottom+20;
        this.addChild(this.submitButton);
        /*//add forgot password button
        //button itself
        this.forgotButton=new Button("forgotPassword",0,0,200,30,"Forgot Password?",["#FFFFFF","#FFFFFF","#FFFFFF"],"helveticaNeueLight",14,["#888888","#54c896","#000000"],this.forgotPasswordClick.bind(this),null,null,"#EFEFEF");
        this.forgotButton.bounds.centerX=this.submitButton.bounds.centerX;
        this.forgotButton.bounds.top=this.submitButton.bounds.bottom+3;
        this.addChild(this.forgotButton);*/
        //response text
        this.feedbackText = new paper.PointText();
		this.feedbackText.fontFamily="helveticaNeueLight";
		this.feedbackText.justification='center';
		this.feedbackText.fontSize=18;
        this.feedbackText.fillColor = colors[2];
        this.feedbackText.content="";
        this.feedbackText.bounds.centerX=this.submitButton.bounds.centerX;
        this.feedbackText.bounds.top=this.submitButton.bounds.bottom+2;
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
	submitForm(){
	    if(this.usernameInputText.string.length==0){
	        this.feedbackText.content="You must enter a username.";
	        this.usernameInputText.active=true;
	        this.passwordInputText.active=false;
	        return;
	    }else if(this.passwordInputText.string.length==0){
	        this.feedbackText.content="You must enter a password.";
	        this.usernameInputText.active=false;
	        this.passwordInputText.active=true;
	        return;
	    }
	    this.submitButton.toggle=false;
	    this.feedbackText.content="";
	    this.sendXHTTP();
	}
	forgotPasswordClick(){
	    if(this.usernameInputText.string.length==0){
	        this.feedbackText.content="You must enter a username.";
	        this.usernameInputText.active=true;
	        this.passwordInputText.active=false;
	        return;
	    }
	    var tempXhttp = new XMLHttpRequest();
        var params = JSON.stringify({
          username: this.usernameInputText.string,
        });
        tempXhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("password recovery response: "+this.responseText);
            }
        };
        tempXhttp.open("POST", "cgi-bin/passwordResetRequestCode.py", true);
        tempXhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        tempXhttp.send(params);
	    this.feedbackText.content="Password recovery sent. Please check your email.";
	}
	sendXHTTP(){
	    this.feedbackText.content="Logging in. Please wait!";
	    this.xhttp = new XMLHttpRequest();
        var params = JSON.stringify({
          username: this.usernameInputText.string,
          password: this.passwordInputText.string,
        });
        window.dispatchEvent(new CustomEvent('setCredentials',{ detail: params}));
        this.xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                var json=JSON.parse(this.responseText);
                /*try{
                    console.log(json.content.assignments[0].prompt);
                    console.log(json.content.assignResponse[0]);
                    console.log(json.content.assignments[1].prompt);
                    console.log(json.content.assignResponse[1]);
                    console.log(json.content.assignments[2].prompt);
                    console.log(json.content.assignResponse[2]);
                }catch(error){
                    
                }*/
                json.httpDispatcher="loginForm";
                window.dispatchEvent(new CustomEvent('xhttpReturn',{ detail: json}));
            }
        };
        this.xhttp.open("POST", "cgi-bin/login.py", true);
        this.xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        this.xhttp.send(params);
	}
	onKeyDown(event){
	    if(event.keyCode==9){//tab
	        if(event.shiftKey){//shift tab -> reverse
	            if(this.passwordInputText.active){
	                this.passwordInputText.active=false;
	                this.usernameInputText.active=true;
	                event.preventDefault();
	            }else if(this.usernameInputText.active){
	                event.preventDefault();
	            }
	        }else{//plain tab -> forward
	            if(this.usernameInputText.active){
	                this.usernameInputText.active=false;
	                this.passwordInputText.active=true;
	                event.preventDefault();
	            }else if(this.passwordInputText.active){
	                event.preventDefault();
	            }
	        }
	    }else if(event.keyCode==13){//enter
	        this.submitForm();
	    }
	}
	xhttpReturn(event){
	    if(event.detail.httpDispatcher=="loginForm" && event.detail.success==false){
	        this.feedbackText.content="Incorrect username or password. Try again.";
	        this.usernameInputText.active=true;
	        this.passwordInputText.active=false;
	        this.submitButton.toggle=true;
	    }
	}
	remove(){
	    window.removeEventListener('keydown', this.keyDownCallback);
	    window.removeEventListener("xhttpReturn", this.xhttpCallback, false);
	    this.usernameInputText.remove();
	    this.passwordInputText.remove();
	    super.remove();
	}
}
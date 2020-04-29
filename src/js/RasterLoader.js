class RasterLoader extends paper.Group{
	constructor(id,url,width,height,rotation=0,callback=null,bgOpacity=1) {
	    super();
	    this.applyMatrix=false;
	    this.pivot=[0,0];
	    this.myId=id;
	    this.width=width;
	    this.height=height;
	    this.rot=rotation;
	    this.callback=callback;
	    this.bgOpacity=bgOpacity;
	    
	    //draw background
        this.bg = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(width, height));
        this.bg.fillColor="#FCFCFC";
        this.addChild(this.bg);
	    
	    //load image
	    if(url){
    	    this.raster = new paper.Raster(url);
            this.raster.visible=false;
            this.raster.onLoad = function() {
                this.raster.rotation=this.rot;
                if(this.width){
                    if(this.height){
                        this.raster.scaling=Math.min(this.width/this.raster.bounds.width,this.height/this.raster.bounds.height);
                    }else{
                        this.raster.scaling=this.width/this.raster.bounds.width;
                    }
                }else{
                    this.raster.scaling=this.height/this.raster.bounds.height;
                }
                this.addChild(this.raster);
                this.raster.bounds.centerX=this.bg.bounds.centerX;
                this.raster.bounds.centerY=this.bg.bounds.centerY;
                this.raster.visible=true;
                this.bg.opacity=this.bgOpacity;
    
                if(this.callback){
                    this.callback(this.myId);
                }
            }.bind(this);
	    }
	}
}
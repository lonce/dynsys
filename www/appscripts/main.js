/* This application does simple "event chat". Here, events are mouse clicks on a canvas. 
	We register for the following messages:
		init - sent by the server after the client connects. Data returned is an id that the server and other clients will use to recognizes messages from this client.
		mouseClick - sent when another chatroom member generates a mouse click. Data is x, y of their mouse position on their canvas.
*/

require.config({
	paths: {
		"root": "..",
        "jsaSound": "http://animatedsoundworks.com:8001/"
        //"jsaSound": "http://localhost:8001/"
	}
});
require(
    ["utils",  "root/jslibs/raphael-min", "makediffeq", "movingWindowFactory", "trajectoryGraphic", "jsaSound/jsaModels/FilteredNoiseBand",  "root/jslibs/numeric-1.2.6"],

	function (utils, Raphael, makediffeq, movingWindowFactory, trajectoryGraphic, sndFactory) {

        var myrequestAnimationFrame = utils.getRequestAnimationFrameFunc();

        var svgElmt = document.getElementById("SimpleDiv");
        var pWidth = svgElmt.width.baseVal.value;
        var pHeight = svgElmt.height.baseVal.value;

        var paper = Raphael(document.getElementById("SimpleDiv"), pWidth, pHeight);

        console.log("pWidth is " + pWidth + ", and pHeight is " + pHeight);

        var prect = paper.rect(0,0, pWidth, pHeight);
        prect.attr("fill", "#000"); //fill-opacity
        prect.toBack();


        var svgGraphElmt = document.getElementById("WorldDiv");
        var wpWidth = svgGraphElmt.width.baseVal.value;
        var wpHeight = svgGraphElmt.height.baseVal.value;
        var worldPaper=Raphael(document.getElementById("WorldDiv"), wpWidth, wpHeight);

        var world = [null,null,null];
        var worldlength=400;

        for (var i=0;i<3;i++){
            world[i]=movingWindowFactory(worldlength);
            world[i].historyIndex=(function(){idx=[]; for(var i=0;i<worldlength;i++)idx.push(Math.round(i*pWidth/worldlength)); return idx;})();
        }
        var numUnits=10;
        var g_stepSize=.006;
        var g_trailLength=10;
        var viewDimension1=1;
        var viewDimension2=2;
        var worldDimension=0;
        var headSize=3;

        var v_xtranslate=pWidth/2;
        var v_ytranslate=pHeight/2;
        var v_scale=.5;

        var paused = false;


        
        var unitGenerator=function(id){
            var unit = {
                "id": id,
                "coefs": [],
                "temp_coefs":[],
                "f": function(){},
                "y": [],
                "snd": null,
                // keep path history (pop old, and push new on each solving epoch)
                "pathHistory": {"maxSegments": g_trailLength, 
                                "seg":[],
                                "newseg": function(segment){
                                    this.seg.push(segment);
                                    if (this.seg.length > this.maxSegments){
                                        this.seg[0].remove(); // from the canvas
                                        this.seg.shift();     // remove from the history list      
                                    }
                                }
                               },
                "drawing":{
                    "shift": 0,
                    "scale": 0,
                    "color": "#fff",
                    "stateGraphic": null
                },

                "initialize": function(p){
                    //unit[i].y = [[Math.random()*10-5],[Math.random()*10-5],[Math.random()*10-5]];  // initial value               
                    //unit[i].y = [[-20],[4+Math.random()+.1],[-9], [0]];  // initial value  (kissing with no world input)      
                    //unit[i].y = [[0],[Math.random()*.1],[1.2], [0]];  // initial value        
                    //unit[i] = unitGenerator([[0, -5, 10],[0, 28, -1, 0, 0, 0, -1],[0, 0, 0, -8/3, 0, 1]]);
                    this.drawing.color=utils.hslToRgb(Math.random(), .75, .75);
                    this.y = [[-14+Math.random()*280],[-14-Math.random()*280],[-14+Math.random()*280], [0]];  // initial value   Isley Bros
                    this.drawing.stateGraphic=trajectoryGraphic(p, headSize, this.drawing.color);

                    var that=this;
                    this.drawing.stateGraphic.on("mousedown", 
                        function(e){
                            console.log("mousdown AHA unit id = " + that.id);
                            console.log("unit["+that.id+"].dim"+viewDimension1+" ="+that.y[viewDimension1].last() +", and unit["+that.id+"].dim"+viewDimension2+" ="+that.y[viewDimension2].last());
                            that.freeze();
                        }
                    );

                    this.drawing.stateGraphic.on("mouseup", 
                        function(e){
                            console.log("mouseup AHA unit id = " + that.id);
                            console.log("unit["+that.id+"].dim"+viewDimension1+" ="+that.y[viewDimension1].last() +", and unit["+that.id+"].dim"+viewDimension2+" ="+that.y[viewDimension2].last());
                            that.unfreeze();
                        }
                    );

                    this.drawing.stateGraphic.on("mousemove", 
                        function(e){
                            console.log("mousemove AHA unit id = " + that.id);
                            console.log("unit["+that.id+"].dim"+viewDimension1+" ="+that.y[viewDimension1].last() +", and unit["+that.id+"].dim"+viewDimension2+" ="+that.y[viewDimension2].last());
                            for(i=0;i<3;i++){
                                if (i===viewDimension1) {
                                    that.y[i]= [e.offsetX].translate(-v_xtranslate).scale(1/v_scale);
                                }
                                if (i===viewDimension2) {
                                    that.y[i]= [e.offsetY].translate(-v_ytranslate).scale(1/v_scale);
                                }
                           }
                        }
                    );


                    this.snd=sndFactory();
                    //snd[i].setParam("Frequency", 400*Math.pow(2, (unit[i].y[0].last()/4+10)/12));
                    this.snd.setParam(1, 200*Math.pow(2, (this.y[viewDimension1].last()/4+10)/12));
                    this.snd.setParam("Gain", .4);
                    this.snd.setParam("play", 1);   
                },

                "clearTail" : function(){
                    for(var i=0;i<this.pathHistory.seg.length;i++){
                        this.pathHistory.seg[0].remove(); // from the canvas
                        this.pathHistory.seg.shift();
                    }

                },
                "kickTheBucket": function(){
                    // erase drawing path
                    this.drawing.clearTail();
                    this.drawing.stateGraphic.remove(); // from the paper
                },
                "mutate": function(){
                    //this.kickTheBucket();
                    //this.snd();

                    // choose a gene already within the coeficient list
                    
                    var vn = Math.floor(3*Math.random());
                    var kn = Math.floor(this.coefs[vn].length*Math.random());
                    var sgn = (Math.random()>.5)? 1:-1;
                    chng = sgn*(Math.max(Math.min(Math.abs(this.coefs[vn][kn]*.2), 1), .2));
                    console.log("changing coef ["+vn+"]["+kn+"] from "+this.coefs[vn][kn]+" by " + chng);
                    this.coefs[vn][kn]+=chng;
                    this.f = makediffeq(this.coefs);
                    
                },
                "freeze": function(){
                    this.temp_coefs=this.coefs;
                    this.coefs = [[0],[0],[0],[0]];
                    this.f = makediffeq(this.coefs);
                    this.drawing.stateGraphic.altGraphic(6);
                },
                "unfreeze": function(){
                    this.coefs = this.temp_coefs;
                    this.f = makediffeq(this.coefs);
                    this.drawing.stateGraphic.origGraphic();
                }
            };
            //unit.f=makediffeq(coeficients);
            return unit;
        }


        //-----------------------------------------------------------
        // Lorenz diffeq
        /*
        var f = function(t,x) {
          return [10*(x[1]-x[0]),
                  x[0]*(28-x[2])-x[1],
                  x[0]*x[1]-(8/3)*x[2]];
        }
        */
        //var lorenzDNA = [[0, -5, 10],[0, 28, -1, 0, 0, 0, 0, -1],[0, 0, 0, -8/3, 0, 0, 1],[0]];
        var lorenzDNA = [[0, -5, 10, 0, 0],[0, 28, -1, 0, 15, 0, 0, -1],[0, 0, 0, -8/3, 5, 0, 1],[0]];
        //var lorenzEQ = makediffeq(lorenzDNA);


        var unit = [];
        for(var i=0;i<numUnits;i++){
        }

        makeSolveStepper=function(){
            var t=0;
            var lastTriggerTime=0;
            var lastUnit=-1; 
            var step=g_stepSize;
            
            var sol;  // raw solution from solver
            var solX;  // x variable solution, scaled and shifted for plotting
            var solY;  // y variable solution, scaled and shifted for plotting
            var pathString; // solution converted to SVG path string


            for(var i=0;i<numUnits;i++){
                unit[i]= unitGenerator(i);
                unit[i].coefs = lorenzDNA;
                unit[i].f = makediffeq(unit[i].coefs);  
                //unit[i].y = [[-2+Math.random()*4],[-1*Math.random()*2.],[-3+Math.random()*6], [0]];  // initial value       
                unit[i].initialize(paper);
            }


            var summaryVoice=[0,0,0];
            var temp_summaryVoice=[0,0,0];
            // solve for the next time segment (from now, to now+step)
            // For each tick, draw the new segment, and remove the oldest segment
            return function tick(){
                //Every so often, make something happen
                if (Math.floor(t) > lastTriggerTime){ // make something happen
                    var k=Math.floor(unit.length*Math.random());
                    //console.log("mutating unit number " + k);
                    //unit[i].mutate();
                    //unit[k].freeze();
                    if (lastUnit >=0){
                        //unit[lastUnit].unfreeze();
                    }
                    lastUnit=k;
                    lastTriggerTime=Math.floor(t);
                }
                
                
                for(var i=0;i<numUnits;i++){
                    sol = numeric.dopri(t,t+step,[unit[i].y[0].last(),unit[i].y[1].last(), unit[i].y[2].last(), summaryVoice[worldDimension]], unit[i].f,1e-6,2000);
                    
                    //console.log ("fval = " + (400*Math.pow(2, -(unit[i].y[viewDimension2].last()/4+10)/12)));
                    unit[i].snd.setParam(1, 400*Math.pow(2, -(unit[i].y[viewDimension2].last()/4+10)/12));
                    unit[i].snd.setParam("Gain", .4);

                    unit[i].y = numeric.transpose(sol.y);


                    temp_summaryVoice[0]+=unit[i].y[0].last();
                    temp_summaryVoice[1]+=unit[i].y[1].last();
                    temp_summaryVoice[2]+=unit[i].y[2].last();

                    solX=unit[i].y[viewDimension1].scale(v_scale).translate(v_xtranslate);
                    solY=unit[i].y[viewDimension2].scale(v_scale).translate(v_ytranslate);

                    pathString = utils.atopstring(solX,solY);
                    unit[i].pathHistory.newseg(paper.path(pathString).attr("stroke", unit[i].drawing.color));
                    unit[i].drawing.stateGraphic.mv(solX.last(),solY.last());
                }
                //console.log("summaryvoice: " + summaryVoice);
                var vdim=2;
                worldPaper.clear();
                    world[vdim].addHistory(temp_summaryVoice[vdim]);
                    pathString = utils.atopstring(world[vdim].historyIndex,world[vdim].history.scale(wpHeight/(50*numUnits)).translate(wpHeight/2));
                    worldPaper.path(pathString);
                /*
              for (var i=0;i<3;i++){
                    world[i].addHistory(temp_summaryVoice[i]);
                    pathString = utils.atopstring(world[i].historyIndex,world[i].history.scale(wpHeight/(50*numUnits)).translate(wpHeight/2));
                    worldPaper.path(pathString);
                }
                */
                summaryVoice[0]=temp_summaryVoice[0];
                summaryVoice[1]=temp_summaryVoice[1];
                summaryVoice[2]=temp_summaryVoice[2];

                temp_summaryVoice=[0,0,0];

                t+=step;
                if (! paused) myrequestAnimationFrame(tick);
            };
        }

        var tick = makeSolveStepper();
        tick();

        window.addEventListener("keydown", keyDown, true);

        function keyDown(e){
                var keyCode = e.keyCode;
                switch(keyCode){
                    case 83:
                        if (e.ctrlKey==1){
                            //alert("control s was pressed");
                            e.preventDefault(); 
                            if (paused){
                                paused=false;
                                myrequestAnimationFrame(tick);
                            } else{
                                paused=true;
                            }
                                                       
                        }
                }
        }


        svgElmt.onresize = function(e){
            
            console.log("resize");
            pWidth = svgElmt.width.baseVal.value;
            pHeight = svgElmt.height.baseVal.value;

            paper.setSize(pWidth,pHeight);

            console.log("pWidth is " + pWidth + ", and pHeight is " + pHeight);

            prect.attr("width" , pWidth);
            prect.attr("height" , pHeight);
            prect.attr("fill", "#000"); //fill-opacity

            for(var i=0;i<numUnits;i++){
                unit[i].clearTail();
            }


            wpWidth = svgGraphElmt.width.baseVal.value;
            wpHeight = svgGraphElmt.height.baseVal.value;
            worldPaper.clear();
            //worldPaper=Raphael(document.getElementById("WorldDiv"), wpWidth, wpHeight);
            worldPaper.setSize(pWidth,pHeight);

        }
        svgElmt.addEventListener("SVGResize", svgElmt.onresize, false);
        window.addEventListener('resize', svgElmt.onresize, false);

	}
);
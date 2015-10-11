define(
    ["utils"],
    function(utils){
    	return function makeTrajectoryGraphic(paper,i_size, i_color){  // first 3 args are required
        	var tg={  //default values
                "color":"#FFFFFF", // default color
                "size": 3, 
                "stateGraphic": null,
                "selected": false,

                "origColor" :"#FFFFFF",
                "origSize": 3,
            };


            tg.altGraphic=function(i_size, i_color){
                tg.color = i_color;
                tg.size = i_size;
                tg.stateGraphic.attr("r", tg.size);
                tg.stateGraphic.attr("fill", tg.color);
                tg.stateGraphic.attr("stroke", "FFFFFF");//tg.color);
                tg.stateGraphic.toFront();
            }
            tg.origGraphic = function(){
                tg.color = tg.origColor;
                tg.size = tg.origSize;
                tg.stateGraphic.attr("r", tg.size);
                tg.stateGraphic.attr("fill", tg.color);
                tg.stateGraphic.attr("stroke", tg.color);
                tg.stateGraphic.toFront();
            }
            tg.remove=function(){
                tg.stateGraphic.remove();
            }

            tg.mv=function(x,y){
                tg.stateGraphic.attr("cx", x);
                tg.stateGraphic.attr("cy", y);
            }

            tg.add=function(x,y){
                tg.stateGraphic = paper.circle(x, y, tg.size);
                console.log("setting stateGraphic to be color " + i_color);
                tg.stateGraphic.attr("r", tg.size);
                tg.stateGraphic.attr("fill", tg.color);
                tg.stateGraphic.attr("stroke", tg.color);
                //tg.stateGraphic.toFront();
            }

            tg.paper = paper;
            tg.size = tg.origSize = (i_size || tg.size);
            tg.color = tg.origColor = (i_color || tg.color); // optional arg

            tg.add(0,0);

            utils.eventuality(tg);

            tg.stateGraphic.MYmousemove = function(e){
                if (tg.selected){
                    console.log("moved element id = " + tg.stateGraphic.id);
                    tg.fire(e);
                }
            };


            tg.stateGraphic.mousedown(function(e){
                console.log("clicked element id = " + tg.stateGraphic.id);

                if (tg.selected === false) {
                    tg.selected=true;
                    tg.fire(e);

                    /*paper.canvas.onmousemove=function(e){
                        console.log("papermousemove!!!!");
                    }*/
                    paper.canvas.onmousemove=tg.stateGraphic.MYmousemove;
                }
            });


            var bar;
            

            tg.stateGraphic.mouseup(function(e){
                console.log("UNselecting element id = " + tg.stateGraphic.id);
                if (tg.selected === true){
                    tg.selected=false;
                    paper.canvas.unmousemove=tg.stateGraphic.MYmousemove;
                }
                tg.fire(e);


            });



        	return tg;
    	}

    }
);


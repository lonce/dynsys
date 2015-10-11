// This module returns a function that
// takes an 3D array, where each dimension is an arrof of coeficients
// It returns function of (t, x) which consists of an array of 3 2nd-order polynomials constructed from the coeficients provided to the function.
// The function returned by this module can be pased to the differential equation solver, numeric.dopri.
//
define(
    [],
    function(){

    	// create a polynomial 
    	var coef2polystring = function(coefs){
    		var numeqs=coefs.length;
  			var numcoefs;
  			var termcount;
  			var vars2d= ["", "x[0]","x[1]", "x[2]",          "x[0]*x[0]", "x[0]*x[1]","x[0]*x[2]",             "x[1]*x[1]","x[1]*x[2]",              "x[2]*x[2]"];
            var vars =  ["", "x[0]","x[1]", "x[2]", "x[3]",  "x[0]*x[0]", "x[0]*x[1]","x[0]*x[2]", "x[0]*x[3]","x[1]*x[1]","x[1]*x[2]", "x[1]*x[3]", "x[2]*x[2]", "x[2]*x[3]", "x[3]*x[3]"];

    		var outstring="[";
    		for (i=0;i<numeqs;i++){
    			numcoefs=coefs[i].length;
    			termcount=0; // prEvents the first term in the polynomial from being preceeded by a sign. 
    			for(j=0;j<numcoefs;j++){
    				if (coefs[i][j] != 0){
    					if ((termcount>0) && (coefs[i][j] > 0)) outstring += " + ";
    					outstring += coefs[i][j] + ((j>0)?"*":"") + vars[j];
    					termcount++;
    				}
                    else if (j===0) {
                        outstring += "0"; // this is the constant coef === 0 case
                        termcount++;
                    }
    			}
    			if (numeqs > (i+1)) outstring += ",";
    		}
    		outstring += "]";
    		return outstring;
    	}


    	return function(coefs){
    		var polystring = coef2polystring(coefs);
    		var funstring = "var fun = function(t, x){ return " + polystring + ";}";
            console.log("polystring is: " + polystring);
    		eval(funstring);
    		return fun;
    	}
    }   
);

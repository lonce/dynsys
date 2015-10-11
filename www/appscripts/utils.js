define(
    [],
        function(){
            var utils = {};
    		// utilities
		    // Until requestAnimationFrame comes standard in all browsers, test
            // for the prefixed names as well.

            utils.getRequestAnimationFrameFunc = function() {
                try {
                    return (window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.msRequestAnimationFrame ||
                            (function (cb) {
                                setTimeout(cb, 1000/60);
                            }));
                } catch (e) {
                    return undefined;
                }
            };


           function byte2Hex(n)
            {
                var nybHexString = "0123456789ABCDEF";
                return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
            }

            /**
             * Converts an HSL color value to RGB. Conversion formula
             * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
             * Assumes h, s, and l are contained in the set [0, 1] and
             * returns r, g, and b in the set [0, 255].
             *
             * @param   Number  h       The hue
             * @param   Number  s       The saturation
             * @param   Number  l       The lightness
             * @return  Array           The RGB representation
             */
            utils.hslToRgb=function(h, s, l){
                var r, g, b;

                if(s == 0){
                    r = g = b = l; // achromatic
                }else{
                    function hue2rgb(p, q, t){
                        if(t < 0) t += 1;
                        if(t > 1) t -= 1;
                        if(t < 1/6) return p + (q - p) * 6 * t;
                        if(t < 1/2) return q;
                        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    }

                    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    var p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1/3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1/3);
                }

                return '#' + byte2Hex(Math.floor(r * 255)) + byte2Hex(Math.floor(g * 255)) + byte2Hex(Math.floor(b * 255));
                //return [r * 255, g * 255, b * 255];
            }


            // converts two arrays representing x and y values into an SVG string for drawing lines
            utils.atopstring = function(a, b){
                s="M " + a[0] + " " + b[0] + " L";
                for(i=1;i<a.length;i++){
                    s+= " " + a[i] + " " + b[i];
                }
                return s;
            }


            Array.prototype.scale = function (sc) {
                var newa=[];
                for (var i = 0; i < this.length; i++) {
                    newa[i]=this[i]*sc;
                }
                return newa;
            };
            Array.prototype.translate = function (tr) {
                var newa=[];
                for (var i = 0; i < this.length; i++) {
                    newa[i]=this[i]+tr;
                }
                return newa;
            };

            Array.prototype.last = function () {
                return this[this.length - 1];
            };

            Array.prototype.fill = function (l,v) {
                var first=this.length;
                for(var i=first;i<l;i++){
                    this[i]=v || i;
                }
                return this;
            }


            //------------------------------------------------------------------------
            // This is Douglas Crockfords "composing objects by parts" code from his book
            utils.eventuality = function (that) {
                var registry = {};
                that.fire = function (event) {
            // Fire an event on an object. The event can be either
            // a string containing the name of the event or an
            // object containing a type property containing the
            // name of the event. Handlers registered by the 'on'
            // method that match the event name will be invoked.
                    var array,
                        func,
                        handler,
                        i,
                        type = typeof event === 'string' ?
                                event : event.type;
            // If an array of handlers exist for this event, then
            // loop through it and execute the handlers in order.
                    if (registry.hasOwnProperty(type)) {
                        array = registry[type];
                        for (i = 0; i < array.length; i += 1) {
                            handler = array[i];
            // A handler record contains a method and an optional
            // array of parameters. If the method is a name, look
            // up the function.
                            func = handler.method;
                            if (typeof func === 'string') {
                                func = this[func];
                            }
            // Invoke a handler. If the record contained
            // parameters, then pass them. Otherwise, pass the
            // event object.
                            func.apply(this,
                                handler.parameters || [event]);
                        }
                    }
                    return this;
                };
                that.on = function (type, method, parameters) {
            // Register an event. Make a handler record. Put it
            // in a handler array, making one if it doesn't yet
            // exist for this type.
                    var handler = {
                        method: method,
                        parameters: parameters
                    };
                    if (registry.hasOwnProperty(type)) {
                        registry[type].push(handler);
                    } else {
                        registry[type] = [handler];
                    }
                    return this;
                };
                return that;
            }

            
            return utils;
});

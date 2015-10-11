define(
    [],
    function(){
        return function(i_len){
            var mw={};
            mw.maxHistoryLength=i_len || 400;
            mw.history=[].fill(mw.maxHistoryLength,0);
            mw.historyIndex=[].fill(mw.maxHistoryLength); // the time points that the history list corresponds to
            mw.addHistory =  function(val){
                mw.history.push(val);
                if (mw.history.length > mw.maxHistoryLength){
                    mw.history.shift();     // remove from the history list      
                }
            }
            mw.setHistoryLength=function(l){
                mw.maxHistoryLength=l;
                mw.history=[].fill(l,0);
                mw.historyIndex=[].fill(l); // the time points that the history list corresponds to
            }

            return mw;
        }
    }   
);

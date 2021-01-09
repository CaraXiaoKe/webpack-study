Array.prototype.reduce = function(fn,pre){
    var result = null;
    if(pre != undefined){
        result = fn(pre,this[0])
    }else{
        result = this[0]
    }
    for(var i = 1;i<this.length;i++){
       result =  fn(result,this[i],i,this)
    }
    return result
};

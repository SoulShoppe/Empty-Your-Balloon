'use strict';

// This is a stateless service which just provides a bunch of utility 
// functions and simple transformations.


angular.module('PSMmla.util',[])

.factory('util',['$log', function($log){ 
  
  var concatMap = function (l,f) { 
    var output = []; 
    for(var i in l){
      output = output.concat(f(l[i],i,l)); 
    } 
    return output;
  };
 
  // take a component and place it in every other position in the input array
  var interleave = function(l,e){
    var o = concatMap(l, function(c){ 
      return [c,e]; 
    });
    if(o.length > 1){
      o.pop();
    };
    
    return o; 
  };

  return {
  
    // Check whether two arrays are equal ... whoode do
    arraysEqual: function (a, b) {
      if (a === b)                return true;
      if (a == null || b == null) return false;
      if (a.length != b.length)   return false;
      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    },
  
    // Find the index of the first element that satisfies a given condition 
    // otherwise just return undefined 
    findIndex: function (l,f) { 
      for(var i in l){
        if(f(l[i],i,l)) return i;
      }
      return undefined;
    },
  
    // Map a function over some iterable element ...
    map: function (l,f) {
      var output;
      for(var i in l){
        output[i] = f(l[i],i,l);
      }
      return output; 
    },
  
    // Iterate over all elements while performing some function
    iterate: function(l,f){ 
      for(var i in l){ 
        f(l[i],i,l); 
      }
    },
  
    // concatenate lists after mapping 
    concatMap: concatMap,
  
    // Assertion
    assert: function(b,s){ 
      if(!b) $log.error("Assertion failed with message \"" + s + "\"."); 
    },
  
    interleave: interleave, 
    };
}])

.filter('ppJson', ['$sce', '$log' , function ($sce,$log) {
  function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  
  return function(input,color){
    var col = (!color) || (color === undefined) || (color === null) ;
    var str = JSON.stringify(input, undefined, "   ");
    if(!str){str = "undefined"}
    var colstr = (col)?syntaxHighlight(str):str;
    //var barstr = colstr.replace(/@!@/g,'<span class="json-bar">|</span>');
    return $sce.trustAsHtml(colstr); 
  };
}])

.directive('json', ['$log',function ($log){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      obj: '=',
    },
    template: '<div class="json" ng-bind-html=\'obj | ppJson\'></div>', 
  }; 
}])

;



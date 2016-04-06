(function() {
  'use strict';
  angular.module('app',[])
  .directive('starsContainer',function(){
    var Controller=function(){
    this.scores=[];
         this.addScore=function(score){
            this.scores.push(score);
          };
          this.sum=function(){
            var addValues=function(a,b){
              var num= a.value+b.value;
              return {value:num};
            };
            return this.scores.reduce(addValues,{value:0}).value;
          };
     };
      return{
        transclude:true,
        controller:Controller,
        controllerAs:'ctrl',
        scope:{
            maxItems:'@'
        },
        template:['<div class="container">',
                  '<h2>Total: {{ctrl.sum()}}</h2>',
                  '<ng-transclude></ng-transclude>',
                  '</div>'].join('')
      };
  })
  .directive('stars',function(){
     var addSelected=function(el){
       var currentElement=angular.element(el.currentTarget);
       currentElement.parent().children().removeClass('selected');
       currentElement.addClass('selected');
       return +currentElement.attr('data-rating');
      };

     var handleClick=function(el){
        this.score.value= addSelected(el);
        this.$apply();
     };

     var link=function(scope, element, attr, parentCtrl){
        var els=element.find('span');
        els.bind('click',handleClick.bind(scope));
        parentCtrl.addScore(scope.score);
     };
     return{
        transclude:true,
        require:"^starsContainer",
        scope:{
          score:'='
        },
        template:['<div class="rating">',
                  '<ng-transclude></ng-transclude>',
                  '<span data-rating="1">&#9734;</span>',
                  '<span data-rating="2">&#9734;</span>',
                  '<span data-rating="3">&#9734;</span>',
                  '<span data-rating="4">&#9734;</span>',
                  '<span data-rating="5">&#9734;</span>',
                  '<h5>Rating: {{score.value}}</h5>',
                  '</div>'].join(''),
        link:link
    };
  });
}());

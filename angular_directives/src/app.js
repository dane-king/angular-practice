(function() {
  'use strict';
  angular.module('app',[])
  .directive('starsContainer',function(){
      return{
        template:['<div class="container">',
                  '<h2>Total: {{ctrl.sum()}}</h2>',
                  '<ng-transclude></ng-transclude>',
                  '</div>'].join('')
      };
  })
  .directive('stars',function(){
     return{
        template:['<div class="rating">',
                  '<ng-transclude></ng-transclude>',
                  '<span data-rating="1">&#9734;</span>',
                  '<span data-rating="2">&#9734;</span>',
                  '<span data-rating="3">&#9734;</span>',
                  '<span data-rating="4">&#9734;</span>',
                  '<span data-rating="5">&#9734;</span>',
                  '<h5>Rating: {{score.value}}</h5>',
                  '</div>'].join(''),
    };
  });
}());

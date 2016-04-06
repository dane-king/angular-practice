describe('Directives', function() {
  var compileFn, $rootScope;
  beforeEach(module('app.directive'));

  beforeEach(inject(function($compile, _$rootScope_){
   $rootScope=_$rootScope_;
    compileFn=function getCompileFunction(html,scope){
      if(!scope) scope=$rootScope;
      var compiledElement=$compile(html)(scope);
      scope.$digest();
      return compiledElement;
    };
  }));
  describe("Template", function () {
    it("should return template string for attribute", function () {
        expect(compileFn('<div tmpl></div>').html()).toBe('template text ');
    });

    it("should return template string for element", function () {
        expect(compileFn('<tmpl></tmpl>').html()).toBe('template text ');
    });

    it("should be able to bind to root scope", function () {
        $rootScope.text='root text';
        expect(compileFn('<tmpl><tmpl>',$rootScope).html()).toBe('template text root text');
    });

    it("should be able to bind to parent scope", function () {
        var mockScope=$rootScope.$new();
        mockScope.text="mock text";
        expect(compileFn('<tmpl><tmpl>',mockScope).html()).toBe('template text mock text');
    });

  });

  describe("Isolated Scope", function () {
    var mockScope, compiledElement;
    var isoHtml='<iso-scope bind-both="config" bind-method="fn()" bind-one="{{config.prop1}}"><iso-scope>';
    beforeEach(function () {
      mockScope=$rootScope.$new();
      mockScope.text="mock text";
      mockScope.config={
          prop:'value',
          prop1:"some"
      };

      mockScope.fn=jasmine.createSpy('scope function',function(){console.log('scope function called');});

      compiledElement=compileFn(isoHtml, mockScope);

    });


    it("should be able to bind parent scope to isolated scope", function () {
        expect(compiledElement.html()).toContain('value some text');
    });

    it("should reflect changes on isolate scope in parent scope", function () {
        compiledElement.isolateScope().bindBoth.prop="new value";
        expect(mockScope.config.prop).toBe('new value');
    });

    it("should bind one way text", function () {
        expect(compiledElement.html()).toContain('value some text');
    });

    it("should not reflect changes on isolate scope in parent scope", function () {
        compiledElement.isolateScope().bindOne.prop1="new value";
        expect(mockScope.config.prop1).toBe('some');
    });
    it("should have a function in isolate scope", function () {
      expect(compiledElement.isolateScope().bindMethod).toBeDefined();
    });
    it("should call method on parent scope", function () {
        compiledElement.isolateScope().bindMethod();
        expect(mockScope.fn).toHaveBeenCalled();
    });
    it("should call method on parent scope after click", function () {
        var divToClick=compiledElement.find('div')[0];
        divToClick.click();
        expect(mockScope.fn).toHaveBeenCalled();
    });
  });
  describe("Link Functions", function () {
    var compiledElement;
    beforeEach(function () {
      var scope=$rootScope.$new();
      scope.text="new scope";
      scope.fn=function() {console.log(test);};
      compiledElement=compileFn('<link-fn data-my-attr="attr"></link-fn>',scope);
    });
    it("should be able set scope", function () {
      expect(compiledElement.html()).toContain('<div class="ng-binding">In Link</div>');
    });
    it("should be able change element DOM", function () {
      expect(compiledElement.html()).toContain('<span>Added DOM</span>');
    });
    it("should be able access and change attributes", function () {
      compiledElement.html();
      expect(compiledElement.html()).toContain('<span>Added DOM</span>');
    });
  });
  describe("Transclude", function () {

  });
  describe("Controller Functions", function () {
    var compiledElement, isolatedScope, isoCtrl;
    beforeEach(function () {
      var scope=$rootScope.$new();
      compiledElement=compileFn('<parent heading="expectedHeading"><child item="{id:1,name:\'Bob\',value:3}"></child><child item="{id:2,name:\'Joe\',value:5}"></child></parent>',scope);
      isolatedScope=compiledElement.isolateScope();
      isoCtrl=isolatedScope.ctrl;
    });
    it("should use controller values", function () {
      expect(compiledElement.html())
        .toBe(['<div class="myList">',
                  '<h1 class="ng-binding">expectedHeading</h1>',
                  '<div class="ng-binding">Sum is 8</div><ng-transclude>',
                  '<child item="{id:1,name:\'Bob\',value:3}" class="ng-binding ng-scope ng-isolate-scope">Name: Bob</child>',
                  '<child item="{id:2,name:\'Joe\',value:5}" class="ng-binding ng-scope ng-isolate-scope">Name: Joe</child>',
                  '</ng-transclude></div>'].join(""));
    });
    it("changes to isolate should reflect in controller", function () {
      isoCtrl.addItem({id:2,name:'Two'});
      expect(isoCtrl.items).toContain({id:2,name:'Two'});
    });
    it("calculates sum of items", function () {
      //current total is 8
      expect(isoCtrl.sum()).toBe(8);
    });

  });
});

(function() {
  'use strict';
  angular.module('app.directive',[])

  .directive('tmpl',function(){
    return {
      template:'template text {{text}}'
    };
  })
  .directive('isoScope',function(){
    return {
      scope:{
        bindBoth:'=',
        bindOne:'@',
        bindMethod:'&'
      },
      template:'{{bindBoth.prop}} {{bindOne}} text<div ng-click="bindMethod()">Click Me</div>'
    };
  })
  .directive('linkFn',function(){
    var link=function(scope, element, attrs){
      scope.value="In Link";
      element.append('<span>Added DOM</span>');
    };
    return{
        scope:{},
        template:'<div>{{value}}</div>',
        link:link
    };
  })
  .directive('parent',function(){
    function Controller(){
        this.items=[];
        this.addItem=function(item){
            this.items.push(item);
        };
        this.sum=function(){
          var addValues=function(a,b){
            var num= b.value+a.value;
            return {value:num};
          };
          return this.items.reduce(addValues).value;
        };

    }
    return {
        scope:{
          heading:'@'
        },
        controller:Controller,
        controllerAs:'ctrl',
        transclude:true,
        template:['<div class="myList">',
                  '<h1>{{heading}}</h1>',
                  '<div>Sum is {{ctrl.sum()}}</div>',
                  '<ng-transclude></ng-transclude>',
                  '</div>'].join('')
    };
  })
  .directive('child',function(){
    function link(scope,element,attrs,parentCtrl){
        parentCtrl.addItem(scope.item);
    }
    return {
      restrict:'E',
      scope:{
        item:'='
      },
      require:"^parent",
      link:link,
      template:'Name: {{item.name}}'
    };
  });

}());

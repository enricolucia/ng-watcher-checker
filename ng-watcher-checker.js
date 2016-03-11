window.ngWatcherChecker = window.ngWatcherChecker || {};

window.ngWatcherChecker = function() {
  if( typeof angular === 'undefined' || !angular ) {
    console.info('It seems that this page might not use Angular, I can\'t find the "window.angular" JavaScript object.');
  } else {
    var ngWatchCount = function (targetElements) {
        var watchersOn = function(scope) {
        if (scope && scope.$$watchers) {
          return scope.$$watchers.length;
        }

        return 0;
      };

      var countWatchers = function(element) {
        var watchers = 0;
        var angularElement = angular.element(element);

        if (angularElement.hasClass('ng-scope')) {
          watchers += watchersOn(angularElement.scope());
        }

        if (angularElement.hasClass('ng-isolate-scope')) {
          watchers += watchersOn(angularElement.isolateScope());
        }

        angular.forEach(angularElement.children(), function(childElement) {
            watchers += countWatchers(childElement);
        });

        return watchers;
      };


      var angularTargetElements = angular.element(targetElements || document);

      var watchers = 0;
      angular.forEach(angularTargetElements, function(element) {
        watchers += countWatchers(element);
      });

      console.log('Element contains ' + watchers + ' watchers.');
      return watchers;
    };

    var watcherCountClassName = 'ng-profiler-count';
    var watcherHighlightClassName = 'ng-profiler-highlight';
    var watcherCountTemplate = '<div class="' + watcherCountClassName + '">{watcherCount}</div>';

    var removeAnyWatcherHighlighting = function() {
      angular.element(document.querySelector('.' + watcherHighlightClassName)).removeClass(watcherHighlightClassName);
      angular.element(document.querySelector('.' + watcherCountClassName)).remove();
    };

    var closestParentWithAScope = function(element) {
      var parent = angular.element(element);

      while( parent && !(parent.hasClass('ng-scope') || parent.hasClass('ng-isolate-scope')) ) {
        parent = parent.parent();
      }

      return parent;
    };

    var findScopeParentThen = function(element, workForScopeParent) {
      var scopeParent = closestParentWithAScope(element);

      workForScopeParent(scopeParent);
    };

    var highlight = function(element) {
      element.addClass(watcherHighlightClassName);
    };

    var insertWatcherCountInto = function(element) {
      var watcherCount = ngWatchCount(element);

      element.append(watcherCountTemplate.replace('{watcherCount}', watcherCount));
    };

    var showWatchers = function(event) {
      removeAnyWatcherHighlighting();

      findScopeParentThen(event.target, function(scopeParent) {
        highlight(scopeParent);
        insertWatcherCountInto(scopeParent);
      });

      event.stopPropagation();
    };

    var hideWatchers = function(event) {
      removeAnyWatcherHighlighting();

      event.stopPropagation();
    };

    var injectCss = function () {
      var css = '\
      .ng-profiler-highlight {\
        border: 1px solid #0077CC !important;\
        position: relative !important;\
      }\
      .ng-profiler-count {\
        position: absolute;\
        top: 0;\
        right: 0;\
        z-index: 9999;\
        min-width: 20px;\
        padding: 5px;\
        background-color: #0077CC;\
        color: white;\
        text-align: center;\
        font-weight: bold;\
        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;\
        font-size: 14px;\
      }';
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

      style.type = 'text/css';
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }

      head.appendChild(style);
    };

    injectCss();

    angular.element(document).on('mouseover', showWatchers)
                             .on('mouseout', hideWatchers);
  }
};

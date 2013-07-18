ngDefine(
  'cockpit.directives', [ 
  'jquery', 'angular' 
], function(module, $, angular) {

  module.directive('ctnCollapsableParent', function() {

    return {
      restrict: 'CA',
      link: function(scope, element, attrs) {
        var container = $(element);

        // the element being collapsed
        var collapsableElement = container.children('.ctn-collapsable');

        // the direction into which to collapse
        var direction = collapsableElement.attr('collapse') || 'left';
        var vertical = direction == 'left' || direction == 'right';

        // the main element that compensates the collapsing
        var compensateElement = collapsableElement[direction == 'left' || direction == 'top' ? 'next' : 'prev']();

        // a resize handle
        var resizeHandle = $('<div class="resize-handle"></div>')
                              .appendTo(container);

        /////// init show / hide handles ////////

        var showHandle = 
          compensateElement
            .children('.show-collapsable')
              .addClass('expand-collapse')
              .append('<i class="icon-chevron-right"></i>')
              .attr('title', 'Show sitebar');
        
        var hideHandle = 
          collapsableElement
            .children('.hide-collapsable')
              .addClass('expand-collapse')
              .append('<i class="icon-chevron-left"></i>')
              .attr('title', 'Hide sitebar');

        /**
         * Toggle show / hide handles
         */
        function setCollapsed(collapsed) {
          if (collapsed) {
            hideHandle.hide();
            showHandle.css('display', 'block');
          } else {
            showHandle.hide();
            hideHandle.css('display', 'block');
          }
        }

        function initResize() {

          var changeAttr = vertical ? 'width' : 'height';
          var resizeHandleAttachAttr = vertical ? 'left' : 'top';
          var changeAxis = vertical ? 'x' : 'y';

          // a tiny pixel compensation to make sure the resize handle is always positioned 
          // right on the line between the two resizable containers
          var pxc = direction == 'top' || direction == 'left' ? 3 : -3;

          /**
           * Create a { direction: i } object
           */
          function createOffset(i) {
            var style = {};
            style[direction] = i;

            return style;
          }

          /**
           * Create a { changeAttr: i } object
           */
          function createSize(i) {
            var style = {};
            style[changeAttr] = i;

            return style;
          }

          resizeHandle
            .addClass(vertical ? 'vertical' : 'horizontal');

          var originalCollapsableSize = collapsableElement[changeAttr]();

          function updateResizeHandlePosition() {
            var collapsableSize = collapsableElement[changeAttr]();
            var collapsablePosition = collapsableElement.position();

            if (direction == 'left' || direction == 'top') {
              resizeHandle
                .css(resizeHandleAttachAttr, collapsableSize - pxc)
            } else {
              resizeHandle
                .css(resizeHandleAttachAttr, collapsablePosition[resizeHandleAttachAttr] - 5 - pxc);
            }
          }

          $(resizeHandle)
            .draggable({ axis: changeAxis, containment: 'parent'})
            .on('drag', function(e, ui) {
              var position = resizeHandle.position();
              var pos = position[direction];

              if (direction == 'right') {
                pos = container.width() - position.left;
              }

              if (direction == 'bottom') {
                pos = container.height() - position.top;
              }

              // update collapsed state on drag
              setCollapsed(pos < 10);

              collapsableElement.css(changeAttr, pos + pxc);
              compensateElement.css(direction, pos + pxc);
            });

          hideHandle.click(function() {

            setCollapsed(true);

            resizeHandle.animate(createOffset(0));
            collapsableElement.animate(createSize(0));
            compensateElement.animate(createOffset(pxc));
          });

          showHandle.click(function() {
            setCollapsed(false);

            resizeHandle.animate(createOffset(originalCollapsableSize - pxc));
            collapsableElement.animate(createSize(originalCollapsableSize));
            compensateElement.animate(createOffset(originalCollapsableSize));
          });

          $(window).on('resize', updateResizeHandlePosition);

          scope.$on('$destroy', function() {
            $(window).off('resize', updateResizeHandlePosition);
          });

          updateResizeHandlePosition();
        }

        setCollapsed(false);
        initResize();
      }
    };
  });
});
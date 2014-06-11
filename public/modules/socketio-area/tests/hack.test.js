//$(document).ready(function()  {
CSSLIB = (function () {
  function allCss(element, doc) {
      var parentsCss = parentElementsCss(element, doc);
      var childrenCss = childElementsCss(element, doc);
    
      /* Combine parent with children */
      for (var i = 0; i < parentsCss.length; ++i) {
          childrenCss.push(parentsCss[i]);
      }
    
      return childrenCss;
  }
  
  function parentElementsCss(element, doc) {
      var treeCss = [];

      if (element.parentElement) {
          var parentCss = parentElementsCss(element.parentElement, doc);
          
        
          // Add the parent styling to the tree of css
          for (var i = 0; i < parentCss.length; ++i) {
              treeCss.push(parentCss[i]);
          }
      }
      
      // Get my styling and add to the tree of css
      var thisNodesCss = elementCss(element, doc);
      for (var i = 0; i < thisNodesCss.length; ++i) {
          treeCss.push(thisNodesCss[i]);
      }
      
      return treeCss;
  }
  
  /* Recursively traverse the DOM tree for all descendants of element in doc */
  function childElementsCss(element, doc) {
      var treeCss = [];
      var childrenCss = [];
    
      /* Get this node's CSS and fold into to our collection of CSS. 
         - treeCss is an array */
      var nodeCss = elementCss(element, doc);
      for (var i = 0; i < nodeCss.length; ++i) {
        treeCss.push(nodeCss[i]);
      }
    
      /* Get the CSS of this node's children. 
         - childrenCSS is an array. */
      for (var i = 0; i < element.children.length; ++i) {
        
        /* Recursively call this method on the children, 
           which will in turn call this method on their children. 
           - childCss is an array */
        var childCss = allCss(element.children[i], doc);
        
        /* Fold childCss array into our running array of childrenCss */
        for (var j = 0; j < childCss.length; ++j) {
          childrenCss.push(childCss[j]);
        }
      }
    
      /* Fold childrenCss array into treeCss array */
      for (var i = 0; i < childrenCss.length; ++i) {
        treeCss.push(childrenCss[i]);
      }
    
      /* Returns an array of css for all CSS at each level of for descendants of element*/
      return treeCss;
  }
  
  /* This is the workhorse method */
  /* It is the method that extracts the CSS from each element and returns it */
  function elementCss(element, doc) {
      var sheets = doc.styleSheets, 
          o = [];

      for (var i in sheets) {
          var rules = sheets[i].rules || sheets[i].cssRules;
          for (var r in rules) {
              var isMatch = false;
              try {
                isMatch = element.webkitMatchesSelector(rules[r].selectorText);
              } catch(ex) {
                /* when using html tags with non-standard markup, this explodes (angularjs tags for instance)*/
              }
            
              if (isMatch) {
                  o.push(rules[r].cssText);
              }
          }
      }

      return o;
  }
  
  // Credit: http://stackoverflow.com/questions/10191941/jquery-unique-on-an-array-of-strings
  // Credit: http://stackoverflow.com/users/491075/gion-13
  function unique(array) {
      return $.grep(array, function(el, index) {
          return index == $.inArray(el, array);
      });
  }
  
  return {
      test : function() {
          console.log('hi');
      },
      printCssForElement : function(xPath) {
          /* Grab a DOM reference to the element of interest (jquery + xpath) */
          var element = $x(xPath)[0];
          if (!element) {
              console.log('Element not found');
              return '';
          }
            
          /* Get an array of all the CSS that touches any descendant of the DOM element */
          var allTheCss = allCss(element, window.document);

          /* There may be duplicate rules. We only need one "copy" of each rule that applies. */
          var uniqueCss = unique(allTheCss).join(' ');

          /* Get the results. Would be cool if this could be pretty printed... */
          return uniqueCss;
      },
      prettyPrintCssForElement : function(xPath) {
          /* Grab a DOM reference to the element of interest (jquery + xpath) */
          var element = $x(xPath)[0];
          if (!element) {
              console.log('Element not found');
              return '';
          }
            
          /* Get an array of all the CSS that touches any descendant of the DOM element */
          var allTheCss = allCss(element, window.document);

          /* There may be duplicate rules. We only need one "copy" of each rule that applies. */
          var tokens = unique(allTheCss);

          var formattedStyles = '';
          for (var i = 0; i < tokens.length; ++i) {
              var selector = tokens[i].split('{')[0];
              var styles = tokens[i].split('{')[1]  // Take the stuff after the open bracket
                            .split('}')[0]          // Take the stuff to the left of the close bracket
                            .split(';');            // Separated by semicolons
              
              var formattedStyle = selector + ' { ' + '\n'  
                  + styles.map(function(obj, index) 
                                  { return index === styles.length-1 ? '' : '    ' + obj + ';\n' }).join('')
                  + '}' + '\n';
              
              formattedStyles = formattedStyles + formattedStyle;
          }
        
          /* Get the results. Would be cool if this could be pretty printed... */
          return formattedStyles;
      }
  };
})();
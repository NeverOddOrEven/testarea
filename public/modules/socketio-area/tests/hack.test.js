$(document).ready(function()  {
  
  /* Grab a DOM reference to the element of interest */
  var element = document.getElementById('row');
  
  /* Get an array of all the CSS that touches any descendant of the DOM element */
  var allTheCss = allCss(element, window.document);
  
  /* There may be duplicate rules. We only need one "copy" of each rule that applies. */
  var uniqueCss = $.unique(allTheCss).join(' ');
  
  /* Print the results. Would be cool if this could be pretty printed... */
  console.log(uniqueCss);

  /* Recursively traverse the DOM tree for all descendants of element in doc */
  function allCss(element, doc) {
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
});
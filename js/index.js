(function () {

  var _ = function (element, o) {
    var self = this;

    // Setup.
    self.element = $(element);
    self.options = {};

    o = o || {};

    configure(self, {
      focusopen: 'enabled',
      clickopen: 'disabled',
      classNames: {
        link: 'c-menu__link',
        sub: 'c-menu__sub',
        open: 'is-open',
        nohover: 'no-hover'
      }
    }, o);

    $.bind($$('.' + self.options.classNames.link, self.element), {
      'focus': function (e) {
        var trigger = e.target;
        var subMenu = trigger.nextElementSibling;
        // Close open sub menus that are not part of the triggered menu tree.
        var openSubMenus = $$('.' + self.options.classNames.open, self.element);
        openSubMenus.forEach(function (openSubMenu) {
          if (!isDescendant(openSubMenu, trigger)) {
            self.closeSubMenu(openSubMenu);
          }
        });
        // Open the sub menu.
        if (self.options.focusopen == 'enabled' && subMenu && subMenu.classList.contains(self.options.classNames.sub)) {
          self.openSubMenu(subMenu);
        }
      },
      'blur': function (e) {
        // Close all open sub menus if the menu loses focus.
        setTimeout(function() {
          var trigger = document.activeElement;
          if (!isDescendant(self.element, trigger)) {
            var openSubMenus = $$('.' + self.options.classNames.open, self.element);
            openSubMenus.forEach(function (openSubMenu) {
              self.closeSubMenu(openSubMenu);
            });
          }
        }, 1);
      }
    });

    if (self.options.clickopen == 'enabled') {
      $$('.' + self.options.classNames.sub, self.element).forEach(function (subMenu) {
        subMenu.classList.add(self.options.classNames.nohover)
      });
      $.bind($$('.' + self.options.classNames.link, self.element), {
        'click': function (e) {
          var subMenu = e.target.nextElementSibling;

          if (subMenu && subMenu.classList.contains(self.options.classNames.sub)) {
            e.preventDefault();
            self.openSubMenu(subMenu);
          }
        }
      });
    }
  };

  _.prototype = {
    openSubMenu: function (subMenu) {
      var self = this;
      var trigger = subMenu.previousElementSibling;

      // Add open class and aria rule to the sub menu.
      trigger.setAttribute('aria-expanded', true);
      subMenu.classList.add(self.options.classNames.open);
    },
    closeSubMenu: function (subMenu) {
      var self = this;
      var trigger = subMenu.previousElementSibling;

      // Remove open class and aria rule from not targeted sub menus.
      trigger.setAttribute('aria-expanded', false);
      subMenu.classList.remove(self.options.classNames.open);
    }
  };

  // Private functions.
  function configure(instance, properties, o) {
    for (var i in properties) {
      var initial = properties[i];
      var attrValue = instance.element.getAttribute('data-' + i.toLowerCase());

      if (typeof initial === 'number') {
        instance.options[i] = parseInt(attrValue);
      }
      else if (initial === false) {
        instance.options[i] = attrValue !== null;
      }
      else if (initial instanceof Function) {
        instance.options[i] = null;
      }
      else {
        instance.options[i] = attrValue;
      }

      if (!instance.options[i] && instance.options[i] !== 0) {
        instance.options[i] = (i in o) ? o[i] : initial;
      }
    }
  }

  function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  // Helpers.
  var slice = Array.prototype.slice;

  function $(expr, con) {
    return typeof expr === "string" ? (con || document).querySelector(expr) : expr || null;
  }

  function $$(expr, con) {
    return slice.call((con || document).querySelectorAll(expr));
  }

  $.create = function(tag, o) {
    var element = document.createElement(tag);

    for (var i in o) {
      var val = o[i];

      if (i === 'inside') {
        $(val).appendChild(element);
      }
      else if (i === 'around') {
        var ref = $(val);
        ref.parentNode.insertBefore(element, ref);
        element.appendChild(ref);
      }
      else if (i in element) {
        element[i] = val;
      }
      else {
        element.setAttribute(i, val);
      }
    }

    return element;
  };

  $.bind = function(elements, o) {
    if (elements) {
      elements = elements.length ? elements : [elements];
      elements.forEach(function (element) {
        for (var event in o) {
          var callback = o[event];
          event.split(/\s+/).forEach(function (event) {
            element.addEventListener(event, callback);
          });
        }
      });
    }
  };

  $.fire = function(target, type, properties) {
    var evt = document.createEvent('HTMLEvents');

    evt.initEvent(type, true, true );

    for (var j in properties) {
      evt[j] = properties[j];
    }

    return target.dispatchEvent(evt);
  };

  // Initialization.
  function init() {
    $$('.js-c-nav').forEach(function (element) {
      new _(element);
    });
  }

  // Are we in a browser? Check for Document constructor.
  if (typeof Document !== 'undefined') {
    // DOM already loaded?
    if (document.readyState !== 'loading') {
      init();
    }
    else {
      // Wait for it.
      document.addEventListener('DOMContentLoaded', init);
    }
  }

  _.$ = $;
  _.$$ = $$;

  // Make sure to export componentNav on self when in a browser.
  if (typeof self !== 'undefined') {
    self.componentNav = _;
  }

  return _;

}());
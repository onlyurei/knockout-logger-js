knockout-logger-js
==================

A logger that can be displayed on the page and/or in the console.

Dependencies:

KnockoutJS - http://knockoutjs.com/
SugarJS - http://sugarjs.com/
RequireJS - http://requirejs.org/

Bootstrap - http://getbootstrap.com/

Signature of Storage:

        /**
         * Get a key/value pair from storage
         * @param {String} key Name of the item to be retrieved
         * @param {Boolean=true} permanent If true, uses local storage instead of session storage (optional)
         */
        get: function (key, permanent) {}
        
        /**
         * Set a key/value pair to storage
         * @param {String} key Name of the item to be set
         * @param {Object} value JSON object representing the data to be stored
         * @param {Boolean=true} permanent If true, uses local storage instead of session storage (optional)
         */
        set: function (key, value, permanent) {}
        
        /**
         * Removes an item from storage
         * @param {String} key Name of the item to be removed
         * @param {Boolean=true} permanent If true, uses local storage instead of session storage (optional)
         */
        remove: function (key, permanent) {}
        
        /**
         * Clears items from storage
         * @param {Boolean=true} permanent If true, uses local storage instead of session storage (optional)
         */
        clear: function (permanent) {}

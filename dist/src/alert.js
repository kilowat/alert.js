/*!
 * alert.js v0.0.0-alpha, 10.01.2015
 * Beautifully crafted javascript dialog boxes.
 * By Ankit Pokhrel (http://ankitpokhrel.com.np, @ankitpokhrel)
 * Licensed under MIT
 */

(function (window, document, undefined) {
    'use strict';

    /**
     * Main alert class.
     * @constructor
     */
    var Alert = function() {

        /** @private */
        var

            //default options
            defaults = {
                type: 'alert',
                heading: '',
                subHeading: '',
                message: '',
                buttons: {
                    OK: {
                        label: 'Ok',
                        attrs: {
                            id: 'btn_ok',
                            'class': 'alert-js-btn alert-js-btn-ok'
                        }
                    },
                    CANCEL: {
                        label: 'Cancel',
                        attrs: {
                            id: 'btn_cancel',
                            'class': 'alert-js-btn alert-js-btn-cancel'
                        }
                    }
                },
                overlay: true,
                effect: 'ease-in',
                wait: 0,
                from: 'middle',
                success: null,
                cancelled: null,
                complete: null
            },
            
            /*
              Create and assemble different component of alert boxes
              @param  {Object} options user provided settings
              @return {Object} this object
            */
            make = function( options ) {
                var me = this,
                    a = me.artisan,
                    s = ( JSON.parse( JSON.stringify(defaults) ) ), //quick clone
                    opt = _.map(s, options);

                //set mapped options
                a.setOptions(opt);

                //we don't need cancel button for alert box
                if( a.options.type === 'alert' ) {
                    a.options.buttons.CANCEL = false;
                }                

                //create elements
                a.create('layer');
                a.create('header');
                a.create('mainHeading');

                if( a.options.subHeading !== '' ) {
                    a.create('subHeading');
                }
                
                a.create('body');

                if( a.options.type === 'prompt' ) {
                    a.create('input');
                }

                a.create('overlay');

                //we might want to check user provided options here
                //not the mapped one as the mapper will add default
                //values for buttons
                if( options.buttons !== false ) {
                    a.create('footer');
                    a.create('okButton');

                    if( a.options.buttons.CANCEL !== false ) {
                        a.create('cancelButton');
                    }
                }
               
                assemble(a);
                
                return a; //return creator
            },

            /* Assemble elements */
            assemble = function(a) {
                document.body.appendChild(a.layer);
                a.layer.appendChild(a.header);
                a.layer.appendChild(a.body);
                put(a.header, a.heading);
                put(a.header, a.subHeading);
                put(a.body, a.input);
                put(a.layer, a.footer);

                //append buttons if any
                if( a.footer !== null && a.okButton !== null ) {
                    a.footer.appendChild(a.okButton);
                    
                    //attach listener
                    listen(a.okButton, 'click', function() {
                        addEvent(true);
                    });
                }

                if( a.footer !== null && a.cancelButton !== null ) {
                    a.footer.appendChild(a.cancelButton);

                    //attach listener   
                    listen(a.cancelButton, 'click', function() {
                        addEvent(false);
                    });
                }
            },
           
            /* Append element to DOM if it exists */
            put = function(elm, prop) {
                if( prop !== null ) {
                    elm.appendChild(prop);
                }
            },

            //attach different events
            addEvent = function( status ) {
                var a = fn(),
                    o = a.artisan.options;

                a.hide();

                if( status && o.success !== null ) {
                    if(o.type === 'prompt') { 
                        o.success.call(this, a.artisan.input.value); 
                    } else { 
                        o.success.apply(this); 
                    }
                } else if( !status && o.cancelled !== null ) {
                    o.cancelled.apply(this);
                }

                if( o.complete !== null ) {
                    if( o.type === 'prompt' ) {
                        o.complete.call(this, status, a.artisan.input.value);
                    } else {
                        o.complete.call(this, status);
                    }
                }
            },

            /* Animate and show alert box */
            animate = function() {
                var a = fn();
                if( Object.keys(a).length > 0 ){
                    a = a.artisan;

                    setTimeout(function() {

                        //add overlay
                        document.body.insertBefore(a.overlay, a.layer);
                        if( !a.options.overlay ) {
                            a.overlay.style.visibility = 'hidden';
                        }

                        //fix scrollbar
                        document.body.style.overflow = 'hidden';

                        //start animation by switching classes
                        _.addClass(a.layer, 'alert-js-' + a.options.effect, function() {
                            //wait sometime for smooth animation
                            setTimeout(function(){
                                _.removeClass(a.layer, 'alert-js-animation-' + a.options.from);
                            }, 10);
                        });

                    }, a.options.wait);
                }
            },

            /*
              Binds event listener to an element
              @param {Object} el Element to bind event to
              @param {Event} evt Event to bind
              @param {Function} cb Callback
             */
            listen = function( el, evt, cb ) {

                if( typeof el.addEventListener === 'function' ) {
                    el.addEventListener(evt, cb, false);
                } else if( el.attachEvent ) {
                    el.attachEvent("on" + evt, cb);
                }

            },

            /* 
              provide access of public methods  to
              private functions via current object
            */
            fn = function() {
                var o = _pool.slice(0, 1) ;
                if( o.length > 0 ) {
                    return o.pop();
                }

                return {};
            };

            return {                
                /** @public */
                artisan: new Creator(),

                /**
                 * Show different type of alerts
                 * @param  {Object}   options  User defined options
                 * @return {Object} Alert object
                 */
                show: function( options ) {
                    var that, self = this;

                    if( typeof options.type === 'undefined' || !_.inArray(options.type, _.validTypes()) ) {
                        options.type = 'alert'; //default type
                    }

                    //make a local copy of Alert to work on
                    if( _pool.length === 0 ) {
                        //only allow one instance at a time
                        _pool.push(new Alert());

                        that = make.apply(fn(), arguments);
                        animate();                                      
                    } else {
                        that = _pool.slice(0, 1);
                    }

                    this.artisan = that;
                    return self;
                },

                /* Hides alert box */
                hide: function() {
                    var me = this,
                        elm = me.artisan.layer,
                        overlay = me.artisan.overlay,
                        opt = me.artisan.options;

                       _.addClass(elm, 'alert-js-animation-' + opt.from, function() {
                            if( _pool.length > 0 ) {
                                setTimeout(function() {
                                    document.body.removeChild(overlay);
                                    document.body.removeChild(elm);
                                    document.body.style.overflow = '';
                                    _pool.splice(0, 1);
                                }, 400);
                            }
                       });
                }
               
            };
    };

    //alert box container
    var _pool = [];

    /**
     * Creator class
     * Creates all html elements required for the app
     * @constructor
     */
    var Creator = function() {
        /** @private */
        var

            //Creates outer element that wraps alert dialog.
            createOuterLayer = function() {
                var layer = document.createElement('section');
                layer.setAttribute('id', 'alertJS');
                layer.className = 'alert-js alert-js-animation-' + this.options.from;

                return layer;
            },

            //Creates header element.
            createHeader = function() {
                var header = document.createElement('header');
                header.setAttribute('id', 'alertJSheader');
                header.className = 'alert-js-header alert-js-header-primary';

                return header;
            },

            //Creates main heading element.
            createMainHeading = function() {
                var h1 = document.createElement('h1');
                h1.innerHTML = this.options.heading;

                return h1;
            },

            //Creates sub header element.
            createSubHeading = function() {
                var h2 = document.createElement('h2');
                h2.innerHTML = this.options.subHeading;

                return h2;
            },

            //Creates body.
            createBody = function() {
                var body = document.createElement('div');
                body.setAttribute('id', 'alertJSbody');
                body.className = 'alert-js-body';
                if( this.options.message.charAt(0) === '#' ) {
                    body.innerHTML = _.pick(this.options.message.slice(1), true).innerHTML;
                } else {
                    body.innerHTML = this.options.message;
                }

                return body;
            },

            //Creates input field for prompt
            createInput = function() {
                var input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('id', 'alertJSinput');
                input.className = 'alert-js-input';

                return input;
            },

            //Creates footer element.
            createFooter = function() {
                var footer = document.createElement('footer');
                footer.setAttribute('id', 'alertJSfooter');
                footer.className = 'alert-js-footer';

                return footer;
            },

            //Creates OK and CANCEL button element.
            createButton = function( type ) {
                var btn = document.createElement('button'),
                    scope = this.options.buttons[type];

                //set attributes
                if( typeof scope === 'object' && _.keyExist('attrs', scope) ) {
                    for( var attr in scope.attrs ) {
                        if( typeof scope.attrs[attr] !== 'function' && scope.attrs.hasOwnProperty(attr) ) {
                            btn.setAttribute(attr, scope.attrs[attr]);
                        }
                    }
                }

                //set button text
                if( typeof scope === 'object' && _.keyExist('label', scope) ) {
                    btn.innerHTML = scope.label;
                } else if( typeof scope === 'string' ) {
                    btn.innerHTML = scope;
                } else {
                    btn.innerHTML = scope.toString();
                }

                return btn;
            },

            //Creates OK button.
            createOKbutton = function() {
                return createButton.call(this, 'OK');
            },

            //Creates CANCEL button.
            createCancelButton = function() {
                return createButton.call(this, 'CANCEL');
            },

            //Creates overlay element.
            createOverlay = function() {
                var overlay = document.createElement('div');
                overlay.className = 'alert-js-overlay';

                return overlay;
            };


        return {
            /** @public */
            layer: null,
            header: null,
            heading: null,
            subHeading: null,
            body: null,
            input: null,
            footer: null,
            buttons: null,
            okButton: null,
            cancelButton: null,
            overlay: null,
            options: null,

            /**
             * Builder
             * @param  {string} type Determines what to build and builds
             *                       it by calling appropriate builder.
             * @return {Object | boolean}
             */
            create: function( type ) {
                switch(type) {
                    case 'layer':
                        return (this.layer = createOuterLayer.call(this));

                    case 'header':
                        return (this.header = createHeader.call(this));

                    case 'mainHeading':
                        return (this.heading = createMainHeading.call(this));

                    case 'subHeading':
                        return (this.subHeading = createSubHeading.call(this));

                    case 'body':
                        return (this.body = createBody.call(this));

                    case 'input':
                        return (this.input = createInput.call(this));

                    case 'footer':
                        return (this.footer = createFooter.call(this));

                    case 'okButton':
                        return (this.okButton = createOKbutton.call(this));

                    case 'cancelButton':
                        return (this.cancelButton = createCancelButton.call(this));

                    case 'overlay':
                        return (this.overlay = createOverlay.call(this));
                }

                return false;
            },

            setOptions: function( options ) {
                this.options = options;
            }
        };
    };

    /* Helpers */
    var _ = {

        /* Simple DOM selector */
        pick: function( elm, id ) {
            if( typeof id === 'undefined' ) {
                return document.querySelectorAll(elm);
            } else {
                return document.getElementById(elm);
            }
        },

        /* All valid alert boxes */
        validTypes: function() {
            return ['alert', 'confirm', 'prompt'];
        },

        /* Checks if value exists in an array */
        inArray: function( needle, haystack ) {
            if( typeof haystack !== 'object' ) {
                return false;
            }

            return haystack.indexOf(needle) >= 0;
        },

        /* Checks if key exist in a single dimensional object literal */
        keyExist: function( key, obj ) {
            if( obj !== null && typeof obj === 'object') {
                return (key in obj);
            }

            return false;
        },

        /**
         * Maps user and default settings for application to use.
         * @param  {Object} dSet  Default settings
         * @param  {Object} uSet User defined settings
         * @return {Object} Mapped/merged settings
         */
        map: function( dSet, uSet ) {
            if( typeof uSet === 'undefined' ) {
                return dSet;
            }            

            for( var prop in uSet ) {
                if( dSet.hasOwnProperty(prop) ) {
                    if( _.inArray(typeof uSet[prop], ['string', 'number', 'function', 'boolean']) ) {
                        if( prop === 'class' ) {
                            dSet[prop] = dSet[prop] + ' ' + uSet[prop];
                        } else {
                            dSet[prop] = uSet[prop];
                        }
                    } else if( typeof uSet[prop] === 'object' && !_.inArray(prop, ['success', 'cancelled', 'complete']) ) {
                        _.map(dSet[prop], uSet[prop]);
                    }
                }
            }

            return dSet;
        },

        /* Adds a class to an element */
        addClass: function( elm, classes, cb ) {
            var className = elm.className;
            if(typeof classes !== 'string') {
                for(var i = 0; i < classes.length; i++) {
                    className += ' ' + classes[i];
                }
            } else {
                className += ' ' + classes;
            }

            elm.className = className;

            if( typeof cb === 'function' ) {
                cb.apply(null);
            }

            return className;
        },

        /* Removes class from given element */
        removeClass: function( elm, klass ) {
            var klasses = elm.className.split(' '), i;

            while( (i = klasses.indexOf(klass)) > -1 ) {
                klasses = klasses.slice(0, i).concat( klasses.slice(++i) );
            }

            elm.className = klasses.join(' ');

            return elm;
        }

    };

    //Provide access of alerts object to the global 
    //window object if it isn't already available.
    if( typeof alertjs === 'undefined' ) {
        window.alertjs = new Alert();
    }

})(window, document);

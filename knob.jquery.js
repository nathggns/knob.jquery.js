(function(window, document, $, undefined) {

    var Plugin = function(element) {
        this.element = element;
        this.$element = $(element);
    };

    Plugin.prototype.init = function(opts) {

        var $ele = this.$element;

        if (!opts.width) {
            opts.width = parseFloat($ele.css('width'), 10);
        }

        if (!opts.height) {
            opts.height = parseFloat($ele.css('height'), 10);
        }

        this.width = opts.width;
        this.height = opts.height;

        this.canvas = document.createElement('canvas');
        this.$canvas = $(this.canvas);

        this.$canvas.attr({
            width: opts.width,
            height: opts.height
        }).addClass(opts.class_name).addClass(opts.class_name + '-' + opts.id);

        this.$canvas.insertAfter($ele);
        $ele.hide();
        this.ctx = this.canvas.getContext('2d');

        this.start = 0;
        this.current = 0;
        this.style = opts.style;
        this.update = opts.update;
        this.offset = opts.offset;
        this.draw();
    };

    Plugin.prototype.draw = function() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        var size = Math.min(this.width, this.height);

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(this.width / 2, this.height / 2);
        ctx.arc(this.width / 2, this.height / 2, size / 2, this.start + this.offset, this.current + this.offset);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.clip();
        
        ctx.beginPath();

        if (typeof this.style === 'string') {
            ctx.fillStyle = this.style;
            ctx.rect(0, 0, this.width, this.height);
            ctx.fill();    
        } else if (typeof this.style === 'function') {
            this.style.apply(this);
        } else {
            ctx.drawImage(this.style, 0, 0, this.width, this.height);
        }

        ctx.closePath();

        ctx.restore();

        var _this = this;

        return setTimeout(function() {
            _this.draw();
        }, this.update);
    };

    Plugin.prototype.set_to = function(opts) {
        var point = opts.point;

        this.current = point;
    };

    Plugin.prototype.animate_to = function(opts) {
        var point = opts.point;
        var from = { i: this.current };
        var to = { i: point };
        var _this = this;

        $(from).animate(to, {
            duration: opts.speed,
            step: function(step) {
                _this.current = step;
            },
            complete: function() {
                if (opts.complete) {
                    return opts.complete.apply(_this, arguments);
                }
            },
            easing: opts.easing
        });
    };

    Plugin.prototype.instance = function() {
        return this;
    };

    var instances = {};

    var make_id = function(length) {
        length = length || 5;

        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        possible += possible.toLowerCase();
        possible += '0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    var plugin = $.fn.knob = function(opts) {
        opts = $.extend({}, plugin.defaults, opts);

        var method = opts.method;

        delete opts.method;

        if (!(method in Plugin.prototype)) {
            return $.error('Method ' + method + ' does not exist');
        }

        opts = $.extend({}, plugin.method_defaults[method] || {}, opts);

        var results = [];

        var result = this.each(function() {
            var $this = $(this);

            if (!$this.data(opts.id_data_key)) {
                $this.data(opts.id_data_key, make_id() + '-' + (new Date()).getTime());
            }

            var key = $this.data(opts.id_data_key);

            if (!(key in instances)) {
                instances[key] = new Plugin(this);
            }

            opts.id = key;

            var result = instances[key][method](opts);

            if (result) {
                results.push(result);
            }
        });

        if (results.length > 0) {
            if (results.length === 1) results = results[0];

            return results;
        }

        return result;


    };

    plugin.defaults = {
        method: 'init',
        id_data_key: 'knob-plugin-id',
        class_name: 'knob-canvas',
        style: '#000',
        update: 16,
        offset: -.5 * Math.PI
    }

    plugin.method_defaults = {
        init: {
            width: null,
            height: null
        },

        set_to: {
            point: Math.PI
        },

        animate_to: {
            point: Math.PI,
            speed: 600,
            easing: 'swing'
        }
    }

})(window, document, jQuery);
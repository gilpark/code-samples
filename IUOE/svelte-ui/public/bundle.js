
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    const identity$1 = x => x;
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$1;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop$1;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity$1, tick = noop$1, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind$1(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction$1(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction$1(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction$1,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Factory for creating new instances
    axios$1.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var default_1 = axios$1;
    axios_1.default = default_1;

    var axios = axios_1;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function createErrorClass(createImpl) {
        var _super = function (instance) {
            Error.call(instance);
            instance.stack = new Error().stack;
        };
        var ctorFunc = createImpl(_super);
        ctorFunc.prototype = Object.create(Error.prototype);
        ctorFunc.prototype.constructor = ctorFunc;
        return ctorFunc;
    }

    var UnsubscriptionError = createErrorClass(function (_super) {
        return function UnsubscriptionErrorImpl(errors) {
            _super(this);
            this.message = errors
                ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
                : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
        };
    });

    function arrRemove(arr, item) {
        if (arr) {
            var index = arr.indexOf(item);
            0 <= index && arr.splice(index, 1);
        }
    }

    var Subscription = (function () {
        function Subscription(initialTeardown) {
            this.initialTeardown = initialTeardown;
            this.closed = false;
            this._parentage = null;
            this._teardowns = null;
        }
        Subscription.prototype.unsubscribe = function () {
            var e_1, _a, e_2, _b;
            var errors;
            if (!this.closed) {
                this.closed = true;
                var _parentage = this._parentage;
                if (_parentage) {
                    this._parentage = null;
                    if (Array.isArray(_parentage)) {
                        try {
                            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                                var parent_1 = _parentage_1_1.value;
                                parent_1.remove(this);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    else {
                        _parentage.remove(this);
                    }
                }
                var initialTeardown = this.initialTeardown;
                if (isFunction(initialTeardown)) {
                    try {
                        initialTeardown();
                    }
                    catch (e) {
                        errors = e instanceof UnsubscriptionError ? e.errors : [e];
                    }
                }
                var _teardowns = this._teardowns;
                if (_teardowns) {
                    this._teardowns = null;
                    try {
                        for (var _teardowns_1 = __values(_teardowns), _teardowns_1_1 = _teardowns_1.next(); !_teardowns_1_1.done; _teardowns_1_1 = _teardowns_1.next()) {
                            var teardown_1 = _teardowns_1_1.value;
                            try {
                                execTeardown(teardown_1);
                            }
                            catch (err) {
                                errors = errors !== null && errors !== void 0 ? errors : [];
                                if (err instanceof UnsubscriptionError) {
                                    errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                                }
                                else {
                                    errors.push(err);
                                }
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_teardowns_1_1 && !_teardowns_1_1.done && (_b = _teardowns_1.return)) _b.call(_teardowns_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                if (errors) {
                    throw new UnsubscriptionError(errors);
                }
            }
        };
        Subscription.prototype.add = function (teardown) {
            var _a;
            if (teardown && teardown !== this) {
                if (this.closed) {
                    execTeardown(teardown);
                }
                else {
                    if (teardown instanceof Subscription) {
                        if (teardown.closed || teardown._hasParent(this)) {
                            return;
                        }
                        teardown._addParent(this);
                    }
                    (this._teardowns = (_a = this._teardowns) !== null && _a !== void 0 ? _a : []).push(teardown);
                }
            }
        };
        Subscription.prototype._hasParent = function (parent) {
            var _parentage = this._parentage;
            return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
        };
        Subscription.prototype._addParent = function (parent) {
            var _parentage = this._parentage;
            this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
        };
        Subscription.prototype._removeParent = function (parent) {
            var _parentage = this._parentage;
            if (_parentage === parent) {
                this._parentage = null;
            }
            else if (Array.isArray(_parentage)) {
                arrRemove(_parentage, parent);
            }
        };
        Subscription.prototype.remove = function (teardown) {
            var _teardowns = this._teardowns;
            _teardowns && arrRemove(_teardowns, teardown);
            if (teardown instanceof Subscription) {
                teardown._removeParent(this);
            }
        };
        Subscription.EMPTY = (function () {
            var empty = new Subscription();
            empty.closed = true;
            return empty;
        })();
        return Subscription;
    }());
    var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
    function isSubscription(value) {
        return (value instanceof Subscription ||
            (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe)));
    }
    function execTeardown(teardown) {
        if (isFunction(teardown)) {
            teardown();
        }
        else {
            teardown.unsubscribe();
        }
    }

    var config = {
        onUnhandledError: null,
        onStoppedNotification: null,
        Promise: undefined,
        useDeprecatedSynchronousErrorHandling: false,
        useDeprecatedNextContext: false,
    };

    var timeoutProvider = {
        setTimeout: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (setTimeout).apply(void 0, __spreadArray([], __read(args)));
        },
        clearTimeout: function (handle) {
            return (clearTimeout)(handle);
        },
        delegate: undefined,
    };

    function reportUnhandledError(err) {
        timeoutProvider.setTimeout(function () {
            {
                throw err;
            }
        });
    }

    function noop() { }

    function errorContext(cb) {
        {
            cb();
        }
    }

    var Subscriber = (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destination) {
            var _this = _super.call(this) || this;
            _this.isStopped = false;
            if (destination) {
                _this.destination = destination;
                if (isSubscription(destination)) {
                    destination.add(_this);
                }
            }
            else {
                _this.destination = EMPTY_OBSERVER;
            }
            return _this;
        }
        Subscriber.create = function (next, error, complete) {
            return new SafeSubscriber(next, error, complete);
        };
        Subscriber.prototype.next = function (value) {
            if (this.isStopped) ;
            else {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (this.isStopped) ;
            else {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (this.isStopped) ;
            else {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (!this.closed) {
                this.isStopped = true;
                _super.prototype.unsubscribe.call(this);
                this.destination = null;
            }
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            try {
                this.destination.error(err);
            }
            finally {
                this.unsubscribe();
            }
        };
        Subscriber.prototype._complete = function () {
            try {
                this.destination.complete();
            }
            finally {
                this.unsubscribe();
            }
        };
        return Subscriber;
    }(Subscription));
    var SafeSubscriber = (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            var next;
            if (isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                (next = observerOrNext.next, error = observerOrNext.error, complete = observerOrNext.complete);
                var context_1;
                if (_this && config.useDeprecatedNextContext) {
                    context_1 = Object.create(observerOrNext);
                    context_1.unsubscribe = function () { return _this.unsubscribe(); };
                }
                else {
                    context_1 = observerOrNext;
                }
                next = next === null || next === void 0 ? void 0 : next.bind(context_1);
                error = error === null || error === void 0 ? void 0 : error.bind(context_1);
                complete = complete === null || complete === void 0 ? void 0 : complete.bind(context_1);
            }
            _this.destination = {
                next: next ? wrapForErrorHandling(next) : noop,
                error: wrapForErrorHandling(error !== null && error !== void 0 ? error : defaultErrorHandler),
                complete: complete ? wrapForErrorHandling(complete) : noop,
            };
            return _this;
        }
        return SafeSubscriber;
    }(Subscriber));
    function wrapForErrorHandling(handler, instance) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            try {
                handler.apply(void 0, __spreadArray([], __read(args)));
            }
            catch (err) {
                {
                    reportUnhandledError(err);
                }
            }
        };
    }
    function defaultErrorHandler(err) {
        throw err;
    }
    var EMPTY_OBSERVER = {
        closed: true,
        next: noop,
        error: defaultErrorHandler,
        complete: noop,
    };

    var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

    function identity(x) {
        return x;
    }

    function pipeFromArray(fns) {
        if (fns.length === 0) {
            return identity;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }

    var Observable = (function () {
        function Observable(subscribe) {
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var _this = this;
            var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
            errorContext(function () {
                var _a = _this, operator = _a.operator, source = _a.source;
                subscriber.add(operator
                    ?
                        operator.call(subscriber, source)
                    : source
                        ?
                            _this._subscribe(subscriber)
                        :
                            _this._trySubscribe(subscriber));
            });
            return subscriber;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                sink.error(err);
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe();
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var _a;
            return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        var _a;
        return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
    }
    function isObserver(value) {
        return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
    }
    function isSubscriber(value) {
        return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
    }

    function hasLift(source) {
        return isFunction(source === null || source === void 0 ? void 0 : source.lift);
    }
    function operate(init) {
        return function (source) {
            if (hasLift(source)) {
                return source.lift(function (liftedSource) {
                    try {
                        return init(liftedSource, this);
                    }
                    catch (err) {
                        this.error(err);
                    }
                });
            }
            throw new TypeError('Unable to lift unknown Observable type');
        };
    }

    var OperatorSubscriber = (function (_super) {
        __extends(OperatorSubscriber, _super);
        function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
            var _this = _super.call(this, destination) || this;
            _this.onFinalize = onFinalize;
            _this._next = onNext
                ? function (value) {
                    try {
                        onNext(value);
                    }
                    catch (err) {
                        destination.error(err);
                    }
                }
                : _super.prototype._next;
            _this._error = onError
                ? function (err) {
                    try {
                        onError(err);
                    }
                    catch (err) {
                        destination.error(err);
                    }
                    finally {
                        this.unsubscribe();
                    }
                }
                : _super.prototype._error;
            _this._complete = onComplete
                ? function () {
                    try {
                        onComplete();
                    }
                    catch (err) {
                        destination.error(err);
                    }
                    finally {
                        this.unsubscribe();
                    }
                }
                : _super.prototype._complete;
            return _this;
        }
        OperatorSubscriber.prototype.unsubscribe = function () {
            var _a;
            var closed = this.closed;
            _super.prototype.unsubscribe.call(this);
            !closed && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
        };
        return OperatorSubscriber;
    }(Subscriber));

    var ObjectUnsubscribedError = createErrorClass(function (_super) {
        return function ObjectUnsubscribedErrorImpl() {
            _super(this);
            this.name = 'ObjectUnsubscribedError';
            this.message = 'object unsubscribed';
        };
    });

    var Subject = (function (_super) {
        __extends(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.closed = false;
            _this.observers = [];
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype._throwIfClosed = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
        };
        Subject.prototype.next = function (value) {
            var _this = this;
            errorContext(function () {
                var e_1, _a;
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    var copy = _this.observers.slice();
                    try {
                        for (var copy_1 = __values(copy), copy_1_1 = copy_1.next(); !copy_1_1.done; copy_1_1 = copy_1.next()) {
                            var observer = copy_1_1.value;
                            observer.next(value);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (copy_1_1 && !copy_1_1.done && (_a = copy_1.return)) _a.call(copy_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            });
        };
        Subject.prototype.error = function (err) {
            var _this = this;
            errorContext(function () {
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    _this.hasError = _this.isStopped = true;
                    _this.thrownError = err;
                    var observers = _this.observers;
                    while (observers.length) {
                        observers.shift().error(err);
                    }
                }
            });
        };
        Subject.prototype.complete = function () {
            var _this = this;
            errorContext(function () {
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    _this.isStopped = true;
                    var observers = _this.observers;
                    while (observers.length) {
                        observers.shift().complete();
                    }
                }
            });
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = this.closed = true;
            this.observers = null;
        };
        Object.defineProperty(Subject.prototype, "observed", {
            get: function () {
                var _a;
                return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
            },
            enumerable: false,
            configurable: true
        });
        Subject.prototype._trySubscribe = function (subscriber) {
            this._throwIfClosed();
            return _super.prototype._trySubscribe.call(this, subscriber);
        };
        Subject.prototype._subscribe = function (subscriber) {
            this._throwIfClosed();
            this._checkFinalizedStatuses(subscriber);
            return this._innerSubscribe(subscriber);
        };
        Subject.prototype._innerSubscribe = function (subscriber) {
            var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
            return hasError || isStopped
                ? EMPTY_SUBSCRIPTION
                : (observers.push(subscriber), new Subscription(function () { return arrRemove(observers, subscriber); }));
        };
        Subject.prototype._checkFinalizedStatuses = function (subscriber) {
            var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
            if (hasError) {
                subscriber.error(thrownError);
            }
            else if (isStopped) {
                subscriber.complete();
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable));
    var AnonymousSubject = (function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
        };
        AnonymousSubject.prototype.error = function (err) {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
        };
        AnonymousSubject.prototype.complete = function () {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var _a, _b;
            return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
        };
        return AnonymousSubject;
    }(Subject));

    var BehaviorSubject = (function (_super) {
        __extends(BehaviorSubject, _super);
        function BehaviorSubject(_value) {
            var _this = _super.call(this) || this;
            _this._value = _value;
            return _this;
        }
        Object.defineProperty(BehaviorSubject.prototype, "value", {
            get: function () {
                return this.getValue();
            },
            enumerable: false,
            configurable: true
        });
        BehaviorSubject.prototype._subscribe = function (subscriber) {
            var subscription = _super.prototype._subscribe.call(this, subscriber);
            !subscription.closed && subscriber.next(this._value);
            return subscription;
        };
        BehaviorSubject.prototype.getValue = function () {
            var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
            if (hasError) {
                throw thrownError;
            }
            this._throwIfClosed();
            return _value;
        };
        BehaviorSubject.prototype.next = function (value) {
            _super.prototype.next.call(this, (this._value = value));
        };
        return BehaviorSubject;
    }(Subject));

    function filter(predicate, thisArg) {
        return operate(function (source, subscriber) {
            var index = 0;
            source.subscribe(new OperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
        });
    }

    class SvelteSubject extends BehaviorSubject {
        set(value) {
            super.next(value);
        }
        update(updater) {
            // console.log(cb instanceof Function)
            // console.log(cb instanceof Object)
            if(updater instanceof Function)return super.next(updater(super.getValue()))
            super.next({...super.getValue(),...updater});
        }
        lift(operator) {
            const result = new SvelteSubject();
            result.operator = operator;
            result.source = this;
            return result
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop$1;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    const pcMessage$ = new SvelteSubject(null);
    const isPlayCanvasReady = writable(false);
    window.addEventListener("message", d => {
        console.log('[svelte:message$]: ',d.data);
        if( IsJsonString(d.data)){
            const parsed = JSON.parse(d.data);
            if(parsed.action === 'start'){
                isPlayCanvasReady.set(true);
            }
            pcMessage$.set(parsed);
        }
    }, false);

    //todo remove this on production
    const str = JSON.stringify({
        PIPE:"https://playcanv.as/e/b/KJpypzAC",
        STEAM:"https://playcanv.as/e/b/sisZ1Fi4",
        ITEC:"https://playcanv.as/e/b/Q4sRSY7d",
    });
    const encryptedContent = CryptoJS.AES.encrypt(str, 'IUOE-AR').toString();
    console.log(encryptedContent);

    const gistURL = 'https://api.github.com/gists/f546f6af53e78d3759395f618e44b76c';
    var getBuildURLs = () => axios(gistURL, {
        headers: {'Accept' : 'application/vnd.github.v3+json'}})
        .then( res => {
            const encryptedContent = res?.data?.files?.build?.content;
            const bytes  = CryptoJS.AES.decrypt(encryptedContent, 'IUOE-AR');
            const originalStr = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(originalStr)
        }).catch( error => console.error(error));

    /* src\components\Playcanvs.svelte generated by Svelte v3.38.2 */

    function create_if_block$4(ctx) {
    	let iframe;
    	let iframe_src_value;

    	return {
    		c() {
    			iframe = element("iframe");
    			attr(iframe, "id", "app-frame");
    			if (iframe.src !== (iframe_src_value = /*buildObj*/ ctx[2][/*appName*/ ctx[0]])) attr(iframe, "src", iframe_src_value);
    		},
    		m(target, anchor) {
    			insert(target, iframe, anchor);
    			/*iframe_binding*/ ctx[3](iframe);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*buildObj, appName*/ 5 && iframe.src !== (iframe_src_value = /*buildObj*/ ctx[2][/*appName*/ ctx[0]])) {
    				attr(iframe, "src", iframe_src_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(iframe);
    			/*iframe_binding*/ ctx[3](null);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let if_block = /*buildObj*/ ctx[2] && create_if_block$4(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*buildObj*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { appName = "STEAM" } = $$props;
    	let container, buildObj = undefined;

    	onMount(async () => {
    		$$invalidate(2, buildObj = await getBuildURLs());
    	});

    	function iframe_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("appName" in $$props) $$invalidate(0, appName = $$props.appName);
    	};

    	return [appName, container, buildObj, iframe_binding];
    }

    class Playcanvs extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { appName: 0 });
    	}
    }

    /* src\components\ScreenSizeHandler.svelte generated by Svelte v3.38.2 */

    function create_fragment$7(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.innerHTML = `<p class="content svelte-8cn26a">Turn your phone to start the experience.</p>`;
    			attr(div, "class", "container svelte-8cn26a");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function instance$7($$self) {
    	onMount(() => {
    		setTimeout(
    			function () {
    				window.scroll(0, -100000);
    			},
    			1000
    		);

    		if (document.getElementById("app-frame")) {
    			const pc = document.getElementById("app-frame").contentWindow;
    			pc.postMessage(JSON.stringify({ action: "pause", pause: true }), "*");
    		}

    		return () => {
    			const pc = document.getElementById("app-frame").contentWindow;
    			pc.postMessage(JSON.stringify({ action: "pause", pause: false }), "*");
    		};
    	});

    	return [];
    }

    class ScreenSizeHandler extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});
    	}
    }

    /* src\components\LandingPage.svelte generated by Svelte v3.38.2 */

    function create_fragment$6(ctx) {
    	let div;
    	let h1;
    	let raw_value = /*getDisplayName*/ ctx[2](/*appName*/ ctx[0]) + "";
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = space();
    			button = element("button");
    			button.textContent = "START";
    			attr(div, "class", "container svelte-1kz5hwi");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			h1.innerHTML = raw_value;
    			append(div, t0);
    			append(div, button);

    			if (!mounted) {
    				dispose = listen(button, "click", prevent_default(/*buttonClickHandler*/ ctx[1]));
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*appName*/ 1 && raw_value !== (raw_value = /*getDisplayName*/ ctx[2](/*appName*/ ctx[0]) + "")) h1.innerHTML = raw_value;		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function openFullscreen() {
    	if (document.documentElement.requestFullscreen) {
    		document.documentElement.requestFullscreen();
    	} else if (document.documentElement.mozRequestFullScreen) {
    		/* Firefox */
    		document.documentElement.mozRequestFullScreen();
    	} else if (document.documentElement.webkitRequestFullscreen) {
    		/* Chrome, Safari and Opera */
    		document.documentElement.webkitRequestFullscreen();
    	} else if (document.documentElement.msRequestFullscreen) {
    		/* IE/Edge */
    		document.documentElement.msRequestFullscreen();
    	}
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { enterExperience = false } = $$props, { appName = "" } = $$props;

    	const requestIOSMotion = cb => {
    		const android = (/Android/i).test(navigator.userAgent);

    		if (window.DeviceOrientationEvent) {
    			if (typeof DeviceOrientationEvent.requestPermission === "function") {
    				DeviceOrientationEvent.requestPermission().then(permissionState => {
    					if (permissionState === "granted") {
    						console.log("IOS orientation supported - svelte");
    						window.addEventListener("deviceorientation", cb);
    					}
    				}).catch(console.error);
    			}
    		}

    		if (android) {
    			console.log("Android orientation supported - svelte");
    			window.addEventListener("deviceorientation", cb, false);
    		}
    	};

    	const buttonClickHandler = e => {
    		const android = (/Android/i).test(navigator.userAgent);
    		const pc = document.getElementById("app-frame").contentWindow;

    		const sensorCb = ({ alpha, beta, gamma }) => {
    			pc.postMessage(
    				JSON.stringify({
    					id: "sensor",
    					data: { alpha, beta, gamma }
    				}),
    				"*"
    			);
    		};

    		if (android && !document.fullscreenElement) {
    			openFullscreen();
    		}

    		$$invalidate(3, enterExperience = true);
    		requestIOSMotion(sensorCb);
    	};

    	const getDisplayName = name => {
    		switch (name) {
    			case "STEAM":
    				return "STEAM ENGINE";
    			case "PIPE":
    				return "HOISTING & PORTABLE";
    			case "ITEC":
    				return `INTERNATIONAL TRAINING<br/> & EDUCATION CENTER`;
    			default:
    				return "LANDING PAGE";
    		}
    	};

    	$$self.$$set = $$props => {
    		if ("enterExperience" in $$props) $$invalidate(3, enterExperience = $$props.enterExperience);
    		if ("appName" in $$props) $$invalidate(0, appName = $$props.appName);
    	};

    	return [appName, buttonClickHandler, getDisplayName, enterExperience];
    }

    class LandingPage extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { enterExperience: 3, appName: 0 });
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity$1 } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    var contentObj$2 = {
        data:[
            {
                id:0,
                padding:"0",
                width:"40%",
                align:"flex-start",
                title:"Running the Engine",
                text:"The piston is connected to a crankshaft.  A large flywheel connected to the crankshaft creates the momentum necessary to carry the piston past dead zones, or moments when the engine creates no power while the piston changes direction. This allows steam to enter the cylinder and the piston to continue its power stroke.",
            },
            {
                id:1,
                padding:"0",
                width:"42%",
                align:"flex-start",
                title:"Regulating the Engine",
                text:"The fly-ball governor operates a valve supplying steam to the cylinders, regulating the engine’s speed. It connects to the throttle valve and flywheel and spins as the engine runs. The force acting on the fly balls pushes the vertical shaft into the valve, reducing the gap through which steam is fed.",

            },
            {
                id:3,
                padding:"50%",
                width:"85%",
                align:"center",
                title:"Safeguarding the Engine",
                text:"If the governor spins fast enough, the shaft cuts off the steam intake completely. This was crucial in the operation of large steam engines like this one, to prevent the engine from shaking itself apart. Early stationary engineers monitored pressures and mechanics of the engine to ensure it was working efficiently and safely.",

            },
            {
                id:2,
                padding:"50%",
                width:"87%",
                align:"center",
                title:"Powering the Engine",
                text:"The Corliss’ main source of power is steam, produced by a boiler connected to the engine. This high-pressure steam is pushed into alternating sides of a cylinder through sliding valves, forcing a piston to move back and forth. Excess steam is released through the exhaust.",

            }
        ],

    };

    /* src\pages\SteamPage.svelte generated by Svelte v3.38.2 */

    function create_if_block_1$3(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	return {
    		c() {
    			div = element("div");
    			div.textContent = "STEAM ENGINE";
    			attr(div, "class", "title svelte-1l62eqr");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};
    }

    // (56:8) {#if content}
    function create_if_block$3(ctx) {
    	let div0;
    	let div0_transition;
    	let t0;
    	let div4;
    	let div3;
    	let div1;
    	let t1_value = /*content*/ ctx[0].title.toUpperCase() + "";
    	let t1;
    	let t2;
    	let div2;
    	let t3_value = /*content*/ ctx[0].text + "";
    	let t3;
    	let div4_transition;
    	let current;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div0 = element("div");
    			div0.innerHTML = `<img src="./assets/Arrow_V1-svg.png" class="svelte-1l62eqr"/>`;
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			attr(div0, "class", "close-btn svelte-1l62eqr");
    			attr(div1, "class", "text-title svelte-1l62eqr");
    			attr(div2, "class", "text-text svelte-1l62eqr");
    			set_style(div2, "max-width", /*content*/ ctx[0].width);
    			attr(div3, "class", "text-inner-wrapper");
    			set_style(div3, "padding-left", /*content*/ ctx[0].padding);
    			attr(div4, "class", "text-box-wrapper svelte-1l62eqr");
    			set_style(div4, "align-items", /*content*/ ctx[0].align);
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t0, anchor);
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, div1);
    			append(div1, t1);
    			append(div3, t2);
    			append(div3, div2);
    			append(div2, t3);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div0, "click", prevent_default(/*handleClose*/ ctx[2]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty & /*content*/ 1) && t1_value !== (t1_value = /*content*/ ctx[0].title.toUpperCase() + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*content*/ 1) && t3_value !== (t3_value = /*content*/ ctx[0].text + "")) set_data(t3, t3_value);

    			if (!current || dirty & /*content*/ 1) {
    				set_style(div2, "max-width", /*content*/ ctx[0].width);
    			}

    			if (!current || dirty & /*content*/ 1) {
    				set_style(div3, "padding-left", /*content*/ ctx[0].padding);
    			}

    			if (!current || dirty & /*content*/ 1) {
    				set_style(div4, "align-items", /*content*/ ctx[0].align);
    			}
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, true);
    					div0_transition.run(1);
    				});
    			}

    			if (local) {
    				add_render_callback(() => {
    					if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, true);
    					div4_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, false);
    				div0_transition.run(0);
    			}

    			if (local) {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, false);
    				div4_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach(t0);
    			if (detaching) detach(div4);
    			if (detaching && div4_transition) div4_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let if_block0 = /*showTitle*/ ctx[1] && create_if_block_1$3();
    	let if_block1 = /*content*/ ctx[0] && create_if_block$3(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr(div0, "class", "content svelte-1l62eqr");
    			attr(div1, "class", "container svelte-1l62eqr");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t);
    			if (if_block1) if_block1.m(div0, null);
    		},
    		p(ctx, [dirty]) {
    			if (/*showTitle*/ ctx[1]) {
    				if (if_block0) {
    					if (dirty & /*showTitle*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$3();
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*content*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*content*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			transition_in(if_block0);
    			transition_in(if_block1);
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { enterExperience = false } = $$props;
    	let content = undefined;
    	let showTitle = false;

    	const handleClose = () => {
    		const pc = document.getElementById("app-frame").contentWindow;
    		pc.postMessage(JSON.stringify({ id: "svelte", data: { action: "close" } }), "*");
    		$$invalidate(0, content = undefined);
    		document.getElementById("audio").play();
    	};

    	onMount(() => {
    		const sub = pcMessage$.pipe(filter(d => d)).subscribe(({ action, id }) => {
    			if (!action) return;

    			switch (action) {
    				case "start":
    					$$invalidate(1, showTitle = true);
    					break;
    				case "hideTitle":
    					$$invalidate(1, showTitle = false);
    					break;
    				case "showTitle":
    					$$invalidate(1, showTitle = true);
    					break;
    				case "popup":
    					$$invalidate(0, content = contentObj$2.data.find(d => d.id === id));
    					// console.log(content, id)
    					break;
    			}
    		});

    		return () => {
    			sub.dispose();
    		};
    	});

    	$$self.$$set = $$props => {
    		if ("enterExperience" in $$props) $$invalidate(3, enterExperience = $$props.enterExperience);
    	};

    	return [content, showTitle, handleClose, enterExperience];
    }

    class SteamPage extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { enterExperience: 3 });
    	}
    }

    var contentObj$1 = {
        data:[
            {
                id:0,
                padding:"55%",
                width:"94%",
                align:"center",
                title:"Inspecting & Laying",
                text:"Inspectors looked at each weld and X-rayed it for damage. Any dust or rust was removed, and a heavy coat of lacquer was placed on the outside. If the soil was corrosive, the weld also got a coat of tar and fiberglass. A side boom caterpillar then picked up the pipe and laid it into the trench, requiring skill and coordination between the operator and crew members.",
            },
            {
                id:1,
                padding:"0",
                width:"42%",
                align:"flex-start",
                title:"Fitting & Welding",
                text:"Forty-foot sections of steel pipe, each weighing about 1.5 tons, were shaped to fit the land’s unique curvature. After the pipes were trimmed and fitted, line-up clamps were run through each and given a welded stringer bead, tacking them into position. Welders then attached all the sections with a finishing bead, stronger than steel pipe itself.",

            },
            {
                id:2,
                padding:"0",
                width:"42%",
                align:"flex-start",
                title:"Trenching & Excavating",
                text:"In the early days of pipelines, trenching was done by hand. Eventually, trenching machines automated the work, but early models required constant upkeep. This trench most likely was dug using a combination of the two methods. Explosives were then placed inside the trench and ignited to deepen and widen it.",

            },
            {
                id:3,
                padding:"0",
                width:"42%",
                align:"flex-start",
                title:"Surveying & Clearing",
                text:"After the land was surveyed, both from overhead and from the ground, it was cleared using early caterpillar machines. Sometimes multiple machines were needed to push others uphill on treacherous terrain. Weather, such as the snow seen here, also played a role in creating a challenging environment for the crew.",

            },

        ],

    };

    /* src\pages\PipePage.svelte generated by Svelte v3.38.2 */

    function create_if_block_1$2(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	return {
    		c() {
    			div = element("div");
    			div.textContent = "HOISTING & PORTABLE";
    			attr(div, "class", "title svelte-1l62eqr");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};
    }

    // (56:8) {#if content}
    function create_if_block$2(ctx) {
    	let div0;
    	let div0_transition;
    	let t0;
    	let div4;
    	let div3;
    	let div1;
    	let t1_value = /*content*/ ctx[0].title.toUpperCase() + "";
    	let t1;
    	let t2;
    	let div2;
    	let t3_value = /*content*/ ctx[0].text + "";
    	let t3;
    	let div4_transition;
    	let current;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div0 = element("div");
    			div0.innerHTML = `<img src="./assets/Arrow_V1-svg.png" class="svelte-1l62eqr"/>`;
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			attr(div0, "class", "close-btn svelte-1l62eqr");
    			attr(div1, "class", "text-title svelte-1l62eqr");
    			attr(div2, "class", "text-text svelte-1l62eqr");
    			set_style(div2, "max-width", /*content*/ ctx[0].width);
    			attr(div3, "class", "text-inner-wrapper");
    			set_style(div3, "padding-left", /*content*/ ctx[0].padding);
    			attr(div4, "class", "text-box-wrapper svelte-1l62eqr");
    			set_style(div4, "align-items", /*content*/ ctx[0].align);
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t0, anchor);
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, div1);
    			append(div1, t1);
    			append(div3, t2);
    			append(div3, div2);
    			append(div2, t3);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div0, "click", prevent_default(/*handleClose*/ ctx[2]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty & /*content*/ 1) && t1_value !== (t1_value = /*content*/ ctx[0].title.toUpperCase() + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*content*/ 1) && t3_value !== (t3_value = /*content*/ ctx[0].text + "")) set_data(t3, t3_value);

    			if (!current || dirty & /*content*/ 1) {
    				set_style(div2, "max-width", /*content*/ ctx[0].width);
    			}

    			if (!current || dirty & /*content*/ 1) {
    				set_style(div3, "padding-left", /*content*/ ctx[0].padding);
    			}

    			if (!current || dirty & /*content*/ 1) {
    				set_style(div4, "align-items", /*content*/ ctx[0].align);
    			}
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, true);
    					div0_transition.run(1);
    				});
    			}

    			if (local) {
    				add_render_callback(() => {
    					if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, true);
    					div4_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, false);
    				div0_transition.run(0);
    			}

    			if (local) {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, false);
    				div4_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach(t0);
    			if (detaching) detach(div4);
    			if (detaching && div4_transition) div4_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let if_block0 = /*showTitle*/ ctx[1] && create_if_block_1$2();
    	let if_block1 = /*content*/ ctx[0] && create_if_block$2(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr(div0, "class", "content svelte-1l62eqr");
    			attr(div1, "class", "container svelte-1l62eqr");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t);
    			if (if_block1) if_block1.m(div0, null);
    		},
    		p(ctx, [dirty]) {
    			if (/*showTitle*/ ctx[1]) {
    				if (if_block0) {
    					if (dirty & /*showTitle*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2();
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*content*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*content*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			transition_in(if_block0);
    			transition_in(if_block1);
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { enterExperience = false } = $$props;
    	let content = undefined;
    	let showTitle = false;

    	const handleClose = () => {
    		const pc = document.getElementById("app-frame").contentWindow;
    		pc.postMessage(JSON.stringify({ id: "svelte", data: { action: "close" } }), "*");
    		$$invalidate(0, content = undefined);
    		document.getElementById("audio").play();
    	};

    	onMount(() => {
    		const sub = pcMessage$.pipe(filter(d => d)).subscribe(({ action, id }) => {
    			if (!action) return;

    			switch (action) {
    				case "start":
    					$$invalidate(1, showTitle = true);
    					break;
    				case "hideTitle":
    					$$invalidate(1, showTitle = false);
    					break;
    				case "showTitle":
    					$$invalidate(1, showTitle = true);
    					break;
    				case "popup":
    					$$invalidate(0, content = contentObj$1.data.find(d => d.id === id));
    					// console.log(content, id)
    					break;
    			}
    		});

    		return () => {
    			sub.dispose();
    		};
    	});

    	$$self.$$set = $$props => {
    		if ("enterExperience" in $$props) $$invalidate(3, enterExperience = $$props.enterExperience);
    	};

    	return [content, showTitle, handleClose, enterExperience];
    }

    class PipePage extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { enterExperience: 3 });
    	}
    }

    const isPortrait = writable(false);

    window.addEventListener('gesturestart', function(e) {
        e.preventDefault();
        // special hack to prevent zoom-to-tabs gesture in safari
        document.body.style.zoom = 0.99;
    }, false);
    window.addEventListener('gestureend', function(e) {
        e.preventDefault();
        // special hack to prevent zoom-to-tabs gesture in safari
        document.body.style.zoom = 0.99;
    }, false);
    window.addEventListener('gesturechange', function(e) {
        e.preventDefault();
        // special hack to prevent zoom-to-tabs gesture in safari
        document.body.style.zoom = 0.99;
    }, false);

    const handleScreenSize = () =>{
        const isNarrow = (document.body.clientWidth/document.body.clientHeight) < 1.3;
        console.log("is Narrow? ", isNarrow, document.body.clientWidth/document.body.clientHeight);
        isPortrait.set(isNarrow);
    };

    const handleOrientation = () =>{
        let isLandscapeMode = false;
        if( 'orientation' in window ) {
            const isLandScape = Math.abs(window.orientation) === 90;
            isLandscapeMode = isLandScape;
        } else if ( 'orientation' in window.screen ) {
            const isLandScape = screen.orientation.type === 'landscape-primary' || screen.orientation.type === 'landscape-secondary';
            isLandscapeMode = isLandScape;
        } else if( 'mozOrientation' in window.screen ) {
            const isLandScape = screen.mozOrientation === 'landscape-primary' || screen.mozOrientation === 'landscape-secondary';
            isLandscapeMode = isLandScape;
        }
        console.log("is isLandscapeMode? ", isLandscapeMode);
        isPortrait.set(!isLandscapeMode);
    };

    window.addEventListener('resize', handleScreenSize, true);
    window.addEventListener('orientationchange', handleOrientation, true);
    handleOrientation();
    handleScreenSize();

    var contentObj = {
        data:[
            {
                id:0,
                top: "10%",
                left: "5%",
                title:"training pads",
                text:"Outside on the training pads students practice the fundamentals of operating heavy equipment, from work on boom crawlers to horizontal directional drilling and advanced crane operations. Students also learn skills of the future, by managing robotic equipment and working alongside Built Robotics autonomous vehicles.",
                imageUrl:"https://res.cloudinary.com/facepaint/image/upload/v1631043594/IUOE/Area4/0_trainingpad.jpg"
            },
            {
                id:1,
                top: "10%",
                left: "5%",
                title:"mechanic shop",
                text:"To keep our equipment running, an onsite mechanic shop makes for training opportunities. It features a 10-ton overhead crane, welding simulators and CNC (computer numerical control) technology. Built-in railroad tracks prevent the floor from cracking when heavy machines come into the mechanics shop for maintenance.",
                imageUrl:"https://res.cloudinary.com/facepaint/image/upload/v1631043687/IUOE/Area4/1_mechanic.jpg"
            },
            {
                id:2,
                top: "25%",
                left: "10%",
                title:"central plant",
                videoUrl: "https://res.cloudinary.com/facepaint/video/upload/v1631632299/IUOE/Area4/v2/Central_Plant_Overview_v2.mp4"

            },
            {
                id:4,
                bottom: "15%",
                left: "18%",
                title:"classrooms | labs",
                videoUrl:"https://res.cloudinary.com/facepaint/video/upload/v1631632302/IUOE/Area4/v2/ITEC_Classrooms_David_Prickett_v2.mp4"

            },
            {
                id:3,
                top: "35%",
                left: "10%",
                title:"simulators",
                text:"A simulation room allows members to practice operating construction equipment in a virtual environment. Among the simulators: a pair of Vortex cranes with a computer that communicates between the machines so that two students can train together.",
                imageUrl:"https://res.cloudinary.com/facepaint/image/upload/v1631059132/IUOE/Area4/4_sim.jpg"


            },
            {
                id:5,
                left: '56%',
                bottom: '12%',
                title:"purpose",
                videoUrl:"https://res.cloudinary.com/facepaint/video/upload/v1631632305/IUOE/Area4/v2/ITEC_Origins_GP_Callahan_v2.mp4"


            },
            {
                id:6,
                bottom: "22%",
                right: "18%",
                title:"amenities",
                videoUrl:"https://res.cloudinary.com/facepaint/video/upload/v1631632297/IUOE/Area4/v2/ITEC_Amenities_Overview_v2.mp4"

            },

        ],

    };

    /* src\components\VideoPlayer.svelte generated by Svelte v3.38.2 */

    function create_fragment$3(ctx) {
    	let div2;
    	let video;
    	let track;
    	let video_src_value;
    	let video_updating = false;
    	let video_animationframe;
    	let video_is_paused = true;
    	let t0;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t1;
    	let progress;
    	let progress_value_value;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function video_timeupdate_handler() {
    		cancelAnimationFrame(video_animationframe);

    		if (!video.paused) {
    			video_animationframe = raf(video_timeupdate_handler);
    			video_updating = true;
    		}

    		/*video_timeupdate_handler*/ ctx[9].call(video);
    	}

    	return {
    		c() {
    			div2 = element("div");
    			video = element("video");
    			track = element("track");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t1 = space();
    			progress = element("progress");
    			attr(track, "kind", "captions");
    			if (video.src !== (video_src_value = /*url*/ ctx[0])) attr(video, "src", video_src_value);
    			attr(video, "class", "svelte-daokjh");
    			if (/*duration*/ ctx[3] === void 0) add_render_callback(() => /*video_durationchange_handler*/ ctx[10].call(video));
    			if (img.src !== (img_src_value = "assets/playbutton.png")) attr(img, "src", img_src_value);
    			set_style(img, "opacity", /*paused*/ ctx[4] ? "1" : "0");
    			attr(img, "class", "svelte-daokjh");
    			attr(div0, "class", "info svelte-daokjh");
    			progress.value = progress_value_value = /*time*/ ctx[2] / /*duration*/ ctx[3] || 0;
    			attr(progress, "class", "svelte-daokjh");
    			attr(div1, "class", "controls svelte-daokjh");
    			set_style(div1, "opacity", /*duration*/ ctx[3] && /*showControls*/ ctx[5] ? 1 : 0);
    			attr(div2, "class", "video-wrapper svelte-daokjh");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, video);
    			append(video, track);
    			append(div2, t0);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, img);
    			append(div1, t1);
    			append(div1, progress);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(video, "mousemove", /*handleMove*/ ctx[6]),
    					listen(video, "touchmove", prevent_default(/*handleMove*/ ctx[6])),
    					listen(video, "mousedown", /*handleMousedown*/ ctx[7]),
    					listen(video, "mouseup", /*handleMouseup*/ ctx[8]),
    					listen(video, "timeupdate", video_timeupdate_handler),
    					listen(video, "ended", function () {
    						if (is_function(/*onComplete*/ ctx[1])) /*onComplete*/ ctx[1].apply(this, arguments);
    					}),
    					listen(video, "durationchange", /*video_durationchange_handler*/ ctx[10]),
    					listen(video, "play", /*video_play_pause_handler*/ ctx[11]),
    					listen(video, "pause", /*video_play_pause_handler*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (!current || dirty & /*url*/ 1 && video.src !== (video_src_value = /*url*/ ctx[0])) {
    				attr(video, "src", video_src_value);
    			}

    			if (!video_updating && dirty & /*time*/ 4 && !isNaN(/*time*/ ctx[2])) {
    				video.currentTime = /*time*/ ctx[2];
    			}

    			video_updating = false;

    			if (dirty & /*paused*/ 16 && video_is_paused !== (video_is_paused = /*paused*/ ctx[4])) {
    				video[video_is_paused ? "pause" : "play"]();
    			}

    			if (!current || dirty & /*paused*/ 16) {
    				set_style(img, "opacity", /*paused*/ ctx[4] ? "1" : "0");
    			}

    			if (!current || dirty & /*time, duration*/ 12 && progress_value_value !== (progress_value_value = /*time*/ ctx[2] / /*duration*/ ctx[3] || 0)) {
    				progress.value = progress_value_value;
    			}

    			if (!current || dirty & /*duration, showControls*/ 40) {
    				set_style(div1, "opacity", /*duration*/ ctx[3] && /*showControls*/ ctx[5] ? 1 : 0);
    			}
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { url = "" } = $$props, { onComplete = null } = $$props;

    	// These values are bound to properties of the video
    	let time = 0;

    	let duration;
    	let paused = true;
    	let showControls = true;
    	let showControlsTimeout;

    	// Used to track time of last mouse down event
    	let lastMouseDown;

    	function handleMove(e) {
    		// Make the controls visible, but fade out after
    		// 2.5 seconds of inactivity
    		clearTimeout(showControlsTimeout);

    		showControlsTimeout = setTimeout(() => $$invalidate(5, showControls = false), 2500);
    		$$invalidate(5, showControls = true);
    		if (!duration) return; // video not loaded yet
    		if (e.type !== "touchmove" && !(e.buttons & 1)) return; // mouse not down

    		const clientX = e.type === "touchmove"
    		? e.touches[0].clientX
    		: e.clientX;

    		const { left, right } = this.getBoundingClientRect();
    		$$invalidate(2, time = duration * (clientX - left) / (right - left));
    	}

    	// we can't rely on the built-in click event, because it fires
    	// after a drag — we have to listen for clicks ourselves
    	function handleMousedown(e) {
    		lastMouseDown = new Date();
    	}

    	function handleMouseup(e) {
    		if (new Date() - lastMouseDown < 300) {
    			if (paused) e.target.play(); else e.target.pause();
    		}
    	}

    	function video_timeupdate_handler() {
    		time = this.currentTime;
    		$$invalidate(2, time);
    	}

    	function video_durationchange_handler() {
    		duration = this.duration;
    		$$invalidate(3, duration);
    	}

    	function video_play_pause_handler() {
    		paused = this.paused;
    		$$invalidate(4, paused);
    	}

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    		if ("onComplete" in $$props) $$invalidate(1, onComplete = $$props.onComplete);
    	};

    	return [
    		url,
    		onComplete,
    		time,
    		duration,
    		paused,
    		showControls,
    		handleMove,
    		handleMousedown,
    		handleMouseup,
    		video_timeupdate_handler,
    		video_durationchange_handler,
    		video_play_pause_handler
    	];
    }

    class VideoPlayer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { url: 0, onComplete: 1 });
    	}
    }

    /* src\pages\ITECpage.svelte generated by Svelte v3.38.2 */

    function create_if_block_3$1(ctx) {
    	let videoplayer;
    	let current;

    	videoplayer = new VideoPlayer({
    			props: {
    				url: /*content*/ ctx[0].videoUrl,
    				onComplete: /*handleClose*/ ctx[3]
    			}
    		});

    	return {
    		c() {
    			create_component(videoplayer.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(videoplayer, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const videoplayer_changes = {};
    			if (dirty & /*content*/ 1) videoplayer_changes.url = /*content*/ ctx[0].videoUrl;
    			videoplayer.$set(videoplayer_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(videoplayer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(videoplayer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(videoplayer, detaching);
    		}
    	};
    }

    // (74:8) {#if showTitle}
    function create_if_block_2$1(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	return {
    		c() {
    			div = element("div");

    			div.innerHTML = `INTERNATIONAL TRAINING<br/>
                &amp; EDUCATION CENTER`;

    			attr(div, "class", "title svelte-1tt3urn");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};
    }

    // (88:8) {#if content}
    function create_if_block$1(ctx) {
    	let div0;
    	let div0_transition;
    	let t;
    	let div1;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*content*/ ctx[0].imageUrl) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div0 = element("div");
    			div0.innerHTML = `<img src="./assets/Arrow_V1-svg.png" class="svelte-1tt3urn"/>`;
    			t = space();
    			div1 = element("div");
    			if_block.c();
    			attr(div0, "class", "close-btn svelte-1tt3urn");
    			attr(div1, "class", "text-box-wrapper svelte-1tt3urn");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t, anchor);
    			insert(target, div1, anchor);
    			if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div0, "click", prevent_default(/*handleClose*/ ctx[3]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, true);
    					div0_transition.run(1);
    				});
    			}

    			if (local) {
    				add_render_callback(() => {
    					if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, true);
    					div1_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			if (local) {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, false);
    				div0_transition.run(0);
    			}

    			if (local) {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, false);
    				div1_transition.run(0);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach(t);
    			if (detaching) detach(div1);
    			if_block.d();
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (111:20) {:else}
    function create_else_block(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*content*/ ctx[0].title.toUpperCase() + "";
    	let t0;
    	let t1;
    	let div1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			div1.innerHTML = `<img src="assets/playbutton.png" class="svelte-1tt3urn"/>`;
    			attr(div0, "class", "text-title svelte-1tt3urn");
    			attr(div1, "class", "text-text svelte-1tt3urn");
    			set_style(div1, "pointer-events", "all", 1);
    			attr(div2, "class", "text-inner-wrapper svelte-1tt3urn");
    			set_style(div2, "top", /*content*/ ctx[0].top);
    			set_style(div2, "left", /*content*/ ctx[0].left);
    			set_style(div2, "bottom", /*content*/ ctx[0].bottom);
    			set_style(div2, "right", /*content*/ ctx[0].right);
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, t0);
    			append(div2, t1);
    			append(div2, div1);

    			if (!mounted) {
    				dispose = listen(div1, "click", prevent_default(/*handleVidClick*/ ctx[4]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*content*/ 1 && t0_value !== (t0_value = /*content*/ ctx[0].title.toUpperCase() + "")) set_data(t0, t0_value);

    			if (dirty & /*content*/ 1) {
    				set_style(div2, "top", /*content*/ ctx[0].top);
    			}

    			if (dirty & /*content*/ 1) {
    				set_style(div2, "left", /*content*/ ctx[0].left);
    			}

    			if (dirty & /*content*/ 1) {
    				set_style(div2, "bottom", /*content*/ ctx[0].bottom);
    			}

    			if (dirty & /*content*/ 1) {
    				set_style(div2, "right", /*content*/ ctx[0].right);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (96:16) {#if content.imageUrl}
    function create_if_block_1$1(ctx) {
    	let div4;
    	let div2;
    	let div0;
    	let t0_value = /*content*/ ctx[0].title.toUpperCase() + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*content*/ ctx[0].text + "";
    	let t2;
    	let t3;
    	let div3;
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			img = element("img");
    			attr(div0, "class", "text-title svelte-1tt3urn");
    			attr(div1, "class", "text-text svelte-1tt3urn");
    			attr(div2, "class", "text-text-wrapper svelte-1tt3urn");
    			if (img.src !== (img_src_value = /*content*/ ctx[0].imageUrl)) attr(img, "src", img_src_value);
    			attr(img, "class", "svelte-1tt3urn");
    			attr(div3, "class", "text-image svelte-1tt3urn");
    			set_style(div4, "width", "100%");
    			set_style(div4, "position", "fixed");
    			set_style(div4, "height", "100%");
    			set_style(div4, "left", "0");
    			set_style(div4, "top", "0");
    			set_style(div4, "display", "grid");
    			set_style(div4, "grid-template-columns", "50% 50%");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div2);
    			append(div2, div0);
    			append(div0, t0);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, t2);
    			append(div4, t3);
    			append(div4, div3);
    			append(div3, img);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*content*/ 1 && t0_value !== (t0_value = /*content*/ ctx[0].title.toUpperCase() + "")) set_data(t0, t0_value);
    			if (dirty & /*content*/ 1 && t2_value !== (t2_value = /*content*/ ctx[0].text + "")) set_data(t2, t2_value);

    			if (dirty & /*content*/ 1 && img.src !== (img_src_value = /*content*/ ctx[0].imageUrl)) {
    				attr(img, "src", img_src_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	let if_block0 = /*openVideo*/ ctx[2] && create_if_block_3$1(ctx);
    	let if_block1 = /*showTitle*/ ctx[1] && create_if_block_2$1();
    	let if_block2 = /*content*/ ctx[0] && create_if_block$1(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr(div0, "class", "content svelte-1tt3urn");
    			attr(div1, "class", "container svelte-1tt3urn");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*openVideo*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*openVideo*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*showTitle*/ ctx[1]) {
    				if (if_block1) {
    					if (dirty & /*showTitle*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$1();
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*content*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*content*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { enterExperience = false } = $$props;
    	let content = undefined;
    	let showTitle = false;
    	let openVideo = false;

    	const handleClose = () => {
    		const pc = document.getElementById("app-frame").contentWindow;
    		pc.postMessage(JSON.stringify({ id: "svelte", data: { action: "close" } }), "*");
    		$$invalidate(0, content = undefined);
    		$$invalidate(2, openVideo = false);
    		document.getElementById("audio").play();
    	};

    	onMount(() => {
    		const sub = pcMessage$.pipe(filter(d => d)).subscribe(({ action, id }) => {
    			if (!action) return;
    			console.log(action, 0);

    			switch (action) {
    				case "start":
    					$$invalidate(1, showTitle = true);
    					break;
    				case "hideTitle":
    					$$invalidate(1, showTitle = false);
    					break;
    				case "showTitle":
    					$$invalidate(1, showTitle = true);
    					break;
    				case "popup":
    					$$invalidate(0, content = contentObj.data.find(d => d.id === id));
    					// console.log(content, id)
    					break;
    			}
    		});

    		return () => {
    			sub.dispose();
    		};
    	});

    	// const android = /Android/i.test(navigator.userAgent)
    	// afterUpdate(() => {
    	//
    	//     if (android && !document.fullscreenElement && document.fullscreen) {
    	//         console.log("need to fullscreen???")
    	//         //openFullscreen()
    	//     }
    	// });
    	const handleVidClick = () => {
    		$$invalidate(2, openVideo = true);

    		setTimeout(
    			_ => {
    				document.querySelectorAll("VIDEO").forEach(v => v.play());
    			},
    			0
    		);

    		document.getElementById("play").play();
    	};

    	$$self.$$set = $$props => {
    		if ("enterExperience" in $$props) $$invalidate(5, enterExperience = $$props.enterExperience);
    	};

    	return [content, showTitle, openVideo, handleClose, handleVidClick, enterExperience];
    }

    class ITECpage extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { enterExperience: 5 });
    	}
    }

    /* src\components\VideoBG.svelte generated by Svelte v3.38.2 */

    function create_fragment$1(ctx) {
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*bgUrl*/ ctx[1])) attr(img, "src", img_src_value);
    			attr(img, "class", "bg-image svelte-1vnvh7j");
    			toggle_class(img, "show", /*useWebCamBG*/ ctx[0] && isPlayCanvasReady);
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { appName = "STEAM" } = $$props;
    	let useWebCamBG = appName !== "PIPE";

    	const bgUrl = appName === "STEAM"
    	? "assets/steam-bg.jpg"
    	: "assets/itec-bg2.jpg";

    	onMount(() => {
    	});

    	$$self.$$set = $$props => {
    		if ("appName" in $$props) $$invalidate(2, appName = $$props.appName);
    	};

    	return [useWebCamBG, bgUrl, appName];
    }

    class VideoBG extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { appName: 2 });
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */

    function create_if_block_4(ctx) {
    	let landingpage;
    	let updating_enterExperience;
    	let current;

    	function landingpage_enterExperience_binding(value) {
    		/*landingpage_enterExperience_binding*/ ctx[3](value);
    	}

    	let landingpage_props = { appName: /*appName*/ ctx[2] };

    	if (/*enterExperience*/ ctx[0] !== void 0) {
    		landingpage_props.enterExperience = /*enterExperience*/ ctx[0];
    	}

    	landingpage = new LandingPage({ props: landingpage_props });
    	binding_callbacks.push(() => bind$1(landingpage, "enterExperience", landingpage_enterExperience_binding));

    	return {
    		c() {
    			create_component(landingpage.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(landingpage, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const landingpage_changes = {};

    			if (!updating_enterExperience && dirty & /*enterExperience*/ 1) {
    				updating_enterExperience = true;
    				landingpage_changes.enterExperience = /*enterExperience*/ ctx[0];
    				add_flush_callback(() => updating_enterExperience = false);
    			}

    			landingpage.$set(landingpage_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(landingpage.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(landingpage.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(landingpage, detaching);
    		}
    	};
    }

    // (43:0) {#if appName === "STEAM"}
    function create_if_block_3(ctx) {
    	let steampage;
    	let current;
    	steampage = new SteamPage({});

    	return {
    		c() {
    			create_component(steampage.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(steampage, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(steampage.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(steampage.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(steampage, detaching);
    		}
    	};
    }

    // (44:0) {#if appName === "PIPE"}
    function create_if_block_2(ctx) {
    	let pipepage;
    	let current;
    	pipepage = new PipePage({});

    	return {
    		c() {
    			create_component(pipepage.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(pipepage, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(pipepage.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(pipepage.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(pipepage, detaching);
    		}
    	};
    }

    // (45:0) {#if appName === "ITEC"}
    function create_if_block_1(ctx) {
    	let itecpage;
    	let current;
    	itecpage = new ITECpage({});

    	return {
    		c() {
    			create_component(itecpage.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(itecpage, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(itecpage.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(itecpage.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(itecpage, detaching);
    		}
    	};
    }

    // (47:0) {#if $isPortrait }
    function create_if_block(ctx) {
    	let screensizehandler;
    	let current;
    	screensizehandler = new ScreenSizeHandler({});

    	return {
    		c() {
    			create_component(screensizehandler.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(screensizehandler, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(screensizehandler.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(screensizehandler.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(screensizehandler, detaching);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let audio0;
    	let audio0_src_value;
    	let t0;
    	let audio1;
    	let audio1_src_value;
    	let t1;
    	let t2;
    	let videobg;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let playcanvs;
    	let current;
    	let if_block0 = !/*enterExperience*/ ctx[0] && create_if_block_4(ctx);
    	videobg = new VideoBG({ props: { appName: /*appName*/ ctx[2] } });
    	let if_block1 = /*appName*/ ctx[2] === "STEAM" && create_if_block_3();
    	let if_block2 = /*appName*/ ctx[2] === "PIPE" && create_if_block_2();
    	let if_block3 = /*appName*/ ctx[2] === "ITEC" && create_if_block_1();
    	let if_block4 = /*$isPortrait*/ ctx[1] && create_if_block();
    	playcanvs = new Playcanvs({ props: { appName: /*appName*/ ctx[2] } });

    	return {
    		c() {
    			audio0 = element("audio");
    			t0 = space();
    			audio1 = element("audio");
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			create_component(videobg.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			if (if_block3) if_block3.c();
    			t6 = space();
    			if (if_block4) if_block4.c();
    			t7 = space();
    			create_component(playcanvs.$$.fragment);
    			attr(audio0, "id", "audio");
    			if (audio0.src !== (audio0_src_value = "assets/close-sound.mp3")) attr(audio0, "src", audio0_src_value);
    			attr(audio1, "id", "play");
    			if (audio1.src !== (audio1_src_value = "assets/play-sound.mp3")) attr(audio1, "src", audio1_src_value);
    		},
    		m(target, anchor) {
    			insert(target, audio0, anchor);
    			insert(target, t0, anchor);
    			insert(target, audio1, anchor);
    			insert(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t2, anchor);
    			mount_component(videobg, target, anchor);
    			insert(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t4, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t5, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert(target, t6, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert(target, t7, anchor);
    			mount_component(playcanvs, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!/*enterExperience*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*enterExperience*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$isPortrait*/ ctx[1]) {
    				if (if_block4) {
    					if (dirty & /*$isPortrait*/ 2) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block();
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t7.parentNode, t7);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(videobg.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(playcanvs.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(videobg.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(playcanvs.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(audio0);
    			if (detaching) detach(t0);
    			if (detaching) detach(audio1);
    			if (detaching) detach(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t2);
    			destroy_component(videobg, detaching);
    			if (detaching) detach(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t4);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(t5);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach(t6);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach(t7);
    			destroy_component(playcanvs, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $isPortrait;
    	component_subscribe($$self, isPortrait, $$value => $$invalidate(1, $isPortrait = $$value));
    	let enterExperience = false;

    	const getAppName = () => {
    		//21 == pipe
    		//22 == steam
    		//4 == itec
    		const host = window.location.host;

    		if (host.includes("itec-ar.com")) {
    			const id = host.split(".")[0];
    			console.log("your app is...", id);
    			if (id === "21") return "PIPE";
    			if (id === "22") return "STEAM";
    			if (id === "4") return "ITEC";
    		} else {
    			const urlParams = new URLSearchParams(window.location.search);
    			const type = urlParams.get("type");
    			console.log(type);
    			return type ? type.toLocaleUpperCase() : "STEAM";
    		}
    	};

    	const appName = getAppName();

    	function landingpage_enterExperience_binding(value) {
    		enterExperience = value;
    		$$invalidate(0, enterExperience);
    	}

    	return [enterExperience, $isPortrait, appName, landingpage_enterExperience_binding];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

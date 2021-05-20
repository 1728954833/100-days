class Vue {
    constructor(options) {
        this.$options = options;
        this.$el = options.el;
        this.$data = options.data;
        this.$methods = options.methods;
        this._proxyData(this.$data);
        new Observer(this.$data);
        new Compiler(this, document.querySelector(this.$el));
    }

    _proxyData(data) {
        Object.keys(data).forEach(k => {
            Object.defineProperty(this, k, {
                get() {
                    return this.$data[k];
                },
                set(value) {
                    this.$data[k] = value;
                },
            });
        });
    }
}

class Observer {
    constructor(data) {
        this.execute(data);
    }

    execute(data) {
        if (typeof data !== "object" || !data) return;
        Object.keys(data).forEach(k => this.defineReactive(data, k, data[k]));
    }

    defineReactive(target, key, value) {
        let _self = this;
        let dep = new Dep();
        if (typeof value === "object") {
            this.defineReactive(value, key, value[key]);
        }
        Object.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get() {
                dep.addSub(Dep.target);
                return value;
            },
            set(newValue) {
                if (newValue !== value) {
                    value = newValue;
                    if (typeof newValue === "object") {
                        _self.defineReactive(newValue, key, newValue[key]);
                    }
                    dep.notify();
                }
            },
        });
    }
}

class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        Dep.target = this;
        this.oldValue = vm[key];
        Dep.target = null;
    }

    update() {
        let newValue = this.vm[this.key];
        if (this.oldValue !== newValue) {
            this.cb(newValue);
        }
    }
}

class Dep {
    constructor() {
        this.subs = [];
    }

    addSub(watcher) {
        if (watcher && watcher.update) {
            this.subs.push(watcher);
        }
    }

    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}

class Compiler {
    constructor(vm, el) {
        this.vm = vm;
        this.el = el;
        this.complier(el);
    }

    complier(el) {
        el.childNodes.forEach(node => {
            if (this.isElement(node)) {
                this.complierElement(node);
            } else if (this.isText(node)) {
                this.complierText(node);
            }

            if (node.childNodes && node.childNodes.length) {
                this.complier(node);
            }
        });
    }

    complierText(node) {
        let reg = /\{\{(.*)\}\}/;
        if (!reg.test(node.textContent)) return;
        node.textContent = this.getValueFromVm(RegExp.$1);
        new Watcher(this.vm, RegExp.$1, newValue => {
            node.textContent = newValue;
        });
    }

    getValueFromVm(text) {
        const v = text.split(".");
        return v.reduce((prev, key) => prev[key], this.vm);
    }

    complierElement(node) {
        Array.from(node.attributes).forEach(attr => {
            if (this.isDirective(attr.name)) {
                switch (attr.name) {
                    case "v-text":
                        return this.textUpdater(node, attr.value);
                    case "v-model":
                        return this.modelUpdater(node, attr.value);
                    case "v-html":
                        return this.htmlUpdater(node, attr.value);
                    case "v-on":
                        return this.onUpdater(node, attr.value);
                }
            }
        });
    }

    onUpdater(el, value) {
        const start = value.indexOf("{");
        const end = value.indexOf("}");
        const str = value.slice(start + 1, end);
        const arr = str.split(",");
        arr.forEach(item => {
            const [eventKey, methodKey] = item.split(":");
            const handleEvent = this.vm.$methods[methodKey.trim()];
            el.addEventListener(eventKey, handleEvent);
        });
    }

    htmlUpdater(el, value) {
        el.innerHTML = value;
    }

    modelUpdater(el, value) {
        el.value = this.getValueFromVm(value);
        new Watcher(this.vm, value, newValue => {
            el.value = newValue;
        });
        el.addEventListener("input", e => {
            this.vm[value] = e.target.value;
        });
    }

    textUpdater(el, value) {
        el.textContent = this.getValueFromVm(value);
        new Watcher(this.vm, value, newValue => {
            el.textContent = newValue;
        });
    }

    isElement(el) {
        return el.nodeType === 1;
    }

    isDirective(attr) {
        return attr.startsWith("v-");
    }

    isText(el) {
        return el.nodeType === 3;
    }
}

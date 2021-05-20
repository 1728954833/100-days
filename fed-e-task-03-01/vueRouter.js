let _Vue = null;

class VueRouter {
    static installed = null;
    constructor(options) {
        console.log("start");
        this.options = options;
        this.routeMap = {};
        this.data = _Vue.observable({
            current: "/",
        });
    }

    static install(Vue) {
        console.log("init");

        if (_Vue && VueRouter.installed) return;
        VueRouter.installed = true;
        _Vue = Vue;

        _Vue.mixin({
            beforeCreate() {
                if (this.$options.router) {
                    _Vue.prototype.$router = this.$options.router;
                }
            },
        });

        // 创建两个全局组件
        Vue.component("router-link", {
            props: {
                to: String,
            },
            render(h) {
                // 利用h函数创建dom
                return h(
                    "a",
                    {
                        attrs: {
                            href: this.to,
                        },
                    },
                    [this.$slots.default]
                );
            },
        });
    }

    createRouteMap() {
        let routes = this.options.routes;
        routes.forEach(route => {
            this.routeMap[route.path] = route.component;
        });
    }
}

export default VueRouter;

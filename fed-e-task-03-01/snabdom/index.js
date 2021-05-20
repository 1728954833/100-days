import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
} from "snabbdom";

const patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
]);

let vnode;
let data = [
    {
        id: 1,
        name: "haha",
        age: 18,
    },
    {
        id: 2,
        name: "xixi",
        age: 28,
    },
];

function sort() {
    data = data.sort((a, b) => {
        return a.age - b.age;
    });
    vnode = patch(vnode, view(data));
}

function add() {
    data.push({
        id: new Date().getTime(),
        name: "dasdas",
        age: Math.floor(Math.random() * 100),
    });
    vnode = patch(vnode, view(data));
}

function remove(id) {
    data = data.filter(item => {
        return id !== item.id;
    });
    vnode = patch(vnode, view(data));
}

function view(data) {
    return h("div", [
        h("button", { on: { click: sort } }, "Sort"),
        h("button", { on: { click: add } }, "Add"),
        h(
            "div",
            {},
            data.map(item => {
                return h(
                    "div",
                    {
                        on: {
                            click: () => {
                                remove(item.id);
                            },
                        },
                        key: item.id,
                    },
                    `${item.name} - ${item.age}`
                );
            })
        ),
    ]);
}

window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");
    vnode = patch(container, view(data));
});

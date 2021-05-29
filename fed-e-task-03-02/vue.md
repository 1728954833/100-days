1、请简述 Vue 首次渲染的过程。
    1. 在 new Vue之后会去调用vue的init初始化
    2. init会将props,method, inject 这些东西挂载到vm实例上，并给data变成响应式数据
    3. 初始化之后会调用$mound去挂载组件
    4. $mount会去调用mountComponent在此期间调用beforeMount钩子然后调用vm_update进行新旧节点比较然后渲染成真实dom
2、请简述 Vue 响应式原理。
    在vue调用_init的时候初始化data会去调用observer创建Observer对象,创建过程中会对data中的属性调用defineReactive进行依赖劫持(get的时候去收集依赖进入对应的Watcher,set的时候调用Watcher的notify进行通知调用所有收集的函数)Watcher会在调用mountComponent挂载的时候进行注册


3、请简述虚拟 DOM 中 Key 的作用和好处。
如果没有key在diff算法进行比较的时候无法精确的确定两个节点是否相同，可能会造成一些bug

4、请简述 Vue 中模板编译的过程。
首先会把模板字符串转换成AST对象然后优化过后转换回去在转换成render
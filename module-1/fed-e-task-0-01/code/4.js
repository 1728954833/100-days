const STATUS = {
    PENDING: 'PENDING',
    REJECTED: 'REJECTED',
    FULFILLED: 'FULFILLED'
}

class MyPromise {
    status = STATUS.PENDING
    reason = undefined
    value = undefined
    rejectedQuene = []
    fullfilledQuene = []

    // new Promise传入的函数进来后会直接进行
    constructor(callback) {
        if (callback instanceof Function) {
           try {
               callback && callback(this.resolve.bind(this), this.reject.bind(this))
           } catch(err) {
               this.reject(err)
           }
        }
    }

    // 用于处理链式调用中then的返回值
    // 如果then返回是普通值或者是prmise值的操作
    // 这里不应该以static暴露到外面，这里这样写只是为了方便
    static handlePromise(p1, value, resolve, reject) {
        // then返回的promise和当前返回的promise一样会照成循环引用
        if (p1 === value) {
            throw 'can not do this: return promise';
        }

        if (value instanceof MyPromise) {
            value.then(v => resolve(v), r => reject(r))
        } else {
            resolve(value)
        }
    }

    resolve(value) {
        if (this.status === STATUS.PENDING) {
            this.status = STATUS.FULFILLED
            this.value = value

            // 如果对应的事件队列有操作则取出消费
            while(this.fullfilledQuene.length !== 0) {
                this.fullfilledQuene.shift()(this.value)
            }
        }
    }

    reject(reason) {
        // status值只有在Pending的时候才会进行转换
        if (this.status === STATUS.PENDING) {
            this.status = STATUS.REJECTED
            this.reason = reason
            // 如果对应的事件队列有操作则取出消费
            while(this.rejectedQuene.length !== 0) {
                this.rejectedQuene.shift()(this.reason)
            }
        }
    }

    then(successCallback, rejectCallback) {
        const promise = new MyPromise((resolve, reject) => {
            if (this.status === STATUS.FULFILLED) {
                setTimeout(() => {
                    try {
                        const value = successCallback(this.value)
                        MyPromise.handlePromise(promise, value, resolve, reject)
                    } catch(err) {
                        reject(err)
                    }
                }, 0)
            } else if (this.status === STATUS.REJECTED) {
                setTimeout(() => {
                    try {
                        const value = rejectCallback(this.reason)
                        MyPromise.handlePromise(promise, value, resolve, reject)
                    } catch(err) {
                        reject(err)
                    }
                }, 0)
            } else {
                // 如果是异步操作就传入对应的事件队列
                this.fullfilledQuene.push(() => {
                    setTimeout(() => {
                        try {
                            const value = successCallback(this.value)
                            MyPromise.handlePromise(promise, value, resolve, reject)
                        } catch(err) {
                            reject(err)
                        }
                    }, 0)
                })
                this.rejectedQuene.push(() => {
                    setTimeout(() => {
                        try {
                            const value = rejectCallback(this.reason)
                            MyPromise.handlePromise(promise, value, resolve, reject)
                        } catch(err) {
                            reject(err)
                        }
                    }, 0)
                })
            }
        })

        // 返回promise才可以进行链式调用
        return promise
    }
}
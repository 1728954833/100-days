const { maxBy } = require('lodash')
const fp = require('lodash/fp')

class Container {
    static of(value) {
        return new Container(value)
    }
    constructor(value) {
        this._value = value
    }
    map(fn) {
        return Container.of(fn(this._value))

    }
}

class Maybe {
    static of(x) {
        return new Maybe(x)
    }
    isNothing() {
        return this._value === null || this._value === undefined
    }
    constructor(x) {
        this._value = x
    }
    map(fn) {
        return this.isNothing() ? this : Maybe.of(fn(this._value))
    }
}

// 练习1
let maybe = Maybe.of([5, 6, 1])
let ex1 = (count) => maybe.map(item => fp.map(fp.add(count), item))
console.log(ex1(2))

// 练习2
let xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do'])
let ex2 = () => xs.map(item => fp.first(item)) 
console.log(ex2())

// 练习3
let safeProp = fp.curry(function (x, o) {
    return Maybe.of(o[x])
})
let user = {id: 2, name: 'Albert'}
let ex3 = () => fp.first(safeProp('name', user)._value)
console.log(ex3())

// 练习4
let ex4 = (n) =>  Maybe.of(n).map(n => parseInt(n))
console.log(ex4('300'))



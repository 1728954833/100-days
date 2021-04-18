// 1.将下面异步代码使用Promise的方式改进
new Promise((resolve) => {
    setTimeout(() => {
        resolve('hello ')
    })
}).then((res) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(res + 'lagou ')
        })
    })
}).then((res) => {
    setTimeout(() => {
        console.log(res + 'I love you')
    }, 10)
})


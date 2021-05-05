// 实现这个项目的构建任务
const { series, parallel, src, dest, watch } = require('gulp')
// 安装sass可能会遇到python2没有的情况: npm install --global --production windows-build-tools
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const swig = require('gulp-swig')
const browserSync = require('browser-sync')
const imagemin = require('gulp-imagemin')
const del = require('del')
const loadPlugins = require('gulp-load-plugins')
// 这个plugins会包含很多glup的插件让plugins.xxx这样使用
const plugins = loadPlugins()
const bs = browserSync.create()

// 对打包html进行的配置
// 会去代替模板文件
const data = {
    menus: [
        {
            name: 'Home',
            icon: 'aperture',
            link: 'index.html'
        },
        {
            name: 'Features',
            link: 'features.html'
        },
        {
            name: 'About',
            link: 'about.html'
        },
        {
            name: 'Contact',
            link: '#',
            children: [
                {
                    name: 'Twitter',
                    link: 'https://twitter.com/w_zce'
                },
                {
                    name: 'About',
                    link: 'https://weibo.com/zceme'
                },
                {
                    name: 'divider'
                },
                {
                    name: 'About',
                    link: 'https://github.com/zce'
                }
            ]
        }
    ],
    pkg: require('./package.json'),
    date: new Date()
}

// 打包文件前先清理
const clean = () => {
    return del(['dist', 'temp'])
}

// 对scss文件进行编译成css,需要安装gulp-sass
const style = () => {
    return src('src/assets/styles/*.scss', { base: 'src' })
        .pipe(sass())
        // 因为后面还要压缩所以打包到temp
        .pipe(dest('dist'))
        // 表示会热更新到服务器使用
        .pipe(bs.reload({ stream: true }))
}

// 对js文件进行打包
// 需要安装gulp-babel @babel/core @babel/preset-env
const script = () => {
    return src('src/assets/scripts/*.js', { base: 'src' })
        .pipe(babel({ presets: ['@babel/preset-env'] }))
        // 因为后面还要压缩所以打包到temp
        .pipe(dest('temp'))
        .pipe(bs.reload({ stream: true }))
}

// 对html文件进行打包
// 需要安装gulp-swig
const page = () => {
    return src('src/*.html', { base: 'src' })
        .pipe(swig({
            data,
            // 防止模板缓存导致页面不能及时更新
            defaults: { cache: false }
        }))
        // 因为后面还要压缩所以打包到temp
        .pipe(dest('temp'))
        .pipe(bs.reload({ stream: true }))
}

// 打包图片文件和字体文件
// 需要安装gulp-imagemin
const image = () => {
    return src('src/assets/images/**', { base: 'src' })
        .pipe(imagemin())
        .pipe(dest('dist'))
}
const font = () => {
    return src('src/assets/fonts/**', { base: 'src' })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

// 服务器启动
const serve = () => {
    // 观察并热更新 
    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/*.js', script)
    watch('src/*.html', page)

    watch([
        'src/assets/images/**',
        'src/assets/fonts/**',
        'public/**'
    ], bs.reload)

    bs.init({
        notify: false,
        port: 2080,
        // open: false,
        // files: 'dist/**',
        server: {
            // 根据基本路径
            baseDir: ['temp', 'src', 'public'],
            routes: {
                // 在html使用/node_modules的时候会用node_modules替换
                '/node_modules': 'node_modules'
            }
        }
    })
}

// 这里主要是对打包过后的代码进行压缩
// 对应的plugins都需要安装gulp-xxx 驼峰要转换为下划线如:cleanCss <=> gulp-clean-css
const useref = () => {
    return src('temp/*.html', { base: 'temp' })
        // 这里表示对temp的文件进行压缩 
        .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
        // 根据情况进行压缩
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            // 对空白字符过滤
            collapseWhitespace: true,
            // 对css进行压缩
            minifyCSS: true,
            // 对js进行压缩
            minifyJS: true
        })))
        .pipe(dest('dist'))
}

// 输出public里面的静态文件
const extra = () => {
    return src('public/**', { base: 'public' })
        .pipe(dest('dist'))
}

// 不管是服务器启动还是打包都需要对这三个东西进行打包
const compile = parallel(style, script, page)

// series为同步等待执行, parallel为异步执行
const build = series(
    clean,
    parallel(
        series(compile, useref),
        image,
        font,
        extra
    )
)


const develop = series(compile, serve)

module.exports = {
    build,
    develop
}

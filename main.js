/**
 * index.js :webpack入口文件
 * 
 * 1、运行指令：
 * 开发环境：webpack ./src/index.js -o ./build/built.js --mode=development
 * webpack会以 ./src/index/js 为入口文件开始打包，打包后输出到 ./build/built.js
 * 整体打包环境，是开发环境
 * 
 * 生产环境：webpack ./src/index.js -o ./build --mode=production
 * webpack会以 ./src/index/js 为入口文件开始打包，打包后输出到 ./build/built.js
 * 整体打包环境，是生产环境
 * 
 * 2、结论：
 * 1、webpack能处理js/json资源,不能处理css/img等其他资源
 * 2、生产环境和开发环境将es6模块化编译成浏览器能识别的模块化
 * 3、生产环境比开发环境多一个压缩js代码功能
 */

import './src/css/index.css'
import './src/css/a.css'
import './src/css/index.less'
import './src/font/iconfont.css'
import data from './src/data.json'
function add (x, y) {
    return x + y;
}
let h1 = document.createElement('h1');
h1.innerHTML = data.name + add(1, 2);
document.body.appendChild(h1)
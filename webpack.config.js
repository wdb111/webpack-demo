//开发环境配置  能让代码运行
//运行命令：
// webpack 会将打包结果输出（dist文件）
// npx webpack-dev-server 只会在内存中编译打包，没有任何输出
/**
 * HMR:hot module replacement 热模块替换/模块热替换
 * 作用：一个模块发生变化，只会重新打包这一个模块（而不是打包所有模块）
 * 极大提升构建速度
 * 
 * 样式文件：可以使用HMR功能（因为style-loader内部实现了此功能）
 * js文件：默认不能使用HMR功能 --> 需要修改js代码，添加支持HMR功能的代码
 * 注意：HMR功能对js的处理，只能处理非入口js文件的其他文件
 * html文件：默认不能使用HMR功能，同时会导致问题(html文件不能热更新)（因为只有一个html文件，所以不用做HMR功能）
 * 解决：修改entry入口，将html文件引入
 */
// const path = require('path');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');//输出html
const MiniCssExtractPlugin = require('mini-css-extract-plugin');//提取css文件
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');//压缩css文件

//设置nodejs环境变量
// process.env.NODE_ENV = 'development'//默认是生产环境production

module.exports = {
    //模式
    mode: 'development',//development：开发环境 production：生产环境（js会自动压缩代码）
    devtool: 'inline-source-map', //文件错误追踪
    // 入口
    entry: ['./main.js','./index.html'],//引入html是为了让html也可以热更新
    // 输出
    output: {
        // 输出文件名
        filename: 'static/js/index.js',
        // __dirname nodejs的变量，代表当前文件的目录绝对路径
        path: resolve(__dirname, 'dist')
    },
    // loader的配置
    module: {
        rules: [
            // 处理文件顺序：从右到左，从下到上
            {
                // 匹配文件
                test: /\.css$/,
                // 使用哪些loader进行处理
                use: [
                    //创建style标签，将js中的样式资源插入进行，添加到head中生效
                    // 'style-loader',//@2版本  不提取css文件时用这个
                    MiniCssExtractPlugin.loader,//这个loader取代style-loader,提取js中的css成单独文件
                    //将css文件变成commonjs模块整合到js中，里面内容是样式字符串
                    'css-loader',//@5版本
                    /* 
                    css兼容性处理： postcss --> postcss-loader postcss-preset-env
                    帮postcss找到package.json中的browserslist里面的配置，通过配置加载指定的css兼容性样式
                    "browserslist": {
                        开发环境：设置node环境变量 process.env.NODE_ENV = 'development'
                        "development": [
                            "last 1 chrome version",//最近的Chrome
                            "last 1 firefox version",
                            "last 1 safari version"
                        ],
                        生产环境：默认是生产环境
                        "production": [
                            ">0.2%",
                            "not dead",
                            "not op_mini all"
                        ]
                      }
                    
                    */
                    // 使用loader的默认配置
                    // 'postcss-loader',
                    // 修改loader的配置
                    {
                        loader: 'postcss-loader',//@3版本
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                //postcss的插件
                                require('postcss-preset-env')()//@3版本
                            ]
                        }
                    }
                ],
                // options:{
                //     outputPath:'css'
                // }
            },
            {
                test: /\.less$/,
                use: [
                    //创建style标签，将js中的样式资源插入进行，添加到head中生效
                    'style-loader',//@2版本
                    //将css文件变成commonjs模块加载js中，里面内容是样式字符串
                    'css-loader',//@5版本
                    //将less文件编译成css文件
                    'less-loader'//对应@6版本
                ]
            },
            {
                test: /\.(jpg|png|gif)$/,
                // 使用一个loader
                // 下载 url-loader  file-loader
                loader: 'url-loader',
                options: {
                    // 图片大小小于8kb,就会被base64处理（此例运行之后只会在dist中生成一张图片，另外两张图片以base64的形式存在与js中）
                    // 优点：减少请求数量（减轻服务器压力）
                    // 缺点：图片体积会更大（文件请求速度更慢）
                    limit: 8 * 1024,
                    //  问题：因为url-loader默认使用es6模块化解析，而html-loader引入图片是commonjs
                    //  解析时会出现问题：[object Module]
                    //  解决：关闭url-loader的es6模块化，使用commonjs解析
                    esModule: false,
                    //给图片进行重命名
                    //[hash:10]取图片的hash的前10位
                    //[ext]取文件原来扩展名
                    name: '[hash:10].[ext]',
                    outputPath: 'static/img',
                },

            },
            {
                test: /\.html$/,
                // 处理html文件的img图片，负责引入img,从而能被url-loader处理
                loader: 'html-loader'//@1版本
            },
            // 打包其他资源（除了html/css/js以外的资源）
            {
                // 排除html、css、js等资源
                // exclude:/\.(html|css|js|json|less|jpg|png|gif)$/,
                test: /\.(woff|woff2|ttf)/,
                loader: 'file-loader',
                options: {
                    name: '[hash:10].[ext]',
                    outputPath: 'static/font'
                },

            },
            //语法检查： eslint-loader eslint
            //注意：只检查自己的源代码，第三方的库不用检查
            //设置检查规则：
            // package.json中eslintConfig中设置
            // "eslintConfig": {
            //     "extends": "airbnb-base"
            //   }
            // airbnb --> eslint-config-airbnb-base eslint eslint-pligin
            // {
            //     test: /\.js$/,
            //     excludes: /node_modules/,
            //     loader: 'eslint-loader',
            //     options: {},
            //     // 自动修复
            //     fix: true,
            // },
            /**
             * js兼容性处理：babel-loader @babel/core @babel/preset-env
             *  1.基本js兼容性处理 --> @babel/preset-env
             *  问题：只能转换基本语法,如：promise不能转换
             *  2.全部js兼容性处理 --> @babel/polyfill
             *  问题：只需要解决部分兼容性问题，但实际将所有兼容性代码全部引入，增大了体积
             *  3.需要做兼容性处理的才做：按需加载 --> core-js
             */
            // {
            //     test:/\.js/,
            //     exclude:/node_modules/,//排除node_modules文件
            //     loader:'babel-loader',
            //     options:{
            //         //预设：指示babel做怎样的兼容性处理
            //         preset:[
            //             [
            //                 '@babel/preset-env',
            //                 {
            //                     //按需加载
            //                     useBuiltIns:'usage',
            //                 // 指定core-js版本
            //                 corejs:{
            //                     version:3
            //                 },
            //                 // 指定兼容性做到哪个版本的浏览器
            //                 targets:{
            //                     chrome:'60',
            //                     firefox:'60',
            //                     ie:'9',
            //                     safari:'10',
            //                     adge:'17'
            //                 }
            //                 }
            //             ]
            //         ]
            //     }
            // }
        ]
    },
    //plugins的配置
    plugins: [
        //默认会创建一个空的HTML，自动引入打包输出的所有资源（js、css）
        //需要有结构的HTML文件
        new HtmlWebpackPlugin(//@3版本
            {
                //复制 ‘./src/index.html’文件，并自动引入打包输出的所有资源(js、css)
                template: './index.html',
                // filename:'test.html',//文件名，默认是index.html
                // title:'自定义标题',//不使用HTML模块时生效
                // inject: 'head' //输出的js资源在文档中插入的位置，默认在body中；有true，false，body，head四个取值
                // 压缩html代码
                // minify:{
                //     //移除空格
                //     collapseWhitespace:true,
                //     //移除注释
                //     removeComments:true
                // }
            }
        ),
        new MiniCssExtractPlugin({
            filename: 'static/css/index.css'//对输出的css文件重命名
        }),//@1版本
        //压缩css
        new OptimizeCssAssetsWebpackPlugin()

    ],
    //开发服务器 devServer:用来自动化（自动编译，自动打开浏览器，自动刷新浏览器~~）
    //特点:只会在内存中编译打包，不会有任何输出(用此方法启动就不会生成dist文件，webpack命令启动会生成dist)
    //启动devServer指令为：npx webpack-dev-server
    // 注意：将webpack webpack-cli@3 webpack-dev-server安装在生产环境中，不要全局安装，会报错
    devServer: {
        contentBase: resolve(__dirname, 'build'),
        //启动gzip压缩
        compress: true,
        // 端口号
        port: 3001,
        // 自动打开浏览器
        open: true,
        // contentBase: './dist',
        hot: true //启用模块热替换
    },

}
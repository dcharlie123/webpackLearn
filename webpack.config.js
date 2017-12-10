// https://www.cnblogs.com/libin-1/p/6596810.html
const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin')
const cleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlCriticalPlugin = require('html-critical-webpack-plugin')
module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/js/app.js'),
        vendor: ['jquery']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[chunkhash].[name].js' //注：hash名称都会变，但是chunkhash只有对应模块变化才变
    },
    resolve: {
        extensions: ['.js', '.json'], //自动解析确定的拓展名,使导入模块时不带拓展名
        alias: { // 创建import或require的别名
            '$': 'jquery'
        }
    },
    devServer: {
        //compress: true, //压缩
        port: 3000, //端口号
        inline: true, //热更新类型
        overlay: { //把警告和错误显示在浏览器中
            warnings: true,
            errors: true
        }
    },
    module: {
        rules: [{
                test: /\.(less|css)$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [{
                            loader: "css-loader",
                            options: {
                                importLoaders: 1//解决css-loader处理文件导入方式导致的postcss-loader不能正常使用的问题
                            }
                        },
                        {
                            loader: "postcss-loader"//autoprefixer
                        },
                        {
                            loader: "less-loader"
                        }
                    ]
                })
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [{
                        loader: 'url-loader',
                        options: {
                            //publicPath:'',//指定打包后的路径
                            name: '[name].[ext]',
                            outputPath: '/image/', //指定输出路径
                            //useRelativePath: true, //使用相对路径
                            limit: 10240 //限制图片大小,小于限制被转化成base64
                        }
                    },
                    {
                        loader: "image-webpack-loader",
                        options: {
                            mozjpeg: { //对图片压缩程度设置
                                progressive: true,
                                quality: 65
                            }
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                //http://www.css88.com/doc/webpack2/loaders/babel-loader/
                use: [{
                    loader: "babel-loader"
                }],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env': env //配置全局环境为生产环境
        // }),
        //生成js自动插入html模板
        new htmlWebpackPlugin({
            template: 'index.html', //根目录下的index.html模板
            filename: 'index.html', //新生成的文件名称
            inject: true, //注入的js文件将会被放在body标签中,当值为'head'时，将被放在head标签中
            minify: { //压缩配置
                removeComments: true, //删除html中的注释代码
                collapseWhitespace: true, //删除html中的空白符
                removeAttributeQuotes: true //删除html元素中属性的引号
            },
            chunksSortMode: 'dependency' //按dependency的顺序引入
        }),
        //每次编译前自动清除dist文件下重复的文件
        new cleanWebpackPlugin(['dist'], {
            root: __dirname, //指定插件根目录位置
            verbose: true, //开启在控制台输出信息
            dry: false //启用删除文件
        }),
        //分离css
        new ExtractTextPlugin("css/[name].css"),//分离出的css文件名
        //启用js压缩
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
            //sourceMap: true //生成sourceMap文件
        }),
        //压缩提取的css代码
        new OptimizeCSSPlugin({ 
            cssProcessorOptions: {
                safe: true
            }
        }),
        //https://doc.webpack-china.org/configuration/externals/
        new webpack.ProvidePlugin({
            "$": "jquery",
            "jQuery": "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.optimize.CommonsChunkPlugin({ //vendor抽取第三方库，runtime将每次打包会更改的东西单独提取
            name: ["vendor", "runtime"],
            minChunks: Infinity
        }),
        new webpack.optimize.CommonsChunkPlugin({ //对公共部分进行合并
            name: "commons",
            filename: 'commons.[chuckhash:4].js',
            minChunks: 3
        }),
        new webpack.optimize.CommonsChunkPlugin({ //对公共部分进行合并
            children: true,
            minChunks: 3
        }),
        // new HtmlCriticalPlugin({
        //     base: path.join(path.resolve(__dirname), '/'),
        //     src: 'index.html',
        //     dest: 'index.html',
        //     inline: true,
        //     minify: true,
        //     extract: true,
        //     width: 375,
        //     height: 565,
        //     penthouse: {
        //         blockJSRequests: false,
        //     }
        // })
    ]
}
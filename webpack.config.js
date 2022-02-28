const path = require('path');
const HTML = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const getHost = require('get-host');

const { CleanWebpackPlugin: CleanWebpack } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        polyfill: '@babel/polyfill',
        app: path.resolve('src/index')
    },
    output: {
        path: path.resolve('dist'),
        filename: `js/[name].[hash:8].js`
    },
    resolve: {
        alias: {
            '@games': path.resolve(__dirname, 'games'),
            '@src': path.resolve(__dirname, 'src'),
            '@base': path.resolve(__dirname, 'base')
        },
        extensions: ['.tsx', '.ts', '.js', '.json'],
        modules: [path.resolve('node_modules')]
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                exclude: [
                    path.resolve('node_modules')
                ],
                use: [{
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    },
                }],
            },
            {
                test: /\.(json|csv)$/,
                type: 'javascript/auto',
                use: [
                    {
                        loader: `file-loader`,
                        options: {
                            esModule: false,
                            name: `datas/[name].[hash:4].[ext]`,
                        },
                    },
                ],
            },
            {
                test: /\.(css)$/,
                type: 'javascript/auto',
                use: [{
                    loader: `file-loader`,
                    options: {
                        name: `assets/[name].[hash:4].[ext]`,
                        esModule: false
                    },
                }]
            },
            {
                test: /\.(atlas)$/,
                type: 'javascript/auto',
                use: [
                    {
                        loader: `file-loader`,
                        options: {
                            name: `images/[name].[hash:4].[ext]`,
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test:/(ttf_bmf_0.png)$/,
                use:[{
                    loader: 'file-loader',
                    options: {
                        esModule: false,
                        name: 'fonts/[name].[ext]'
                    }
                }]
            },
            {
                test: /\.(svg|png|gif|jpe?g)$/,
                exclude: /(ttf_bmf_0.png)$/,
                use: [{
                    loader: `file-loader`,
                    options: {
                        limit: 0,
                        esModule: false,
                        name: `images/[name].[hash:4].[ext]`
                    }
                }]
            },
            {
                test: /\.(mp3|mp4)$/,
                use: [{
                    loader: `file-loader`,
                    options: {
                        limit: 5120,
                        esModule: false,
                        name: `audio/[name].[hash:4].[ext]`
                    }
                }]
            },
            {
                test:/\.(fnt)$/,
                use:[{
                    loader: 'file-loader',
                    options: {
                        esModule: false,
                        name: 'fonts/[name].[ext]'
                    }
                }]
            }
        ]
    },
    plugins: [
        new WebpackBar(),
        new CleanWebpack(),
        new HTML({
            filename: `index.html`,
            template: `src/template/index.html`
        })
    ],
    devtool: 'cheap-module-source-map',
    devServer: {
        compress: true,
        writeToDisk: true,
        contentBase: path.resolve(__dirname, 'dist'),
        contentBasePublicPath: [
            ''
        ],
        host: getHost(),
        port: 8000,
        disableHostCheck: true,
        watchContentBase: false,
        open: true,
        overlay: true,
    }
}
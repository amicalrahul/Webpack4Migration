'use strict';
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const SuppressChunksPlugin = require('suppress-chunks-webpack-plugin').default;
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

//Initialize PLUGINS
const MiniCssPlugin = new MiniCssExtractPlugin({
    filename: 'assets/css/[name].css'
});

// cleans 'dist' folder everytime before a new build
//not required but nice to start with clean folder
const CleanPLugin = new CleanWebpackPlugin(
    ['./dist/js', './dist/css'], {
        verbose: false,
        dry: false
    });
module.exports = (env) => {

    //Define variables
    const isDev = env === 'development';
    const jsIdentifier = './assets/js/[name].js';
    const plugins = isDev ? [CleanPLugin, MiniCssPlugin, new BundleAnalyzerPlugin()] : [CleanPLugin, MiniCssPlugin];
   
    // build WEBPACK config
    const config = {};
    config.mode = env;
    config.watch = isDev;
    config.resolve = {
        extensions: ['.js', '.jsx']
    };
    config.devtool = 'source-map';
    config.entry =
        {
            'angularapp.min': './angularapp/app.js',
            sassStyle: './assets/scss/main.scss',
            lessStyle: './assets/less/main.less',
            'reactapp.min': './reactapp/index.js'
        };
    config.output = {
        path: __dirname,
        filename: jsIdentifier,
        chunkFilename: jsIdentifier
    };
    // you can get more information about the splitchunks plugin from webpack site.
    // this plugin is very powerful as you can define more than one entries inside cacheGroups
    // and further split the vendor chunks in as many small bundles as you want depending upon the 'test' value
    config.optimization = {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor.min',
                    chunks: 'initial'
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                sourceMap: isDev,
                cache: true,
                parallel: true,
                terserOptions: {
                    mangle: false,
                    keep_classnames: true,
                    keep_fnames: true,
                    output: {
                        comments: false
                    }
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    };
    config.plugins = plugins;config.module = {
        rules: [
            {
                test: /\.(js|jsx)$/, exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015', 'react', 'stage-3']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader", options: {
                            sourceMap: true
                        }
                    },
                    'postcss-loader',
                    {
                        loader: "sass-loader", options: {
                            sourceMap: true
                        }
                    }]
            },
            { // less loader for webpack
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader']
            }
        ]
    };
    return config;
};
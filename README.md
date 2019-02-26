# Webpack4Migration

<h2>Introduction</h2>

<p>Migrating from Webpack 3 to Webpack 4 is a very cumbersome process. I went through many articles and blogs to find a nice, easy and quick way of doing it. However, I could not find one single article that explains everything and lists out the pain points of migration. So, I decided to write something to help other fellow developers who are considering the upgrade in the near future.</p>

<h2>Background</h2>

<p>The first question is why do we need to upgrade to webpack 4. I am sure there are tons of articles over the internet to explain the benefits. So, I am skipping this part.</p>

<p>I&#39;ll explain upgrade of react/angular/other js bundles, less/Scss bundles. I am sure that once you get a handle on these assets, fonts/images are going to be a cakewalk.</p>

<h2>Using the Code</h2>

<p>Few things to consider before starting the migration are listed below:</p>

<ol>
	<li>Update the <code>npm</code> version. It should be greater than <code>8.9.0</code>. Run command <code>npm -v</code> to check the current version and to upgrade on Windows machine - just download node msi from <a href="https://nodejs.org/dist/v10.15.1/node-v10.15.1-x64.msi">here</a>. For mac/linux, visit nodejs site and follow upgrade steps from there.</li>
	<li>Start with a new <em>webpack.config.js</em> file. It&#39;s always good to start from scratch and gradually do the migration with one asset type at a time. Rename the existing <em>webpack.config.js</em> file to <em>webpack_old.config.js</em>.</li>
	<li>Always try to use <code>webpack-bundle-analyzer</code> during migration to visualize which bundle file contains what packages. It helps in deciding which bundle to group in what chunk, therefore helps in optimising the chunks.</li>
	<li>Webpack 4 does not use <code>extract-text-css-plugin</code>, <code>common-chunks-plugin</code>, <code>uglify-js-plugin </code>(this works with earlier versions of webpack 4, not with the latest), so just get rid of these plugins. The alternate to these are mini-css-extract-plugin, <code>splitChunksplugin </code>(inbuilt in webpack 4) and <code>terser-webpack-plugin</code> consecutively.</li>
	<li>For the <code>sass/scss</code> transformation, you will need to add a <em>postcss.config.js</em> file inside your <em>root</em> folder. I&#39;ll attach this file for reference:
	<pre lang="jscript">
//
// <strong>postcss.config.js</strong>
// 
module.exports = {
    plugins: [
        require(&#39;autoprefixer&#39;)
    ]
}</pre>
	</li>
	<li>Try to start with modifying the <em>package.json</em> file first, then update all the required migration packages.</li>
	<li>I got some error related to <code>cosmiconfig</code>. So, I had to include this package inside <em>package.json</em> file.</li>
</ol>

<p>The package json should have minimum of these packages to run the webpack 4 for <em>js/jsx/css/less/scss</em> files.</p>

<h2>Package.json</h2>

<pre lang="jscript">
//
// minimum packages required to start with webpack 4 - define in package.json file
// 
    &quot;autoprefixer&quot;: &quot;^9.4.7&quot;,
    &quot;babel-core&quot;: &quot;^6.26.3&quot;,
    &quot;babel-loader&quot;: &quot;7.1.2&quot;,
    &quot;babel-polyfill&quot;: &quot;6.26.0&quot;,
    &quot;babel-preset-env&quot;: &quot;1.6.1&quot;,
    &quot;babel-preset-es2015&quot;: &quot;^6.24.1&quot;,
    &quot;babel-preset-react&quot;: &quot;6.24.1&quot;,
    &quot;babel-preset-stage-3&quot;: &quot;6.24.1&quot;,
    &quot;clean-webpack-plugin&quot;: &quot;^0.1.16&quot;,
    &quot;cosmiconfig&quot;: &quot;4.0.0&quot;,
    &quot;less&quot;: &quot;^3.9.0&quot;,
    &quot;less-loader&quot;: &quot;4.1.0&quot;,
    &quot;mini-css-extract-plugin&quot;: &quot;0.5.0&quot;,
    &quot;node-sass&quot;: &quot;4.11.0&quot;,
    &quot;npm&quot;: &quot;^5.8.0&quot;,
    &quot;optimize-css-assets-webpack-plugin&quot;: &quot;^5.0.1&quot;,
    &quot;postcss-loader&quot;: &quot;3.0.0&quot;,
    &quot;sass-loader&quot;: &quot;7.1.0&quot;,
    &quot;style-loader&quot;: &quot;0.23.1&quot;,
    &quot;suppress-chunks-webpack-plugin&quot;: &quot;0.0.4&quot;,
    &quot;terser-webpack-plugin&quot;: &quot;1.1.0&quot;,
    &quot;toastr&quot;: &quot;^2.1.4&quot;,
    &quot;webpack&quot;: &quot;4.29.0&quot;,
    &quot;webpack-bundle-analyzer&quot;: &quot;^3.0.4&quot;,
    &quot;webpack-cli&quot;: &quot;3.2.3&quot;,</pre>

<h2>Webpack.config.js</h2>

<p>Define the <code>const</code> at the top in <em>webpack.config.js</em> file:</p>

<pre lang="jscript">
&#39;use strict&#39;;
const path = require(&#39;path&#39;);
const MiniCssExtractPlugin = require(&quot;mini-css-extract-plugin&quot;);
const SuppressChunksPlugin = require(&#39;suppress-chunks-webpack-plugin&#39;).default;
const OptimizeCSSAssetsPlugin = require(&quot;optimize-css-assets-webpack-plugin&quot;);
const BundleAnalyzerPlugin = require(&#39;webpack-bundle-analyzer&#39;).BundleAnalyzerPlugin;
const TerserPlugin = require(&#39;terser-webpack-plugin&#39;);

//Initialize PLUGINS
const MiniCssPlugin = new MiniCssExtractPlugin({
    filename: &#39;assets/css/[name].css&#39;
});

// cleans &#39;dist&#39; folder every time before a new build
//not required but nice to start with clean folder
const CleanPLugin = new CleanWebpackPlugin(
    [&#39;./dist/js&#39;, &#39;./dist/css&#39;], {
        verbose: false,
        dry: false
    });</pre>

<p>Start with webpack module export and then define the <code>config</code> entries inside as follows:</p>

<pre lang="jscript">
module.exports = (env) =&gt; {

    //Define variables
    const isDev = env === &#39;development&#39;;
    const jsIdentifier = &#39;./assets/js/[name].js&#39;;
    const plugins = isDev ? [CleanPLugin, MiniCssPlugin, 
                    new BundleAnalyzerPlugin()] : [CleanPLugin, MiniCssPlugin];
   
    // build WEBPACK config
    const config = {};
    config.mode = env;
    config.watch = isDev;
    config.resolve = {
        extensions: [&#39;.js&#39;, &#39;.jsx&#39;]
    };
    config.devtool = &#39;source-map&#39;;
    config.entry =
        {
            &#39;angularapp.min&#39;: &#39;./angularapp/app.js&#39;,
            sassStyle: &#39;./assets/scss/main.scss&#39;,
            lessStyle: &#39;./assets/less/main.less&#39;,
            &#39;reactapp.min&#39;: &#39;./reactapp/index.js&#39;
        };
    config.output = {
        path: __dirname,
        filename: jsIdentifier,
        chunkFilename: jsIdentifier
    };
    // you can get more information about the splitchunks plugin from webpack site.
    // This plugin is very powerful as you can define more than one entry inside cacheGroups
    // and further split the vendor chunks in 
    // as many small bundles as you want depending upon the &#39;test&#39; value
    config.optimization = {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: &#39;vendor.min&#39;,
                    chunks: &#39;initial&#39;
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
                    loader: &#39;babel-loader&#39;,
                    query: {
                        presets: [&#39;es2015&#39;, &#39;react&#39;, &#39;stage-3&#39;]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader,
                    {
                        loader: &quot;css-loader&quot;, options: {
                            sourceMap: true
                        }
                    },
                    &#39;postcss-loader&#39;,
                    {
                        loader: &quot;sass-loader&quot;, options: {
                            sourceMap: true
                        }
                    }]
            },
            { // less loader for webpack
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader,
                    &#39;css-loader&#39;,
                    &#39;less-loader&#39;]
            }
        ]
    };
    return config;
};</pre>

<p>There are two ways in which you can define the production/development <code>config</code>s in webpack:</p>

<ol>
	<li>One way is using the <code>--mode production</code> (in package json command)</li>
	<li>The other, that I have used <code>--env production</code> flag (refer to the attached <em>package.json</em> file <code>build</code> scripts command)</li>
</ol>

<p>There is no right or wrong approach. It totally depends upon how you want to define the configuration inside <em>webpack.config.js</em> file.</p>

<p>And that is all you have to change to migrate to webpack 4. I have attached the <em>package.json</em> and <em>webpack.config.js</em> file for reference.</p>

<h2>Points of Interest</h2>

<p>You can learn more about Webpack 4 configuration <a href="https://webpack.js.org/configuration">here.</a></p>

<h2>History</h2>

<ul>
	<li>25<sup>th</sup> February, 2019: Initial version</li>
</ul>

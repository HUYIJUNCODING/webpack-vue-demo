## webpack4.0 + vue2.0 version-2

在实际开发中我们往往会有不同的环境，常见的就是开发环境和生产环境，根据不同的环境，往往我们的`webpack`配置是有差异的，因此就需要把不同环境的配置从 `webpack.config.js` 文件中分离出来。如何分离，请继续往下看。<br>

### webpack 分环境配置（version-2）
#### 新建配置目录
项目根目录新建 `build`文件夹，`build`目录下新建三个配置文件，分别是：`webpack.base.conf.js`(基础配置文件)、`webpack.dev.conf.js`(开发环境配置文件)、`webpack.pro.conf.js`(生产环境配置文件)。

#### 分离配置
##### 1. webpack.base.conf.js
`webpack.base.conf.js` 文件放置开发环境和生产环境`webpack`打包时候需要的公共基础配置项。

```js
<!--webpack.base.conf.js->
const path = require("path"); //node.js 里面的path模块,用于生成绝对路径
const VueLoaderPlugin = require("vue-loader/lib/plugin"); //必须导入此插件,它负责克隆定义的任何其他规则，并将它们应用于.vue文件中的相应语言块
const CopyPlugin = require("copy-webpack-plugin");//拷贝静态文件，例如.txt,.md等文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");//分离css
const ProgressBarPlugin = require("progress-bar-webpack-plugin"); //运行/打包,显示进度条

module.exports = {
  entry: path.resolve(__dirname, "../src/index.js"), //指定入口文件
  output: {
    filename: "[name].[hash].js", //导出的文件名
    path: path.resolve(__dirname, "../dist") //导出的打包后文件输出路径(必须是绝对路径)
  },
  resolve: {
    extensions: [".js", ".vue", ".scss", ".css"], //后缀名自动补全,当导入文件的时候可以省略后缀名不写
    alias: {
      vue$: "vue/dist/vue.esm.js", //精确匹配,当import Vue from 'vue'的时候引入的是vue.esm.js这个版本库而不是其他版本
      "@": path.resolve(__dirname, "../src"), //用@代替./src路径  所以就可以 import xx from ' @/xx'
      assets: path.resolve(__dirname, "../src/assets")
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          "css-loader"
        ]
      },
      {
        test: /\.scss/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: "url-loader",
          options: {
            esModule: false,
            limit: 10 * 1024, //限制图片资源大小,小于10kb的图片会以 base64 编码输出,大于的会以拷贝方式(file-loader)放到 'outputPath'指定目录下
            outputPath: "static/imgs/" //指定图片资源输入路径,不指定默认直接放到dist目录下,此时这里是 dist/static/imgs/
          }
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/ //不查找 'node_modules'目录
      },
      {
        test: /\.vue$/,
        use: "vue-loader"
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[hash].css"
    }),
    new ProgressBarPlugin(),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, "../src/static"),
        to: "static"
      }
    ])
  ]
};
```

* copy-webpack-plugin
    * 安装：`npm run copy-webpack-plugin -D`
    * 描述：
        * 这里新增了一个插件，`copy-webpack-plugin`，就是将既不是 `js` ，也不是 `css` ， `图片` 之类的静态文件，比如 `README.md`，也希望能打包到我的项目里，而这个插件就是采用拷贝的方式来将其复制进我们的打包目录。
        * from：需要拷贝的静态文件源路径
        * to：文件拷贝后输出的目标位置。
##### 2. webpack.dev.conf.js
`webpack.dev.conf.js` 文件仅存放开发环境下 `webpack`打包时候/运行项目的 `webpack` 配置项。依然先 bia 代码，再进行说明。

```js
const path = require("path");
const merge = require("webpack-merge");//合并配置项的方法
const base = require("./webpack.base.conf");//基础配置项
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //自动生成html
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin"); //可以识别某些类的webpack错误，并清除，汇总并确定优先级。

const devWebpackConfig = merge(base, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    host: "localhost", //用于配置 DevServer 服务监听的地址,想要局域网中的其它设备访问你本地的服务,请配置为 0.0.0.0,默认只有本地可以访问
    port: 8000, //访问端口号,默认8080,如果被占用,会自动更换
    quiet: true, // necessary for FriendlyErrorsPlugin
    compress: true, //启用压缩
    open: false //自动打开浏览器
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), //模块热替换,当更新代码时候自动编译,无需手动更新,一般配合webpack-dev-server 使用

    new HtmlWebpackPlugin({
      template: "./index.html", //模板文件
      filename: "index.html", //文件名
      inject: true // true || 'head' || 'body' || false,注入资源到给定的html模板文件,如果为true或者body,则将所有js文件都将放置在body元素的底部
    })
  ],
  devtool: "source-map" //在浏览器端调试方便,可以直接看源码
});

module.exports = new Promise(resolve => {
  const host = devWebpackConfig.devServer.host;
  const port = devWebpackConfig.devServer.port;
  devWebpackConfig.plugins.push(
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`Your application is running here: http://${host}:${port}`]
      },
      onErrors: function(severity, errors) {
        // You can listen to errors transformed and prioritized by the plugin
        // severity can be 'error' or 'warning'
      }
    })
  );
  resolve(devWebpackConfig);
});

```
* webpack-merge
    * 安装：`webpack`内置，因此无需单独安装。
    * 描述：`webpack-merge` 是`webpack`提供的一个可以合并对象/数组并生成新的对象的方法。因此我们这里可以借助该方法，将 `webpack.base.conf.js`暴露的基础配置对象合并进来。

* friendly-errors-webpack-plugin
    * 安装： npm i -D friendly-errors-webpack-plugin
    * 描述：
        * 可以识别某些类的webpack错误，并清除，汇总并确定优先级。简单讲，就是一个捕获并收集打包编译过程中发生的错误，并给出提示的插件。这里我们用它来在编辑器控制台显示当前项目在浏览器端的访问地址(vue-cli中那样) <br>
        例如：
        ![](https://user-gold-cdn.xitu.io/2020/1/15/16fa6dde9ca50f4c?w=476&h=158&f=png&s=4562)<br>

        * 配置该插件时候需要注意两点：<br>
            1. 为了引用到当前文件中配置的主机号和端口号，因此需要改写下 `module.exports` 导出配置的写法，这里我们使用导出 `Promise` 对象，具体使用请看上方的代码。或者参考官方文档。<br>
            2. 除了需要在 `plugins`里注册实例，还需在 `devServer` 里面添加 ` quiet: true`，固定用法。
            

##### 3. webpack.pro.conf.js
`webpack.pro.conf.js` 文件仅存放生产环境下 `webpack`打包时候的 `webpack` 配置项。依然先 bia 代码，再进行说明。

```
const path = require("path");
const merge = require("webpack-merge"); //合并webpack options
const base = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //自动生成html
const TerserPlugin = require("terser-webpack-plugin"); //压缩js
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");//压缩css
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); //每次打包前,先清理掉之前的打包文件

module.exports = merge(base, {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html", //模板文件
      filename: "index.html", //文件名
      inject: true, // true || 'head' || 'body' || false,注入资源到给定的html模板文件,如果为true或者body,则将所有js文件都将放置在body元素的底部
      favicon: path.resolve(__dirname,'../favicon.ico'),
      //如果将minify选项设置为true（当webpack的模式为“生产”时为默认值），则将以下选项来缩小生成的HTML(压缩html资源)
      minify: {
        removeComments: true, //移除注释
        collapseWhitespace: true, //合并空格
        removeAttributeQuotes: true //移除属性双引号
      }
    }),
    new OptimizeCSSPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require("cssnano")
    }),
    new CleanWebpackPlugin()
  ]
});

```
* terser-webpack-plugin
    * 安装：`npm i -D terser-webpack-plugin`
    * 描述：
        * 该插件用来压缩 `js` 代码，使用它而舍弃 `uglifyjs-webpack-plugin` 插件的最大一个原因就是支持 `es6` 语法，而 ``uglifyjs-webpack-plugin`不支持，对就是这么任性。 
        * 该插件的配置方式有点特别，不是注册在 `plugins`中，而是在 `optimization`中，关于 `optimization`，看官方文档的描述为优化，是一个对象，然后对象里面可以手动配置重写一些优化项和策略。感觉比较高深，我就浅尝辄止，将`TerserPlugin`插件相关的优化项写进来。
        
        ```js
        <!--webpack.pro.conf.js-->
         optimization: {
            minimize: true, //告知 webpack 使用 TerserPlugin 压缩 打包后的js文件
            minimizer: [new TerserPlugin()], //允许通过提供一个或多个定制过的 TerserPlugin 实例，覆盖默认压缩工具(minimizer)。
        },
        ```
        
* optimize-css-assets-webpack-plugin
    * 安装：`npm i -D optimize-css-assets-webpack-plugin`
    * 描述：
        * 优化/压缩 css 的插件，使用该插件不仅压缩出来的 css 拥有很好的格式，而且压缩过程中采用的多种优化策略来保证 css 文件体积尽量的小
        * assetNameRegExp：指定要压缩优化那种类型的静态资源文件(正则表达式)
        * cssProcessor：指定压缩优化 `css` 文件时采用的那种 `css` 处理器，默认为 `cssnano`
        
        
* clean-webpack-plugin
    * 安装：`npm i -D clean-webpack-plugin`
    * 描述：
        * 该插件用于删除/清理构建文件夹(dist)，可以对比下该插件使用前后 `dist` 目录下文件差异，会发现安装前多次打包后 `dist` 目录下会保留每次打包生成的构建文件，那这样就带来一个问题，虽然我们打包次数的增加，若不手动删除dist会越来越大。这肯定不是我们想要的。因此使用该插件可以帮我们每一次重新打包前删除先前的构建文件夹。
       * 该插件的引入略有点特殊 `const { CleanWebpackPlugin } = require("clean-webpack-plugin");`,固定用法，了解即可。
       
还记得我们 `package.json` `script`属性里面的任务命令吗？对，这里现在得更改下就可以起飞了。
```js
<!--package.json-->
...
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "webpack-dev-server --config  ./build/webpack.dev.conf.js",
    "build": "webpack --config ./build/webpack.pro.conf.js"
  },
  ...
  ```
  
  `npm run dev` 和 `npm run build` 操作起来，看看此时构建过程跟构建后的文件跟之前有啥不同呢？ 嘿嘿嘿！。<br>
  
  相信能坚持看到这里的老铁绝对是真爱，所以如果您觉得对你有帮助或者内心有些许波澜，麻烦给小弟 **点个赞** 或 **star**~下，蟹蟹！<br>
  
  最后附上版本2的仓库源代码地址，有需要可以直接 `folk` [vue2.0中配置webpack4.0版本2源代码地址](https://github.com/HUYIJUNCODING/webpack-vue-demo/tree/version-2)
  
  ## 后记
  以上就是在 `vue2.0` 中从 `0 - 1` 配置 `webpack`的全部内容了，`webpack4.0`的东西非常之多，也非常之高深，作为一个前端菜鸟深知需要学习和进步的空间还很大，因此，如若有 不恰当/不准确 之处，还望路过的各位大佬多多指教。不胜感激！
  

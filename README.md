### webpack4.0 + vue2.0 version-1


## 前言
* 最近掘金上关于`webpack`的文章像是开了挂一般，疯狂的产出量着实让人望洋兴叹。这不，我这麽懒的人也都来凑个热闹，嘿嘿（黑人头像）！<br>
* 先大概说下下来到底干神马。本文默认你已经看过`webpack`官方文档或者一些基础的文章资料，说实话这方面的优质文章太多了，作为一个前端菜鸟的我就不在这里重复造轮子了，如果您还非要再去看下，得嘞，看官您这边请：[从0到1教你撸一撸webpack](https://juejin.im/post/5e05ba98518825124e13f6e1#heading-2)、[深入浅出Webpack](https://webpack.wuhaolin.cn/)、[webpack中文文档](https://www.webpackjs.com/guides/)。那咱干啥呢，请看标题【如何在vue2.0中配置webpack4.0】，对，就是这样的，我们手牵手从无到有在`vue2.0`来配置起`webpack4.0`，话不多说，走起！

### 基础构建
#### 初始化环境依赖
首先我们新建一个项目`webpack-vue-demo`，然后`npm init`或`npm init -y`初始化项目，会在根目录生成一个`package.json`文件，打开`package.json`瞅一眼，除了一些基础信息，啥也没有，别慌，没有就对了，这才称得上从无到有嘛。既然是在`vue`中配置`webpack`那项目肯定得要有`vue`环境和`webpack`环境，我们这里就都采用本地安装（安装依赖）的方式，通过两行命令来搞定：
```
npm i -S vue
npm i -D  vue-loader vue-style-loader vue-template-compiler
```
* vue-loader<br>
官方文档解释是`vue-loader` 是一个 `webpack` 的 `loader`，它允许你以一种名为单文件组件 (SFCs)的格式撰写 `Vue` 组件。这也就是`vue`中可以`.vue`文件的方式写组件的原因。`vue-loader`会将`.vue`的组件识别成三部分`template`、`script`、`style`然后再通过`webpack`配置中的其他相关`loader`将其彻底解析成浏览器可识别的`html`、`js`、`css`文件。
* vue-style-loader<br>
用于处理`vue-loader`解析后的`style`。
* vue-template-compiler<br>
把 vue-loader 提取出的 HTML 模版编译成对应的可执行的 JavaScript 代码。

```
npm i -D  webpack webpack-cli
```
这里**需要注意**的是从`webpack4.0`开始，`webpack` 和 `cli` 被分成了两个包，因此我们需要分别安装这两个依赖才可以，否则在控制台会输出提示安装`webpack-cli`，当然缺少也是打包不成功的。

至此，我们的两个必要的环境依赖安装好了，下来我们将项目的基础目录和相关基础文件搞起来。
#### 构建基础目录
项目根目录下创建`src`文件夹，`index.html`，`webpack.config.js`或`webpackfile.js`(webpack配置文件，所有的webapck配置都在这里进行)，在`src`下又分别创建`index.js`, `views`文件夹等项目所需文件,具体参考效果如下：
```
webpack-vue-demo(项目根目录)

—— src（项目源代码目录）
    —— index.js（项目打包入口文件）
    —— views(页面组件)
        —— App.vue(项目根组件)
    —— assets(图片资源目录,存放图片)
    —— components(公共组件目录)
        —— child.vue(子组件)
    —— styles(公共样式目录，存放公共，全局等一些样式表)
—— index.html（html模板）
—— webpack.config.js/webpackfile.js（webpack配置文件）
—— package.json（包管理文件）
```
#### 初始化vue(实例化，挂载等)
这部分没啥好说的，直接贴代码吧
```js
<!--App.vue-->
<template>
  <div id="app">
    <Child></Child>
  </div>
</template>

<script>
import Child from "@/components/child"; //这里可以使用@符号，是需要在webpack配置文件里面配置，后面会说到，先这样写。
export default {
  name: "App",
  data() {
    return {};
  },
  components: {
    Child
  }
};
</script>

<style scoped>
</style>
```

```js
<!--index.js-->
import Vue from 'vue'
import App from './views/App'


new Vue({
    el:'#app',
    render: h => h(App)
})
```

到此，项目基础工作已经基本落地完成，下来我们就来专注做配置的事情(这里项目还运行不起来，因为还没有webpack配置)。

### 配置 webpack（version-1）
 在配置之前，我们先稍微补充点点额外的。<br>
 
 第一：我们在启动或者打包`vue`项目的时候都是使用`npm run dev`或`npm run build`这样的命令来完成的，而这样的命令则是在`package.json`里的`scripts`中定义的。所以那到底这是为什么呢，为啥这里定义后就可以启动`webpack`打包任务呢？
 * `package.json` 里面定义的`scripts`字段(对象)是`Npm Script`的一种表现形式，也就是说`Npm Script`允许在`package.json` 文件里面使用`scripts`字段定义任务，而`Npm Script`本身就是`Npm`内置的一个功能，专门用来执行任务的。所以在 `package.json`的`scripts`对象里定义的每一个任务都是一个`npm`可执行的任务。这些任务每一个对应一段 Shell 脚本，例如定义的 `dev` 和 `build`, 其底层实现原理都是通过调用 `Shell` 去运行脚本命令，执行 `npm run build` 命令等同于执行命令 `node build.js`。又`webpack`在执行打包压缩的时候是依赖`nodejs`, so，应该明白了吧！执行`Npm Script`任务就可以启动`webpack`打包压缩程序。

第二：配置 `Webpack` 的方式有两种：
1. 通过一个 `JavaScript` 文件描述配置，例如使用 `webpack.config.js` 文件里的配置；<br>
2. 执行 `Webpack` 可执行文件时通过命令行参数传入，例如 `webpack --devtool source-map`。<br>

这两种方式可以相互搭配，例如执行 `Webpack` 时通过命令 `webpack --config webpack.config.js` 指定配置文件，再去 `webpack.config.js` 文件里描述部分配置。但是**只通过命令行参数传入的选项，这种最为少见**；顺势而为，我们该项目中会采用两种结合的方式。不过主要的配置都在`webpack.config.js`文件里面进行。<br>

**下面就开始吧！**

#### Entry
entry： **必填项**，配置输出文件的名称，为string 类型。如果只有一个输出文件，则可以把它写成静态不变的，`Webpack` 执行构建的第一步将从入口开始搜寻及递归解析出所有入口依赖的模块。（执行打包压缩的入口）
```js
<!--webpack.config.js-->
module.exports = {
    entry: "./src/index.js"
}
```
#### Output
output：**必填项**，配置如何输出最终想要的代码的出口，是一个对象，常用的属性`filename`(指定导出文件名)、`path`(配置输出文件存放在本地的目录，必须是 `string` 类型的绝对路径。通常通过 `Node.js` 的 `path` 模块去获取绝对路径)
* Tip：在配置文件中可能会很频繁遇到path.resolve(__dirname, "xxx")的语法，这个语法是 `node.js` 中 `path`模块提供的一个绝对路径解析的方法，如果想要深入了解，可以去查看 `node.js`文档，我们这里只需知道它的作用就行。当然在使用的文件中需要手动在文件顶部`require`进来才可以使用的。

```js
<!--webpack.config.js-->
const path = require("path"); //node.js 里面的path模块,这里用来解析绝对路径的
module.exports = {
    entry: "./src/index.js", //指定入口文件
    output: {
        filename: "[name].[hash].js", //导出的文件名,hash值是避免文件名缓存
        path: path.resolve(__dirname, "dist") //导出的打包后文件输出路径(必须是绝对路径)
    },
}
```
#### Loader
loader：**必填项**，模块转换器，可以理解为一个将非js模块翻译为js模块的具有文件转换功能的翻译员。因为`webpack`在进行模块打包构建时只识别`js`模块文件，那对于非`js`的类型文件需要将其进行转换成`js`类型,这就是我们项目中为啥可以正常使用图片，视频以及样式预处理器等的原因，它们都会对应有不同的`loader`来对其进行翻译转换，当然这些`loader`是需要配置才可以生效的。
* module：模块，`webpack`中一切皆模块（任何文件都看作是一个模块）
* rules：配置模块的读取和解析规则，通常用来配置Loader。其类型是一个数组，数组里每一项都描述了如何去处理部分文件
* test、include、exclude：`text` (指定应用当前 `loader` 的类型文件，这里就是所有 `.css` 后缀的文件都应用css-loader来处理)，`include`(指定去查找的目录)，`exclude` (排除不需要查找的目录)，一般 `include`和 `exclude`二选一结合 `test`使用。是缩小查询范围的一种优化手段。
* use: 配置应用的`loader`，可以是字符串、数组、对象
* loader：模块解析器，可以是字符串、数组、对象。

```
const path = require("path"); //node.js 里面的path模块,这里用来解析绝对路径的

module.exports = {
  entry: "./src/index.js", //指定入口文件
  output: {
    filename: "[name].[hash].js", //打包导出文件的文件名
    path: path.resolve(__dirname, "dist") //导出的打包后文件输出路径(必须是绝对路径)
  },
  
  module: {
    rules: [
      {
        test: /\.css$/,//指定应用当前loader的类型文件，这里就是所有.css后缀的文件都应用css-loader来解析
        use: [ "vue-style-loader", "css-loader"]
      },
      {
        test: /\.scss/,
        use: ["vue-style-loader"，"css-loader"，"sass-loader"]
      },
      {
        test: /\.(png|jpg|gif|svg|bmp)$/,
        use: {
          loader: "url-loader",
          options: {
            esModule: false,
            limit: 10 * 1024, //限制图片资源大小,小于10kb的图片会以 base64 编码输出,大于此限制值的会以拷贝方式(file-loader)放到 'outputPath'指定目录下
            outputPath: "imgs/" //指定图片资源输出路径,不指定默认直接放到dist目录下,此时这里是 dist/imgs/
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
  }
};
```
> 关于 `loader`,**需特别注意** 的是，若配置一组 `loader`，那么组内的 `loader` 是有严格的执行顺序的，不可颠倒。顺序为按照数组索引反方向（从尾部往头部）依次执行，并将当前 `loader` 解析结果传递给后一个`loader`去解析，在最后一个 `loader`，返回 webpack 所预期的 `JavaScript`。
* vue-style-loader
    * 安装：`npm i -D vue-style-loader`
    * 描述：功能类似于 `style-loader`，是将 `css-loader` 加载后的 `css`作为样式标签动态注入到文档中，是专门应用于 `vue` 模板环境下的样式表加载器。因此如果配置了 `vue-style-loader` 就不需要再配置 `style-loader`了。
* css-loader
    * 安装：`npm i -D css-loader`
    * 描述：解释 @import 和 url() ，会 import/require() 后再解析它们。通俗的讲就是 `css-loader` 会找出当前 `css` 文件中的 `@import` 和 `url()` 这样的导入语句，告诉 `Webpack` 依赖这些资源，然后同时将当前 `css`文件 解析成模块，处理完后再把结果交给 style-loader 去处理。
* sass-loader
    * 安装：`npm i -D sass-loader`
    * 描述：sass-loader 的作用就是把 `scss` 源码转换为 `css` 代码，再把 `css` 代码交给 `css-loader` 去处理。
* url-loader
   * 安装：`npm i -D url-loader`
    * 描述
        * 可以把文件的内容经过 `base64` 编码后注入到 `JavaScript`(模板中或js中引入) 或者 `css`（css中引入） 中去，一般用来加载解析图片、视频等媒体资源，但通常是处理比较小的媒体资源，例如图片，将解析后的资源注入到代码中去，但因为是采用 `base64`编码后，因此会造成代码文件过大，所以，通常会配合 `limit`属性一起使用，当超过当前 `limit`限制，则采用 `file-loader`加载解析，将资源进行拷贝。这里还有两个属性值得注意，一般需要配合使用。
        * `esModule`：默认为 `true`，表示文件加载器会生成使用 `ES` 模块语法的 `JS` 模块，如果关闭(false)，则采用 `CommonJS`模块语法来生成 `JS ` 模块,这里一定要为 `false`,是踩坑发现的，如果不关闭，则 采用 `require`方式引入的模块资源打包后不能正常显示。
        * `outputPath`：指定图片资源输出路径，不指定默认直接放到dist目录下。
* babel-loader
    * 安装：`npm i -D @babel/core @babel/plugin-transform-runtime @babel/preset-env babel-loader`
    * 描述
        * `Babel` 是一个 `JavaScript` 编译器，能将采用 `ES6` 或 `ES7` 甚至更高规范的代码转为 `ES5` 规范下的代码。为啥转换嘞，因为浏览器的支持性不好。那在项目使用过程中 通常采用配置 `loader` + **插件** 的形式来转换 `js` 代码，这里的 `loader`也就是 `babel-loader`。需要注意下，因为 `babel-loader` 执行比较耗时，因此使用`exclude`去排除无需查找的目录，比如 `node_modules`，否则默认会查找所有目录下符合要求的文件。
        * `babel-plugin-transform-runtime` 是 `Babel` 官方提供的一个插件，作用是减少冗余代码。 `Babel` 在把 `ES6` 代码转换成 `ES5` 代码时通常需要一些 `ES5` 写的辅助函数来完成新语法的实现。`babel-plugin-transform-runtime` 的作用在于不把辅助函数内容注入到文件里。
        * `presets` 属性告诉 `Babel` 要转换的源码使用了哪些新的语法特性，一个 `Presets` 对一组新语法特性提供支持，多个 `Presets` 可以叠加。 `Presets` 其实是一组 `Plugins` 的集合，每一个 `Plugin` 完成一个新语法的转换工作
        * 在 `Babel` 执行编译的过程中，会从项目根目录下的 `.babelrc` 文件读取配置。`.babelrc` 是一个 `JSON` 格式的文件，所以需要在项目根目录新建一个 `.babelrc`文件
        ```js
        <!--.babelrc-->
        {
            "presets": ["@babel/preset-env"],//设定转码规则
            "plugins": ["@babel/plugin-transform-runtime"] // transform-runtime 插件表示不管浏览器是否支持ES6，只要是ES6的语法，它都会进行转码成ES5
        }
        ```
        
        
* vue-loader
    * 安装：`npm i -D vue vue-loader vue-style-loader vue-template-compiler`
    * `Tip`：该 `loader` 的安装往往会结合 `vue`一起安装。
    * 描述：文章开头已经描述，这里就不再重复说明。
    
    
至此，项目中常用到的 `loader` 就已经全部安装及说明完毕，可能心急的小伙伴已经迫不及待想试试看一下效果，但是，这会还真不行，还差一个重要的配置项 **插件** （plugin），所以我们还得再往下继续看看。

#### Plugin
plugin：**必填项** ，插件是 `webpack` 的支柱功能，用于扩展 `Webpack` 的能力，在 `webpack` 的构建流程中，`plugin` 用于处理更多其他的一些构建任务，只要是`loader`无法实现的事，插件都可以完美的胜任。因此其地位和作用不言而喻，称得上是`webpack`中最重要的配置。格式是数组，数组中的每一项都是用来行使不同目的的插件实例（new）。

```
const path = require("path"); //node.js 里面的path模块,这里用来解析绝对路径的
const HtmlWebpackPlugin = require("html-webpack-plugin"); //自动生成html
const VueLoaderPlugin = require("vue-loader/lib/plugin"); //必须导入此插件,它负责克隆您定义的任何其他规则，并将它们应用于.vue文件中的相应语言块
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //分离css

module.exports = {
  ...
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html", //模板文件
      filename: "index.html", //文件名
      hash: true //避免缓存
    }),
    new MiniCssExtractPlugin({
      filename: "styles/[name].[hash].css", //指定分离生成的css文件名，hash为了避免缓存
    })
  ]
};

```
* vue-loader-plugin
    * 安装：在安装 `vue-loader`的时候会生成
    * 描述：将你定义过的其它规则复制并应用到 `.vue` 文件里相应语言的块。例如，如果你有一条匹配 `/\.js$/` 的规则，那么它会应用到 `.vue` 文件里的 `<script>` 块。
* html-webpack-plugin
    * 安装：`npm install -D html-webpack-plugin`
    * 描述：该插件会自动生成一个 `HTML5` 文件， 其中包括使用 `script` 标签的 `body` 中的所有 `webpack` 包，因此我们无需担心打包后的所有依赖，它会帮我们自动引入 `html` 模板中，例如（js,css），解放了双手。
        * template: 这里需要我们提前定义好一个 `html`模板文件，`template` 属性就是用来指定所使用的模板文件
        * filename： 是指定产出后的文件名，就是 `dist`目录下的那个 `html`文件名。
        * hash：避免文件缓存
* mini-css-extract-plugin
    * 安装：`npm install -D mini-css-extract-plugin`
    * 描述：
        * 该插件主要作用用来分离 `css` 代码，我们的 `css` 代码在经过 `css-loader，style-loder`解析后以字符串的形式存在于js文件中。这样随着项目的业务扩展，会导致当前js文件会越来越大，并且也会加载的很慢，所以我们这里使用 `mini-css-extract-plugin`来将每一个 `js` 文件中的 `css`代码单独分离出来，并且支持异步、按需加载。
        * 该插件的配置方式跟其余插件略有不同，除了在 `plugins`数组里注册外，还需要将 `style-loader` 或 `vue-style-loader`替换成如下的写法：
            ```
            <!--webpack.config.js-->
            
              module: {
                rules: [
                  {
                   ...
                    use: [
                      {
                        loader: MiniCssExtractPlugin.loader //分离css
                      },
                      "css-loader"
                    ]
                  },
                  {
                  ...
                    use: [
                      {
                        loader: MiniCssExtractPlugin.loader
                      },
                      "css-loader",
                      "sass-loader"
                    ]
                  },
                ]
            }
            ```
到这里，项目就可以进行打包了。只不过我们需要在 `package.json`的 `script`属性中定义下任务命令就好了。

```json
<!--package.json-->
...
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "webpack --mode development",//开发环境下打包命令
    "build": "webpack --mode production"//生产环境下打包命令
  },
```
ok,控制台运行命令 `npm run dev`或 `npm run build`会发现在项目根目录产生一个 `dist`文件夹，`dist` 文件夹下就是 `webpack`打包后的源代码，我们可以编辑器打开 `index.html`瞅一眼会发现多了一个 `<link>` 和 `<script>`标签，这就是上面提到的 `html-webpack-plugin`插件帮我们完成的。然后浏览器运行 `index.html` 文件，会发现有内容，并且正是我们开始在`child.vue` 组件里定义的东西。此时就说明打包已经成功。<br>
也许，此时的你正沉浸在喜悦中无法自拔，可是，这并不是我们想要的结果。试想下 `vue-cli`中打包项目的时候是如何的一个情景，并且当我们更改代码的时候的热更新又是如何的一个情景，所以，还需要优化。首先先整理下需要实现的几个效果
1. 本地可以运行项目，支持代码热更新、热替换
2. 项目运行或者打包可以看到进度条。<br>

好了，明确需求后，我们就来实现它。还是先贴出代码，再叙述实现吧。
```js
<!--webpack.config.js-->
...
const webpack = require("webpack"); 
const ProgressBarPlugin  = require("progress-bar-webpack-plugin") //运行/打包,显示进度条

module.exports = {
...
  devServer: {
    host: 'localhost',//开发服务器监听的主机地址
    port: 8000, //开发服务器监听的端口号，默认是 8080
    compress: true, //启用压缩
  },
  
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ProgressBarPlugin()
  ]
};

```
* webpack-dev-server
    * 安装：`npm i -D webpack-dev-server`
    * 描述：
        * 使用 `DevServer`会帮我们在本地启动一个服务，这样我们可以通过在浏览器访问服务地址来预览效果，而不用每次手动去打开 `index.html` 文件。
        * `DevServer` 它提供了一些配置项可以改变 `DevServer` 的默认行为。 要配置` DevServer` ，除了在配置文件里通过 `devServer` 传入参数外，还可以通过命令行参数传入。 注意只有在通过 `DevServer` 去启动 `Webpack` 时配置文件里 `devServer` 才会生效，因为这些参数所对应的功能都是 `DevServer` 提供的，`Webpack` 本身并不认识 `devServer` 配置项。
        ```js
        <!--webpack.config.js-->
        module.exports = {
        ...
          devServer: {
            host: 'localhost',//开发服务器监听的主机地址
            port: 8000, //开发服务器监听的端口号，默认是 8080
            compress: true, //启用压缩
          }
        };
        ```
        如果使用了命令行参数，则启动服务时会将参数写入`devServer`配置中，如果有重名，则命令行参数会覆盖配置项属性。
        
        * `DevServer`使用需要在`package.json`里的 `script`属性中配置命令：
        ```js
        <!--package.json-->
        "scripts": {
            "dev": "webpack-dev-server --open",
        },
        ```
        * `webpack-dev-server` 命令启动服务后运行的打包文件是在 **内存中**，并不在 **硬盘中**，为了验证这一点，你可以将`dist`文件夹删掉，然后重启服务，会发现并不会在项目根目录生成 `dist`文件夹，况且项目仍然可以运行。
        

* HotModuleReplacementPlugin
    * 安装：`webpack`内置的插件，因此无需单独安装。
    * 描述： 该插件是用来启用热替换模块（HMR）的，启用热替换模块的好处是当我们更改了模块文件的代码时浏览器在不刷新当前页面的情况下更新页面内容。其实实现有两种方式，除了这里的使用插件，还要就是使用命令行`webpack-dev-server --hot`,两者看心情任选其一即可。
* progress-bar-webpack-plugin
    * 安装：`npm i -D progress-bar-webpack-plugin`
    * 描述：该插件比较简单，就是一个用来显示打包进度的插件，尤其是当项目比较大的时候，打包比较耗时，显示进度会显得体验比较友好。
    
那麽现在，我们再`npm run dev`的时候就会在本地使用服务来运行当前项目，当修改模块中的代码，会自动热更新。而且还会有进度条，这样看起来就舒服多了吧。
#### Resolve
resolve：**可选项**，格式是对象，配置 `Webpack` 如何寻找模块所对应的文件。 `Webpack` 内置 `JavaScript` 模块化语法解析功能，默认会采用模块化标准里约定好的规则去寻找，但你也可以根据自己的需要修改默认的规则。修改的规则就要定义在 `resolve` 中，以下列出来几个比较常见的解析规则
```js
<!--webpack.config.js-->
...
module.exports = {
    ...
    resolve: {
      extensions: [".js", ".vue", ".scss", ".css"], //后缀名自动补全,当导入文件的时候可以省略后缀名不写
      alias: {
        vue$: "vue/dist/vue.esm.js", //精确匹配,当import Vue from 'vue'的时候引入的是vue.esm.js这个版本库而不是其他版本库
        "@": path.resolve(__dirname, "../src"), //用@代替./src路径  所以就可以 import xx from ' @/xx'
    }
    }
}

```

到现在，其实关于 `vue2.0`中配置`webpack4.0`的常用配置的知识点差不多已经说完了。那麽是时候将 `webpack.config.js`的整体代码 `bia`出来了。
```js
<!--webpack.config.js-->
const path = require("path"); //node.js 里面的path模块,这里用来解析绝对路径的
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //自动生成html
const VueLoaderPlugin = require("vue-loader/lib/plugin"); //必须导入此插件,它负责克隆您定义的任何其他规则，并将它们应用于.vue文件中的相应语言块
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //分离css
const ProgressBarPlugin  = require("progress-bar-webpack-plugin") //运行/打包,显示进度条

module.exports = {
  entry: "./src/index.js", //指定入口文件
  output: {
    filename: "[name].[hash].js", //导出的文件名
    path: path.resolve(__dirname, "dist") //导出的打包后文件输出路径(必须是绝对路径)
  },
  resolve: {
    extensions: [".js", ".vue", ".scss", ".css"], //后缀名自动补全,当导入文件的时候可以省略后缀名不写
    alias: {
      'vue$': 'vue/dist/vue.esm.js',//精确匹配,当import Vue from 'vue'的时候引入的是vue.esm.js这个版本库而不是其他版本
      "@": path.resolve(__dirname, "./src") //用@代替./src路径  所以就可以 import xx from ' @/xx'
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,//指定应用当前loader的类型文件，这里就是所有.css后缀的文件都应用css-loader来处理
        use: [
          {
            loader: MiniCssExtractPlugin.loader //分离css
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
        test: /\.(png|jpg|gif|svg|bmp)$/,
        use: {
          loader: "url-loader",
          options: {
            esModule: false,
            limit: 10* 1024, //限制图片资源大小,小于10kb的图片会以 base64 编码输出,大于10kb的会以拷贝方式(file-loader)放到 'outputPath'指定目录下
            outputPath: "imgs/" //指定图片资源输出路径,不指定默认直接放到dist目录下,此时这里是 dist/imgs/
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
  devServer: {
    host: 'localhost',//开发服务器监听的主机地址
    port: 8000, //开发服务器监听的端口号，默认是 8080
    compress: true, //启用压缩
    
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html", //模板文件
      filename: "index.html", //文件名
      hash: true //避免缓存
    }),
    new MiniCssExtractPlugin({
      filename: "styles/[name].[hash].css",
    }),
    new ProgressBarPlugin()
  ],
  devtool: "source-map" //可以直接在浏览器控制台source下查看项目未打包的源代码，在出现一些错误的时候，
  //如果不使用source-map的时候，错误无法定位到源代码中。
  //使用了source-map以后，可以直接定位到错误出现的行
};

```

同时也附上仓库源代码地址，有需要可以直接 `folk` [vue2.0中配置webpack4.0版本1源代码地址](https://github.com/HUYIJUNCODING/webpack-vue-demo/tree/version-1)

以上为版本1，难道还有版本2不成（黑人问号脸）？，对，确实还有版本2。卧槽，无情！
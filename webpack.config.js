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

const path = require("path"); //node.js 里面的path模块,用于生成绝对路径
const VueLoaderPlugin = require("vue-loader/lib/plugin"); //必须导入此插件,它负责克隆定义的任何其他规则，并将它们应用于.vue文件中的相应语言块
const CopyPlugin = require("copy-webpack-plugin"); //拷贝静态文件，例如.txt,.md等文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //分离css
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

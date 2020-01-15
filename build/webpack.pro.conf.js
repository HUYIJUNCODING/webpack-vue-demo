const path = require("path");
const merge = require("webpack-merge"); //合并webpack options
const base = require("./webpack.base.conf"); //基础配置项
const HtmlWebpackPlugin = require("html-webpack-plugin"); //自动生成html
const TerserPlugin = require("terser-webpack-plugin"); //压缩js
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");//压缩css
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); //每次打包前,先清理掉之前的打包文件

module.exports = merge(base, {
  mode: "production", //模式
  optimization: {
    minimize: true,//告知 webpack 使用 TerserPlugin 压缩 打包后的js文件
    minimizer: [new TerserPlugin()], //允许通过提供一个或多个定制过的 TerserPlugin 实例，覆盖默认压缩工具(minimizer)。
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

const path = require("path");
const merge = require("webpack-merge");//合并配置项的方法
const base = require("./webpack.base.conf");//基础配置项
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //自动生成html
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin"); //可以识别某些类的webpack错误，并清除，汇总并确定优先级。

const devWebpackConfig = merge(base, {
  mode: "development",//模式
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

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-cheap-source-map",
    devServer: {
        contentBase: "./build",
        port: 3000,
        hot: true,
        hotOnly: true
    },
});

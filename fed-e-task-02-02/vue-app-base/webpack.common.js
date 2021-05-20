const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
    entry: "./src/main.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "./dist"),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.less$/,
                // 使用MiniCssExtractPlugin.loader需要删除style-loader
                // style-loader的作用就是把编译后的css内联到html
                use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
            },
            {
                test: /\.png$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 1024,
                            fallback: "file-loader",
                            // 处理文件为[object%20Module]
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
            {
                test: /\.vue$/,
                use: "vue-loader",
            },
          {
              test: /\.vue$/,
              exclude: /node_modules/,
              use: "eslint-loader",
              enforce: "pre",
          },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            favicon: "./public/favicon.ico",
            options: {
                title: "dm",
                url: "test",
            },
        }),
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        // 抽离css
        new MiniCssExtractPlugin(),
        // 压缩抽离后的css
        new OptimizeCssAssetsPlugin(),
    ],
};

const Webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Path = require("path");

module.exports = {
    name: "website",
    entry: ["./src/website/index.tsx"],
    output: {
        filename: "bundle.js",
        path: Path.resolve(__dirname, "build")
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|build)/,
                use: ["awesome-typescript-loader"]
            }
        ]
    },

    resolve: {
        modules: [Path.resolve(__dirname, "src"), "node_modules"],
        extensions: [".js", ".ts", ".tsx"]
    },

    devtool: "source-map",

    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/website/index.html',
            inject: 'body',
        }),
        // new Webpack.DefinePlugin({
        //     'process.env': {
        //         NODE_ENV: JSON.stringify('production')
        //     }
        // }),
        // new Webpack.optimize.UglifyJsPlugin()
    ]
};

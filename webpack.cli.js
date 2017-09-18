const Path = require("path");

module.exports = {
    name: "cli",
    target: "node",
    entry: ["./src/tshark/index.ts"],
    output: {
        filename: "h2vis-cli.js",
        path: Path.resolve(__dirname, "build")
    },

    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /(node_modules|build)/,
                use: ["awesome-typescript-loader"]
            },
        ]
    },

    resolve: {
        modules: [Path.resolve(__dirname, "src"), "node_modules"],
        extensions: [".js", ".ts"]
    },

    devtool: "source-map"
};
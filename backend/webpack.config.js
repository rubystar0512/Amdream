const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./server.js", // Your entry point
  target: "node", // Target environment: Node.js
  externals: [nodeExternals()], // Ignore node_modules for faster build
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.bundle.js", // Output file
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  mode: "production", // Set to "development" for debugging
};

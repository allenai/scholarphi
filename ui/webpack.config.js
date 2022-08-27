const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = (env, argv) => {
  const mode = argv.mode;
  const devtool = mode === "development" ? "eval-source-map" : undefined;
  const proxyHost = env.PROXY
    ? env.PROXY
    : "https://s2-reader.apps.allenai.org";
  return {
    entry: {
      list: ["react-hot-loader/patch", "./src/papers/index.tsx"],
      reader: ["react-hot-loader/patch", "./src/index.tsx"],
    },
    devtool,
    module: {
      rules: [
        {
          test: /\.(less|css)$/,
          use: ["style-loader", "css-loader", "less-loader"],
        },
        {
          test: /\.[jt]sx?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(jpe?g|png|gif|woff(2)?|ttf|eot|svg)$/i,
          loader: "file-loader",
          options: {
            name: "static/media/[name].[hash:8].[ext]",
          },
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      fallback: { querystring: require.resolve("querystring-es3") },
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: "./public/viewer.html",
        templateParameters: {
          cacheBust: Math.random().toString(36).substring(7),
        },
        excludeChunks: ["list"],
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: "./public/papers/index.html",
        filename: "papers/index.html",
        excludeChunks: ["reader"],
      }),
      // This copies everything that isn't an HTML file from `public/` into the build output
      // directory.
      new CopyPlugin({
        patterns: [
          {
            from: "public/**/*",
            filter: (absPathToFile) => {
              return !absPathToFile.endsWith(".html");
            },
            // transformPath: (p) => p.replace(/^public\//, ""),
            to({ context, absoluteFilename }) {
              return absoluteFilename.replace(/^public\//, "");
            },
          },
        ],
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: path.resolve(__dirname, "./tsconfig.json"),
          // the following diagnosticOPtions and mode are necessary when using with babel
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
          mode: "write-references",
          memoryLimit: 4096,
        },
      }),
    ],
    output: {
      filename: "[name].[hash:6].js",
      path: path.resolve(__dirname, "build"),
    },
    performance: false,
    devServer: {
      compress: true,
      static: path.resolve(__dirname, "public"),
      hot: true,
      host: "0.0.0.0",
      // The `ui` host is used by the reverse proxy when requesting the UI while working locally.
      allowedHosts: ["ui"],
      historyApiFallback: true,
      port: 3001,
      proxy: {
        "/api": {
          target: proxyHost,
          secure: false,
          changeOrigin: true,
        },
      },
    },
  };
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    module: {
        rules: [
            // This allows for CSS to be included via import statements, like so:
            // `import '@allenai/varnish/dist/theme.css';`
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
              test: /\.less$/,
              loader: 'less-loader',
            },
            // This tells webpack to hand TypeScript files to the TypeScript compiler
            // before bundling them.
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: 'file-loader',
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx|css)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    plugins: [
        // This copies `public/index.html` into the build output directory.
        new HtmlWebpackPlugin({ template: 'public/index.html' }),
        // This copies everything that isn't `index.html` from `public/` into the build output
        // directory.
        new CopyPlugin({
            patterns: [
                {
                    from: 'public/**/*',
                    filter: (absPathToFile) => {
                        return absPathToFile !== path.resolve(__dirname, 'public', 'index.html');
                    },
                    transformPath: (p) => p.replace(/^public\//, ''),
                },
            ],
        }),
    ],
    output: {
        filename: 'main.[hash:6].js',
        path: path.resolve(__dirname, 'build'),
    },
    devServer: {
        hot: true,
        host: '0.0.0.0',
        // The `ui` host is used by the reverse proxy when requesting the UI while working locally.
        allowedHosts: ['ui'],
        historyApiFallback: true,
        port: 3000,
        // Apparently webpack's dev server doesn't write files to disk. This makes it hard to
        // debug the build process, as there's no way to examine the output. We change this
        // setting so that it's easier to inspect what's built. This in theory might make things
        // slower, but it's probably worth the extra nanosecond.
        writeToDisk: true,
        lazy: false,
        sockPort: 8080,
    },
};

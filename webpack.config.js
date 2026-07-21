const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => ({
    mode: argv.mode === 'production' ? 'production' : 'development',

    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === 'production' ? false : 'inline-source-map',

    entry: {
        ui: './src/ui.tsx', // The entry point for your UI code
        code: './src/code.ts', // The entry point for your plugin code
    },

    module: {
        rules: [
            // Converts TypeScript code to JavaScript
            { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
        ],
    },

    // Webpack tries these extensions for you if you omit the extension like "import './file'"
    resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
        clean: true,
    },

    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },

    // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/ui.html',
            filename: 'ui.html',
            chunks: ['ui'],
            inject: 'body',
            scriptLoading: 'blocking',
        }),
        new HtmlInlineScriptPlugin({
            scriptMatchPattern: [/ui\.js$/],
        }),
    ],
});

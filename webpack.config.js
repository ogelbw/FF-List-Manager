const path = require('path');

module.exports = {
    entry: './src/popup.jsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'popup.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devtool: 'cheap-module-source-map'
};

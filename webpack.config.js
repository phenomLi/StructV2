const path = require('path');


module.exports = {
    entry: './src/StructV.ts',
    output: {
		filename: './sv.js',
     	libraryTarget: 'umd'
    },
    resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/, 
				loader: 'awesome-typescript-loader'
			}
		]
	},
	devtool: 'eval-source-map'
};

const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
    mode: 'production',
    devtool: false,
    entry: {
        auth: './frontend/js/auth.js',
        categories: './frontend/js/categories.js',
        config: './frontend/js/config.js',
        map: './frontend/js/map.js',
        notifications: './frontend/js/notifications.js',
        reports: './frontend/js/reports.js'
    },
    output: {
        path: path.resolve(__dirname, 'frontend/js/dist'),
        filename: '[name].min.js',
        clean: true
    },
    optimization: {
        minimize: true
    },
    plugins: [
        new JavaScriptObfuscator({
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.5,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.2,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            renameGlobals: false,
            selfDefending: true,
            splitStrings: true,
            splitStringsChunkLength: 5,
            unicodeEscapeSequence: false
        }, ['config.min.js'])
    ]
};

module.exports = {
    lintOnSave: false, // 关闭语法检查
    devServer: {
        port: 5000,
        open: true,
        proxy: {
            '/api':{
                // target: 'https://api.digi-ortho.com:8443',
                target: 'https://www.digi-ortho.com',
            },
            '/teethAPI2.0d':{
                target: 'https://api.digi-ortho.com:8443',
            },
            '/oauth2.0': {
                target: 'http://localhost:8008',
            },
        }
    },
    publicPath: "/testLogin/",
    outputDir: 'testLogin',

    // publicPath: "/testDownload/",
    // outputDir: 'testDownload',
}
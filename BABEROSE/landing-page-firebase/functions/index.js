//https://medium.com/@jalalio/dynamic-og-tags-in-your-statically-firebase-hosted-polymer-app-476f18428b8b
const functions = require('firebase-functions');
const fs = require('fs')
const appConfig = require('./appConfig')

exports.host = functions.https.onRequest((req, res) => {
    const indexHTMLPath = './hosting/index.html'
    const publicID = req.path.replace('/user/',"")
    const pageTitle = appConfig.metaTitle
    const pageDescription = appConfig.metaDescription
    const OGImageUrl = `${appConfig.metaImageBaseURL}/${publicID}.gif`
    fs.readFile(indexHTMLPath, 'utf8', function (err,data) {
        if (err) {
            return console.error(err);
        }
        data = data.replace(/\$OG_TITLE/g, pageTitle)
        data = data.replace(/\$OG_DESCRIPTION/g, pageDescription)
        let result = data.replace(/\$OG_IMAGE/g, OGImageUrl)
        console.info(result)
        res.send(result)
    })
})

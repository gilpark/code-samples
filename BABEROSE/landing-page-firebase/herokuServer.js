const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const path = require('path')
const fs = require('fs')

app.use(express.static(path.resolve(__dirname, './build')))
app.get('*', function(request, response) {
    let fileName = request.path.replace('/user/',"")
    const filePath = path.resolve(__dirname, './build', 'index.html')
    fs.readFile(filePath, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        data = data.replace(/\$OG_TITLE/g, '#BABEDOESAMERICA');
        data = data.replace(/\$OG_DESCRIPTION/g, "Check out my photo from the BABE Bus");
        let result = data.replace(/\$OG_IMAGE/g, `https://res.cloudinary.com/facepaint/image/upload/pg_1/v1578079072/BABE/${fileName}.gif`);
        response.send(result)
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
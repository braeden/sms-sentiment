const express = require('express')
const xmlParser = require('./parser')
const app = express()
const port = process.env.PORT || 3000
app.use(express.static('public'))
const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.post('/upload', async (req, res) => {
    // console.log(req)
    if (!req.files || !req.files.xmlupload || Object.keys(req.files).length === 0) {
        return res.status(400).json({error: "No files were uploaded."});
    } else if (!req.files.xmlupload.mimetype.includes("xml")) {
        return res.status(400).json({error: "Incorrect filetype."});
    } else if (req.files.xmlupload.size > 1000000) {
        return res.status(400).json({error: "File too large."});
    }
    const f = req.files.xmlupload
    const parsedXML = await xmlParser.parseXML(f.data.toString())
    // console.log(parsedXML)
    if (req.body.useTFJS == 'true') {
        console.log("runnning tfjs")
        await xmlParser.addSentimentTFJS(parsedXML)
    } else {
        console.log("runnning gcp")
        await xmlParser.addSentimentGCP(parsedXML)
    }
    res.json(parsedXML)
})

app.listen(port, () => console.log(`Started at port ${port}`))
const express = require('express')
const xmlParser = require('./parser')
const app = express()
const port = process.env.PORT || 3000
app.use(express.static('public'))
const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.xmlupload || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    } else if (!req.files.xmlupload.mimetype.includes("xml")) {
        return res.status(400).send('Incorrect filetype')
    } else if (req.files.xmlupload.size > 10000) {
        return res.status(400).send('File too large')
    }

    const f = req.files.xmlupload
    console.log(f.mimetype, f.size)
    parsedXML = await xmlParser.parseXML(f.data.toString())
    console.log(parsedXML)
    await xmlParser.addSentiment(parsedXML);
    console.log(parsedXML)
    res.json(parsedXML)
})



app.get('/test', async (req, res) => {
    const parsedXML = [
        [{
                "body": "text 1",
                "date": "asdasdasasdsa"
            },
            {
                "body": "text number two",
                "date": "asdasdasasdsa"
            },
            {
                "body": "I hate you",
                "date": "asdasdasasdsa"
            }
        ],
        [{
                "body": "i like you and i want to go home",
                "date": "asdasdasasdsa"
            },
            {
                "body": "yeet is a nice word plus ect",
                "date": "asdasdasasdsa"
            },
            {
                "body": "hello this is a test",
                "date": "asdasdasasdsa"
            }
        ]
    ]

    sentimentAnalysis(parsedXML)
    console.log(parsedXML);
    res.send("hello")
});

app.listen(port, () => console.log(`Started at port ${port}`))
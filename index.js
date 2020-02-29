const express = require('express')
const xmlParser = require('./parser')
const app = express()
const port = process.env.PORT || 3000
app.use(express.static('public'))
const fileUpload = require('express-fileupload');
app.use(fileUpload());
const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();



// const text = 'I hate you tyler! I love you tyler.';

// const document = {
//     content: text,
//     type: 'PLAIN_TEXT',
// };
app.post('/test', async (req, res) => {
    if (!req.files || !req.files.xmlupload || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    } else if (!req.files.xmlupload.mimetype.includes("xml")) {
        return res.status(400).send('Incorrect filetype')
    }
    const f = req.files.xmlupload
    console.log(f.mimetype, f.size)
    console.log(await xmlParser.parseXML(f.data.toString()))
    // parser.parse(f.data)
    res.send('yeet')
})

async function sentimentAnalysis(parsedXML) {


    const sentencesArray = []
    parsedXML.forEach((userEntry) => {
        userEntry.forEach((textObject) => {
            sentencesArray.push(textObject.body)
        })
    })
    const combinedSentences = sentencesArray.join(". ")

    const [result] = await client.analyzeSentiment({
        document: {
            content: combinedSentences,
            type: 'PLAIN_TEXT'
        }
    });
    const sentiments = result.sentences.map((result) => {
        return result.sentiment.score;
    })
    let i = 0;
    parsedXML.forEach((userEntry) => {
        userEntry.forEach((textObject) => {
            textObject["score"] = sentiments[i]
            i++;
        })
    })
}


app.get('/upload', async (req, res) => {
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
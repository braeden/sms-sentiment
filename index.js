const express = require('express')
const app = express()
const port = process.env.PORT || 3000
app.use(express.static('public'))
const fileUpload = require('express-fileupload');
app.use(fileUpload());
const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();
const parser = require('fast-xml-parser');



const text = 'I hate you tyler! I love you tyler.';

const document = {
    content: text,
    type: 'PLAIN_TEXT',
};


app.get('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const parsedXML = await parseXML(req.files.xmlupload)



    req.files.
    const
    // res.redirect("/index.html")

    const [result] = await client.analyzeSentiment({
        document: document
    });
    console.log(result)
    result.sentences.forEach((obj) => {
        console.log(obj.sentiment, obj.text)
    })
    res.send("hello")
    // const sentiment = result.sentences;
    // console.log(`Text: ${text}`);
    // console.log(`Sentiment score: ${sentiment.score}`);
    // console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
});

// async function parseXML(f) {
    
// }

app.listen(port, () => console.log(`Started at port ${port}`))
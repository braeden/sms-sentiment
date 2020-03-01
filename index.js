const express = require('express')
const xmlParser = require('./parser')
const app = express()
const port = process.env.PORT || 3000
app.use(express.static('public'))
const fileUpload = require('express-fileupload');
app.use(fileUpload());
const tf = require("@tensorflow/tfjs");
const fetch = require("node-fetch");



app.post('/upload', async (req, res) => {
    // console.log(req)
    if (!req.files || !req.files.xmlupload || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    } else if (!req.files.xmlupload.mimetype.includes("xml")) {
        return res.status(400).send('Incorrect filetype')
    } else if (req.files.xmlupload.size > 10000000) {
        return res.status(400).send('File too large')
    }

    const f = req.files.xmlupload
    console.log("checkbox", req.body.useTFJS)
    console.log(f.mimetype, f.size)
    parsedXML = await xmlParser.parseXML(f.data.toString())
    // console.log(parsedXML)
    if (req.body.useTFJS == 'true') {
        console.log("runnning tfjs")

        await xmlParser.addSentimentTFJS(parsedXML)
    } else {
        console.log("runnning gcp")
        await xmlParser.addSentimentGCP(parsedXML)
    }
    // console.log(parsedXML)
    res.json(parsedXML)
})

// const getMetaData = async () => {
//     //https://www.twilio.com/blog/how-positive-was-your-year-with-tensorflow-js-and-twilio
//     const metadata = await fetch("https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json")
//     return metadata.json()
// }

// const loadModel = async () => {
//     const url = `https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json`;
//     const model = await tf.loadLayersModel(url);
//     return model;
// };

// app.get('/test', async (req, res) => {
//     const parsedXML = [
//         [{
//                 "body": "text 1",
//                 "date": "asdasdasasdsa"
//             },
//             {
//                 "body": "text number two",
//                 "date": "asdasdasasdsa"
//             },
//             {
//                 "body": "I hate you",
//                 "date": "asdasdasasdsa"
//             }
//         ],
//         [{
//                 "body": "i like you and i want to go home",
//                 "date": "asdasdasasdsa"
//             },
//             {
//                 "body": "yeet is a nice word plus ect",
//                 "date": "asdasdasasdsa"
//             },
//             {
//                 "body": "hello this is a test",
//                 "date": "asdasdasasdsa"
//             }
//         ]
//     ]

//     sentimentAnalysis(parsedXML)
//     console.log(parsedXML);
//     res.send("hello")
// });

app.listen(port, () => console.log(`Started at port ${port}`))
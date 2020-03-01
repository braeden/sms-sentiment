require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');
const parser = require('fast-xml-parser');
const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();



module.exports = {
    parseXML: async function parseXML(f) {
        if (parser.validate(f) === true) {
            const options = {
                attributeNamePrefix: "",
                attrNodeName: false, //default is 'false'
                textNodeName: "",
                ignoreAttributes: false,
                ignoreNameSpace: false,
                allowBooleanAttributes: false,
                parseNodeValue: false,
                parseAttributeValue: true,
                trimValues: true,
                cdataTagName: false, //default is 'false'
                cdataPositionChar: "\\c",
                parseTrueNumberOnly: false,
                arrayMode: false, //"strict"
                stopNodes: []
            };
            const jsonObj = parser.parse(f, options);

            const messages = jsonObj.smses.sms;

            let jsonArr = [];

            messages.forEach(messageMeta => {
                let body = messageMeta.body.toString() || ''
                body = body.replace(/(\?|\.|&#[0-9]+;|\!)/gm, '')
                // body = body.replace(/\./gm,, '');
                // body = body.replace(/\!/g, '');
                // body = body.replace(/\&\#.*;/g, '');
                // body = body.replace(/\?/g, '');

                if (body && body != '') {
                    let date = messageMeta.date
                    const type = messageMeta.type - 1
                    while (jsonArr.length <= type) {
                        jsonArr.push([])
                    }
                    let senderArr = jsonArr[type]
                    let messageData = {
                        body: body,
                        date: date.toString()
                    }
                    senderArr.push(messageData)
                }
            });
            return jsonArr;
        }
    },
    addSentimentGCP: async (parsedXML) => {
        const sentencesArray = getSentencesArray(parsedXML)
        const combinedSentences = sentencesArray.join(". ") + "."

        const [result] = await client.analyzeSentiment({
            document: {
                content: combinedSentences,
                type: 'PLAIN_TEXT'
            }
        });
        let sentimentsObj = {}
        const sentiments = result.sentences.forEach((sentence) => {
            // console.log("Sentence: ", sentence.text.content.replace(". ", ""))

            sentimentsObj[sentence.text.content.replace(".", "")] = sentence.sentiment.score;
        })
        parsedXML.forEach((userEntry) => {
            userEntry.forEach((textObject) => {
                textObject.score = sentimentsObj[textObject.body]
                if (textObject.score == undefined) {
                    console.log("error finding: ", textObject.body)
                }
            })
        })
    },
    addSentimentTFJS: async (parsedXML) => {
        const sentencesArray = getSentencesArray(parsedXML)
        //identity_attack, insult, obscene, severe_toxicity, sexual_explicit, threat, toxicity,
        const model = await toxicity.load(0.5, ['toxicity']);
        const [predictions] = await model.classify(sentencesArray)
        const sentiments = predictions.results.map((e) => {
            return e.probabilities[1]
        })
        pushSentiments(parsedXML, sentiments)
    }
}

const getSentencesArray = (parsedXML) => {
    const sentencesArray = []
    parsedXML.forEach((userEntry) => {
        userEntry.forEach((textObject) => {
            sentencesArray.push(textObject.body)
        })
    })
    return sentencesArray;
}

const pushSentiments = (parsedXML, sentiments) => {
    let i = 0;
    parsedXML.forEach((userEntry) => {
        userEntry.forEach((textObject) => {
            textObject["score"] = sentiments[i]
            i++;
        })
    })
}
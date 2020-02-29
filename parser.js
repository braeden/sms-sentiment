const parser = require('fast-xml-parser');

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
                let body = messageMeta.body
                body = body.replace(/\./g, '');

                let date = messageMeta.date
                let type = messageMeta.type - 1
                while (jsonArr.length <= type) {
                    jsonArr.push([])
                }
                let senderArr = jsonArr[type]
                let messageData = {}
                messageData["body"] = body
                messageData["date"] = date.toString()
                senderArr.push(messageData)
            });
            //console.log(jsonObj.smses.sms);

            // console.log(jsonArr);
            return jsonArr;

        }
    }
}
async function parseXML(f) {

    // f = '<?xml version=\'1.0\' encoding=\'UTF-8\' standalone=\'yes\' ?> <!--File Created By SMS Backup & Restore v10.06.102 on 28/02/2020 19:22:37-->\
    //  <smses count="455" backup_set="34188180-5079-4029-baf0-c7b428a749be" backup_date="1582939357325">\
    // <sms protocol="0" address="+15716235399" date="1540489671000" type="1" subject="" body="God damn it. "\
    //  toa="null" sc_toa="null" service_center="null" read="1" status="-1" locked="0" date_sent="1540489671000" sub_id="-1" \
    //  readable_date="Oct 25, 2018 12:47:51" contact_name="Braeden Smith" />\
    //   <sms protocol="0" address="+15716235399" date="1540489702000" type="1" subject="" \
    //   body="I can\'t even prof out of 125" toa="null" sc_toa="null" service_center="null"\
    //    read="1" status="-1" locked="0" date_sent="1540489702000" sub_id="-1" readable_date="Oct 25, 2018 12:48:22"\
    //     contact_name="Braeden Smith" />\
    //   <sms protocol="0" address="+15716235399" date="1540489727000" type="2" subject="" \
    //   body="Damn. Sorry to hear that. I wouldn\'t have guessed that" toa="null" sc_toa="null" \
    //   service_center="null" read="1" status="-1" locked="0" date_sent="1540489727000" sub_id="-1"\
    //    readable_date="Oct 25, 2018 12:48:47" contact_name="Braeden Smith" />\
    //    </smses>'
//    console.log(parser.validate(f));
  
    if(parser.validate(f) === true){
        const options = {
            attributeNamePrefix : "",
            attrNodeName: false, //default is 'false'
            textNodeName : "",
            ignoreAttributes : false,
            ignoreNameSpace : false,
            allowBooleanAttributes : false,
            parseNodeValue : false,
            parseAttributeValue : true,
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
            body = body.replace(/\./g,'');

            let date = messageMeta.date
            let type = messageMeta.type-1
            while(jsonArr.length <= type){
                jsonArr.push([])
            }
            let senderArr = jsonArr[type]
            let messageData = {}
            messageData["body"] = body
            messageData["date"] = date.toString()
            senderArr.push(messageData)
        });
        //console.log(jsonObj.smses.sms);

        console.log(jsonArr);
    }
    return jsonArr;
}

async function handleImageUpload(event) {
    const files = event.target.files
    const formData = new FormData()
    formData.append('xmlupload', files[0])
    formData.append('useTFJS', document.getElementById('useTFJS').checked)
    const resp = await fetch('/upload', {
        method: 'POST',
        body: formData
    })
    let json = await resp.json()

    if (!json.error) {
        lineGraph(json);
    } else {
        alert(json.error);
    }

    console.log(json)
}

document.getElementById('fileUpload').addEventListener('change', event => {
    handleImageUpload(event)
})



function lineGraph(jsonData) {
    let config = {
        type: 'line',
        data: {
            datasets: [

            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'SMS Sentiment'
            },
            tooltips: {
                enabled: true,

                mode: 'index',
                intersect: true,
                callbacks: {
                    label: function(tooltipItems, data){
                        var prefix = "";
                        return prefix;
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes : [{
                    type: 'time',
                    distribution: 'linear',
                    time:{
                        unit: 'day',
                        //tooltipFormat: 'MMMM Do YYYY, h:mm:ss a'
                    },
                    scaleLabel:{
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'value'
                    }
                }]
            }
        }
    }

    const DATE_FORMAT = "MMMM Do YYYY, h:mm:ss";
    const colorList = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#000000'];

    let dateArr = []
    
    jsonData.forEach(userData => {
        userData.forEach(message => {
            const curDate = Math.floor(parseInt(message.date.trim()) / 1000);
            if (!(dateArr.includes(curDate))) {
                dateArr.push(curDate)
            }
        });
    })
    dateArr.sort();

    let userCount = 0;
    let dateToMessageMapArr = []
    jsonData.forEach(userData => {
        let sentimentDateMap = {};
        dateToMessageMapArr.push({});
        userData.forEach(message => {
            const curDate = Math.floor(parseInt(message.date.trim()) / 1000);
            const curSentiment = message.score;
            let curFormattedDate = moment.unix(curDate, DATE_FORMAT);
            
            console.log(curFormattedDate)
            if (curFormattedDate in dateToMessageMapArr[userCount]) {
                const newDateString = dateToMessageMapArr[userCount][curFormattedDate].concat("...").concat(message.body);
                dateToMessageMapArr[userCount][curFormattedDate] = newDateString;
            } else {
                dateToMessageMapArr[userCount][curFormattedDate] = message.body;
            }

            if (dateToMessageMapArr[userCount][curFormattedDate].length > 100) {
                dateToMessageMapArr[userCount][curFormattedDate] = dateToMessageMapArr[userCount][curFormattedDate].substring(0, 100);
                dateToMessageMapArr[userCount][curFormattedDate] = dateToMessageMapArr[userCount][curFormattedDate].concat("...");
            }

            if (curDate in sentimentDateMap) {
                const oldMap = sentimentDateMap[curDate]
                sentimentDateMap[curDate] = {
                    sentimentSum: parseFloat(curSentiment) + oldMap.sentimentSum,
                    count: 1 + oldMap.count
                };
            } else {
                sentimentDateMap[curDate] = {
                    sentimentSum: parseFloat(curSentiment),
                    count: 1
                };
            }

        });
        let newSentiment = {
            label: "User ".concat(userCount.toString()),
            backgroundColor: colorList[userCount],
            borderColor: colorList[userCount],
            data: [],
            fill: false,
            spanGaps: true
        }

        dateArr.forEach(date => {
            let sentimentAverage = null;
            if(date in sentimentDateMap){
                sentimentAverage = sentimentDateMap[date].sentimentSum / sentimentDateMap[date].count;
            }

            newSentiment.data.push({x: new Date(moment.unix(date, DATE_FORMAT)), y: sentimentAverage});
        })

        config.data.datasets.push(newSentiment);
        userCount += 1
    });
    console.log(config);
    config.options.tooltips.callbacks.label = function (tooltipItems, data) {
        const hoveredDate = tooltipItems.label;

        const hoveredUnix = moment.unix(hoveredDate, DATE_FORMAT)
        console.log(tooltipItems)
        console.log(dateToMessageMapArr[0])
        const yValue = tooltipItems.value.substring(0, 4)
        const user = tooltipItems.datasetIndex

        let message = yValue.concat(" --- ");
        message = message.concat(dateToMessageMapArr[user][hoveredUnix] || "N/A")       
        return message;
    };
    
    let ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);

}

function convertDateFormat(date){
    let dateC = date.substring(4, date.length-9);
    dateC = dateC.slice(0, 6)+","+dateC.slice(6);
    if(dateC.charAt(4) == '0'){
        dateC = dateC.slice(0, 3) + dateC.slice(4);
    }
    let to_ret = [dateC.concat(" am"), dateC.concat(" pm")]
    return to_ret;
    //dateC = dateC.replace(',','');
}
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
            labels: [],
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
                        var prefix = "NOT";
                        return prefix;
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                x: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Month'
                    }
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }
            }
        }
    }

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

    dateArr.forEach(date => {
        config.data.labels.push(date.toString())
    })

    let userCount = 0;
    let dateToMessageMapArr = []
    jsonData.forEach(userData => {
        let sentimentDateMap = {};
        dateToMessageMapArr.push({});
        userData.forEach(message => {
            const curDate = Math.floor(message.date / 1000);
            const curSentiment = message.score;

            if (curDate in dateToMessageMapArr[userCount]) {
                const newDateString = dateToMessageMapArr[userCount][curDate].concat("...").concat(message.body);
                dateToMessageMapArr[userCount][curDate] = newDateString;
            } else {
                dateToMessageMapArr[userCount][curDate] = message.body;
            }

            if (dateToMessageMapArr[userCount][curDate].length > 100) {
                dateToMessageMapArr[userCount][curDate] = dateToMessageMapArr[userCount][curDate].substring(0, 100);
                dateToMessageMapArr[userCount][curDate] = dateToMessageMapArr[userCount][curDate].concat("...");
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
        const dates = Object.keys(sentimentDateMap);
        let curDateIndex = 0;
        let curDate = dateArr[curDateIndex];
        dates.forEach(date => {
            while (dateArr[curDateIndex] < date) {
                //const sentimentAverage = sentimentDateMap[date].sentimentSum/sentimentDateMap[date].count;
                newSentiment.data.push(null);
                curDateIndex += 1
            }
            const sentimentAverage = sentimentDateMap[date].sentimentSum / sentimentDateMap[date].count;
            newSentiment.data.push(sentimentAverage);
            curDateIndex += 1
        });
        config.data.datasets.push(newSentiment);
        userCount += 1
    });
    config.options.tooltips.callbacks.label = function (tooltipItems, data) {
        
        let hoveredDate = parseInt(tooltipItems.label);
        let yValue = tooltipItems.value.substring(0, 4)
        let user = tooltipItems.datasetIndex

        let message = yValue.concat(" --- ");
        message = message.concat(dateToMessageMapArr[user][hoveredDate] || "N/A")       
        return message;
    };
    
    let ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);

}
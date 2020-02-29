async function handleImageUpload(event) {
    const files = event.target.files
    const formData = new FormData()
    formData.append('xmlupload', files[0])
    console.log(files[0])
    console.log("checkbox", document.getElementById('useTFJS').checked)
    formData.append('useTFJS', document.getElementById('useTFJS').checked)
    console.log(formData)
    const resp = await fetch('/upload', {
        method: 'POST',
        body: formData
    })
    let json = await resp.json()
    lineGraph(json);
    console.log(json)
}

document.getElementById('fileUpload').addEventListener('change', event => {
    handleImageUpload(event)
})



function lineGraph(jsonData) {
    var config = {
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
                text: 'Chart.js Line Chart'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
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

    // jsonData = [
    //     [{
    //         body: "hello",
    //         date: "1",
    //         sentiment: ".8"
    //     }, {
    //         body: "hello",
    //         date: "3",
    //         sentiment: "-.3"
    //     }],
    //     [{
    //         body: "bye",
    //         date: "1",
    //         sentiment: ".3"
    //     }, {
    //         body: "bye bye",
    //         date: "2",
    //         sentiment: ".3"
    //     }, {
    //         body: "hello",
    //         date: "3",
    //         sentiment: ".7"
    //     }]
    // ]

    const colorList = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#000000'];

    let dateArr = []
    jsonData.forEach(userData => {
        userData.forEach(message => {
            const curDate = parseInt(message.date.trim());

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
    jsonData.forEach(userData => {
        let sentimentDateMap = {};
        userData.forEach(message => {
            const curDate = message.date;
            const curSentiment = message.score;

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

    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);

}
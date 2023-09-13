let cron = require("node-cron")
let now = new Date()
const topic = 'http://10.0.1.5:1080/a45fcafb43bf51893ae936a9'
const location = "https://api.weather.gov/points/47.1169,-88.5448"
let locationGridPoint = ""
let cityLocation = "" 

cron.schedule('0 7 * * *', () => {
    runMorning()
});

cron.schedule('1 12 * * *', () => {
    runAfternoon()
});
async function runMorning() {
    await getPreliminaryData(location)
    getForecast(locationGridPoint, 0)
    getForecast(locationGridPoint, 1)
    getForecast(locationGridPoint, 2)
    console.log('\x1b[35m%s\x1b[0m',`[PUSH] `,'\x1b[0m',`Successfully sent message ${now.toDateString()}`)
}

async function runAfternoon() {
    await getPreliminaryData(location)
    getForecast(locationGridPoint, 0)
    console.log('\x1b[35m%s\x1b[0m',`[PUSH] `,'\x1b[0m',`Successfully sent message ${now.toDateString()}`)

}

function postNotification(forecast, err) {
    fetch(topic, {
        method: 'POST',
        headers: {
            'Icon' : forecast.icon,
            'Title': cityLocation + " - " + forecast.name,
            'Priority': "3"
        },
        body: forecast.temperature + "°F • " + forecast.shortForecast + " • " + forecast.wind 
    })
}


async function getPreliminaryData(url) {
    const request = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (!request.ok) {
        fetch(topic, {
            method: 'POST',
            headers: {
                'Title': "Network response is not OK",
                'Priority': "4"
            },
            body: "Status: " +  request.status
        })
        return
    } else {
        console.log('\x1b[35m%s\x1b[0m',`[getPreliminaryData] `,'\x1b[0m', "Network Response is OK\nStatus: ", request.status)
        const data = await request.json()
        locationGridPoint = JSON.stringify(data.properties.forecast).replace(/['"]+/g, '')
        cityLocation = JSON.stringify(data.properties.relativeLocation.properties.city + ", " + data.properties.relativeLocation.properties.state).replace(/['"]+/g, '')
    }
}


async function getForecast(url, period) {
    const request = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (!request.ok) {
        fetch(topic, {
            method: 'POST',
            headers: {
                'Title': "Network response is not OK",
                'Priority': "4"
            },
            body: "Status: " +  request.status
        }) 
        return
    } else {
        console.log('\x1b[35m%s\x1b[0m',`[getForecast] `,"Network Response is OK\nStatus: ", request.status)
        const data = await request.json()
        let prop = data.properties.periods[0]
        switch (period) {
            case 0:
                prop = data.properties.periods[0]
                break
            case 1:
                prop = data.properties.periods[1]
                break
            case 2:
                prop = data.properties.periods[2]
                break
            case 3: 
                prop = data.properties.periods[3]
                break
            case 4:
                prop = data.properties.periods[4]
                break
        }

        const forecast = {
            "name" : JSON.stringify(prop.name).replace(/['"]+/g, ''),
            "dew" : JSON.stringify(prop.dewpoint.value).replace(/['"]+/g, ''),
            "temperature" : JSON.stringify(prop.temperature).replace(/['"]+/g, ''),
            "relativeHumidity" : JSON.stringify(prop.relativeHumidity.value + "%").replace(/['"]+/g, ''),
            "wind" : JSON.stringify(prop.windDirection + " " + prop.windSpeed).replace(/['"]+/g, ''),
            "icon" : JSON.stringify(prop.icon).replace(/['"]+/g, ''),
            "shortForecast" : JSON.stringify(prop.shortForecast).replace(/['"]+/g, '')
        }
        postNotification(forecast, false)
    }
}
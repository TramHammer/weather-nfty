let now = new Date()

let topic = ""
let locationGridPoint = ""
let cityLocation = ""
let location = ""
let alertLocation = ""
let retrys = 0;
let alerts = []
let link = ""
let shortAlert = null

export default { setConfig, initializeGridPointData, runAfternoon, runMorning, getAlerts, clearAlertTable }

function setConfig(latitude, longitude, nftyTopic, retryAttempts, shortAlerts) {
    topic = nftyTopic
    shortAlert = shortAlerts
    retrys = retryAttempts
    link = "https://forecast.weather.gov/MapClick.php?lat=" + latitude + "&lon=" + longitude
    location = "https://api.weather.gov/points/" + latitude + "," + longitude
    alertLocation = "https://api.weather.gov/alerts/active?point=" + latitude + "," + longitude
    console.log('\x1b[35m%s\x1b[0m',`[Initalized] `,'\x1b[0m',``)
}

function clearAlertTable() {
    alerts = []
}

/*
Establishes the correct gridPoint based on the latitude and longitude based on the passed values in setConfig
*/
async function initializeGridPointData() {
    let requestCount = 0;
    do {
        const request = await fetch(location, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!request.ok) {
            requestCount++
            continue
        } else {
            console.log('\x1b[35m%s\x1b[0m', `[getPreliminaryData] `, '\x1b[0m', "Network Response is OK\nStatus: ", request.status)
            const data = await request.json()
            locationGridPoint = JSON.stringify(data.properties.forecast).replace(/['"]+/g, '')
            cityLocation = JSON.stringify(data.properties.relativeLocation.properties.city + ", " + data.properties.relativeLocation.properties.state).replace(/['"]+/g, '')
            return true
        }
    } while (requestCount < retrys)
    fetch(topic, {
        method: 'POST',
        headers: {
            'Title': "Network response is not OK",
            'Priority': "4"
        },
        body: "initializeGridPointData() failed after " + retrys
    })
    return false
}
/*
Gets the forecast for morning, afternoon, and the next day
*/
async function runMorning() {
    getForecast(0)
    getForecast(1)
    getForecast(2)
    console.log('\x1b[35m%s\x1b[0m', `[PUSH] `, '\x1b[0m', `Successfully sent message ${now.toDateString()}`)
}
/*
Gets the forecast for the evening
*/
async function runAfternoon() {
    getForecast(0)
    console.log('\x1b[35m%s\x1b[0m', `[PUSH] `, '\x1b[0m', `Successfully sent message ${now.toDateString()}`)

}

/*
nfty post notification method, designed for Andriod w/support for Icon
*/
async function postNotification(forecast, type) {
    if (type) {
        if (!shortAlert) {
            fetch(topic, {
                method: 'POST',
                headers: {
                    'Icon': "https://www.shareicon.net/data/512x512/2015/08/18/86945_warning_512x512.png",
                    'Title': forecast.name + " - " + forecast.sender,
                    'Priority': "4",
                    'Tags': forecast.id,
                    'Actions': `view, Open weather.gov, ${link}`
                },
                body: forecast.description + "\n\n" + forecast.instructions
            })
        } else {
            fetch(topic, {
                method: 'POST',
                headers: {
                    'Icon': "https://www.shareicon.net/data/512x512/2015/08/18/86945_warning_512x512.png",
                    'Title': forecast.name + " - " + forecast.sender,
                    'Priority': "4",
                    'Tags': forecast.id,
                    'Actions': `view, Open weather.gov, ${link}`
                },
                body: forecast.headline + "\n\n" + forecast.instructions
            })
        }
    } else {
        fetch(topic, {
            method: 'POST',
            headers: {
                'Icon': forecast.icon,
                'Title': cityLocation + " - " + forecast.name,
                'Priority': "3"
            },
            body: forecast.temperature + "°F • " + forecast.shortForecast + " • " + forecast.wind
        }) 
    }
}

/*
Gets alert information based on alert link
*/
async function getAlerts() {
    let requestCount = 0;
    do {
        const request = await fetch(alertLocation, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!request.ok) {
            console.log("Failed " + requestCount + " times " + location)
            requestCount++
            continue;
        } else {
            console.log('\x1b[35m%s\x1b[0m', `[getAlerts()] `, `Network Response is OK : getAlerts()\nStatus: `, request.status)
            const data = await request.json()

            for (let i = 0; i < Object.keys(data.features).length; i++) {
                let information = data.features[i].properties;

                const alert = {
                    "name": JSON.stringify(information.event).replace(/['"]+/g, ''),
                    "description": (information.description),
                    "instructions":  (information.instruction),
                    "headline": JSON.stringify(information.headline).replace(/['"]+/g, ''),
                    "effective":  JSON.stringify(information.effective).replace(/['"]+/g, ''),
                    "expires":  JSON.stringify(information.expires).replace(/['"]+/g, ''),
                    "sender":  JSON.stringify(information.senderName).replace(/['"]+/g, ''),
                    "id": JSON.stringify(information.id).replace(/['"]+/g, ''),
                }
                if (!alerts.includes(alert.id)) {
                    postNotification(alert, true)
                    alerts.push(alert.id)
                }
            }
            return true
        }
    } while (requestCount < retrys)
    fetch(topic, {
        method: 'POST',
        headers: {
            'Title': "Network response is not OK",
            'Priority': "4"
        },
        body: "getForecast() failed after " + retrys
    })
    return false

}


/*
Gets the forecast based on the period using locationGridPoint
*/
async function getForecast(period) {
    let requestCount = 0;
    do {
        const request = await fetch(locationGridPoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!request.ok) {
            console.log("Failed " + requestCount + " times " + location)
            requestCount++
            continue
        } else {
            console.log('\x1b[35m%s\x1b[0m', `[getForecast] `, `Network Response is OK : getForecast(${period})\nStatus: `, request.status)
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
                "name": JSON.stringify(prop.name).replace(/['"]+/g, ''),
                "dew": JSON.stringify(prop.dewpoint.value).replace(/['"]+/g, ''),
                "temperature": JSON.stringify(prop.temperature).replace(/['"]+/g, ''),
                "relativeHumidity": JSON.stringify(prop.relativeHumidity.value + "%").replace(/['"]+/g, ''),
                "wind": JSON.stringify(prop.windDirection + " " + prop.windSpeed).replace(/['"]+/g, ''),
                "icon": JSON.stringify(prop.icon).replace(/['"]+/g, ''),
                "shortForecast": JSON.stringify(prop.shortForecast).replace(/['"]+/g, '')
            }
            postNotification(forecast, false)
            return true
        }
    } while (requestCount < retrys)
    fetch(topic, {
        method: 'POST',
        headers: {
            'Title': "Network response is not OK",
            'Priority': "4"
        },
        body: "getForecast() failed after " + retrys
    })
    return false
}

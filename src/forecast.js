import fetch from 'node-fetch'

let topic = ""
let locationGridPoint = ""
let cityLocation = ""
let location = ""
let alertLocation = ""
let alerts = []
let link = ""
let shortAlert = null
let pushMobileError = null

export default { setConfig, initializeGridPointData, runAfternoon, runMorning, getAlerts, clearAlertTable }

/**
 * Sets the configuration within this file 
 * @param {*} latitude 
 * @param {*} longitude 
 * @param {*} nftyTopic 
 * @param {*} shortAlerts 
 * @param {*} pushMobileErrors 
 */
function setConfig(latitude, longitude, nftyTopic, shortAlerts, pushMobileErrors) {
    topic = nftyTopic
    shortAlert = shortAlerts
    pushMobileError = pushMobileErrors
    latitude = Number(latitude).toFixed(4)
    longitude = Number(longitude).toFixed(4)
    console.log(latitude, longitude)
    link = "https://forecast.weather.gov/MapClick.php?lat=" + latitude + "&lon=" + longitude
    location = "https://api.weather.gov/points/" + latitude + "," + longitude
    alertLocation = "https://api.weather.gov/alerts/active?point=" + latitude + "," + longitude
    console.log('\x1b[32m%s\x1b[0m', `[setConfig] `, '\x1b[0m', `${new Date().toISOString()} Initalized`)
}

/**
 * Clears alert table when called
 */
function clearAlertTable() {
    alerts = []
}

/**
 * Establishes the correct gridPoint based on the latitude and longitude based on the passed values in setConfig
 */
async function initializeGridPointData() {
    try {
        const request = await fetch(location, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        console.log('\x1b[35m%s\x1b[0m', `[initializeGridPointData] `, '\x1b[0m', `${new Date().toISOString()} Network Response is OK\nStatus: `, request.status)
        const data = await request.json()
        locationGridPoint = JSON.stringify(data.properties.forecast).replace(/['"]+/g, '')
        cityLocation = JSON.stringify(data.properties.relativeLocation.properties.city + ", " + data.properties.relativeLocation.properties.state).replace(/['"]+/g, '')
    } catch (err) {
        postErrorNotification("initializeGridPointData", err)
    }
}

/**
 * Posts error as a notification through the same channel in nfty
 * @param {*} messageType the function name
 * @param {*} err the error from the catch statement
 */
async function postErrorNotification(messageType, err) {
    console.log('\x1b[31m%s\x1b[0m', `[postErrorNotification]`, '\x1b[0m', ` ${new Date().toISOString()} ${messageType}() failed, ${err}}`)
    if (pushMobileError) {
        await fetch(topic, {
            method: 'POST',
            headers: {
                'Title': "Network response is not OK",
                'Priority': "4"
            },
            body: `${messageType}() failed, see logs for more details...`
        }).catch(err => console.log('\x1b[31m%s\x1b[0m', `[postErrorNotification]`, '\x1b[0m', ` ${new Date().toISOString()} Failed to send mobile push notification, ${err}`))
    }
}

/**
 * Gets the forecast for morning, afternoon, and the next day
 */
async function runMorning() {
    getForecast(0)
    getForecast(1)
    getForecast(2)
    console.log('\x1b[35m%s\x1b[0m', `[runMorning] `, '\x1b[0m', ` ${new Date().toISOString()} Successfully sent message`)
}

/**
 * Gets the forecast for the evening
 */
async function runAfternoon() {
    getForecast(0)
    console.log('\x1b[35m%s\x1b[0m', `[runAfternoon] `, '\x1b[0m', ` ${new Date().toISOString()} Successfully sent message`)
}


/**
 * nfty post notification method, designed for Andriod w/support for Icon
 * @param {*} forecast the forecast product as a dictionary
 * @param {*} type if it is an api.weather.gov alert
 */
async function postNotification(forecast, type) {
    if (type) {
        if (!shortAlert) {
            await fetch(topic, {
                method: 'POST',
                headers: {
                    'Icon': "https://www.shareicon.net/data/512x512/2015/08/18/86945_warning_512x512.png",
                    'Title': forecast.name + " - " + forecast.sender,
                    'Priority': "4",
                    'Tags': forecast.id,
                    'Actions': `view, Open weather.gov, ${link}`
                },
                body: forecast.description + "\n\n" + forecast.instructions
            }).then(() => {
                return false

            }).catch(err => console.log(err))
        } else {
            await fetch(topic, {
                method: 'POST',
                headers: {
                    'Icon': "https://www.shareicon.net/data/512x512/2015/08/18/86945_warning_512x512.png",
                    'Title': forecast.name + " - " + forecast.sender,
                    'Priority': "4",
                    'Tags': forecast.id,
                    'Actions': `view, Open weather.gov, ${link}`
                },
                body: forecast.headline + "\n\n" + forecast.instructions
            }).then(() => {
                return false

            }).catch(err => console.log(err))
        }
    } else {
        await fetch(topic, {
            method: 'POST',
            headers: {
                'Icon': forecast.icon,
                'Title': cityLocation + " - " + forecast.name,
                'Priority': "3"
            },
            body: forecast.temperature + "°F • " + forecast.shortForecast + " • " + forecast.wind
        }).then(() => {
            return false

        }).catch(err => console.log(err))
    }
}


/**
 * Gets alert information based on alert link
 * @returns 
 */
async function getAlerts() {
    try {
        const request = await fetch(alertLocation, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        console.log('\x1b[35m%s\x1b[0m', `[getAlerts] `, ` ${new Date().toISOString()} Network Response is OK : getAlerts()\nStatus: `, request.status)
        const data = await request.json()

        for (let i = 0; i < Object.keys(data.features).length; i++) {
            let information = data.features[i].properties;

            const alert = {
                "name": JSON.stringify(information.event).replace(/['"]+/g, ''),
                "description": (information.description),
                "instructions": (information.instruction),
                "headline": JSON.stringify(information.headline).replace(/['"]+/g, ''),
                "effective": JSON.stringify(information.effective).replace(/['"]+/g, ''),
                "expires": JSON.stringify(information.expires).replace(/['"]+/g, ''),
                "sender": JSON.stringify(information.senderName).replace(/['"]+/g, ''),
                "id": JSON.stringify(information.id).replace(/['"]+/g, ''),
            }
            if (!alerts.includes(alert.id)) {
                postNotification(alert, true)
                alerts.push(alert.id)
            }
        }
        return true
    } catch (err) {
        postErrorNotification("getAlerts", err)
        return false
    }
}


/**
 * Gets the forecast based on the period using locationGridPoint
 * @param {Number} period the period to fetch forecast data from
 * @returns 
 */
async function getForecast(period) {
    try {
        const request = await fetch(locationGridPoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        console.log('\x1b[35m%s\x1b[0m', `[getForecast] `, ` ${new Date().toISOString()} Network Response is OK : getForecast(${period})\nStatus: `, request.status)
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
    } catch (err) {
        postErrorNotification("getForecast", err)
        return false
    }
}



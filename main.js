import weather from './src/forecast.js'
import express from './src/uptimeKuma.js'
import cron from "node-cron"

const topic = '' //nfty topic link
const lat = "" //should be rounded to the 4th decimal place ex. -88.5448
const long = "" //should be rounded to the 4th decimal place
const retryAttempts = 4 //change this to a reasonable number of times you want it to retry until it determines that there is no proper connection to the API
const shortAlerts = true //change if you want the short headline or the full alert details(the full details will not show in the notification bubble completely)

weather.setConfig(lat, long, topic, retryAttempts, shortAlerts)
//This is optional for uptime Kuma Integration
express.uptimeKumaIntegration(5000)

weather.initializeGridPointData()

//This would post a notification on running devices local time at 7 AM
cron.schedule('0 7 * * *', () => {
    weather.runMorning()
});

//This would post a notification on running devices local time at 12 PM
cron.schedule('0 12 * * *', () => {
    weather.runAfternoon()
});

//This would post a notification on running devices local time at 6 PM
cron.schedule('0 18 * * *', () => {
    weather.runAfternoon()
});

//This would check for alerts every 10 minutes
cron.schedule('*/10 * * * *', () => {
    weather.getAlerts()
})

//This would clear alert table every week on Sunday
cron.schedule('0 0 * * 0', () => {
    weather.clearAlertTable()
})


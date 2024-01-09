import weather from './src/forecast.js'
import express from './src/uptimeKuma.js'
import cron from "node-cron"


// nfty topic link
const topic = ''
// Latitude in Decimal Degrees
const lat = ""
// Longitude in Decimal Degrees
const long = ""
// Change to true if you want the full alert details
const shortAlerts = true
// Change to true if you want to see server errors pushed as notifications
const pushMobileErrors = true 

//This is optional for uptime Kuma Integration, the default port will be 5000
express.uptimeKumaIntegration(5000)

weather.setConfig(lat, long, topic, shortAlerts, pushMobileErrors)

weather.initializeGridPointData()

//This would post a notification on running devices local time at 7 AM
cron.schedule('0 7 * * *', () => {
    weather.runMorning()
});

//This would post a notification on running devices local time at 12 PM
cron.schedule('0 12 * * * ', () => {
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

import weather from './src/forecast.js'
import express from './src/express.js'
import cron from "node-cron"

console.log('\x1b[35m%s\x1b[0m',`[Initalized] `,'\x1b[0m',``)

express.uptimeKumaIntegration()

cron.schedule('0 7 * * *', () => {
    weather.runMorning()
});

cron.schedule('1 12 * * *', () => {
    weather.runAfternoon()
});

cron.schedule('0 18 * * *', () => {
    weather.runAfternoon()
});



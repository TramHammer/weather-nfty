import express from 'express'
const app = express()

export default { uptimeKumaIntegration }

function uptimeKumaIntegration(port) {
    app.get('/', (req, res) => {
        res.send("PUSH")
    })

    app.listen(port, () => {
        console.log('\x1b[35m%s\x1b[0m',`[uptimeKumaIntegration] `,'\x1b[0m',`Listening on port ${port}`)
    })
}
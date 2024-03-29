import dotenv from 'dotenv'
import fs from 'fs'
import mongoose from 'mongoose'
import express from 'express'
import cors from 'cors'
import { reportSchema } from './libs/database.js'
import { runBot } from './libs/telegram.js'
import { getWebhook, processWebhook } from './libs/whatsapp.js'
import body_parser from 'body-parser'

console.log("🤖 LOADING ENVIRONMENT..")
dotenv.config()

console.log("💽 CONNECTING TO MONGODB..")
mongoose.connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })

console.log('🚀 STARTING TELEGRAF..')
const app = express()
app.use(body_parser.json())
app.use(cors())
app.use(express.static('photos'));
const port = 3000

runBot()

if (!fs.existsSync('./photos')) {
    fs.mkdirSync('./photos')
}
if (!fs.existsSync('./maps')) {
    fs.mkdirSync('./maps')
}

app.get('/', (req, res) => {
    res.send('Bot Works!')
})

app.get('/markers', async (req, res) => {
    try {
        const reportModel = mongoose.model('report', reportSchema);
        const reports = await reportModel.find({ approved: true })
        res.send(reports)
    } catch (e) {
        res.send("E' successo qualcosa di strano..-riprova!")
    }
})

app.get('/whatsapp/webhook', getWebhook)
app.post('/whatsapp/webhook', processWebhook)

app.listen(port, () => {
    console.log('💥 APP SERVING THROUGH PORT 3000!')
})
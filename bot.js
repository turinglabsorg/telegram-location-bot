const { Telegraf } = require('telegraf')
require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const StormDB = require("stormdb")
const engine = new StormDB.localFileEngine("./reports");
const db = new StormDB(engine);
db.default({ reports: [] });

console.log('STARTING BOT..')
const bot = new Telegraf(process.env.BOT_TOKEN)
const reports = {}

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.on('location', (ctx) => {
    const user = ctx.update.message.from.id
    console.log('RECEIVED LOCATION', ctx.update.message.location);
    if (reports[user] !== undefined) {
        reports[user].location = ctx.update.message.location;
        console.log(reports[user])
        db.get("reports").push(reports[user]);
        db.save();
        ctx.reply('Well done!')
    } else {
        ctx.reply('Send a photo first!')
    }
})

bot.on('photo', (ctx) => {
    const user = ctx.update.message.from.id
    if (reports[user] === undefined) {
        reports[user] = {
            photo: "",
            location: {}
        }
    }
    const fileId = ctx.update.message.photo[3].file_id
    console.log('RECEIVED PICTURE', fileId);
    ctx.telegram.getFileLink(fileId).then(url => {
        url = url.href
        console.log(url)
        axios({ url, responseType: 'stream' }).then(response => {
            return new Promise((resolve, reject) => {
                response.data.pipe(fs.createWriteStream(`./photos/${fileId}.jpg`))
                    .on('finish', () => {
                        reports[user].photo = fileId + '.jpg'
                        ctx.reply('Now send your location..')
                    })
                    .on('error', e => {
                        ctx.reply('Please retry the upload of the photo..')
                    })
            });
        })
    })
})

bot.hears('hi', (ctx) => ctx.reply('Hey there!'))

bot.launch()
console.log('BOT STARTED!')
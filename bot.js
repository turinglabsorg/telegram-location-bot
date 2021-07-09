const { Telegraf } = require('telegraf')
require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const express = require('express')
const StaticMaps = require('staticmaps')

console.log('INIT MONGODB..')
const reportSchema = new mongoose.Schema({
    photo: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    timestamp: Number
});
const reportModel = mongoose.model('report', reportSchema);

console.log('STARTING TELEGRAF..')
const bot = new Telegraf(process.env.BOT_TOKEN)
const app = express()
const port = 3000
const reports = {}

if(!fs.existsSync('./photos')){
    fs.mkdirSync('./photos')
}
if(!fs.existsSync('./maps')){
    fs.mkdirSync('./maps')
}

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.start((ctx) => ctx.reply('Welcome, this is a map bot!'))

bot.on('location', async (ctx) => {
    const user = ctx.update.message.from.id
    console.log('RECEIVED LOCATION', ctx.update.message.location);
    if (reports[user] !== undefined) {
        reports[user].location = ctx.update.message.location;
        const report = new reportModel();
        report.photo = reports[user].photo
        report.location = {
            "type": "Point",
            "coordinates": [
                ctx.update.message.location.longitude,
                ctx.update.message.location.latitude
            ]
        }
        report.timestamp = new Date().getTime()
        await report.save();
        console.log(reports[user])
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

bot.command('map', async (ctx) => {
    const reports = await reportModel.find()
    const mapImg = process.cwd() + '/maps/' + new Date().getTime().toString() + '.png'

    const map = new StaticMaps({
        width: 600,
        height: 400
    });

    const marker = {
        img: `./marker.png`,
        offsetX: 24,
        offsetY: 48,
        width: 48,
        height: 48
    };
    for (let k in reports) {
        marker.coord = reports[k].location.coordinates;
        map.addMarker(marker);
    }
    map.render()
        .then(() => map.image.save(mapImg))
        .then(() => {
            ctx.replyWithPhoto({ source: mapImg });
        })
        .catch((e) => {
            console.log(e)
            ctx.reply('Can\'t render map!')
        });
})

bot.command('position', async (ctx) => {
    const reports = await reportModel.findOne({ timestamp: -1 })
    ctx.tg.sendLocation(ctx.chat.id, '11.120310', '76.119350')
})

bot.launch()

app.get('/', (req, res) => {
    res.send('Bot Works!')
})

app.get('/map', async (req, res) => {
    const reports = await reportModel.find()
    const mapImg = process.cwd() + '/maps/' + new Date().getTime().toString() + '.png'

    const map = new StaticMaps({
        width: 600,
        height: 400
    });

    const marker = {
        img: `./marker.png`,
        offsetX: 24,
        offsetY: 48,
        width: 48,
        height: 48
    };
    for (let k in reports) {
        marker.coord = reports[k].location.coordinates;
        map.addMarker(marker);
    }
    map.render()
        .then(() => map.image.save(mapImg))
        .then(() => { res.sendFile(mapImg) })
        .catch((e) => {
            console.log(e)
            res.send('CAN\'T RENDER MAP')
        });
})

app.listen(port, () => {
    console.log('BOT STARTED!')
})


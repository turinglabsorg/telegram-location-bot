const { Telegraf } = require('telegraf')
require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const express = require('express')
const StaticMaps = require('staticmaps')
const cors = require('cors')

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
    timestamp: Number,
    approved: Boolean
});

console.log('STARTING TELEGRAF..')
const bot = new Telegraf(process.env.BOT_TOKEN)
const app = express()
app.use(cors())
app.use(express.static('photos'));
const port = 3000
const reports = {}

if (!fs.existsSync('./photos')) {
    fs.mkdirSync('./photos')
}
if (!fs.existsSync('./maps')) {
    fs.mkdirSync('./maps')
}

const help = `Ciao! 
Io sono MunnizzaLand, il bot che popolerà un grande database di tutte le discariche abusive!

Cos'è?
Si tratta di un'iniziativa congiunta di associazioni del territorio per denunciare questo grande problema, dai anche tu una mano!

E la privacy?
Tutte le segnalazioni sono anonime, non registriamo nessun dato riguardante il tuo dispositivo o il tuo numero di cellulare.

Come fare?
1) 📷 Invia una fotografia di una discarica
2) 📍 Allega subito dopo la tua posizione
3) 🚀 Condividi la /mappa e questo bot con i tuoi contatti!

Sicurezza
Questo progetto è open-source, vuol dire che il suo codice è pubblico e può essere consultato qui: 
https://github.com/yomi-digital/munnizza-land
`

bot.help((ctx) => ctx.reply(help))
bot.start((ctx) => ctx.reply(help))

bot.on('photo', (ctx) => {
    try {
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
                            ctx.reply('Ok, ora allega la tua 📍 posizione, così da poterla accoppiare con la foto e geolocalizzare la discarica.')
                        })
                        .on('error', e => {
                            ctx.reply('Please retry the upload of the photo..')
                        })
                });
            })
        })
    } catch (e) {
        ctx.reply("E' successo qualcosa di strano..-riprova!")
    }
})

bot.on('video', (ctx) => {
    ctx.reply('Ci dispiace, accettiamo solamente fotografie.')
})

bot.command('accept', (ctx) => {
    console.log(ctx.update.message)
    ctx.reply('What?')
})

bot.on('location', async (ctx) => {
    try {
        const user = ctx.update.message.from.id
        console.log('RECEIVED LOCATION', ctx.update.message.location);
        if (reports[user] !== undefined) {
            const reportModel = mongoose.model('report', reportSchema);
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
            report.approved = false
            report.timestamp = new Date().getTime()
            await report.save();

            const inserted = await reportModel.findOne({ photo: reports[user].photo })
            console.log(inserted)

            reports[user] = {
                photo: "",
                location: {}
            }
            
            ctx.reply(`🎉🎉🎉 Ben fatto, non resta che aspettare l'approvazione! Impieghiamo massimo 24h!

            Grazie per aver partecipato all'iniziativa di MunnizzaLand. Le tue segnalazioni sono importanti, continua ad aiutarci!
            Puoi vedere la mappa di tutte le segnalazioni approvate sul sito di MunnizzaLand:
            https://munnizza.land`)


            // SEND IMAGE TO SEBA
            ctx.telegram.sendMessage(ctx.update.message.from.id, "http://localhost:3000/" + inserted.photo)


        } else {
            ctx.reply('Invia una foto prima!')
        }
    } catch (e) {
        ctx.reply("E' successo qualcosa di strano..-riprova!")
    }
})

bot.command('mappa', async (ctx) => {
    try {
        const reportModel = mongoose.model('report', reportSchema);
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
    } catch (e) {
        ctx.reply("E' successo qualcosa di strano..-riprova!")
    }
})

bot.launch()

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

app.listen(port, () => {
    console.log('BOT STARTED!')
})


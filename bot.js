const { Telegraf } = require('telegraf')
const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu')
require('dotenv').config()

console.log('STARTING BOT..')
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.on('location', (ctx) => {
    console.log('RECEIVED LOCATION', ctx.update.message.location);
})

bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.launch()
console.log('BOT STARTED!')
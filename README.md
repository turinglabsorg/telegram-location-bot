# Munnizza.Land BOT

Questo bot di Telegram serve per catalogare in una mappa tutte le aree con discariche abusive.
Il progetto nasce dal basso, da un gruppo di associazioni della provincia di Ragusa e che vogliono mettere in risalto questo enorme problema.

Vuoi contribuire o creare un altro bot come questo? Nessun problema, fai un fork o proponi modifiche con una PR.

## Istruzioni base

Intanto serve la connessione a MongoDB, per questo crea un file `.env` e inserisci:

```
MONGODB_CONNECTION=UnaConnessioneAMongoDB
```

## Attivare telegram

Prima di tutto contatta il bot di Telegram `@BotFather` per ottenere la tua apikey.
Dopo di che aggiungi al file `.env`:

```
BOT_TOKEN=IlTokenDelBot
MANAGER=IlTuoUsername
```

## Fare partire il bot

Per far partire il bot basta dare nel terminale:

```
yarn dev 
```

per lavorare nell'ambiente di sviluppo, oppure

```
yarn start
```

per far partire il bot definitivamente.

## Messa in produzione

Per metterlo in produzione consigliamo l'uso di PM2:

```
npm install -g pm2
pm2 start bot.js
```
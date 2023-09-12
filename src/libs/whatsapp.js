import dotenv from 'dotenv'
import fs from 'fs'
import axios from 'axios'
import mongoose from 'mongoose'
import { reportSchema, adminSchema } from './database.js'
import { uploadFileOnPinata } from './pinata.js'
dotenv.config()
const token = process.env.WHATSAPP_TOKEN;
let reports = {}

export async function getWebhook(req, res) {
    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === verify_token) {
            // Respond with 200 OK and challenge token from the request
            console.log("🔥 WHATSAPP WEBHOOK VERIFIED!");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

export async function processWebhook(req, res) {
    try {
        // Check the Incoming webhook message
        let msg_response = "Hello!";
        if (req.body.object) {
            if (
                req.body.entry &&
                req.body.entry[0].changes &&
                req.body.entry[0].changes[0] &&
                req.body.entry[0].changes[0].value.messages &&
                req.body.entry[0].changes[0].value.messages[0]
            ) {
                // Understand what's going on
                let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
                let user = req.body.entry[0].changes[0].value.messages[0].from;
                if (reports[phone_number_id] === undefined) {
                    reports[phone_number_id] = {
                        photo: "",
                        location: {}
                    }
                }
                // Check if the message is an image
                if (req.body.entry[0].changes[0].value.messages[0].image !== undefined) {
                    console.log(
                        '📸 RECEIVED PICTURE',
                        req.body.entry[0].changes[0].value.messages[0].image
                    );
                    const fileId = req.body.entry[0].changes[0].value.messages[0].image.id
                    await sendMessage(phone_number_id, user, "Ok, sto scaricando la tua foto..");
                    const media_details = await axios({
                        method: "GET",
                        url: "https://graph.facebook.com/v17.0/" + fileId + "/",
                        headers: { Authorization: "Bearer " + token },
                    })
                    if (media_details.data.url !== undefined) {
                        const url = media_details.data.url;
                        console.log("Downloading from file link:", url)
                        const media_stream = await axios({
                            url, responseType: 'stream',
                            headers: { Authorization: "Bearer " + token }
                        })
                        media_stream.data.pipe(fs.createWriteStream(`./photos/${fileId}.jpg`))
                            .on('finish', async () => {
                                const file = fs.readFileSync(`./photos/${fileId}.jpg`)
                                const uploaded = await uploadFileOnPinata(file, fileId + '.jpg')
                                console.log("Upload on Pinata result:", uploaded)
                                if (uploaded === false) {
                                    await sendMessage(phone_number_id, user, "C'è stato un problema con l'upload della foto, riprova!");
                                } else {
                                    reports[phone_number_id].photo = process.env.PINATA_ENDPOINT + "/ipfs/" + uploaded
                                    await sendMessage(phone_number_id, user, "Ok, ora allega la tua 📍 posizione, così da poterla accoppiare con la foto e geolocalizzare la discarica.");
                                }
                            })
                            .on('error', async e => {
                                await sendMessage(phone_number_id, user, 'Abbiamo riscontrato un problema con la foto, prova di nuovo..');
                            })
                    }
                }
                // Check if the message is a location
                if (
                    req.body.entry[0].changes[0].value.messages[0].location !== undefined
                ) {
                    console.log(
                        "LOCATION",
                        req.body.entry[0].changes[0].value.messages[0].location
                    );
                    if (reports[phone_number_id].photo.length > 0) {
                        reports[phone_number_id].location = req.body.entry[0].changes[0].value.messages[0].location
                        const reportModel = mongoose.model('report', reportSchema);
                        const check = await reportModel.findOne({ photo: reports[phone_number_id].photo })

                        if (check === null) {
                            const report = new reportModel();
                            report.photo = reports[phone_number_id].photo
                            report.from = phone_number_id // Take id not actual number
                            report.location = {
                                "type": "Point",
                                "coordinates": [
                                    reports[phone_number_id].location.longitude,
                                    reports[phone_number_id].location.latitude
                                ]
                            }
                            report.source = 'whatsapp'
                            report.approved = false
                            report.evalued = false
                            report.timestamp = new Date().getTime()
                            await report.save();
                            await reportModel.findOne({ photo: reports[phone_number_id].photo })

                            await sendMessage(phone_number_id, user, `🎉🎉🎉 Ben fatto, non resta che aspettare l'approvazione\! Impieghiamo massimo 24h\!\n\nGrazie per aver partecipato all'iniziativa di MunnizzaLand\. Le tue segnalazioni sono importanti, continua ad aiutarci\!\n\nPuoi vedere la mappa di tutte le segnalazioni approvate sul sito di Munnizza\.Land:\n\nhttps://munnizza\.land`)

                            // SEND IMAGE TO ADMIN
                            const adminModel = mongoose.model('admins', adminSchema);
                            const admin = await adminModel.findOne({ approved: true })
                            if (admin !== null && admin.whatsapp_phone_number !== undefined && admin.whatsapp_user !== undefined) {
                                await sendMessage(admin.whatsapp_phone_number, admin.whatsapp_user, "Devi validare una foto, usa /validate su Telegram per iniziare la procedura!")
                            } else {
                                console.log("Non posso notificare nessuno..")
                            }
                        } else {
                            await sendMessage(phone_number_id, user, "Questa foto è già stata segnalata, grazie per la collaborazione!")
                        }
                        // Reset in-memory report
                        reports[phone_number_id] = {
                            photo: "",
                            location: {}
                        }
                    } else {
                        await sendMessage(phone_number_id, user, "Per favore, invia prima la foto della discarica!");
                    }
                }
                // Check if the message is a text
                if (req.body.entry[0].changes[0].value.messages[0].text !== undefined) {
                    console.log(
                        "TEXT",
                        req.body.entry[0].changes[0].value.messages[0].text.body
                    );
                    if(req.body.entry[0].changes[0].value.messages[0].text.body === '/auth'){
                        console.log("PHONE NUMBER ID:", phone_number_id)
                        console.log("PHONE NUMBER:", user)
                    }
                }

            }
            res.sendStatus(200);
        } else {
            // Return a '404 Not Found' if event is not from a WhatsApp API
            res.sendStatus(404);
        }
    } catch (e) {
        console.log("😵 WHATSAPP WEBHOOK FAILED..")
        console.log(e.message)
        console.log("--------------------")
    }
}

function sendMessage(phone_number_id, user, message) {
    return new Promise(async response => {
        const sent = await axios({
            method: "POST",
            url:
                "https://graph.facebook.com/v17.0/" +
                phone_number_id +
                "/messages?access_token=" +
                token,
            data: {
                messaging_product: "whatsapp",
                to: user,
                text: { body: message },
            },
            headers: { "Content-Type": "application/json" },
        });
        response(sent.data);
    })
}
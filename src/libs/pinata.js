import dotenv from 'dotenv'
import { Readable } from 'stream'
import axios from 'axios'
import FormData from 'form-data'

export function uploadFileOnPinata(content, filename) {
    dotenv.config()
    return new Promise(async response => {
        if (process.env.PINATA_JWT !== undefined) {
            try {
                console.log('Uploading ' + filename + '..')
                const stream = Readable.from(content);
                const formData = new FormData();
                formData.append("file", stream, { filename: filename });
                formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }))
                formData.append("pinataMetadata", JSON.stringify({ name: "[UMi] " + filename }))
                const uploaded = await axios.post(
                    "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    formData,
                    {
                        maxBodyLength: 'Infinity',
                        headers: {
                            "Content-Type": "multipart/form-data; boundary=" + formData._boundary,
                            "Authorization": "Bearer " + process.env.PINATA_JWT
                        },
                    }
                )
                if (uploaded.data.IpfsHash !== undefined) {
                    response(uploaded.data.IpfsHash)
                } else {
                    response(false)
                }
            } catch (e) {
                console.log('Pinata upload failed')
                console.log(e.message)
                console.log("--------------------")
                response(false)
            }
        } else {
            console.log('Pinata is not configured.')
            response(false)
        }
    })
}
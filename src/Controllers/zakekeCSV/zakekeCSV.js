import axios from "axios";
import fs from "fs";
import qs from "qs";

export const get_csv = (req,res) => {
    const sourcePath = "./ZakekeFiles/csv-data.zip";
    fs.readFile(sourcePath, async function(err, data) {
        if(err) {
            res.status(400).json({error:{global:"file was not found"}});
        }
        else {
            let returndata = {}
            let sendData = qs.stringify({
                'grant_type':'client_credentials',
                'access_type':'S2S'
              });
              const token = `${process.env.ZAKEKE_CLIENT_ID}:${process.env.ZAKEKE_SECRET}`;
              const encodedToken = Buffer.from(token).toString('base64');
              const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + encodedToken
              }
              await axios({
                url: 'https://api.zakeke.com/token',
                method: "POST",
                data: sendData,
                headers: headers
               })
               .then((data) => {
                 returndata= data.data
               })
               .catch((err) => {
                res.status(400).json({error:{global:"error while generating token"}});
               })

               returndata["ziploc"] = "/ZakekeFiles/csv-data.zip";

               res.status(200).json({returndata})
        }
    })
}

export default { get_csv }
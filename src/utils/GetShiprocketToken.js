import tokenModel from "../models/tokens";
import shipRocketAuth from "./ShipRocketAuthenticate";


export default async function() {
    let tokenJsonData = [];
    let token = "";
    await tokenModel.find()
    .where('name', 'shiprocket')
    .exec()
    .then((resultdata) => {
        if(resultdata) {
            tokenJsonData = resultdata
        }
    })

    if(tokenJsonData.length != 0) {
        let expiryDate = new Date(tokenJsonData[0].expiry_date);
        let date_now = new Date()
        if(expiryDate < date_now)
        {
            console.log("expiry has passed")
            token = await shipRocketAuth('new');
        }
        else
        {
            token = tokenJsonData[0].token
        }
    }
    else {
        token = await shipRocketAuth('new create');
    }
    console.log("token value is:"+token)

    return token;
}
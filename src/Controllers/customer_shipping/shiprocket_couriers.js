import axios from "axios";
import getShipToken from "../../utils/GetShiprocketToken";


export const get_charges = async (req,res) => {
    const pincode = req.params.pincode
    const weight = req.params.weight


    const token = await getShipToken();
    if(token != "") {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        var config = {
        method: 'get',
        url: 'https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode='+process.env.SHIPROCKET_PICKUP_PIN+'&delivery_postcode='+pincode+'&cod=0&weight='+weight,
        headers: headers
        };
        
        axios(config)
        .then(function (response) {
            console.log("status from shiprocket"+response.status)
            res.status(201).jsonp( response.data );
        })
        .catch(function (error) {
        console.log("error occured while fetching info"+error);
        res.status(400).json({ errors: error })
        });
    }
    else {
        res.status(400).json({error:{global:"token could not be generated"}});
    }
}

export const get_supportedCountries = async (req,res) => {
    const token = await getShipToken();
    if(token != "") {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        var config = {
        method: 'get',
        url: 'https://apiv2.shiprocket.in/v1/external/countries',
        headers: headers
        };
        
        axios(config)
        .then(function (response) {
            console.log("status from shiprocket"+response.status)
            res.status(201).jsonp( response.data );
        })
        .catch(function (error) {
        console.log("error occured while fetching info"+error);
        res.status(400).json({ errors: error })
        });
    }
}

export const get_statesCity = (req,res) => {
    const pincode = req.params.id;
    const headers = {
        'Content-Type': 'application/json'
      }
    var config = {
    method: 'get',
    url: 'http://www.postalpincode.in/api/pincode/'+pincode,
    headers: headers
    };
    
    axios(config)
    .then(function (response) {
        res.status(201).jsonp( response.data );
    })
    .catch(function (error) {
    console.log("error occured while fetching info"+error);
    res.status(400).json({ errors: error })
    });
}


export default { get_charges, get_supportedCountries, get_statesCity }
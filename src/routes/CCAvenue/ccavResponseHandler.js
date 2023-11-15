import http from 'http';
import fs from 'fs';
import { decrypt } from '../../utils/ccavutil';
import { add_credits } from '../../utils/addCCAVCredit';
import { parse } from 'querystring';

export function postRes(request, response) {
    var ccavEncResponse = '',
        ccavResponse = '',
        workingKey = 'AC214F01FED912185696FBCAEA204B00',	//Put in the 32-Bit key shared by CCAvenues.
        ccavPOST = '';

    request.on('data', function (data) {
        ccavEncResponse += data;
        ccavPOST = parse(ccavEncResponse);
        var encryption = ccavPOST.encResp;
        ccavResponse = decrypt(encryption, workingKey);
    });

    request.on('end', async function () {
        var encoded = Object.fromEntries(new URLSearchParams(ccavResponse));
        let retStatus = await add_credits(encoded.order_id,encoded.order_status,encoded.amount);
        var pData = '';
        pData = '<table border=1 cellspacing=2 cellpadding=2><tr><td>'
        pData = pData + ccavResponse.replace(/=/gi, '</td><td>')
        pData = pData.replace(/&/gi, '</td></tr><tr><td>')
        pData = pData + '</td></tr></table>'
        var htmlcode = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Response Page</b></font><br>' + pData + '</center><br></body></html>';
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(htmlcode);
        response.end();
    });
};

export default { postRes }

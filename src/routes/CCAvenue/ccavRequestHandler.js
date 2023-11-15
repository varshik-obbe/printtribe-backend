import http from 'http';
import fs from 'fs';
import { encrypt } from '../../utils/ccavutil';
import { parse } from 'querystring';

export function postReq(request,response){
    var body = '',
	workingKey = 'AC214F01FED912185696FBCAEA204B00',		//Put in the 32-Bit key shared by CCAvenues.
	accessCode = 'AVIA25KJ96CF31AIFC',		//Put in the access code shared by CCAvenues.
	encRequest = '',
	formbody = '';
				
    request.on('data', function (data) {
	body += data;
	encRequest = encrypt(body,workingKey); 
	var bodyDat =  parse(body);
	formbody = '<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';
    });

    request.on('end', function () {
        response.writeHeader(200, {"Content-Type": "text/html"});
	response.write(formbody);
	response.end();
    });
   return; 
}

export default { postReq }
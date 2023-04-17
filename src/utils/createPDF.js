import fs from "fs";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import { promisify } from "util";


function convertTZ(date, tzString) {
  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

export default async function(customer_name,address,zipcode,shipping_charges,state,state_code,email,phone,invoice_no,city,productInfo,gst_details,total_price,design_gst,handling_gst) {
    try {
        const readFile = promisify(fs.readFile);

          let html = await readFile("./uploads/invoice_template.html", 'utf-8');
          Handlebars.registerHelper('calculate', function(price,quant){
            // str is the argument passed to the helper when called
            let total = price * quant;
            return total.toFixed(2);
          });

          Handlebars.registerHelper('ifCond', function(sgst2, igst2, options) {
            if(sgst2 != 0.00 || igst2 != 0.00) {
              return options.fn(this);
            }
            else {
              return options.inverse(this);
            }
          });

          let template = Handlebars.compile(html);

          let nowdate = new Date();
          
          const nDate = convertTZ(nowdate, "Asia/Calcutta");

          let dateAdd = nDate.getDate() + '-' + nDate.getMonth() + '-' + nDate.getFullYear();

          let totalGross = 0.00;

          Promise.all(productInfo.map((item, key) => {
            let total = parseInt(item.price) * parseInt(item.quantity);
            totalGross = totalGross + total;
          }))

          let cgst1 = 0.00;
          let sgst1 = 0.00;
          let igst1 = 0.00;
          let cgst1_perc = "";
          let sgst1_perc = "";
          let igst1_perc = "";
          let cgst2 = 0.00;
          let sgst2 = 0.00;
          let igst2 = 0.00;
          let cgst2_perc = "";
          let sgst2_perc = "";
          let igst2_perc = "";
          let cgst3 = 0.00;
          let sgst3 = 0.00;
          let igst3 = 0.00;
          let cgst3_perc = "";
          let sgst3_perc = "";
          let igst3_perc = "";
          let design_sgst = 0.00;
          let design_cgst = 0.00;
          let design_igst = 0.00;
          let handle_cgst = 0.00;
          let handle_sgst = 0.00;
          let handle_igst = 0.00;
          let design_sgst_perc = "";
          let design_cgst_perc = "";
          let design_igst_perc = "";
          let handle_cgst_perc = "";
          let handle_sgst_perc = "";
          let handle_igst_perc = "";
          

          let total_gst_amount = 0.00;

          let i = 0;
          Promise.all(gst_details.map((itemGst,keyGst) => {
            if(state_code == "29") {
              if(i == 0 && keyGst == 0) {
                cgst1 = parseFloat(itemGst.gst_amount).toFixed(2);
                sgst1 = parseFloat(itemGst.gst_amount).toFixed(2);
                cgst1_perc = itemGst.gst_percent;
                sgst1_perc = itemGst.gst_percent;
                i = i + 2;
              }
              else if(i == 2 && keyGst == 2) {
                cgst2 = parseFloat(itemGst.gst_amount).toFixed(2);
                sgst2 = parseFloat(itemGst.gst_amount).toFixed(2);
                cgst2_perc = itemGst.gst_percent;
                sgst2_perc = itemGst.gst_percent;
                i = i + 2;
              }
              else if(i == 4 && keyGst == 4) {
                cgst3 = parseFloat(itemGst.gst_amount).toFixed(2);
                sgst3 = parseFloat(itemGst.gst_amount).toFixed(2);
                cgst3_perc = itemGst.gst_percent;
                sgst3_perc = itemGst.gst_percent;
                i = i + 2;
              }
            }
            else {
              if(i == 0 && keyGst == 0) {
                igst1 = parseFloat(itemGst.gst_amount).toFixed(2);
                igst1_perc = itemGst.gst_percent;
                i = i + 1;
              }
              else if (i == 1 && keyGst == 1) {
                igst2 = parseFloat(itemGst.gst_amount).toFixed(2);
                igst2_perc = itemGst.gst_percent;
                i = i + 1;
              }
              else if (i == 2 && keyGst == 2) {
                igst3 = parseFloat(itemGst.gst_amount).toFixed(2);
                igst3_perc = itemGst.gst_percent;
                i = i + 1;
              }
            }
          }))

          if(design_gst) {
            Promise.all(design_gst.map((itemGst,keyGst) => {
              if(state_code == "29") {
                design_cgst = parseFloat(itemGst.gst_amount).toFixed(2);
                design_sgst = parseFloat(itemGst.gst_amount).toFixed(2);
                design_sgst_perc = itemGst.gst_percent;
                design_cgst_perc = itemGst.gst_percent;
              }
              else {
                design_igst = parseFloat(itemGst.gst_amount).toFixed(2);
                design_igst_perc = itemGst.gst_percent;
              }
            }))
          }

          if(handling_gst) {
            Promise.all(handling_gst.map((itemGst,keyGst) => {
              if(state_code == "29") {
                handle_cgst = parseFloat(itemGst.gst_amount).toFixed(2);
                handle_sgst = parseFloat(itemGst.gst_amount).toFixed(2);
                handle_sgst_perc = itemGst.gst_percent;
                handle_cgst_perc = itemGst.gst_percent;
              }
              else {
                handle_igst = parseFloat(itemGst.gst_amount).toFixed(2);
                handle_igst_perc = itemGst.gst_percent;
              }
            }))
          }

          console.log("sgst 1 value is: "+sgst1+" cgst 1 is "+ cgst1 + " sgst 2 is "+sgst2+" cgst 2 is "+cgst2);

          total_gst_amount = parseFloat(sgst1) + parseFloat(cgst1) + parseFloat(igst1) + parseFloat(sgst2) + parseFloat(cgst2) + parseFloat(igst2) + parseFloat(sgst3) + parseFloat(cgst3) + parseFloat(igst3) + parseFloat(design_cgst) + parseFloat(design_sgst) + parseFloat(handle_cgst) + parseFloat(handle_sgst) + parseFloat(design_igst) + parseFloat(handle_igst);

          console.log("total gst amount is "+total_gst_amount);

          let amountInWords = await inWords(parseInt(total_price));

          let data = {
            cust_name: customer_name,
            date_set: dateAdd.toString(),
            invoice_no: invoice_no,
            address: address,
            zipcode: zipcode,
            state: state,
            state_code: state_code,
            email_id: email,
            phone: phone,
            city: city,
            productInfo: productInfo,
            totalGross: totalGross.toFixed(2),
            gst_details: gst_details,
            design_gst: design_gst,
            handling_gst: handling_gst,
            sgst1: sgst1,
            cgst1: cgst1,
            igst1: igst1,
            sgst2: sgst2,
            cgst2: cgst2,
            igst2: igst2,
            cgst3: cgst3,
            sgst3: sgst3,
            igst3: igst3,
            design_cgst: design_cgst,
            design_sgst: design_sgst,
            design_igst: design_igst,
            handle_cgst: handle_cgst,
            handle_sgst: handle_sgst,
            handle_igst: handle_igst,
            cgst1_perc: cgst1_perc,
            sgst1_perc: sgst1_perc,
            igst1_perc: igst1_perc,
            cgst2_perc: cgst2_perc,
            sgst2_perc: sgst2_perc,
            igst2_perc: igst2_perc,
            cgst3_perc: cgst3_perc,
            sgst3_perc: sgst3_perc,
            igst3_perc: igst3_perc,
            design_cgst_perc: design_cgst_perc,
            design_sgst_perc: design_sgst_perc,
            design_igst_perc: design_igst_perc,
            handle_cgst_perc: handle_cgst_perc,
            handle_sgst_perc: handle_sgst_perc,
            handle_igst_perc: handle_igst_perc,
            total_gst_amount: parseFloat(total_gst_amount).toFixed(2),
            shipping_charges: shipping_charges,
            total_price: parseFloat(total_price).toFixed(2),
            amountInWords: amountInWords
        };

        let htmlToSend = template(data);

        let pdfName = customer_name.replace(/ |'/g,"_") + Date.now().toString();

          // launch a new chrome instance
  const browser = await puppeteer.launch({args: ['--no-sandbox']})

  // create a new page
  const page = await browser.newPage()

  // set your html as the pages content
  await page.setContent(htmlToSend, {
    waitUntil: 'domcontentloaded'
  })

  // create a pdf buffer
  const pdfBuffer = await page.pdf({
    format: 'A4'
  })

  // or a .pdf file
  await page.pdf({
    // width: '35cm',
    // height: '30cm',
    format: 'A4',
    margin: {
        top: '2px',
        bottom: '2px',
        left: '2px',
        right: '2px',
    },
    path: `./uploads/`+pdfName+`.pdf`
  })

  // close the browser
  await browser.close()

  return pdfName;

        // let createdData = await pdfCreating(htmlToSend,pdfName);

        // if(createdData != "") {
        //     return pdfName;
        // }
        // else {
        //     return pdfName;
        // }
    }
    catch(err) {
        let pfName = "";
        console.log("ran into an error"+err);
        return pfName;
    }
}

async function inWords (num) {
  var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
  var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}
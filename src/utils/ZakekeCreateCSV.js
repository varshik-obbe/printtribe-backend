import { writeToPath } from '@fast-csv/format';
import { parseFile } from 'fast-csv';
import fs from "fs";
import JSZip from 'jszip';
import path from "path";
import Products from "../models/products";
import zakekeConfig from '../models/zakekeConfig';
import DeleteCSV from "./DeleteCSVFiles";
var zip = new JSZip();

export default async function(productid,variants) {    
    try {
      const __dirname = path.resolve();
      if (fs.existsSync(path.join(__dirname, 'ZakekeFiles/products.txt'))) {
        //file exists

        let rows = [[]];

        let rowsSides = [[]];

        let rowsAreas = [[]];

        let rowsPrintTypes = [[]];

        let rowsSidesPrint = [[]];

        rows = await readCSV(path.join(__dirname, 'ZakekeFiles/products.txt'), rows);

        rowsSides = await readCSV(path.join(__dirname, 'ZakekeFiles/sides.txt'), rowsSides);

        rowsAreas = await readCSV(path.join(__dirname, 'ZakekeFiles/areas.txt'), rowsAreas);

        rowsPrintTypes = await readCSV(path.join(__dirname, 'ZakekeFiles/printTypes.txt'), rowsPrintTypes);

        rowsSidesPrint = await readCSV(path.join(__dirname, 'ZakekeFiles/sidesPrintTypes.txt'), rowsSidesPrint);

          // parseFile(path.join(__dirname, 'ZakekeFiles/products.txt'), {headers : false})
          //   .on('error', error => console.error(error))
          //   .on('data', row => {
          //     rows.push([row])
          //    })
          //   .on('end', (rowCount) => {
          //     console.log('csv data :'+rows)
          //     console.log(`Parsed ${rowCount} rows`)
          //   });

          await DeleteCSV('products.txt');

          await DeleteCSV('areas.txt');

          await DeleteCSV('sides.txt');

          await DeleteCSV('printTypes.txt');

          await DeleteCSV('sidesPrintTypes.txt');

          console.log('csv products parse data: '+rows);

          await writeToFile(rows,rowsSides,rowsAreas,rowsPrintTypes,rowsSidesPrint,productid,variants);
        
      }
      else {
        let rows = [["MasterProductID","ProductID","ProductName","ImageLink","Attributes","VariantName","VariantNameLocale"]];

        let rowsSides = [["MasterProductID","VariantName","SideName","SideNameLocale","UrlImageSide","SideCode","PPCM"]];

        let rowsAreas = [["MasterProductID","VariantName","SideName","AreaName","UrlAreaMask","ClipOut"]];

        let rowsPrintTypes = [["MasterProductID","PrintType","PrintTypeNameLocale","DPI","DisableSellerCliparts","DisableUploadImages","UseFixedImageSizes","DisableText","CanChangeSvgColors","CanUseImageFilters","CanIgnoreQualityWarning","EnableUserImageUpload","EnableJpgUpload","EnablePngUpload","EnableSvgUpload","EnablePdfUpload","EnablePdfWithRasterUpload","EnableEpsUpload","EnableFacebookUpload","EnableInstagramUpload","EnablePreviewDesignsPDF"]];

        let rowsSidesPrint = [["MasterProductID","VariantName","SideName","PrintType","DPI","DisableSellerCliparts","DisableUploadImages","UseFixedImageSizes","DisableText","CanChangeSvgColors","CanUseImageFilters"]];

        await writeToFile(rows,rowsSides,rowsAreas,rowsPrintTypes,rowsSidesPrint,productid,variants)
      }

      await zipFiles("./ZakekeFiles/products.txt", "products.txt")

      await zipFiles("./ZakekeFiles/areas.txt", "areas.txt")

      await zipFiles("./ZakekeFiles/sides.txt", "sides.txt")

      await zipFiles("./ZakekeFiles/printTypes.txt", "printTypes.txt")

      await zipFiles("./ZakekeFiles/sidesPrintTypes.txt", "sidesPrintTypes.txt.txt")


      zip
      .generateNodeStream({type:'nodebuffer',streamFiles:true})
      .pipe(fs.createWriteStream('./ZakekeFiles/csv-data.zip'))
      .on('finish', async function () {
          // JSZip generates a readable stream with a "end" event,
          // but is piped here in a writable stream which emits a "finish" event.
          console.log("csv-data.zip written.");

          //  let dataFile = qs.stringify({
          //   'data': process.env.PROJ_DEV_HOST+'ZakekeFiles/csv-data.zip'
          // });
          //  const headersZip = {
          //   'Accept': 'application/json',
          //   'Content-Type': 'multipart/form-data',
          //   'Authorization': 'Bearer ' + bearerObject.access_token
          // }
          //  const zipUploaded = await axios({
          //   url: 'https://api.zakeke.com/v2/csv/import', 
          //   method: "POST",
          //   data: dataFile,
          //   headers: headersZip
          //  })
          //  .catch((err) => {
          //    console.log("error while zip post request :"+err)
          //  })


          //  console.log("response :"+zipUploaded.LastError)
      });

    } catch(err) {
      console.error(err)
    }    
}

async function zipFiles(sourcePath,name)
{
  var contentPromise = new JSZip.external.Promise(function (resolve, reject) {
    fs.readFile(sourcePath, function(err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
  });

  zip.file(name, contentPromise);
}

async function readCSV(path,data)
{
  return new Promise((resolve,reject) => {
    parseFile(path, {headers : false})
    .on('error', error => {
      console.error(error)
      reject(error)
    })
    .on('data', row => {
      data.push(row)
     })
    .on('end', (rowCount) => {
      console.log("data is :"+data)
      console.log(`Parsed ${rowCount} rows`)
      resolve(data)
    });
  })
}

async function writeToFile(rows,rowsSides,rowsAreas,rowsPrintTypes,rowsSidesPrint,productid,variants) {
  let response = {};
  let zakekeConfigData = {};
  const __dirname = path.resolve();

  await Products.find({'_id':productid})
  .exec().
  then((productdata)=>{
      response = {
          count:productdata.length,
          productdata:productdata.map((productrecord)=>({
              id:productrecord._id,
              title: productrecord.title,
              description: productrecord.description,
              price: productrecord.price,
              productsizes: productrecord.productsizes,
              productcolors: productrecord.productcolors,
              cover_img: productrecord.cover_img,
              category_id: productrecord.category_id,
              img: productrecord.img,
              quantity: productrecord.quantity
          
          }))
      }
  })
  .catch((err)=>{
      res.status(500).json({error:{global:"something went wrong while fetching the product"}});
  });
  await zakekeConfig.find()
  .exec().
  then((zakekedata)=>{
      zakekeConfigData = {
              zakekedata: zakekedata.map((zakekerecord)=>({
                id:zakekerecord._id,
                clipOut: zakekerecord.clipOut,
                PrintType: zakekerecord.PrintType,
                DPI: zakekerecord.DPI,
                DisableSellerCliparts: zakekerecord.DisableSellerCliparts,
                DisableUploadImages: zakekerecord.DisableUploadImages,
                UseFixedImageSizes: zakekerecord.UseFixedImageSizes,
                DisableText: zakekerecord.DisableText,
                CanChangeSvgColors: zakekerecord.CanChangeSvgColors,
                CanUseImageFilters: zakekerecord.CanUseImageFilters,
                CanIgnoreQualityWarning: zakekerecord.CanIgnoreQualityWarning,
                EnableUserImageUpload: zakekerecord.EnableUserImageUpload,
                EnableJpgUpload: zakekerecord.EnableJpgUpload,
                panEnablePngUpload: zakekerecord.panEnablePngUpload,
                EnableSvgUpload: zakekerecord.EnableSvgUpload,
                EnablePdfUpload: zakekerecord.EnablePdfUpload,
                EnablePdfWithRasterUpload: zakekerecord.EnablePdfWithRasterUpload,
                EnableEpsUpload: zakekerecord.EnableEpsUpload,
                EnableFacebookUpload: zakekerecord.EnableFacebookUpload,
                EnableInstagramUpload: zakekerecord.EnableInstagramUpload,
                EnablePreviewDesignsPDF: zakekerecord.EnablePreviewDesignsPDF
          }))
      }
  })
  .catch((err)=>{
      res.status(500).json({error:{global:"something went wrong while fetching the product"}});
  });


  for (let i = 0; i < variants.length; i++){
    rows.push([`${response.productdata[0].id}`, `${variants[i].colorName+productid}`, `${response.productdata[0].title}`, `${process.env.PROJ_DEV_HOST+response.productdata[0].img}`, `Color = ${i + 1}`, `${variants[i].colorName}`, ``])
  }

  for (let i = 0; i < variants.length; i++){
    rowsSides.push([`${response.productdata[0].id}`, `${variants[i].colorName}`, `Front`, ``, `${variants[i].frontImgURL}`, ``, `21.5`])
    rowsSides.push([`${response.productdata[0].id}`, `${variants[i].colorName}`, `Back`, ``, `${variants[i].backImgURL}`, ``, `21.5`])
  }

  for (let i = 0; i < variants.length; i++){
    rowsAreas.push([`${response.productdata[0].id}`, `${variants[i].colorName}`, `Front`, `Front Area`, `https://zakekecdn.blob.core.windows.net/cdn/examples/example_images/tshirt_front_mask.png`, `${zakekeConfigData.zakekedata[0].clipOut}`])
    rowsAreas.push([`${response.productdata[0].id}`, `${variants[i].colorName}`, `Back`, `Back Area`, `https://zakekecdn.blob.core.windows.net/cdn/examples/example_images/tshirt_back_mask.png`, `${zakekeConfigData.zakekedata[0].clipOut}`])
  }

  for (let i = 0; i < variants.length; i++){
    rowsPrintTypes.push([`${response.productdata[0].id}`, `${zakekeConfigData.zakekedata[0].PrintType}`, ``, `${zakekeConfigData.zakekedata[0].DPI}`, `${zakekeConfigData.zakekedata[0].DisableSellerCliparts}`, `${zakekeConfigData.zakekedata[0].DisableUploadImages}`, `${zakekeConfigData.zakekedata[0].UseFixedImageSizes}`, `${zakekeConfigData.zakekedata[0].DisableText}`, `${zakekeConfigData.zakekedata[0].CanChangeSvgColors}`, `${zakekeConfigData.zakekedata[0].CanUseImageFilters}`, `${zakekeConfigData.zakekedata[0].CanIgnoreQualityWarning}`, `${zakekeConfigData.zakekedata[0].EnableUserImageUpload}`, `${zakekeConfigData.zakekedata[0].EnableJpgUpload}`, `${zakekeConfigData.zakekedata[0].EnablePngUpload}`, `${zakekeConfigData.zakekedata[0].EnableSvgUpload}`, `${zakekeConfigData.zakekedata[0].EnablePdfUpload}`, `${zakekeConfigData.zakekedata[0].EnablePdfWithRasterUpload}`, `${zakekeConfigData.zakekedata[0].EnableEpsUpload}`, `${zakekeConfigData.zakekedata[0].EnableFacebookUpload}`, `${zakekeConfigData.zakekedata[0].EnableInstagramUpload}`, `${zakekeConfigData.zakekedata[0].EnablePreviewDesignsPDF}`])
  }

  for (let i = 0; i < variants.length; i++){
    rowsSidesPrint.push([`${response.productdata[0].id}`, `${variants[i].colorName}`, `Front`, `${zakekeConfigData.zakekedata[0].PrintType}`, `${zakekeConfigData.zakekedata[0].DPI}`, `${zakekeConfigData.zakekedata[0].DisableSellerCliparts}`, `${zakekeConfigData.zakekedata[0].DisableUploadImages}`, `${zakekeConfigData.zakekedata[0].UseFixedImageSizes}`, `${zakekeConfigData.zakekedata[0].DisableText}`, `${zakekeConfigData.zakekedata[0].CanChangeSvgColors}`, `${zakekeConfigData.zakekedata[0].CanUseImageFilters}`])
    rowsSidesPrint.push([`${response.productdata[0].id}`, `${variants[i].colorName}`, `Back`, `${zakekeConfigData.zakekedata[0].PrintType}`, `${zakekeConfigData.zakekedata[0].DPI}`, `${zakekeConfigData.zakekedata[0].DisableSellerCliparts}`, `${zakekeConfigData.zakekedata[0].DisableUploadImages}`, `${zakekeConfigData.zakekedata[0].UseFixedImageSizes}`, `${zakekeConfigData.zakekedata[0].DisableText}`, `${zakekeConfigData.zakekedata[0].CanChangeSvgColors}`, `${zakekeConfigData.zakekedata[0].CanUseImageFilters}`])
  }

  try {

    let data = await WriteToCSV(path.join(__dirname, 'ZakekeFiles/products.txt'), rows);

    let sidesData = await WriteToCSV(path.join(__dirname, 'ZakekeFiles/sides.txt'), rowsSides);
    
    let areasData = await WriteToCSV(path.join(__dirname, 'ZakekeFiles/areas.txt'), rowsAreas);

    let printTypesData = await WriteToCSV(path.join(__dirname, 'ZakekeFiles/printTypes.txt'), rowsPrintTypes);

    let sidesPrintData = await WriteToCSV(path.join(__dirname, 'ZakekeFiles/sidesPrintTypes.txt'), rowsSidesPrint);
    
    // writeToPath(path.join(__dirname, 'ZakekeFiles/products.txt'), rows)
    // .on('error', err => console.error(err))
    // .on('finish', () => console.log('Done writing.'));

    // writeToPath(path.join(__dirname, 'ZakekeFiles/sides.txt'), rowsSides)
    // .on('error', err => console.error(err))
    // .on('finish', () => console.log('Done writing Sides.'));
    
    // writeToPath(path.join(__dirname, 'ZakekeFiles/areas.txt'), rowsAreas)
    // .on('error', err => console.error(err))
    // .on('finish', () => console.log('Done writing Areas.'));

    // writeToPath(path.join(__dirname, 'ZakekeFiles/printTypes.txt'), rowsPrintTypes)
    // .on('error', err => console.error(err))
    // .on('finish', () => console.log('Done writing Print.'));
  
    // writeToPath(path.join(__dirname, 'ZakekeFiles/sidesPrintTypes.txt'), rowsSidesPrint)
    // .on('error', err => console.error(err))
    // .on('finish', () => console.log('Done writing side Print.'));
  }
  catch (errors) {
    console.log(errors);
  }

}

async function WriteToCSV(path, data) {
  return new Promise((resolve,reject) => {
    writeToPath(path, data)
    .on('error', err => reject(err))
    .on('finish', (data) => {
      console.log("finished writing to :"+path)
      resolve(data)
    });
  })
}
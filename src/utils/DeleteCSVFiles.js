import fs from 'fs';

export default async function deleteFile(filename) {

  // delete a file
  try {
      fs.unlinkSync('./ZakekeFiles/'+filename);
  
      console.log("File is deleted.");
  } catch (error) {
      console.log(error);
  }
}
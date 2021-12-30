import fs from 'fs';

export default function deleteFile(filename) {

  // delete a file
  try {
      fs.unlinkSync('./uploads/'+filename);
  
      console.log("File is deleted.");
  } catch (error) {
      console.log(error);
  }
}
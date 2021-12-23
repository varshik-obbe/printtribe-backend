import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const zakekeConfigSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    clipOut: {type:String, required: true},
    PrintType: {type:String},
    DPI: {type: String, required: true},
    DisableSellerCliparts: {type: String},
    DisableUploadImages: {type: String},
    UseFixedImageSizes: {type: String},
    DisableText: {type: String},
    CanChangeSvgColors: {type: String},
    CanUseImageFilters: {type: String},
    CanIgnoreQualityWarning: {type: String},
    EnableUserImageUpload: {type: String},
    EnableJpgUpload: {type: String},
    panEnablePngUpload: {type: String},
    EnableSvgUpload: {type: String},
    EnablePdfUpload: {type: String},
    EnablePdfWithRasterUpload: {type: String},
    EnableEpsUpload: {type: String},
    EnableFacebookUpload: {type: String},
    EnableInstagramUpload: {type: String},
    EnablePreviewDesignsPDF: {type: String}
},{ timestamps:true });


zakekeConfigSchema.plugin(uniqueValidator)

export default mongoose.model('Zakeke',zakekeConfigSchema);
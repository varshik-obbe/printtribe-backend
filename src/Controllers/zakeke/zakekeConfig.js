import mongoose from "mongoose";
import Zakeke from "../../models/zakekeConfig";
import ParseErrors from "../../utils/ParseErrors";


export const add_Config = (req,res)=>{
    const { configdata } = req.body;
    console.log(configdata);
    const zakeke = new Zakeke({
        _id:mongoose.Types.ObjectId(),
        clipOut: configdata.clipOut,
        PrintType: configdata.PrintType,
        DPI: configdata.DPI,
        DisableSellerCliparts: configdata.DisableSellerCliparts,
        DisableUploadImages: configdata.DisableUploadImages,
        UseFixedImageSizes: configdata.UseFixedImageSizes,
        DisableText: configdata.DisableText,
        CanChangeSvgColors: configdata.CanChangeSvgColors,
        CanUseImageFilters: configdata.CanUseImageFilters,
        CanIgnoreQualityWarning: configdata.CanIgnoreQualityWarning,
        EnableUserImageUpload: configdata.EnableUserImageUpload,
        EnableJpgUpload: configdata.EnableJpgUpload,
        panEnablePngUpload: configdata.panEnablePngUpload,
        EnableSvgUpload: configdata.EnableSvgUpload,
        EnablePdfUpload: configdata.EnablePdfUpload,
        EnablePdfWithRasterUpload: configdata.EnablePdfWithRasterUpload,
        EnableEpsUpload: configdata.EnableEpsUpload,
        EnableFacebookUpload: configdata.EnableFacebookUpload,
        EnableInstagramUpload: configdata.EnableInstagramUpload,
        EnablePreviewDesignsPDF: configdata.EnablePreviewDesignsPDF
    })
    zakeke.save().then((zakekeConfigRecord)=>res.status(201).json({zakekeConfigRecord}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
}

export const getConfig = (req,res) => {
    Zakeke.find()
    .exec()
    .then((zakekeConfigData)=>{
        const response = {
            count:zakekeConfigData.length,
            zakekeconfigdata: zakekeConfigData.map((zakekeConfig)=>({
                    id:zakekeConfig._id,
                    clipOut: zakekeConfig.clipOut,
                    PrintType: zakekeConfig.PrintType,
                    DPI: zakekeConfig.DPI,
                    DisableSellerCliparts: zakekeConfig.DisableSellerCliparts,
                    DisableUploadImages: zakekeConfig.DisableUploadImages,
                    UseFixedImageSizes: zakekeConfig.UseFixedImageSizes,
                    DisableText: zakekeConfig.DisableText,
                    CanChangeSvgColors: zakekeConfig.CanChangeSvgColors,
                    CanUseImageFilters: zakekeConfig.CanUseImageFilters,
                    CanIgnoreQualityWarning: zakekeConfig.CanIgnoreQualityWarning,
                    EnableUserImageUpload: zakekeConfig.EnableUserImageUpload,
                    EnableJpgUpload: zakekeConfig.EnableJpgUpload,
                    panEnablePngUpload: zakekeConfig.panEnablePngUpload,
                    EnableSvgUpload: zakekeConfig.EnableSvgUpload,
                    EnablePdfUpload: zakekeConfig.EnablePdfUpload,
                    EnablePdfWithRasterUpload: zakekeConfig.EnablePdfWithRasterUpload,
                    EnableEpsUpload: zakekeConfig.EnableEpsUpload,
                    EnableFacebookUpload: zakekeConfig.EnableFacebookUpload,
                    EnableInstagramUpload: zakekeConfig.EnableInstagramUpload,
                    EnablePreviewDesignsPDF: zakekeConfig.EnablePreviewDesignsPDF
                }))
        }
        res.status(200).json({zakekeconfigdata:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const updateZakekeConfig = (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    Zakeke.updateOne({_id: id}, {$set: data}).exec().then((zakekeConfigRecord)=>{
        res.status(200).json({success:{global:"User details is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export default { add_Config, getConfig, updateZakekeConfig }
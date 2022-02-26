import mongoose from "mongoose";
import Categories from "../../models/categories";
import Products from "../../models/products";
import ParseErrors from "../../utils/ParseErrors";


export const add_Products = async (req, res, err) => {
        const data = req.body;
        if(!req.files.cover_img)
        {
            res.status(400).json({errors: {'error':'image is not selected'}});   
        }
        else {
            console.log(data);


            let sizes_json_obj = JSON.parse(data.sizes);
            let colors_json_obj = JSON.parse(data.colors);


            // await Promise.all(sizes_json_obj.map((item, key) => {
            //     sizes_arr.push(item);
            // })
            // )
            // await Promise.all(colors_json_obj.map((item, key) => {
            //     colors_arr.push(item);
            // })
            // )

            let product_extraImgsArr = [];

        try {
            if(req.files.extra_imgs.length > 0)
            {
                await Promise.all(req.files.extra_imgs.map((item,key) => {
                    product_extraImgsArr.push(item.path.toString());
                }))
            }
        }
        catch(err) {
            console.log("extra images not entered");
        }


            const categories = new Products({
                _id: mongoose.Types.ObjectId(),
                title: data.title,
                description: data.description,
                price: data.price,
                productsizes: sizes_json_obj,
                productcolors: colors_json_obj,
                cover_img: req.files.cover_img[0].path,
                category_id: data.category_id,
                img: req.files.img[0].path,
                quantity: data.quantity,
                extra_imgs: product_extraImgsArr
            });
            categories.save().then((productsValue) => {
                res.status(201).jsonp({ productsValue })
            })
                .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }));
        }
}

export const get_products = async (req,res) => {
    const maincat = await Categories.find()
        .where('maincat', '0')
        .where('subcat', '0')
        .exec()
        .then((result) => {
            const response = {
                categories: result.map((categoriesdata) => ({
                    id: categoriesdata._id,
                    name: categoriesdata.category,
                    url: categoriesdata.url,
                    img: categoriesdata.img,
                    maincat: categoriesdata.maincat,
                    subcat: categoriesdata.subcat,
                    subCategories: []
                }))
            }
            return response;
        });
    if (Array.isArray(maincat.categories) && maincat.categories.length) {
        await Promise.all(maincat.categories.map(async (item, key) => {
            const subcat = await Categories.find()
                .where('maincat', item.id)
                .where('subcat', '0')
                .exec()
                .then((resultsub) => {
                    const response = {
                        subcategories: resultsub.map((subcategoriesdata) => ({
                            id: subcategoriesdata._id,
                            name: subcategoriesdata.category,
                            url: subcategoriesdata.url,
                            img: subcategoriesdata.img,
                            maincat: subcategoriesdata.maincat,
                            subcat: subcategoriesdata.subcat
                        }))
                    }
                    maincat.categories[key]["subCategories"] = response.subcategories;
                });
                if (Array.isArray(maincat.categories[key].subCategories) && maincat.categories.length > 0) {
                    await Promise.all(maincat.categories[key].subCategories.map(async (itemsub, keysub) => {
                        const subsubcat = await Categories.find()
                        .where('maincat', item.id)
                        .where('subcat', itemsub.id)
                        .exec()
                        .then((resultsubsub) => {
                            const responsesub = {
                                subsubcategories: resultsubsub.map((subsubcategoriesdata) => ({
                                    id: subsubcategoriesdata._id,
                                    name: subsubcategoriesdata.category,
                                    url: subsubcategoriesdata.url,
                                    img: subsubcategoriesdata.img,
                                    maincat: subsubcategoriesdata.maincat,
                                    subcat: subsubcategoriesdata.subcat
                                }))
                            }
                            maincat.categories[key].subCategories[keysub]["subsubCategories"] = responsesub.subsubcategories;                          
                        });
                        const products = await Products.find()
                        .where('category_id', itemsub.id)
                        .exec()
                        .then((resultProducts) => {
                            const responseProducts = {
                                subProducts: resultProducts.map((subproductsData) => ({
                                    id: subproductsData._id,
                                    title: subproductsData.title,
                                    description: subproductsData.description,
                                    price: subproductsData.price,
                                    productsizes: subproductsData.productsizes,
                                    productcolors: subproductsData.productcolors,
                                    cover_img: subproductsData.cover_img,
                                    category_id: subproductsData.category_id,
                                    img: subproductsData.img,
                                    quantity: subproductsData.quantity,
                                    extra_imgs: subproductsData.extra_imgs
                                }))
                            }
                            maincat.categories[key].subCategories[keysub]["products"] = responseProducts.subProducts;
                        });
                        if(Array.isArray(maincat.categories[key].subCategories[keysub].subsubCategories) && maincat.categories[key].subCategories[keysub].subsubCategories.length > 0) {
                            await Promise.all(maincat.categories[key].subCategories[keysub].subsubCategories.map(async (itemsproducts, productskeysub) => {
                                const subsubProducts = await Products.find()
                                .where('category_id', itemsproducts.id)
                                .exec()
                                .then((resultsubsubProducts) => {
                                    const responseSubSubProducts = {
                                        subSubProducts: resultsubsubProducts.map((subsubProductsData) => ({
                                            id: subsubProductsData._id,
                                            title: subsubProductsData.title,
                                            description: subsubProductsData.description,
                                            price: subsubProductsData.price,
                                            productsizes: subsubProductsData.productsizes,
                                            productcolors: subsubProductsData.productcolors,
                                            cover_img: subsubProductsData.cover_img,
                                            category_id: subsubProductsData.category_id,
                                            img: subsubProductsData.img,
                                            quantity: subsubProductsData.quantity,
                                            extra_imgs: subsubProductsData.extra_imgs
                                        }))
                                    }
                                    maincat.categories[key].subCategories[keysub].subsubCategories[productskeysub]["products"] = responseSubSubProducts.subSubProducts;
                                });
                            }))
                        }
                    }))
                }
        }))
    }
    res.status(201).json({ maincat });
}

export const get_SingleProduct = (req,res) => {
    Products.find({'_id':req.params.id})
    .exec().
    then((productdata)=>{
        const response = {
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
                quantity: productrecord.quantity,
                extra_imgs: productrecord.extra_imgs
            
            }))
        }
        res.status(200).json({product:response});
    })
    .catch((err)=>{
        res.status(500).json({error:{global:"something went wrong"}});
    });
}

export const update_product = async (req,res) => {
    const id = req.query.id;
    let cover_img = "";	    
    let img = "";
    if(!req.files.cover_img && !req.files.cover_img){	    
        cover_img = "";
        img = "";	    
    }else{	    
        cover_img = req.files.cover_img[0].path;
        img = req.files.img[0].path;
    }
    
    let  data = req.body;
    if(data == undefined) {
        data = {};
    }
    if(cover_img.trim().length >0 || img.trim().length >0) {
        data.cover_img = cover_img;
        data.img = img;
    }

    if(data.sizes)
    {
        data.sizes = JSON.parse(data.sizes);
    }
    if(data.colors) {
        data.colors = JSON.parse(data.colors);
    }

    if(data.sizes || data.colors) {
        if(data.sizes && !data.colors) {
            console.log("entered sizes part")
            await Products.updateOne({_id: id}, {$set: {"productsizes": data.sizes}}).exec().then((productRecord)=>{
            }).catch((err)=>{
                res.status(400).json({error:{global:"something went wrong while updating sizes"+err}});
            })
        }
        else if(!data.sizes || data.colors) {
            await Products.updateOne({_id: id}, {$set: {"productcolors": data.colors}}).exec().then((productRecord)=>{
            }).catch((err)=>{
                res.status(400).json({error:{global:"something went wrong while updating colors"}});
            })            
        }
        else if(data.sizes || data.colors) {
            await Products.updateOne({_id: id}, {$set: {"productcolors": data.colors, "productsizes": data.sizes}}).exec().then((productRecord)=>{
            }).catch((err)=>{
                res.status(400).json({error:{global:"something went wrong while updating colors and sizes"}});
            })                        
        }
    }
        await Products.updateOne({_id: id}, {$set: data}).exec().then((productRecord)=>{
        }).catch((err)=>{
            res.status(400).json({error:{global:"something went wrong"}});
        })

        if(res.headersSent) { 
         }
         else {
            res.status(200).json({success:{global:"product updated successfully"}})
         }
}

export const search_products = (req,res) => {
    const text = req.params.text

    let title = new RegExp(text)

    Products.find({
        "$or": [
            { title: { '$regex':  title, '$options': 'i'} },
            { description: { '$regex':  title, '$options': 'i'} }
        ]
    })
    .exec()
    .then((data) => {
        res.status(200).json({ products: data })
    })
    .catch((err) => {
        res.status(400).json({error:{global:"could not find the products"}});
    })
}

export const delete_Products = (req,res) => {
    const id = req.params.id;
    Products.deleteOne({_id: id},function(err,data){
        if(err){
            console.log(err);
            res.send('error');
        }
        else
        {
            console.log(data);
            return res.send('success')
        }
    });
}

export default { add_Products, get_products, get_SingleProduct, update_product, delete_Products, search_products }
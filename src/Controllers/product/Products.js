import mongoose from "mongoose";
import Categories from "../../models/categories";
import Products from "../../models/products";
import ParseErrors from "../../utils/ParseErrors";


export const add_Products = (req, res, err) => {
        const  data = req.body;
        if(req.file == "undefined")
        {
            res.status(400).json({errors: {'error':'image is not selected'}});   
        }
        else {
            console.log(data);
            const categories = new Products({
                _id: mongoose.Types.ObjectId(),
                title: data.title,
                description: data.description,
                price: data.price,
                productsizes: data.sizes,
                productcolors: data.colors,
                cover_img: req.files.cover_img[0].path,
                category_id: data.category_id,
                img: req.files.img[0].path,
                quantity: data.quantity
            });
            categories.save().then(async (productsValue) => {
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
                                    quantity: subproductsData.quantity
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
                                            quantity: subsubProductsData.quantity
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
                quantity: productrecord.quantity
            
            }))
        }
        res.status(200).json({product:response});
    })
    .catch((err)=>{
        res.status(500).json({error:{global:"something went wrong"}});
    });
}

export const update_product = (req,res) => {
    const id = req.query.id;
    let cover_img = "";	    
    let img = "";
    if(req.files){	    
        cover_img = req.files.cover_img[0].path;
        img = req.files.img[0].path;
    }else{	    
        cover_img = "";
        img = "";	    
    }
    
    let  data = req.body;
    if(data == undefined) {
        data = {};
    }
    if(cover_img.trim().length >0 || img.trim().length >0) {
        data.cover_img = cover_img;
        data.img = img;
    }
    Products.updateOne({_id: id}, {$set: data}).exec().then((productRecord)=>{
        res.status(200).json({success:{global:"Product details is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
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

export default { add_Products, get_products, get_SingleProduct, update_product, delete_Products }
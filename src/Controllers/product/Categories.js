import mongoose from "mongoose";
import Categories from "../../models/categories";
import ParseErrors from "../../utils/ParseErrors";


export const add_Categories = (req, res) => {
    const { data } = req.body;
    console.log(data);
    const categories = new Categories({
        _id: mongoose.Types.ObjectId(),
        category: data.name,
        url: data.url,
        img: data.img,
        maincat: data.maincat,
        subcat: data.subcat
    });
    categories.save().then(async (categoriesValue) => {
        res.status(201).json({ categoriesValue })
    })
        .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }));
}

export const get_Categories = async (req, res) => {

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
                if (Array.isArray(maincat.categories[key].subCategories) && maincat.categories.length) {
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
                    }))
                }
        }))
    }
    res.status(201).json({ maincat });
}

export const update_categories = (req,res) => {
    const data = req.body.data;
    const id = data['id'];
    const insData = {
        category: data['name'],
        url: data['url'],
        img: data['img'],
        maincat: data['maincat'],
        subcat: data['subcat']
    };
    Categories.updateOne({_id: id}, {$set: insData}).exec().then((userRecord)=>{
        res.status(200).json({success:{global:"Categorie updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const delete_Category = (req,res) => {
    const id = req.params.id;
    Categories.deleteOne({_id: id},function(err,data){
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

export default { add_Categories, get_Categories, update_categories, delete_Category }


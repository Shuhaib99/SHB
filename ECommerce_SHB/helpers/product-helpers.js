
const { ObjectId } = require('mongodb')
let db = require('../config/connection')
let collection = require('../config/collections')
const collections = require('../config/collections')
const { promise } = require('bcrypt/promises')
const { resolve, reject } = require('promise')
const { response } = require('express')
const res = require('express/lib/response')
const { errorFunc } = require('express-fileupload/lib/utilities')
let objectID = require('mongodb').ObjectId



module.exports = {
    addProduct: (Product) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(Product).then((data) => {
                    resolve(data.insertedId)
                })
            } catch (error) {
                reject(error)
            }
        })

    },
    getSingleProduct: (proID) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectID(proID) }).then((product) => {
                    resolve(product)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
                    [
                        {
                            $set: {
                                'category': { '$toObjectId': '$category' }
                            }
                        },
                        {
                            $lookup: {
                                from: collection.CATEGORY_COLLECTION,
                                localField: 'category',
                                foreignField: '_id',
                                as: 'category'
                            }
                        },
                        // {
                        //     $set: {                               
                        //         'subcategory': { '$toObjectId': '$subcategory' }
                        //     }
                        // },
                        // {
                        //     $lookup: {
                        //         from: collection.CATEGORY_COLLECTION,
                        //         localField: 'subcategory',
                        //         foreignField: 'subcategory.sub_id',
                        //         as: 'subcat'
                        //     }
                        // },                

                    ]).toArray()
                    //product[0].category[0].
                // console.log(product[0].subcat)
                resolve(product)
            } catch (error) {
                reject(error)
            }
        })
    },

    getUpdateProduct: (proID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectID(proID) }).then((product) => {
                    resolve(product)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    setUpdateProduct: (products, proID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectID(proID) },
                    {
                        $set: {
                            name: products.name,
                            price: parseInt(products.price),
                            size: products.size,
                            category: products.category,
                            qty: parseInt(products.qty),
                            description: products.description,
                            myimg: products.myimg
                        }
                    }).then((response) => {
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },

    deleteProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectID(proId) }).then((response) => {
                    resolve(response)

                })
            } catch (error) {
                reject(error)
            }
        })

    },


    addCategory: (categry) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categry).then((data) => {
                    // console.log(categry)
                    resolve(data)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    addSubCategory: (sub_categry) => {
        return new Promise(async(resolve, reject) => {
            try {
                let subcategory = []
                subcategory = { sub_id: objectID(), subname: sub_categry.subcategoryname }
                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectID(sub_categry.maincategory) },
                    {
                        $push:
                        {
                            subcategory: subcategory
                        }

                    }
                )
                        resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },

    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                resolve(categories)
            } catch (error) {
                reject(error)
            }
        })
    },
    getSubCategoryOnChange:(catID)=>{
        return new Promise(async (resolve, reject) => {
            try {
                let categ= await db.get().collection(collection.CATEGORY_COLLECTION).find({ _id: objectID(catID) }).toArray()//.then((category) => {
                  
                    resolve(categ[0])
            } catch (error) {
                reject(error)
            }
        })
    },

    getUpdateCategory: (catID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let categ= await db.get().collection(collection.CATEGORY_COLLECTION).find({ _id: objectID(catID) }).toArray()//.then((category) => {
                   
                    resolve(categ[0])
            } catch (error) {
                reject(error)
            }
        })
    },
    setUpdateCategory: (categ, catID) => {
        return new Promise(async (resolve, reject0) => {
            try {
                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectID(catID) },
                    {
                        $set: {
                            name: categ.name,
                            description: categ.description
                        }
                    }).then((response) => {
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }
        })

    },
    setUpdateSubCategory: (categ, catID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectID(catID) ,'subcategory.sub_id': objectID(categ.subcategory) },
                    {
                        $set: {
                            
                            'subcategory.$.subname': categ.editsubcategoryname,

                        }
                    }).then((response) => {
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }
        })

    },


    deleteCategory: (catId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectID(catId) }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })

    },


    // .....................cart.................................

    getCountCart: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userID) })
                if (cart != null) {
                    cart = cart.product.length
                    resolve(cart)
                } else {
                    resolve(0)
                }
            } catch (error) {
                reject(error)
            }
        })

    },

    getProductByCategory: (cat) => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: cat }).toArray()

                resolve(products)
            } catch (error) {
                reject(error)
            }

        })
    }

}

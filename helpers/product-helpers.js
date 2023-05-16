
var db=require('../config/connection')
var collection=require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports={

    addProduct:(product, callback)=>{
        console.log(product)

        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
            callback(data.insertedId)
        })
        
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    remProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            console.log(proId);
            console.log(new objectId(proId));
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new objectId(proId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })

    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId, proDetails)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category,
                    //Image:proDetails.Image
                }
            }).then((response)=>{
                resolve(response)

            })
        })

    },
    adminLogin:(adminData)=>{
        console.log(adminData)
        return new Promise(async (resolve, reject) => {
            let response = {}

            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })
            if (admin){
                if(adminData.password==admin.password){
                    console.log('Login Success');
                    response.admin = admin
                    response.status = true
                    resolve(response)
                }else{
                    console.log('Login Failed');
                    resolve({status:false})
                }
                
            } else {
                console.log('Login Failed');
                resolve({ status: false })
            }
        })

    }
}
const mongoose = require('mongoose') ; 


mongoose.connect('mongodb://localhost:27017/userscrud'); 


const userSchema = mongoose.Schema({
    name: String , 
    email: String , 
    image:{type:String, 
          default: "default.png"
    } , 
    
    adminId:
        {
            type:mongoose.Schema.Types.ObjectId ,
            ref: 'admin'
        }
    
})

module.exports = mongoose.model('user',userSchema) ;
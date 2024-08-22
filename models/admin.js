const mongoose = require('mongoose') ; 

const userSchema = mongoose.Schema({
    email: String , 
    password: String , 
    user:[
        {
            type:mongoose.Schema.Types.ObjectId ,
            ref: 'user'
        }
    ]
})

module.exports = mongoose.model('admin',userSchema) ;
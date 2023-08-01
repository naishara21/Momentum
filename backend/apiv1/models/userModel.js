const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema; 
const SALT_WORK_FACTOR = 10; 

const UserSchema = new Schema({
    name: {
        type: String, 
        required: true
    }, 
    email: {
        type: String, 
        required: true,  
        index: { unique: true }
    }, 
    password: {
        type: String, 
        required: true
    }, 
    creationDate: {
        type: Date,
        default: Date.now,
    }
});

UserSchema.pre('save', function (next) {
    let user = this; 
    // Only hash the password if it's new or modified
    if (!user.isModified('password')) {
      return next();
    }
    
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err , salt) {
        if (err) return next(err);

        //hash the password using new salt
        bcrypt.hash(user.password, salt, function(err, hash){
            if (err) return next(err);

            // override the cleartext password with the hashed one 
            user.password = hash; 
            next();
        }); 
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model("User", UserSchema);
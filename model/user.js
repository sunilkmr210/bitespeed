const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        phoneNumber: { type: String },
        email: { type: String },
        linkendId: {type: String},
        linkPrecedence: {type: String}
    },
    {timestamps: true}
);

//Creating index to reduce search time as inserting a new data take O(logn) because of B-tree while searching takes O(n) without index
userSchema.index({ email: 1, phoneNumber: 1 })

module.exports = mongoose.model('user', userSchema);
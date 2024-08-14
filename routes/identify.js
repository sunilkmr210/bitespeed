const router = require('express').Router();
const User = require('../model/user');
const mongoose = require('mongoose');

router.post('/identify', async (req, res)=>{
    const email = req.body.email||null;
    const phoneNumber = req.body.phoneNumber||null;

    //finding all the entries of cultprit user
    const users = await User.find({
        $or: [
            {email: email},
            {phoneNumber: phoneNumber}
        ]
    });
    if(users.length==0){

        //saving user directly if it is new
        const newUser = new User({
            email: email,
            phoneNumber: phoneNumber,
            linkPrecedence: "primary"
        });

        try{
            const savedUser = await newUser.save();
            const culprit = {
                "contact":{
                    "primaryContatctId": savedUser._id,
                    "emails": [savedUser.email],
                    "phoneNumbers": [savedUser.phoneNumber],
                    "secondaryContactIds": []
                }
            }
            res.status(200).json(culprit);
        }catch(err){
            res.status(400).json(err);
        }
    }
    else{

        let primary;
        let min = new Date('2025-08-01T12:00:00Z')

        // finding first entry of culprit
        for (let i = 0; i < users.length; i++) {
            const element = users[i];
            const date = element.createdAt;
            if(date<min){
                min = date;
                primary = element;
            }
        }

        const newUser = new User({
            email: email,
            phoneNumber: phoneNumber,
            linkendId: primary._id,
            linkPrecedence: "secondary"
        });

        try{
            const savedUser = await newUser.save();
            users.push(savedUser);
        }catch(err){
            console.log(err);
        }

        let culprit = {
            "contact":{
                "primaryContatctId": primary._id,
                "emails": [primary.email],
                "phoneNumbers": [primary.phoneNumber],
                "secondaryContactIds": []
            }
        }

        //adding all the secondaryIds, emails and phoneNumbers of culprit
        for (let i = 0; i < users.length; i++) {
            if(users[i]!=primary){
                culprit.contact.secondaryContactIds.push(users[i]._id);
                if(!culprit.contact.emails.includes(users[i].email)){
                    culprit.contact.emails.push(users[i].email);
                }
                if(!culprit.contact.phoneNumbers.includes(users[i].phoneNumber)){
                    culprit.contact.phoneNumbers.push(users[i].phoneNumber);
                }
            }
        }

        //updating linkPrecedence of culprit from primary to secondary
        await User.updateMany(
            {_id: {$ne: new mongoose.Types.ObjectId(primary._id)}},
            {$set: {linkendId: primary._id, linkPrecedence: "secondary"}}
        );

        res.status(200).json(culprit);

    }
})

module.exports = router;
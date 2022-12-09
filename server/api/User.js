const express = require('express')
const router = express.Router()

//mongodb user model
const User = require('./../models/User')

//mongodb userOTPVerification model
const UserOTPVerification = require('./../models/UserOTPVerification')

//env variables
require('dotenv').config()

//email handler
const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
})

//Password Handler
const bcrypt = require('bcrypt')

//jsonwebtoken
const jwt = require('jsonwebtoken')


router.post("/register", (req, res) => {
  let { fname, lname, email, password } = req.body
  fname = fname.trim()
  lname = lname.trim()
  email = email.trim()
  password = password.trim()

    if(fname == "" || lname =="" || email == "" || password == "" ){
        res.send({ status: "data error" })
    }else if(!/^[a-zA-Z]*$/.test(fname)){
        res.send({ status: "fname error" })
    }else if (!/^[a-zA-Z]*$/.test(lname)){
        res.send({ status: "lname error" })
    }else if (!/^[\w+\.]+@([\w+]+\.)+[\w-]{2,4}$/.test(email)){
        res.send({ status: "email error" })
    }else if (password.length < 8 ){
        res.send({ status: "password error" })
    }else{
        //Checking if user already exist
        User.find({email}).then(result => {
            if(result.length){
                return res.send({ status: "User exists" })
            }else{
               //Try to create a new user
                
               //password handling
                const saltRounds = 10
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                const newUser = new User ({
                    fname,
                    lname,
                    email,
                    password: hashedPassword,
                    verified: false,
                })

                newUser.save().then(result => {
                    
                    //sendOTPVerificationEmail(result, res)
                    res.send({ status: "ok" })
                })
                .catch( e => {
                    res.send({ status: "error" })
                })

               })
               .catch( e => {
                    res.send({ status: "error" })
               })

            }
        }).catch(e => {
            console.log(e)
            res.send({ status: "error" })
        })
    }
    
})


router.post("/login-user", (req, res) => {
    let { email, password } = req.body

    email = email.trim()
    password = password.trim()

    if(email == "" || password == "" ){
        res.send({ status: "data error" })
    }else{
        //Check if the user exists
        User.find({email})
        .then( data => {
            if(data.length){
                //User exists
        
                    const hashedPassword = data[0].password
                    bcrypt.compare(password, hashedPassword).then(result => {
                        if(result){
                            //Password match

                            const token = jwt.sign({ email: email }, process.env.JWT_SECRET)

                            if(!data[0].verified)  {

                                sendOTPVerificationEmail(data, token, res)

                            }else{
                                return res.json({ status: "ok", act: token , data: data[0]})
                            }    
                        }else{
                            return res.json({ status: "error", error: "Invalid Password" })
                        }
                    })
                    .catch(e => {
                        res.json({ status: "password match error"})
                    })
                
            }else{
                res.json({ status: "Invalid Credentials"})
            }
        })
        .catch(e => {
            res.json({ status: "searching user failed"})
        })
    }


});


 router.post("/userData", async (req, res) => {
 const { token } = req.body;
 try {
   const user = jwt.verify(token, process.env.JWT_SECRET);

   const useremail = user.email;
   User.findOne({ email: useremail })
     .then((data) => {
       res.send({ status: "ok", data: data });
     })
     .catch((error) => {
       res.send({ status: "error", data: error });
     });
 } catch (error) {}
});


//verify otp email
router.post("/verifyOTP", async (req, res) => {
    try{

        let { userId, otp } = req.body;
        if(!userId || !otp) {
            throw Error("Empty otp details are not allowed");
        }else {
            const UserOTPVerificationRecords = await UserOTPVerification.find({
                userId,
            });
            if (UserOTPVerificationRecords.length <= 0) {
                //no record found
                throw new Error(
                    "Account record doesn't exist or has been verified already. Please sing up or log in"
                );
            }else {
                //user otp record exists
                const { expiresAt } = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;
                 
                if (expiresAt < Date.now()) {
                    //user otp record has expired
                    await UserOTPVerification.deleteMany({ userId });
                    throw new Error("code has expired. please request again");
                }else {
                   const validOTP = await bcrypt.compare(otp, hashedOTP);

                   if(!validOTP) {
                    //supplied otp is wrong
                    throw new Error("invalid code passed.check your inbox");

                   } else {
                    //success
                    await User.updateOne({ _id: userId }, {verified: true });
                    await UserOTPVerification.deleteMany({ userId });
                    const _id = userId;
                    
                    User.find({_id})
                    .then( data => {
                        if(data.length){
                            const token = jwt.sign({ email: data[0].email }, process.env.JWT_SECRET)
                            res.json({
                                status: "VERIFIED",
                                message: "user email verified successfully",
                            })
                        }
                    });
                   }
                }
            }
        }
    }catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        });
    }
});

//resend verification
router.post("/resendOTPVerificationCode", async (req, res) => {
    try{
        let { userId, email } = req.body;
        
        if( !userId || !email) {
            throw Error("empty user details are not allowed");
        } else {
            //deleting existing records and re-send
            await UserOTPVerification.deleteMany({ userId });
            
            try{
                const otp = `${Math.floor(1000 + Math.random()*9000)}`
                  //hash the otp
                  const saltRounds =10
                  const hashedOTP = await bcrypt.hash(otp, saltRounds)
                  const newOTPVerification = await new UserOTPVerification({
                      userId: userId,
                      otp: hashedOTP,
                      createdAt: Date.now(),
                      expiresAt: Date.now() + 3600000,
                  })
        
                //save otp record
                await newOTPVerification.save()
        
                //mail options
                const mailOptions = {
                    from: process.env.AUTH_EMAIL,
                    to: email,
                    subject: 'Verify your Email',
                    html: `<p>Enter ${otp}</b> in the app to verify your email </p><p>This code expires in 1 hour</p>`,
                }
        
                await transporter.sendMail(mailOptions)
                .then(async () => {
                    res.send({
                        status: 'ok'
                    })
                })
                .catch((e) => {
                    console.log(e)
                    res.send({
                        status: 'verification error'
                    })
                }) 
               
            }catch(e){
        
            }

        }

    }catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        });
    }
});


//Send otp verification email
const sendOTPVerificationEmail = async (data,token, res) => {
    
    const userId= data[0]._id
    await UserOTPVerification.deleteMany({ userId });

    try{
        const otp = `${Math.floor(1000 + Math.random()*9000)}`
          //hash the otp
          const saltRounds =10
          const hashedOTP = await bcrypt.hash(otp, saltRounds)
          const newOTPVerification = await new UserOTPVerification({
              userId: userId,
              otp: hashedOTP,
              createdAt: Date.now(),
              expiresAt: Date.now() + 3600000,
          })

        //save otp record
        await newOTPVerification.save()

        //mail options
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: data[0].email,
            subject: 'Verify your Email',
            html: `<p>Enter ${otp}</b> in the app to verify your email </p><p>This code expires in 1 hour</p>`,
        }

        await transporter.sendMail(mailOptions)
        .then(async () => {
             await UserOTPVerification.find({userId})
            .then( id => {
            if(id.length){
                                    
             res.json({
                status: "FAILED",
                message: "email hasn't been verified yet. check your inbox",
                iddata: id[0],
                data: data[0],
                act: token
                                        
                })
            }else{
                res.json({ status: "no otp"})
            }
        })
            .catch(e => {
                res.json({ status: "otp sending error"})
             })
        })
        .catch((e) => {
            console.log(e)
            res.send({
                status: 'verification error'
            })
        }) 
       
    }catch(e){

    }
}

module.exports = router
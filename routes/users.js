const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const validator = require('validator');
const authenticate = require('../services/authentication');
const MailService = require('../services/mail')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { nanoid } = require('nanoid')


const router = express.Router();



router.post('/register', async (req, res) => {
   try {
      let user = await User.findOne({ email: req.body.email, username: req.body.username });
      console.log(user)
      if (user) {
         res.status(400).json({
            message: "Email or username already registered"
         });
      } else if (!validator.isEmail(req.body.email)) {
         res.status(400).json({
            message: "Invalid Email, please enter a valid email"
         })
      } else {
         let salt = await bcrypt.genSalt(10)
         let hashpassword = await bcrypt.hash(req.body.password, salt)

         const newUser = new User({
            email: req.body.email,
            password: hashpassword,
            username: req.body.username,
            createdAt: new Date().toISOString(),
         })
         const result = await newUser.save();
         console.log(result)
         const mail = new MailService();
         console.log(mail)

         const mailSubject = "Registration for  Tasksubmission app";

         const mailTo = newUser.email;
         console.log(mailTo)

         const mailBody = `<div>
  <h3> successfully registered </h3>
  <p>Please click the given link to login <a target="_blank" href="${process.env.REQUEST_ORIGIN}/login"> click here </a></p>
 </div>`;

         mail.sendMail(mailSubject, mailBody, mailTo);


         res.json({
            message: "User Registered Successfully check the mail",
         });


      }

   } catch (error) {
      console.log(error)
      res.status(400).json({
         message: "Unable to register please enter valid details",
      });
   }
});

router.post('/login', async (req, res) => {
   try {
      let user = await User.findOne({ email: req.body.email });
      console.log(user.email, user.password)
      console.log(user.password, req.body.password)
      if (user) {

         let isUserAuthenticated = await bcrypt.compare(
            req.body.password,
            user.password,
         );

         if (isUserAuthenticated) {
            let token = jwt.sign(
               { userid: user._id, username: user.username, email: user.email },
               process.env.SECRET_KEY, 

            );
            res.json({
               message: "User Authenticated Successfully",
               token,
               data: {
                  email: user.email,
                  username: user.username,
                  
                  
               },
            });
         } else {
            res.status(400).json({
               message: "Password is wrong for the provided email",
            });
         }
      } else {
         res.status(400).json({
            message: "Entered Email does not exists",
         });
      }

   } catch (error) {
      console.log(error)
      res.status(401).json({
         message: 'user not found'
      })
   }
})

router.post('/forgot-password', async (req, res) => {
   try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
         let resetToken = nanoid(10)
         user.resetPasswordToken = resetToken;
         user.resetPasswordTokenExpiry = Date.now() + 30000;
         await user.save();

         console.log('resetToken', resetToken);
         // Send mail for account activation
         const mailService = new MailService();
         const mailSubject = 'Reset Password for Tasksubmission app';
         const mailBody = `<div>
             <h3>Reset Password</h3>
             <p>Please click the given link to reset your password <a target="_blank" href="${process.env.REQUEST_ORIGIN}/reset-password/${encodeURIComponent(resetToken)}"> click here </a></p>
         </div>`;

         const mailTo = user.email;

         // send mail for account activation
         mailService.sendMail(mailSubject, mailBody, mailTo);

         //send response message for uesr
         res.json({
            message: `Mail has been sent to ${user.email}</h4> with further instructions`,
         })
      } else {
         res.status(400).json({
            message: 'User not found',
         })
      }

   } catch (error) {
      console.log(error)
      res.status(400).json({
         message: 'error'
      })
   }
});

router.put('/reset', async (req, res) => {
   try {
      console.log(req.body.token)
      let user = await User.findOne({ resetPasswordToken: decodeURIComponent(req.body.token) });
      console.log(user)
      if (user) {

         let salt = await bcrypt.genSalt(10);
         let hashPassword = await bcrypt.hash(req.body.password, salt);

         // Updating user password
         user.password = hashPassword;
         user.resetPasswordToken = '';
         user.resetPasswordTokenExpiry = '';
         await user.save();

         // Send message for suucessfull password reset
         const mailService = new MailService();
         const mailSubject = 'Successfully changed Password for  Tasksubmission app';
         const mailBody = `<div>
              <h3>Your password was changed successfully </h3>
          </div>`;

         const mailTo = user.email;

         // send mail for account activation
         mailService.sendMail(mailSubject, mailBody, mailTo);

         res.json({
            message: "Password reset successfull check your mail for confirmation",

            data: {
               email: user.email
            }
         })
      } else {
         res.status(400).json({
            message: "Failed to update password token invalid",
         })
      }
   } catch (error) {
      console.log(error)
      res.status(400).json({
         message: "error occured"
      })
   }
})

router.get('/ping', authenticate, async (req, res) => {
   try {
      // check if user exists and is active
      let user = await User.findOne({ _id: req.body.userid });
      if (user) {
         res.json({
            message: "user is logged in",
            data: {
               email: req.body.email,
               userid: req.body.userid
            }
         })
      } else {
         res.status(400).json({
            message: "User Does not exists",
         })
      }
   } catch (err) {
      console.log(err);
   }
})

module.exports = router
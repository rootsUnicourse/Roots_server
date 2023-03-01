import express from 'express'
import nodemailer from 'nodemailer';
import PasswordResetToken from '../modules/forgetPass.js'
import User from '../modules/user.js'
import crypto from 'crypto-js';
import bcrypt from 'bcryptjs'

const router = express.Router();

router.post('/', async(req, res) =>{
    
    
    const { email } = req.body;

    // Check if the email address exists in the database
    const user = await User.findOne({ email });

    if (user) {
        // Generate a unique token
        const token = crypto.lib.WordArray.random(32).toString();
        // Create a new PasswordResetToken object and save it to the database
        const passwordResetToken = new PasswordResetToken({
            email: user.email,
            token,
            expiryDate: new Date(Date.now() + 3600000), // Set the token expiration to 1 hour from now
        });
        await passwordResetToken.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rootsunicourse@gmail.com',
                pass: 'rimpshltgloqyrdh',
            },
        });
    
        const mailOptions = {
            from: 'rootsunicourse@gmail.com',
            to: email,
            subject: 'Roots Password Reset Request',
            html: `<p>Click the link below to reset your password:</p><a href="http://localhost:3000/resetpassword/${token}">Reset Password</a>`,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).send('Error sending email');
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).send('Email sent');
            }
        });
    } else {
    // The email address doesn't exist in the database, so return an error response
        res.status(404).send('Email not found');
    }


    


})

router.post('/reset-password', async (req, res) => {
    const { password, token } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log(token);
    // Find the password reset token in the database
    const passwordResetToken = await PasswordResetToken.findOne({ token });
    
    if (!passwordResetToken) {
      // If the token is not found, return an error response
        return res.status(400).send('Invalid token');
    }

    if (passwordResetToken.expiryDate < Date.now()) {
      // If the token has expired, delete the token from the database and return an error response
        await passwordResetToken.delete();
        return res.status(400).send('Token expired');
    }

    // Find the user in the database and update their password
    const result = await User.findOneAndUpdate(
        { email: passwordResetToken.email },
        { password: hashedPassword },
        { new: true },
    );

    // Delete the password reset token from the database
    await passwordResetToken.delete();

    // Return a success response
    res.send('Password reset successful');
});


export default router
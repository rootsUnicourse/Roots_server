import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.gmail.com', // the host of the SMTP server
    port: 587, // the port of the SMTP server
    secure: false, // use SSL
    service: 'gmail',
    auth: {
        user: 'danelyehuda1998@gmail.com',
        pass: 'hzcwoodogbzcckyr'
    }
});

router.post('/',(req, res) => {
    // handle email sending logic here
    const { name, email, message } = req.body;
    const mailOptions = {
        from: email,
        to: ['danelyehuda1998@gmail.com', 'idanke86@gmail.com', 'amitke91@gmail.com'], // replace with the desired email addresses
        subject: `New message from ${ name ? name : email} (Roots)`,
        text: message
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send({error});
        } else {
            console.log('Email sent: ' + info.response);
            res.send({message: 'email sent'});
        }
    });
})

export default router
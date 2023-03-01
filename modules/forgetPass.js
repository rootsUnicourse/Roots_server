import mongoose from 'mongoose';

const passwordResetTokenSchema = mongoose.Schema({
    email: String,
    token: String,
    expiryDate: {
        type: Date,
        required: true,
    },
});

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;

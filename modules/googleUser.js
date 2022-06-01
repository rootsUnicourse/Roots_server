import mongoose from 'mongoose'

const googleUserSchema = mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    id : { type: String },
    parantId : String,
    imageUrl: String,
})

export default mongoose.model("googleUser", googleUserSchema)
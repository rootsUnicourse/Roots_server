import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String },
    id : { type: String },
    parantId : String,
    imageUrl: String,
})

export default mongoose.model("User", userSchema)
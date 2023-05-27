import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String },
    id : { type: String },
    parentId : { type: String },
    imageUrl: String,
    moneyEarned: { type: Number, default: 0 },
    moneyWaiting: { type: Number, default: 0 },
    moneyApproved: { type: Number, default: 0 },
    cashWithdrawn: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    descendantsEarnings: [{
        descendant: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        earnings: { 
            type: Number, 
            default: 0 
        }
    }],
})

export default mongoose.model("User", userSchema)
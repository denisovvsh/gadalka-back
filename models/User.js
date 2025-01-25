import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    }, 
    name: String,
    password: String,
    role: {
        type: String,
        default: "user"
    },
    date: String,
    date1: String,
    date2: String,
    tab: String,
    results: [String]
}, {
    timestamps: true,
});

export default mongoose.model('User', UserSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["user", "admin"], default: "user", index: true },
  phone:    { type: String, required: true, trim: true },
  gender:   { type: String, required: true },
  avatar:   { type: String },               // profile picture URL
  resetOTP:       { type: String },
  resetOTPExpiry: { type: Date }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
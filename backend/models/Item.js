import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  itemType: { type: String, enum: ["lost", "found"], required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  color: { type: String },
  description: { type: String },
  parkZone: { type: String, required: true }, 
  dateTime: { type: Date, required: true },
  image: { 
    type: String  // KA SAAR GETTER-KA HALKAN SI AY SAN XOGTU UDAX UNKANTID
  },
  imageVisible: { type: Boolean, default: false }, // Admin-ka ayaa maamulaya
  status: {
    type: String,
    enum: ["pending", "verified", "matched", "claimed", "returned"],
    default: "pending"
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model("Item", itemSchema);
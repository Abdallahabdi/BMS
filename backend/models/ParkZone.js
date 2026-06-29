import mongoose from "mongoose";

const parkZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, default: "MapPin" }, // lucide icon name
  color: { type: String, default: "text-emerald-500" },
  bg: { type: String, default: "bg-emerald-500/10" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("ParkZone", parkZoneSchema);

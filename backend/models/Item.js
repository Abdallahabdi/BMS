import mongoose from "mongoose"

const itemSchema = new mongoose.Schema({
  itemType: { type:String, enum:["lost","found"], required:true },
  itemName: { type:String, required:true },
  category: { type:String, required:true },
  color: { type:String },
  description: { type:String },
  parkZone: { type:String, required:true }, // Daarusalaam Park Zones
  dateTime: { type:Date, required:true },
  image: { type:String },
  status: {
    type:String,
    enum:["pending","verified","matched","claimed","returned"],
    default:"pending"
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
},{ timestamps:true })

export default mongoose.model("Item", itemSchema)


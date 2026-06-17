import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String },
  attachmentUrl: { type: String }, // PDF ama Sawir cadeyn ah
  timestamp: { type: Date, default: Date.now }
});

const ClaimSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  claimer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Claim', ClaimSchema);
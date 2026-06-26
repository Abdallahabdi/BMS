import Claim from "../models/Claim.js";
import Item from "../models/Item.js";
import { createNotification } from "./notificationController.js";

// @desc    Get all claims for the logged-in user
// @route   GET /api/claims
// @access  Private
export const getMyClaims = async (req, res) => {
  try {
    // User can be the 'claimer' or the 'owner' of the item
    // First, find items reported by this user
    const units = await Item.find({ reportedBy: req.user._id });
    const itemIds = units.map(u => u._id);

    let query = {
      $or: [
        { claimer: req.user._id },
        { item: { $in: itemIds } }
      ]
    };

    // If admin, show everything
    if (req.user.role === 'admin') {
      query = {};
    }

    const claims = await Claim.find(query)
    .populate("item")
    .populate("claimer", "name email")
    .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claims", error: error.message });
  }
};

// @desc    Get single claim with messages
// @route   GET /api/claims/:id
// @access  Private
export const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("item")
      .populate("claimer", "name email")
      .populate("messages.sender", "name email");

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claim details", error: error.message });
  }
};

// @desc    Send a message in a claim
// @route   POST /api/claims/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { text, attachmentUrl } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const newMessage = {
      sender: req.user._id,
      text,
      attachmentUrl,
      timestamp: new Date()
    };

    claim.messages.push(newMessage);
    await claim.save();

    // Return the updated claim or just the message
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// @desc    Create a new claim
// @route   POST /api/claims
// @access  Private
export const createClaim = async (req, res) => {
  try {
    const { itemId } = req.body;
    
    // Check if item exists
    const item = await Item.findById(itemId).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Check if already claimed by this user
    const existing = await Claim.findOne({ item: itemId, claimer: req.user._id });
    if (existing) return res.status(400).json({ message: "You have already claimed this item." });

    const claim = await Claim.create({
      item: itemId,
      claimer: req.user._id,
      status: 'pending',
      messages: [{
        sender: req.user._id,
        text: `I would like to claim this item: ${item.itemName}`,
      }]
    });

    // Update item status to 'claimed' when a claim is made (if not already)
    try {
      if (item.status !== 'claimed') {
        item.status = 'claimed';
        await item.save();
      }
    } catch (err) {
      console.error('Failed to update item status after claim:', err.message);
    }

    // Notify the item owner that someone made a claim
    try {
      const ownerId = item.reportedBy && item.reportedBy._id ? item.reportedBy._id : item.reportedBy;
      if (ownerId && ownerId.toString() !== req.user._id.toString()) {
        const claimerName = req.user.name || req.user.email || 'A user';
        await createNotification(ownerId, `Your item "${item.itemName}" has a new claim from ${claimerName}.`);
      }
    } catch (err) {
      console.error('Failed to create notification for item owner:', err.message);
    }

    // Return populated claim
    const populated = await Claim.findById(claim._id)
      .populate('item')
      .populate('claimer', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating claim", error: error.message });
  }
};
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const msgIndex = claim.messages.findIndex(m => m._id.toString() === messageId);
    if (msgIndex === -1) return res.status(404).json({ message: "Message not found" });

    // Only the sender can delete their message
    if (claim.messages[msgIndex].sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    claim.messages.splice(msgIndex, 1);
    await claim.save();
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error: error.message });
  }
};

// @desc    Update claim status (Approve/Reject)
// @route   PATCH /api/claims/:id/status
// @access  Private (Admin Only)
export const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    // Check if user is admin (assuming req.user.role exists)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized. Admin only." });
    }

    claim.status = status;
    
    // If approved, maybe update the item status to 'claimed' or 'returned'
    if (status === 'approved') {
      const item = await Item.findById(claim.item);
      if (item) {
        item.status = 'claimed';
        await item.save();
      }
    } else if (status === 'rejected') {
      const item = await Item.findById(claim.item);
      if (item && item.status === 'claimed') {
        item.status = 'verified'; // Reset to verified if claim is rejected
        await item.save();
      }
    }
    await claim.save();

    // Notify the claimer
    const statusMsg = status === 'approved' 
      ? `Congratulations! Your claim for "${claim.item.itemName}" has been approved. You can now proceed with the pickup.` 
      : `We are sorry, your claim for "${claim.item.itemName}" has been rejected.`;
    
    await createNotification(claim.claimer, statusMsg);

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: "Error updating claim status", error: error.message });
  }
};

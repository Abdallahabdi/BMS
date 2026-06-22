import Item from "../models/Item.js"
import { logAction } from "./auditController.js";
import { checkAndNotifyMatch } from "../utils/matchUtils.js";
import { uploadToImgBB } from "../utils/imageUpload.js";

export const createItem = async (req,res)=>{
  try {
    // Sanitize and normalize incoming fields
    const raw = {
      itemName: req.body.itemName,
      itemType: req.body.itemType,
      category: req.body.category,
      description: req.body.description,
      color: req.body.color,
      parkZone: req.body.parkZone,
      additionalInfo: req.body.additionalInfo,
      dateTime: req.body.dateTime
    };

    const itemName = (raw.itemName || "").toString().trim();
    const itemType = (raw.itemType || "").toString().trim().toLowerCase();
    const category = (raw.category || "").toString().trim();
    const description = raw.description ? raw.description.toString().trim() : undefined;
    const color = raw.color ? raw.color.toString().trim() : undefined;
    const parkZone = raw.parkZone ? raw.parkZone.toString().trim() : undefined;
    const additionalInfo = raw.additionalInfo ? raw.additionalInfo.toString().trim() : undefined;
    const dateTime = raw.dateTime ? new Date(raw.dateTime) : undefined;

    // Basic validation
    const allowedTypes = ["lost","found"];
    if (!itemName || !itemType || !category) {
      return res.status(400).json({ success:false, message: "Fadlan buuxi itemName, itemType iyo category." });
    }

    if (!allowedTypes.includes(itemType)) {
      return res.status(400).json({ success:false, message: "itemType waa inuu noqdaa 'lost' ama 'found'." });
    }

    if (itemName.length < 2 || itemName.length > 200) {
      return res.status(400).json({ success:false, message: "Magaca shaygu waa inuu ahaadaa ugu yaraan 2 xaraf oo aan ka badnayn 200." });
    }

    if (category.length < 1 || category.length > 100) {
      return res.status(400).json({ success:false, message: "Category-ga waa inuu noqdaa xarfo ka yar 100." });
    }

    if (parkZone && (parkZone.length < 2 || parkZone.length > 100)) {
      return res.status(400).json({ success:false, message: "Park/Zone waa inuu ahaadaa 2-100 xaraf." });
    }

    if (color && color.length > 50) {
      return res.status(400).json({ success:false, message: "Color waa inuu ka yar yahay 50 xaraf." });
    }

    const itemData = {
      itemName,
      itemType,
      category,
      description,
      color,
      parkZone,
      additionalInfo,
      dateTime,
      reportedBy: req.user._id
    };

    if (req.file) {
      itemData.image = await uploadToImgBB(req.file.buffer);
    }

    const item = await Item.create(itemData);
    
    // Record the creation action in the audit log
    await logAction(req.user._id, "CREATE", "Item", item._id, `Created ${item.itemType} item: ${item.itemName}`);

    // Check for matches and send email notifications asynchronously
    checkAndNotifyMatch(item);

    res.status(201).json(item);
  } catch (error) {
    console.error("❌ Error creating item:", {
      message: error.message,
      body: req.body,
      file: req.file ? req.file.filename : 'No file',
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Error creating item", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const getItems = async (req,res)=>{
  try {
    const { 
      page = 1, 
      limit = 9, 
      itemType, 
      category, 
      search 
    } = req.query;

    const filter = {};
    if (itemType && itemType !== 'All') filter.itemType = itemType.toLowerCase();
    if (category) filter.category = category;
    
    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await Item.find(filter)
      .populate("reportedBy","name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    res.json({
      items,
      currentPage: parseInt(page),
      totalPages,
      totalItems
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error: error.message });
  }
}

export const verifyItem = async (req,res)=>{
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({message:"Item not found"});
    
    item.status="verified"
    await item.save()

    // Record the verification action in the audit log
    await logAction(req.user._id, "UPDATE", "Item", item._id, `Verified item: ${item.itemName}`);

    res.json({message:"Item verified"})
  } catch (error) {
    res.status(500).json({ message: "Error verifying item", error: error.message });
  }
}

export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your items", error: error.message });
  }
}

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.deleteOne();

    // deleting an item is a significant action, so we log it in the audit log
    await logAction(req.user._id, "DELETE", "Item", req.params.id, `Deleted item: ${item.itemName}`);

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
}

export const updateItem = async (req, res) => {
  try {
    const updateDataRaw = { ...req.body };

    // Validate fields if provided
    if (updateDataRaw.itemName !== undefined) {
      const nm = updateDataRaw.itemName.toString().trim();
      if (nm.length < 2 || nm.length > 200) return res.status(400).json({ success:false, message: "Magaca shaygu waa inuu ahaadaa ugu yaraan 2 xaraf oo aan ka badnayn 200." });
      updateDataRaw.itemName = nm;
    }

    if (updateDataRaw.itemType !== undefined) {
      const it = updateDataRaw.itemType.toString().trim().toLowerCase();
      if (!["lost","found"].includes(it)) return res.status(400).json({ success:false, message: "itemType waa inuu noqdaa 'lost' ama 'found'." });
      updateDataRaw.itemType = it;
    }

    if (updateDataRaw.category !== undefined) {
      const cat = updateDataRaw.category.toString().trim();
      if (cat.length < 1 || cat.length > 100) return res.status(400).json({ success:false, message: "Category-ga waa inuu noqdaa xarfo ka yar 100." });
      updateDataRaw.category = cat;
    }

    if (updateDataRaw.parkZone !== undefined) {
      const pz = updateDataRaw.parkZone.toString().trim();
      if (pz && (pz.length < 2 || pz.length > 100)) return res.status(400).json({ success:false, message: "Park/Zone waa inuu ahaadaa 2-100 xaraf." });
      updateDataRaw.parkZone = pz;
    }

    if (req.file) {
      updateDataRaw.image = await uploadToImgBB(req.file.buffer);
    }

    if (updateDataRaw.dateTime) {
      updateDataRaw.dateTime = new Date(updateDataRaw.dateTime);
    }

    const item = await Item.findByIdAndUpdate(req.params.id, updateDataRaw, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Record the update action in the audit log
    await logAction(req.user._id, "UPDATE", "Item", item._id, `Updated item: ${item.itemName}`);

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error: error.message });
  }
}

// @desc  Complete handover — mark found item + matched lost item as 'returned'
// @route PATCH /api/items/:id/handover
// @access Private (Admin)
export const completeHandover = async (req, res) => {
  try {
    const foundItem = await Item.findById(req.params.id);
    if (!foundItem) return res.status(404).json({ message: 'Item not found' });

    // Mark the found item as returned
    foundItem.status = 'returned';
    await foundItem.save();

    // Find best matching lost item and mark it returned too
    const lostItems = await Item.find({ itemType: 'lost', status: { $ne: 'returned' } });
    let bestMatch = null;
    let highestScore = 0;

    for (const lost of lostItems) {
      let score = 0;
      if (lost.itemName && foundItem.itemName &&
          lost.itemName.toLowerCase().includes(foundItem.itemName.toLowerCase())) score += 30;
      if (lost.category === foundItem.category) score += 25;
      if (lost.color && lost.color === foundItem.color) score += 25;
      if (lost.parkZone && lost.parkZone === foundItem.parkZone) score += 20;

      if (score >= 40 && score > highestScore) {
        highestScore = score;
        bestMatch = lost;
      }
    }

    if (bestMatch) {
      bestMatch.status = 'returned';
      await bestMatch.save();
    }

    await logAction(req.user._id, 'UPDATE', 'Item', foundItem._id,
      `Handover completed for: ${foundItem.itemName}${bestMatch ? ` — lost item also marked returned: ${bestMatch.itemName}` : ''}`
    );

    res.json({
      message: 'Handover completed',
      foundItem,
      lostItemUpdated: bestMatch || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing handover', error: error.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("reportedBy", "name email");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item", error: error.message });
  }
}
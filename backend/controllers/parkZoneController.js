import ParkZone from "../models/ParkZone.js";
import Item from "../models/Item.js";

// Default zones to seed if none exist
const DEFAULT_ZONES = [
  { name: "Beerta Ubaxa", icon: "Flower2", color: "text-pink-500", bg: "bg-pink-500/10", order: 1 },
  { name: "Goobta Ciyaarta", icon: "Gamepad2", color: "text-orange-500", bg: "bg-orange-500/10", order: 2 },
  { name: "Baabuur Dhigashada", icon: "Car", color: "text-blue-500", bg: "bg-blue-500/10", order: 3 },
  { name: "Maqaayadda Cuntada", icon: "Utensils", color: "text-red-500", bg: "bg-red-500/10", order: 4 },
  { name: "Albaabka Weyn", icon: "DoorOpen", color: "text-emerald-500", bg: "bg-emerald-500/10", order: 5 },
  { name: "Masaajidka", icon: "MoonStar", color: "text-indigo-500", bg: "bg-indigo-500/10", order: 6 }
];

/**
 * @desc  Get all park zones
 * @route GET /api/parkzones
 * @access Public
 */
export const getParkZones = async (req, res) => {
  try {
    let zones = await ParkZone.find().sort({ order: 1, createdAt: 1 });

    // Seed defaults if empty
    if (zones.length === 0) {
      await ParkZone.insertMany(DEFAULT_ZONES);
      zones = await ParkZone.find().sort({ order: 1 });
    }

    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: "Error fetching park zones", error: err.message });
  }
};

/**
 * @desc  Create a new park zone
 * @route POST /api/parkzones
 * @access Admin
 */
export const createParkZone = async (req, res) => {
  try {
    const { name, icon, color, bg } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Zone name is required" });
    }

    const existing = await ParkZone.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Zone with this name already exists" });
    }

    const count = await ParkZone.countDocuments();
    const zone = await ParkZone.create({
      name: name.trim(),
      icon: icon || "MapPin",
      color: color || "text-emerald-500",
      bg: bg || "bg-emerald-500/10",
      order: count + 1
    });

    res.status(201).json(zone);
  } catch (err) {
    res.status(500).json({ message: "Error creating park zone", error: err.message });
  }
};

/**
 * @desc  Delete a park zone
 * @route DELETE /api/parkzones/:id
 * @access Admin
 */
export const deleteParkZone = async (req, res) => {
  try {
    const zone = await ParkZone.findById(req.params.id);
    if (!zone) return res.status(404).json({ message: "Park zone not found" });

    await zone.deleteOne();
    res.json({ message: "Park zone deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting park zone", error: err.message });
  }
};

/**
 * @desc  Toggle image visibility for an item
 * @route PATCH /api/parkzones/items/:id/toggle-image
 * @access Admin
 */
export const toggleItemImageVisibility = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.imageVisible = !item.imageVisible;
    await item.save();

    res.json({ message: "Image visibility updated", imageVisible: item.imageVisible, item });
  } catch (err) {
    res.status(500).json({ message: "Error toggling image visibility", error: err.message });
  }
};
// @desc    Get all items with pagination, filters and search
// @route   GET /api/items
// @access  Public/Private
export const getItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 9, 
      itemType, 
      category, 
      search,
      status,
      includeReturned
    } = req.query;

    const filter = {};
    if (itemType && itemType !== 'All') filter.itemType = itemType.toLowerCase();
    if (category) filter.category = category;
    
    if (status) {
      filter.status = status;
    } else if (includeReturned !== 'true') {
      filter.status = { $ne: 'returned' };
    }

    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;
    
    const items = await Item.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / parsedLimit);

    // --- HALKAN AYAA ISBEDDELKU KU JIRAA (SAWIR QARINTA) ---
    const isAdmin = req.user && req.user.role === 'admin';

    // Haddii adeegsaduhu uusan Admin ahayn (waa qof caadi ah ama guest)
    if (!isAdmin) {
      const processedItems = items.map(item => {
        // Shuruudda: Haddii imageVisible uu false yahay AMA haddii alaabta la celiyey (returned)
        if (!item.imageVisible || item.status === 'returned') {
          return {
            ...item,
            image: null // Sawirka ka dhig null response-ka dhexdiisa
          };
        }
        return item;
      });

      return res.json({
        items: processedItems,
        currentPage: parsedPage,
        totalPages,
        totalItems
      });
    }

    // Haddii uu Admin yahay, dhammaan sawirada iyo xogta u daa sidooda
    res.json({
      items,
      currentPage: parsedPage,
      totalPages,
      totalItems
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error: error.message });
  }
};
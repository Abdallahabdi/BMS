import Item from "../models/Item.js";

export const getMatches = async (req, res) => {
  try {
    const lostItems = await Item.find({ itemType: "lost", status: { $ne: "returned" } }).populate("reportedBy");
    const foundItems = await Item.find({ itemType: "found", status: { $ne: "returned" } }).populate("reportedBy");

    let matches = [];

    for (const lost of lostItems) {
      for (const found of foundItems) {
        let score = 0;

        // Item Name
        if (
          lost.itemName &&
          found.itemName &&
          lost.itemName.toLowerCase().includes(found.itemName.toLowerCase())
        ) score += 30;

        // Category
        if (lost.category === found.category) score += 25;

        // Color
        if (lost.color && lost.color === found.color) score += 25;

        // Location (parkZone)
        if (lost.parkZone && lost.parkZone === found.parkZone) score += 20;

        if (score >= 40) {
          // Privacy check: only admins or involved users can see the match
          const isAdmin = req.user && req.user.role === 'admin';
          const isOwnerOfLost = lost.reportedBy && req.user && lost.reportedBy._id.toString() === req.user._id.toString();
          const isOwnerOfFound = found.reportedBy && req.user && found.reportedBy._id.toString() === req.user._id.toString();
          
          if (isAdmin || isOwnerOfLost || isOwnerOfFound) {
            matches.push({
              lost,
              found,
              score
            });
          }
        }
      }
    }

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching matches", error: error.message });
  }
};

export const getMatchById = async (req, res) => {
  try {
    // If ID is an Item ID, calculate virtual matching
    const targetItem = await Item.findById(req.params.id).populate("reportedBy");
    if (!targetItem) return res.status(404).json({ message: "Item not found" });

    let bestMatch = null;
    let highestScore = 0;

    const queryType = targetItem.itemType === "lost" ? "found" : "lost";
    const otherItems = await Item.find({ itemType: queryType, status: { $ne: "returned" } }).populate("reportedBy");

    for (const other of otherItems) {
      let score = 0;
      const lost = targetItem.itemType === "lost" ? targetItem : other;
      const found = targetItem.itemType === "found" ? targetItem : other;

      if (lost.itemName && found.itemName && lost.itemName.toLowerCase().includes(found.itemName.toLowerCase())) score += 30;
      if (lost.category === found.category) score += 25;
      if (lost.color && lost.color === found.color) score += 25;
      if (lost.parkZone && lost.parkZone === found.parkZone) score += 20;

      if (score >= 40 && score > highestScore) {
        highestScore = score;
        bestMatch = { lost, found, score };
      }
    }

    if (bestMatch) {
       return res.json(bestMatch);
    } else {
       // If no match found but score is close, or for general debugging
       return res.status(404).json({ message: "No match currently found for this item in the system." });
    }
  } catch (error) {
    if (error.name === 'CastError') {
       return res.status(404).json({ message: "Invalid ID" });
    }
    res.status(500).json({ message: "Error fetching match details", error: error.message });
  }
};

import Item from "../models/Item.js";

/**
 * @desc    Handle chatbot queries
 * @route   POST /api/chatbot
 * @access  Private
 */
export const handleChatbotQuery = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const lowerQuery = query.toLowerCase();

    // Logic for "My items" / "Lost items" (Bilingual Support)
    if (lowerQuery.includes("item") || lowerQuery.includes("lost") || lowerQuery.includes("found") || lowerQuery.includes("report") || lowerQuery.includes("alaab") || lowerQuery.includes("wax") || lowerQuery.includes("halay") || lowerQuery.includes("helay")) {
      const items = await Item.find({ reportedBy: userId });
      
      if (items.length === 0) {
        return res.json({
          response: "Hadda ma jiraan alaab aad soo dirtay oo nidaamka ku jirta. Ma rabtaa inaad alaab cusub soo gudbiso?",
          items: []
        });
      }
 
      const itemNames = items.slice(0, 3).map(item => item.itemName).join(", ");
      return res.json({
        response: `Waxaad nidaamka soo gelisay ${items.length} warbixinood. Waxaana ka mid ah: ${itemNames}${items.length > 3 ? ' iyo kuwo kale' : ''}. Ma rabtaa inaad aragto faahfaahin dheeraad ah?`,
        items: items
      });
    }

    // Generic response (Bilingual Support)
    if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey") || lowerQuery.includes("haye") || lowerQuery.includes("isbari") || lowerQuery.includes("asalaamu") || lowerQuery.includes("khayr")) {
      return res.json({
        response: "Asalaamu Calaykum! Waxaan ahay Baafin AI. Sideen kuu caawin karaa maanta?",
        items: []
      });
    }

    if (lowerQuery.includes("how") || lowerQuery.includes("help") || lowerQuery.includes("work") || lowerQuery.includes("caawi") || lowerQuery.includes("sida") || lowerQuery.includes("shaqeeyo") || lowerQuery.includes("faham")) {
        return res.json({
          response: "Nidaamka Baafin wuxuu u shaqeeyaa sidan:\n\n" +
                    "1. **Warbixin**: Soo gudbi xogta iyo sawirka alaabta lumatay ama la helay.\n" +
                    "2. **Baaritaan (AI Match)**: Nidaamka ayaa si toos ah isugu bar-bardhigaya warbixinada.\n" +
                    "3. **Codsasho (Claim)**: Haddii la helo wax is-waafaqaya, qofka iska leh ayaa codsanaya in dib loo siiyo.\n" +
                    "4. **Xaqiijin**: Maamulka ayaa hubinaya aqoonsiga ka hor intaan alaabta la wareejin.",
          items: []
        });
    }

    if (lowerQuery.includes("all") || lowerQuery.includes("catalog") || lowerQuery.includes("search") || lowerQuery.includes("find") || lowerQuery.includes("baafi") || lowerQuery.includes("raadi") || lowerQuery.includes("dhammaan")) {
        const recentItems = await Item.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(3);
        return res.json({
          response: "Waxaad dhammaan alaabta ka eegi kartaa qaybta Catalog-ga. Halkan waa kuwo dhowaan la soo gudbiyay:",
          items: recentItems
        });
    }
 
    return res.json({
      response: "Waan ka xumahay, si fiican uma fahmin waxaad tiri. Ma rabtaa inaad eegto alaabtaada, Catalog-ga, mise inaan ku caawiyo?",
      items: []
    });

  } catch (error) {
    res.status(500).json({ message: "Chatbot error", error: error.message });
  }
};

import Item from "../models/Item.js";
import User from "../models/User.js";
import Claim from "../models/Claim.js";
import ParkZone from "../models/ParkZone.js";

/**
 * @desc    Smart system-knowledge chatbot
 * @route   POST /api/chatbot
 * @access  Private
 */
export const handleChatbotQuery = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user._id;
    const user = req.user;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const q = query.toLowerCase().trim();

    // ─── SALUTATION ────────────────────────────────────────────────
    if (/\b(hello|hi|hey|salam|haye|asalaam|marhaba|howdy|greet|yo|sup)\b/.test(q)) {
      return res.json({
        response: `Asalaamu Calaykum! Waxaan ahay **Baafin AI Assistant** 🤖\n\nWaxaan kaa caawin karaa:\n• 🔍 Raadinta alaabta luntay/la helay\n• 📊 Xogta nidaamka iyo tirakoobka\n• 📋 Xaaladda codsigaaga\n• ℹ️ Macluumaadka beerta iyo goobaha\n• 🧭 Tilmaamaha sida loo isticmaalo nidaamka\n\nSu'aal i weydii!`,
        items: []
      });
    }

    // ─── MY ITEMS ───────────────────────────────────────────────────
    if (/\b(my item|my report|alaabtay|wixii aan|sidii aan|la soo gudbiyay|soo dirtay)\b/.test(q)) {
      const items = await Item.find({ reportedBy: userId }).sort({ createdAt: -1 });
      if (items.length === 0) {
        return res.json({
          response: "Hadda ma jiraan alaab aad nidaamka u soo dirtay. Riix **'Report Item'** si aad u soo gudbiso alaabta luntay ama aad heshay.",
          items: []
        });
      }
      const names = items.slice(0, 5).map(i => `• ${i.itemName} (${i.status})`).join("\n");
      return res.json({
        response: `Waxaad nidaamka soo gelisay **${items.length}** alaab:\n\n${names}${items.length > 5 ? `\n... iyo ${items.length - 5} kuwo kale` : ""}\n\nMa rabtaa faahfaahin dheeraad ah?`,
        items: items.slice(0, 5)
      });
    }

    // ─── SEARCH / CATALOG / FIND SPECIFIC ITEM ──────────────────────
    const searchMatch = q.match(/(?:raadi|baadi|search|find|catalog|helay|waan raadinayaa|sideen u heli karaa)\s+(.+)/i);
    if (searchMatch || /\b(catalog|dhammaan alaabta|all items|liiska)\b/.test(q)) {
      const searchTerm = searchMatch ? searchMatch[1].trim() : "";
      const filter = { status: { $ne: "returned" } };
      if (searchTerm) {
        filter.$or = [
          { itemName: { $regex: searchTerm, $options: "i" } },
          { category: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } }
        ];
      }
      const items = await Item.find(filter).sort({ createdAt: -1 }).limit(5);
      if (items.length === 0) {
        return res.json({
          response: searchTerm
            ? `Ma helin alaab la yiraahdo **"${searchTerm}"** nidaamka. Fadlan xaqiiji magaca oo dib u tijaabi.`
            : "Hadda ma jiraan alaab firfircoon nidaamka. Dib u tijaabi marka hore.",
          items: []
        });
      }
      return res.json({
        response: searchTerm
          ? `Waxaan ka helay **${items.length}** alaab ku saabsan "${searchTerm}":`
          : `Halkan waa alaabta ugu danbeysay ee nidaamka:`,
        items
      });
    }

    // ─── STATUS / CLAIM STATUS ──────────────────────────────────────
    if (/\b(status|xaaladda|codsiga|claim|waan codsan|sheekaysatay)\b/.test(q)) {
      const claims = await Claim.find({ claimer: userId })
        .populate("item", "itemName status")
        .sort({ createdAt: -1 })
        .limit(5);
      if (claims.length === 0) {
        return res.json({
          response: "Adigu wali ma codsanin alaab. Aad **Catalog** oo codso alaabta aad u maleynayso inay kaagiis tahay.",
          items: []
        });
      }
      const claimList = claims.map(c =>
        `• ${c.item?.itemName || "Alaab aan la garanayn"} → Codsigu: **${c.status}**`
      ).join("\n");
      return res.json({
        response: `Xaaladda codsigaaga:\n\n${claimList}\n\n**Pending** = la sugayaa ● **Approved** = la aqbalay ● **Rejected** = la diidday`,
        items: []
      });
    }

    // ─── STATS / NUMBERS ────────────────────────────────────────────
    if (/\b(tiro|stats|statistics|tirkoob|tirada|meeqa|how many|total|count)\b/.test(q)) {
      const [total, lost, found, returned, pending] = await Promise.all([
        Item.countDocuments(),
        Item.countDocuments({ itemType: "lost" }),
        Item.countDocuments({ itemType: "found" }),
        Item.countDocuments({ status: "returned" }),
        Item.countDocuments({ status: "pending" })
      ]);
      const rate = total > 0 ? Math.round((returned / total) * 100) : 0;
      return res.json({
        response: `📊 **Tirakoobka Nidaamka Baafin:**\n\n• 📦 Wadarta alaabta: **${total}**\n• ❌ La lumiyay (Lost): **${lost}**\n• ✅ La helay (Found): **${found}**\n• 🔄 La celiyay (Returned): **${returned}**\n• ⏳ Sugaya (Pending): **${pending}**\n• 📈 Heerka guusha: **${rate}%**`,
        items: []
      });
    }

    // ─── PARK ZONES ─────────────────────────────────────────────────
    if (/\b(zone|goob|beerta|park|meel|location|xaafad|dhismo)\b/.test(q)) {
      const zones = await ParkZone.find({ isActive: true }).sort({ order: 1 });
      if (zones.length === 0) {
        return res.json({
          response: "Hadda ma jiraan goobaha beerta oo la diiwaan geliyay. Maamulku wuu ku dari karaa goobaha cusub.",
          items: []
        });
      }
      const zoneList = zones.map(z => `• ${z.name}`).join("\n");
      return res.json({
        response: `📍 **Goobaha Beerta Daruusalaam Park:**\n\n${zoneList}\n\nMarka aad alaab soo gudbinayso, dooro goobta ugu dhow ee aad ka lumisay ama ku heshay.`,
        items: []
      });
    }

    // ─── HOW TO USE / HELP ──────────────────────────────────────────
    if (/\b(help|caawi|sida|how|shaqeeyo|isticmaal|guide|tutorial|xukun|qaab)\b/.test(q)) {
      return res.json({
        response: `🧭 **Sida Nidaamka Baafin Loo Isticmaalo:**\n\n**1️⃣ Soo Gudbi (Report)**\nGal qaybta *"Report Item"*, dooro nooca (Lost/Found), buuxi xogta oo soo geli sawirka.\n\n**2️⃣ Baaritaan (AI Match)**\nNidaamku si toos ah ayuu u barbardhigaa alaabta ee la gudbiyay oo kula xidaa haddii la helo wax is-waafaqaya.\n\n**3️⃣ Codso (Claim)**\nHaddii aad aragto alaab aad u maleynayso inay kaagiis tahay, riix "Claim" oo xaqiiji aqoonsigaaga.\n\n**4️⃣ Xaqiijin (Verification)**\nMaamulka ayaa hubinaya aqoonsiga ka hor intaan alaabta dib loogu celiyo.\n\n**5️⃣ Wareejin (Handover)**\nMarka la ansixiyo, waxaad ku heli kartaa alaabta xarunta beerta.`,
        items: []
      });
    }

    // ─── REPORT LOST ITEM ───────────────────────────────────────────
    if (/\b(soo gudbi|report|lost item|lumiyay|la lumiyay|waxan waayay|hayb|la waayay)\b/.test(q)) {
      return res.json({
        response: `📝 **Sida Alaab Lumid Loogu Soo Gudbiyaa:**\n\n1. Riix **"Report Item"** menu-ga bidixda\n2. Dooro **"I Lost Something"**\n3. Buuxi:\n   • Magaca alaabta\n   • Qaybta (Category)\n   • Midabka\n   • Goobta aad ka lumisay\n   • Taariikhda iyo wakhtiga\n4. Soo geli sawirka (haddii aad haystid)\n5. Riix **"Submit Report"**\n\n⚡ Nidaamku si toos ah ayuu u raadiyaa is-waafaqayaasha!`,
        items: []
      });
    }

    // ─── REPORT FOUND ITEM ─────────────────────────────────────────
    if (/\b(waxan helay|la helay|found item|found something|helay)\b/.test(q)) {
      return res.json({
        response: `📸 **Sida Alaab La Helay Loogu Soo Gudbiyaa:**\n\n1. Riix **"Report Item"** menu-ga bidixda\n2. Dooro **"I Found Something"**\n3. Buuxi xogta alaabta:\n   • Magaca\n   • Nooca\n   • Goobta aad ka heshay\n   • Taariikhda\n4. **Sawirka waa waajib** marka la soo gudbinayo alaab la helay\n5. Riix **"Submit Report"**\n\nMaamulku ayaa ka dib ansixin doona oo sawirka u muujin doona dadweynaha.`,
        items: []
      });
    }

    // ─── PROFILE / ACCOUNT ─────────────────────────────────────────
    if (/\b(profile|account|xisaab|password|magac|email|wax ka baddal|update)\b/.test(q)) {
      return res.json({
        response: `👤 **Xisaabta & Profile-ka:**\n\nWaxaad awoodi kartaa:\n• **Profile →** Wax ka beddel magacaaga, emailka iyo sawirkaaga\n• **Password →** Beddel furaha sirta ah\n• **Logout →** Ka bax xisaabta\n\nFadhiiso riix profile-kaaga ee hoose bidixda sidebar-ka.`,
        items: []
      });
    }

    // ─── NOTIFICATIONS ─────────────────────────────────────────────
    if (/\b(notification|ogeysiis|ogeysii|waraan|waran)\b/.test(q)) {
      return res.json({
        response: `🔔 **Ogeysiisyada:**\n\nNidaamku wuxuu kugu soo diri doonaa ogeysiis marka:\n• Alaabta aad soo gudbisay la helo is-waafaqaye\n• Codsigyaaga la aqbalay ama la diidday\n• Alaabta aad codsatay la wareejiyay\n\nRiix badhanka **Bell** 🔔 ee menu-ga si aad aragto dhammaan ogeysiisyadaada.`,
        items: []
      });
    }

    // ─── ABOUT BAAFIN ──────────────────────────────────────────────
    if (/\b(baafin|nidaam|system|waa maxay|about|ku saabsan)\b/.test(q)) {
      return res.json({
        response: `🌿 **Nidaamka Baafin:**\n\nBaafin waa nidaam casri ah oo loogu talagalay **Daruusalaam Park** si loogu caawiyo dadweynaha inay dib u helaan alaabta ay ku lumiyeen beerta.\n\n**✨ Astaamaha Muhiimka ah:**\n• 🤖 AI-powered matching (is-waafaqaynta toos ah)\n• 📸 Sawir-xaqiijin (image verification)\n• 💬 Chatbot-ka 24/7\n• 📊 Analytics & Tirakoob\n• 🔐 Xaqiijin ammaan ah\n\n**🎯 Hadafka:** In alaab walba dib loo celiyo milkiilihiis!`,
        items: []
      });
    }

    // ─── CONTACT / ADMIN ────────────────────────────────────────────
    if (/\b(contact|xiriir|maamul|admin|xiriiri|gaadhsiis)\b/.test(q)) {
      return res.json({
        response: `📞 **Xiriirka Maamulka:**\n\nHaddii aad u baahan tahay caawimaad dheeraad ah:\n\n• **Email:** admin@baafin.so\n• **Goobta:** Xarunta Daruusalaam Park\n• **Wakhtiga Shaqada:** Isbeddelka 8:00 AM - 6:00 PM\n\nQofka maamulka wuu joogi doonaa isaga oo kaa caawinaya si toos ah.`,
        items: []
      });
    }

    // ─── RETURNED / RECOVERED ITEMS ────────────────────────────────
    if (/\b(returned|la celiyay|recovered|dib|wareejin|guul)\b/.test(q)) {
      const returnedItems = await Item.find({ status: "returned" }).sort({ updatedAt: -1 }).limit(5);
      const count = await Item.countDocuments({ status: "returned" });
      return res.json({
        response: `✅ **Alaabta La Celiyay:**\n\nWaxaa hada la celiyay **${count}** alaab!\n\nHalkan waa kuwo dhowaan la celiyay:`,
        items: returnedItems
      });
    }

    // ─── DEFAULT FALLBACK ───────────────────────────────────────────
    return res.json({
      response: `Waan ka xumahay, si fiican uma fahmin su'aashaada. 🤔\n\nWaxaad i weydiin kartaa:\n• **"Alaabtay"** - Si aad aragto wixii aad soo gudbisay\n• **"Sida nidaamka"** - Tilmaamo\n• **"Tirakoobka"** - Xogta nidaamka\n• **"Goobaha beerta"** - Liiska zones\n• **"Codsigyayga"** - Xaaladda claims\n• **"La celiyay"** - Alaabta la soo celiyay\n\nMa jirtaa su'aal gaar ah?`,
      items: []
    });

  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ message: "Chatbot error", error: error.message });
  }
};

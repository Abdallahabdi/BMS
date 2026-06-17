import Item from "../models/Item.js";
import { sendEmail } from "./emailer.js";
import { createNotification } from "../controllers/notificationController.js";

/**
 * Checks for matches against a newly created item and sends an email if a strong match is found.
 * @param {Object} newItem - The newly created Item document.
 */
export const checkAndNotifyMatch = async (newItem) => {
  try {
    const queryType = newItem.itemType === "lost" ? "found" : "lost";
    
    // Find items of the opposite type
    const otherItems = await Item.find({ itemType: queryType }).populate("reportedBy");
    // Ensure the new item has reportedBy populated for emails
    await newItem.populate("reportedBy");

    for (const other of otherItems) {
      let score = 0;
      
      const lost = newItem.itemType === "lost" ? newItem : other;
      const found = newItem.itemType === "found" ? newItem : other;

      // Item Name
      if (
        lost.itemName &&
        found.itemName &&
        (lost.itemName.toLowerCase().includes(found.itemName.toLowerCase()) || 
         found.itemName.toLowerCase().includes(lost.itemName.toLowerCase()))
      ) {
        score += 30;
      }

      // Category
      if (lost.category && found.category && lost.category === found.category) score += 25;

      // Color
      if (lost.color && found.color && lost.color === found.color) score += 25;

      // Location (parkZone)
      if (lost.parkZone && found.parkZone && lost.parkZone === found.parkZone) score += 20;

      // If score is 80 or above, it's a very strong match
      if (score >= 80) {
        // Send email to the person who lost the item
        if (lost.reportedBy && lost.reportedBy.email) {
          try {
            await sendEmail(
              lost.reportedBy.email,
              "🎉 Waxaa la helay is-waafajin alaabta luntay",
              `War farxad leh! Waxaan helnay is-waafajin xooggan oo ku saabsan alaabtaada luntay: "${lost.itemName}".\n\nFadlan ku soo gal dashboard-ka si aad u aragto faahfaahin dheeraad ah.`
            );
            console.log(`Email sent to lost item owner: ${lost.reportedBy.email}`);
          } catch (e) {
            console.error("Email notification failed for lost item owner:", e);
          }

          // Create in-app notification (best-effort)
          try {
            await createNotification(
              lost.reportedBy._id,
              `Is-waafajin xooggan ayaa laga helay alaabtaada luntay "${lost.itemName}". Fadlan hubi Matches-ka.`
            );
          } catch (nerr) {
            console.warn("Failed to create notification for lost owner:", nerr?.message || nerr);
          }
        }

        // Send email to the person who found the item
        if (found.reportedBy && found.reportedBy.email) {
            try {
              await sendEmail(
                found.reportedBy.email,
                "🎉 Is-waafajin ayaa laga helay alaabta aad soo sheegtay",
                `War farxad leh! Waxaa suuragal ah in milkiilaha la helay oo uu la xiriiray alaabta aad soo sheegtay: "${found.itemName}".\n\nFadlan ku soo gal dashboard-ka si aad u aragto faahfaahin dheeraad ah.`
              );
              console.log(`Email sent to found item reporter: ${found.reportedBy.email}`);
            } catch (e) {
              console.error("Email notification failed for found item reporter:", e);
            }

            // Create in-app notification for finder
            try {
              await createNotification(
                found.reportedBy._id,
                `Is-waafajin xooggan ayaa laga helay alaabta aad soo sheegtay "${found.itemName}". Fadlan hubi Matches-ka.`
              );
            } catch (nerr) {
              console.warn("Failed to create notification for finder:", nerr?.message || nerr);
            }
        }
      }
    }
  } catch (error) {
    console.error("Error in checkAndNotifyMatch:", error);
  }
};

export const matchItems = async (newItem)=>{
  const Item = (await import("../models/Item.js")).default

  const oppositeType = newItem.itemType === "lost" ? "found" : "lost"

  const matches = await Item.find({
    itemType: oppositeType,
    category: newItem.category,
    zone: newItem.zone
  })

  return matches
}
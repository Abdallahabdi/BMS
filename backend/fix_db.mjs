import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixSchema = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));

    // Drop the username_1 index if it exists
    const hasUsernameIndex = indexes.some(i => i.name === "username_1");
    if (hasUsernameIndex) {
      await usersCollection.dropIndex("username_1");
      console.log("Successfully dropped 'username_1' index.");
    } else {
      console.log("'username_1' index not found. No action needed.");
    }

  } catch (error) {
    console.error("Error fixing DB:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
};

fixSchema();

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // recommended options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // increase timeouts to tolerate slower networks
      serverSelectionTimeoutMS: 120000, // 2 minutes
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      // connection pool
      maxPoolSize: 10,
    });
    console.log("✅MongoDB Connected");
  } catch (error) {
    console.log("MongoDB connection failed", error);
    process.exit(1);
  }
};


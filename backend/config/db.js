import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20,
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    if (process.env.NODE_ENV === "test") {
      throw error;
    }
    process.exit(1);
  }
};

export default connectDB;

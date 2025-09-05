import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {});
        console.log(`Connection Host | DB : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error while connecting to database.", error);
        process.exit(1);
    }
};

export default connectDB;
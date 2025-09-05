import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middlewares/rateLimiter.js";

dotenv.config({ override : true });

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(rateLimiter);

app.use("/api/notes", notesRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("App is running port : ", PORT);
    });
}).catch(error => console.error(`Error while connecting to db : ${error}`));

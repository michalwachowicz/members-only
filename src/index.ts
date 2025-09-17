import "dotenv/config";
import path from "path";
import express from "express";
import { LOGGER } from "./utils/logger";
import { initDatabase } from "./db/queries";
import { initializeMiddlewares } from "./middlewares";
import { initializeRoutes } from "./routes";
import MessageService from "./services/message-service";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

initializeMiddlewares(app);
initializeRoutes(app);

app.get("/", async (req, res) => {
  try {
    const messages = await MessageService.getMessages();
    res.render("index", {
      user: req.user,
      messages: messages,
      isAuthenticated: req.isAuthenticated(),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.render("index", {
      user: req.user,
      messages: [],
      isAuthenticated: req.isAuthenticated(),
    });
  }
});

app.listen(PORT, async () => {
  LOGGER.info(`Server is running on http://localhost:${PORT}`);
  await initDatabase();
});

export default app;

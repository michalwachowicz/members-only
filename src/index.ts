import "dotenv/config";
import path from "path";
import express from "express";
import { LOGGER } from "./utils/logger";
import { initDatabase } from "./db/queries";
import { initializeMiddlewares } from "./middlewares";
import { initializeRoutes } from "./routes";
import MessageService from "./services/message-service";
import { SafeUser } from "./types/user";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

initializeMiddlewares(app);
initializeRoutes(app);

app.get("/", async (req, res) => {
  try {
    const user = req.user as SafeUser;
    const isMember = user ? user.isMember : false;
    const messages = await MessageService.getMessages(isMember);

    res.render("index", {
      user: req.user,
      messages: messages.map((message) => ({
        ...message,
        canDelete: user ? user.id === message.userId || user.isAdmin : false,
      })),
      isAuthenticated: req.isAuthenticated(),
      success: req.query.success || undefined,
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

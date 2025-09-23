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
  const { requestId, ip } = req;

  try {
    const user = req.user as SafeUser;
    const isMember = user ? user.isMember : false;

    LOGGER.info("Home page request", {
      requestId,
      userId: user?.id,
      username: user?.username,
      isMember,
      ip,
    });

    const messages = await MessageService.getMessages(isMember);

    LOGGER.info("Messages fetched successfully", {
      requestId,
      userId: user?.id,
      messageCount: messages.length,
      isMember,
      ip,
    });

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
    LOGGER.error("Error fetching messages", {
      requestId,
      userId: (req.user as SafeUser)?.id,
      username: (req.user as SafeUser)?.username,
      error: (error as Error).message,
      stack: (error as Error).stack,
      ip,
    });

    res.render("index", {
      user: req.user,
      messages: [],
      isAuthenticated: req.isAuthenticated(),
    });
  }
});

app.use((req, res) => {
  LOGGER.warn("404 Not Found", {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userId: (req.user as SafeUser)?.id,
    username: (req.user as SafeUser)?.username,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(404).render("error", {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
  });
});

app.use((error: Error, req: any, res: any, next: any) => {
  LOGGER.error("Unhandled error", {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userId: (req.user as SafeUser)?.id,
    username: (req.user as SafeUser)?.username,
    ip: req.ip,
    error: error.message,
    stack: error.stack,
  });

  res.status(500).render("error", {
    title: "Internal Server Error",
    message: "An unexpected error occurred. Please try again later.",
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
  });
});

app.listen(PORT, async () => {
  LOGGER.info(`Server is running on http://localhost:${PORT}`);
  await initDatabase();
});

export default app;

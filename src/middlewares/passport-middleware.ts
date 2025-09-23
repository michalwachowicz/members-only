import bcrypt from "bcrypt";
import passport from "passport";
import type { User } from "../types/user";
import { Express } from "express";
import { Strategy as LocalStrategy } from "passport-local";
import { UserService } from "../services";
import { LOGGER } from "../utils/logger";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      LOGGER.debug("Passport authentication attempt", { username });

      const user = await UserService.getUserByUsername(username);
      if (!user) {
        LOGGER.warn("Authentication failed - user not found", {
          username,
        });
        return done(null, false, { message: "Incorrect username." });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        LOGGER.warn("Authentication failed - invalid password", {
          username,
          userId: user.id,
        });
        return done(null, false, { message: "Incorrect password." });
      }

      LOGGER.debug("Authentication successful", {
        username,
        userId: user.id,
        isMember: user.isMember,
        isAdmin: user.isAdmin,
      });

      return done(null, user);
    } catch (error) {
      LOGGER.error("Authentication error", {
        username,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      return done(error, false);
    }
  })
);

passport.serializeUser((user, done) => {
  const userId = (user as User).id;

  LOGGER.debug("User serialized", { userId });
  done(null, userId);
});

passport.deserializeUser(async (id, done) => {
  const userId = id as number;

  try {
    LOGGER.debug("User deserialization attempt", { userId });

    const user = await UserService.getSafeUserById(id as number);

    if (!user) {
      LOGGER.warn("User deserialization failed - user not found", {
        userId,
      });
      return done(null, false);
    }

    LOGGER.debug("User deserialized successfully", {
      userId,
      username: user.username,
    });

    done(null, user);
  } catch (error) {
    LOGGER.error("User deserialization error", {
      userId,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    done(error, false);
  }
});

export default function initializePassport(app: Express) {
  app.use(passport.session());
}

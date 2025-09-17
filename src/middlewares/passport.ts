import bcrypt from "bcrypt";
import passport from "passport";
import User from "../types/user";
import { Express } from "express";
import { Strategy as LocalStrategy } from "passport-local";
import { UserService } from "../services";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await UserService.getUserByUsername(username);
      if (!user) return done(null, false, { message: "Incorrect username." });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password." });

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id, done) => {
  const user = await UserService.getUserById(id as number);
  done(null, user);
});

export default function initializePassport(app: Express) {
  app.use(passport.session());
}

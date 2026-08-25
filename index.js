require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const pool = require("./server/db");
const authRoutes = require("./server/routes/auth");
const dashboardRoutes = require("./server/routes/dashboard");
const publicRoutes = require("./server/routes/public");
const adminRoutes = require("./server/routes/admin");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "server", "views"));
if (isProduction) app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: isProduction },
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? { id: req.session.userId, username: req.session.username, email: req.session.userEmail, plan: req.session.plan }
    : null;
  next();
});

app.get("/", (req, res) => res.render("landing"));

app.use(authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);
app.use("/u", publicRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Direcionador rodando em http://localhost:${PORT}`));
}

module.exports = app;

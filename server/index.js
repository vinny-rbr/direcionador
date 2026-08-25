require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const pool = require("./db");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
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
app.listen(PORT, () => console.log(`Direcionador rodando em http://localhost:${PORT}`));

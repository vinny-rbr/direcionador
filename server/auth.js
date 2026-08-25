const bcrypt = require("bcryptjs");

const ADMIN_EMAIL = "lucassousarbr@gmail.com";

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.userEmail !== ADMIN_EMAIL) return res.status(403).send("Acesso restrito.");
  next();
}

function renderInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : (parts[0] || "?").slice(0, 2);
  return initials.toUpperCase();
}

module.exports = { hashPassword, verifyPassword, requireAuth, requireAdmin, renderInitials, ADMIN_EMAIL };

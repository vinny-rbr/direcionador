const express = require("express");
const router = express.Router();
const pool = require("../db");
const { hashPassword, verifyPassword } = require("../auth");

function startSession(req, user) {
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.userEmail = user.email;
  req.session.plan = user.plan;
}

router.get("/signup", (req, res) => res.render("signup", { error: null }));

router.post("/signup", async (req, res) => {
  const { email, username, password, display_name } = req.body;
  if (!email || !username || !password) {
    return res.render("signup", { error: "Preencha todos os campos." });
  }
  const usernameNormalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_-]{3,30}$/.test(usernameNormalized)) {
    return res.render("signup", { error: "Usuário deve ter 3-30 caracteres: letras minúsculas, números, - ou _." });
  }
  if (password.length < 6) {
    return res.render("signup", { error: "A senha precisa ter pelo menos 6 caracteres." });
  }
  try {
    const hash = await hashPassword(password);
    const result = await pool.query(
      `insert into users (email, username, password_hash, display_name)
       values ($1, $2, $3, $4) returning id, username, email, plan`,
      [email.trim().toLowerCase(), usernameNormalized, hash, display_name || username]
    );
    startSession(req, result.rows[0]);
    res.redirect("/dashboard");
  } catch (err) {
    if (err.code === "23505") {
      return res.render("signup", { error: "E-mail ou usuário já cadastrado." });
    }
    console.error(err);
    res.render("signup", { error: "Erro ao criar conta." });
  }
});

router.get("/login", (req, res) => res.render("login", { error: null }));

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("select * from users where email = $1", [(email || "").trim().toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.render("login", { error: "E-mail ou senha inválidos." });
  }
  startSession(req, user);
  res.redirect("/dashboard");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;

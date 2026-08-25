const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth } = require("../auth");
const THEMES = require("../themes");
const ICONS = require("../icons");

router.use(requireAuth);

async function loadUser(userId) {
  const { rows } = await pool.query("select * from users where id = $1", [userId]);
  return rows[0];
}
async function loadLinks(userId) {
  const { rows } = await pool.query("select * from links where user_id = $1 order by position asc, id asc", [userId]);
  return rows;
}
async function loadSocials(userId) {
  const { rows } = await pool.query("select * from socials where user_id = $1 order by position asc, id asc", [userId]);
  return rows;
}

router.get("/", async (req, res) => {
  const user = await loadUser(req.session.userId);
  const links = await loadLinks(user.id);
  const socials = await loadSocials(user.id);
  res.render("dashboard", { user, links, socials, themes: THEMES, icons: ICONS, message: req.query.msg || null });
});

router.post("/profile", async (req, res) => {
  const { display_name, bio } = req.body;
  await pool.query("update users set display_name = $1, bio = $2 where id = $3", [display_name, bio, req.session.userId]);
  res.redirect("/dashboard?msg=" + encodeURIComponent("Perfil atualizado."));
});

router.post("/theme", async (req, res) => {
  const { theme } = req.body;
  const themeDef = THEMES[theme];
  if (!themeDef) return res.redirect("/dashboard?msg=" + encodeURIComponent("Tema inválido."));

  const user = await loadUser(req.session.userId);
  if (!themeDef.free && user.plan !== "pro") {
    return res.redirect("/dashboard?msg=" + encodeURIComponent("Esse tema é exclusivo do plano PRO."));
  }
  await pool.query("update users set theme = $1 where id = $2", [theme, req.session.userId]);
  req.session.plan = user.plan;
  res.redirect("/dashboard?msg=" + encodeURIComponent("Tema atualizado."));
});

router.post("/links", async (req, res) => {
  const { label, url, icon } = req.body;
  if (!label || !url) return res.redirect("/dashboard");
  const { rows } = await pool.query(
    "select coalesce(max(position), -1) + 1 as pos from links where user_id = $1",
    [req.session.userId]
  );
  await pool.query(
    "insert into links (user_id, label, url, icon, position) values ($1,$2,$3,$4,$5)",
    [req.session.userId, label, url, icon || "link", rows[0].pos]
  );
  res.redirect("/dashboard");
});

router.post("/links/:id", async (req, res) => {
  const { label, url, icon } = req.body;
  if (!label || !url) return res.redirect("/dashboard");
  await pool.query(
    "update links set label = $1, url = $2, icon = $3 where id = $4 and user_id = $5",
    [label, url, icon || "link", req.params.id, req.session.userId]
  );
  res.redirect("/dashboard");
});

router.post("/links/:id/delete", async (req, res) => {
  await pool.query("delete from links where id = $1 and user_id = $2", [req.params.id, req.session.userId]);
  res.redirect("/dashboard");
});

router.post("/links/:id/featured", async (req, res) => {
  await pool.query(
    "update links set featured = not featured where id = $1 and user_id = $2",
    [req.params.id, req.session.userId]
  );
  res.redirect("/dashboard");
});

router.post("/links/:id/move", async (req, res) => {
  const { direction } = req.body;
  const links = await loadLinks(req.session.userId);
  const idx = links.findIndex(l => String(l.id) === req.params.id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= links.length) return res.redirect("/dashboard");
  const a = links[idx], b = links[swapIdx];
  await pool.query("update links set position = $1 where id = $2", [b.position, a.id]);
  await pool.query("update links set position = $1 where id = $2", [a.position, b.id]);
  res.redirect("/dashboard");
});

router.post("/socials", async (req, res) => {
  const { icon, url } = req.body;
  if (!url || !icon) return res.redirect("/dashboard");
  const { rows } = await pool.query(
    "select coalesce(max(position), -1) + 1 as pos from socials where user_id = $1",
    [req.session.userId]
  );
  await pool.query(
    "insert into socials (user_id, icon, url, position) values ($1,$2,$3,$4)",
    [req.session.userId, icon, url, rows[0].pos]
  );
  res.redirect("/dashboard");
});

router.post("/socials/:id", async (req, res) => {
  const { icon, url } = req.body;
  if (!url || !icon) return res.redirect("/dashboard");
  await pool.query(
    "update socials set icon = $1, url = $2 where id = $3 and user_id = $4",
    [icon, url, req.params.id, req.session.userId]
  );
  res.redirect("/dashboard");
});

router.post("/socials/:id/delete", async (req, res) => {
  await pool.query("delete from socials where id = $1 and user_id = $2", [req.params.id, req.session.userId]);
  res.redirect("/dashboard");
});

module.exports = router;

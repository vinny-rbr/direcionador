const express = require("express");
const router = express.Router();
const pool = require("../db");
const THEMES = require("../themes");
const ICONS = require("../icons");
const { renderInitials } = require("../auth");

router.get("/:username", async (req, res) => {
  const username = req.params.username.toLowerCase();
  const { rows } = await pool.query("select * from users where username = $1", [username]);
  const user = rows[0];
  if (!user) return res.status(404).render("404", { username });

  const [{ rows: links }, { rows: socials }] = await Promise.all([
    pool.query("select * from links where user_id = $1 order by position asc, id asc", [user.id]),
    pool.query("select * from socials where user_id = $1 order by position asc, id asc", [user.id]),
  ]);

  const themeDef = THEMES[user.theme] || THEMES.mono;
  res.render("profile", {
    user,
    links,
    socials,
    themeKey: THEMES[user.theme] ? user.theme : "mono",
    themeDef,
    icons: ICONS,
    initials: renderInitials(user.display_name || user.username),
  });
});

module.exports = router;

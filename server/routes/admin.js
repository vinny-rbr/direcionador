const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../auth");

router.use(requireAuth, requireAdmin);

router.get("/", async (req, res) => {
  const { rows } = await pool.query("select id, email, username, plan from users order by id desc");
  res.render("admin", { users: rows });
});

router.post("/users/:id/plan", async (req, res) => {
  const { plan } = req.body;
  if (!["free", "pro"].includes(plan)) return res.redirect("/admin");
  await pool.query("update users set plan = $1 where id = $2", [plan, req.params.id]);
  res.redirect("/admin");
});

module.exports = router;

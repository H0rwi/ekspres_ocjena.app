var express = require('express');
var router = express.Router();
var db = require("../services/db");

/* GET home page. */
router.get('/', async function (req, res, next) {
 res.render('index');
 /* let conn;
  try {
    conn = await db.getConnection();
    const query = "SELECT * FROM rooms ORDER BY name;";
    const stmt = await conn.prepare(query);
    const result = await stmt.execute();
   
  } catch (error) {
  } finally {
    conn.release();
  }*/
})

module.exports = router;

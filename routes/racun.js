var express = require('express');
var router = express.Router();
var db = require("../services/db");

const racunSchema = require("../schemas/racun");

router.get("/create", function (req, res, next) {
    res.render("create/racun");
});

router.post("/create", async function (req, res, next) {
    const result = racunSchema.validate(req.body);

    if (result.error) {
        res.render("create/racun", { error_validation: true });
        return;
    }

    let conn;
    try {
        conn = await db.getConnection();
        const query = "INSERT INTO popis (name) VALUES (?);";
        const stmt = await conn.prepare(query);
        const result = await stmt.execute([req.body.name]);
        res.render("create/racun", { success: true });
    } catch (error) {
        res.render("create/racun", { error_database: true });
    } finally {
        conn.release();
    }
});

router.get("/racun/:id", async function (req, res, next) {
    const roomId = req.params.id;

    let conn, room;
    try {
        conn = await db.getConnection();
        const query = "SELECT * FROM popis WHERE id = ?;";
        const stmt = await conn.prepare(query);
        const result = await stmt.execute([roomId]);
        if (result.length === 1) {
            room = result[0];
        } else {
            res.render("/racun/usage", { invalid_id: true });
        }

        const query2 = "SELECT g.*, r.name FROM `usagee` g, users r " +
            "WHERE g.room_id = ? AND r.id = g.user_id ORDER BY g.signed_in DESC;";
        const stmt2 = await conn.prepare(query2);
        const result2 = await stmt2.execute([roomId]);

        res.render("create/usage", { items: result2, room_id: roomId });
    } catch (error) { } finally {
        conn.release();
    }
});

router.get("/sign_in/:id", async function (req, res, next) {
    const roomId = req.params.id;
    const userEmail = req.userEmail;

    if (!userEmail) {
        res.render("rooms/sign_in", { user_unknown: true });
    }

    let conn;
    try {
        conn = await db.getConnection();
        const query = "SELECT id FROM userss WHERE email = ?;";
        const stmt = await conn.prepare(query);
        const result = await stmt.execute([userEmail]);
        const userId = result[0].id;
        
        const query2 = "INSERT INTO `usagee` (user_id, signed_in, room_id) VALUES (?, ?, ?);"
        const stmt2 = await conn.prepare(query2);
        const result2 = await stmt2.execute([userId, new Date(), roomId]);

        if (result2.affectedRows === 1) {
            res.redirect("create/usage/" + roomId);
        } else {
            res.render("create/sign_in", { error_database: true });
        }
    } catch (error) {
        res.render("create/sign_in", { error_database: true });
    } finally {
        conn.release();
    }
});

module.exports = router;
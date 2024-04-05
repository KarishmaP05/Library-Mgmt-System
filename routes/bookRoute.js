const express = require("express");
const router = express.Router();
const { checkToken } = require("../config/jwt-middleware");
const { addBook, removeBook, updateBook } = require("../controllers/bookController");

router.post("/addBook", checkToken, addBook)
router.delete("/removeBook", checkToken, removeBook)
router.post("/updateBook", checkToken, updateBook)


module.exports = router;
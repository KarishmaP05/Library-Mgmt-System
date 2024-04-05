const express = require("express");
const router = express.Router();
const { checkToken } = require("../config/jwt-middleware");
const { issueBook, returnBook, lostBook, issuedBooks } = require("../controllers/issueRecordsController");

router.post("/issueBook", checkToken, issueBook)
router.post("/returnBook", checkToken, returnBook)
router.post("/issuedBook", checkToken, issuedBooks)

router.post("/lostBook", checkToken, lostBook)



module.exports = router;
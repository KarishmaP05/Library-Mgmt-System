const express = require("express");
const { addStudent, deleteStudent, displayStudent, updateStudent, inactiveStudent } = require("../controllers/studentController");
const router = express.Router();
const { checkToken } = require("../config/jwt-middleware");

router.post("/addStudent", checkToken, addStudent)
router.delete("/inactiveStudent", checkToken, inactiveStudent)
router.get("/displayStudent", checkToken, displayStudent)
router.post("/updateStudent", checkToken, updateStudent)


module.exports = router;
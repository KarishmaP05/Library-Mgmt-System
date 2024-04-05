const express = require("express");
const { addStudent, deleteStudent, displayStudent, updateStudent } = require("../controllers/studentController");
const router = express.Router();
const { checkToken } = require("../config/jwt-middleware");

router.post("/addStudent", checkToken, addStudent)
router.delete("/deleteStudent", checkToken, deleteStudent)
router.get("/displayStudent", checkToken, displayStudent)
router.get("/updateStudent", checkToken, updateStudent)


module.exports = router;
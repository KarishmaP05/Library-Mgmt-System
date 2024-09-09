const bcrypt = require("bcrypt");
const ConnectionRequest = require("../services/DBConnection");
const JWT = require("jsonwebtoken");
const JWTConfig = require("../config/jwt-config");

exports.addStudent = (req, res) => {
    let Name = req.body.name;
    let Branch = req.body.branch;
    let RollNo = req.body.rollno;
    let Email = req.body.email;
    let MobileNo = req.body.mobileno;
    let PRN = req.body.prn;
    let con_addStudent = ConnectionRequest.Connector();

    let select_sql1 = `SELECT email from students where email='${Email}'`
    con_addStudent.query(select_sql1, function(err, result) {
        if (result.length > 0) {
            console.log("email");
            res.status(400).json({
                status: 0,
                message: "Student is Already exist with this Email...."
            });
            return;
        } else {
            let select_sql2 = `SELECT roll_no from students where roll_no=${RollNo}`
            con_addStudent.query(select_sql2, function(err, result) {
                if (result.length > 0) {
                    console.log("rollno");
                    res.status(400).json({
                        status: 0,
                        message: "Student is Already exist with this RollNo...."
                    });
                    return;
                } else {
                    let select_sql = `SELECT * from students where PRN='${PRN}'`
                    con_addStudent.query(select_sql, function(err, result) {
                        console.log("result", result);
                        if (result.length > 0) {
                            console.log("prn");
                            res.status(400).json({
                                status: 0,
                                message: "Student is Already Added...."
                            });
                            return;

                        } else {
                            let sql = `INSERT INTO students(name,branch,roll_no,email,mobile_no,PRN) VALUES ('${Name}','${Branch}','${RollNo}','${Email}','${MobileNo}','${PRN}')`
                            con_addStudent.query(sql, function(err, result) {
                                if (err) {
                                    res.status(500).json({
                                        status: 0,
                                        message: "Error occured",
                                        error: err.sqlMessage
                                    })
                                    return;
                                } else {
                                    if (res.length > 0) {
                                        res.status(200).json({
                                            status: 1,
                                            message: "student has been added successfully"
                                        })
                                        return;
                                    } else {
                                        res.status(501).json({
                                            status: 0,
                                            message: "failed to Add student"
                                        })
                                        return;
                                    }
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

exports.inactiveStudent = (req, res) => {
    let PRN = req.body.PRN;
    let status = req.body.status;
    let con_deleteStudent = ConnectionRequest.Connector();
    let sql = `UPDATE students set status='${status}' where PRN=?`

    con_deleteStudent.query(sql, [PRN], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).json({
                status: 0,
                message: "Error occured",
                error: err.sqlMessage
            })
            return;

        } else {
            if (res.length > 0) {
                res.status(200).json({
                    status: 1,
                    message: `student get '${status}' Successfully`,
                })
                return;
            } else {
                res.status(501).json({
                    status: 0,
                    message: `Failed to '${status}' Student`,
                })
                return;
            }
        }

    })
}

exports.updateStudent = (req, res) => {
    let Name = req.body.name;
    let Branch = req.body.branch;
    // let RollNo = req.body.rollno;
    let Email = req.body.email;
    let MobileNo = req.body.mobileno;
    let PRN = req.body.prn;

    let con_updateStudent = ConnectionRequest.Connector();
    // let sql = `UPDATE students SET name='${Name}',branch='${Branch}',roll_no='${RollNo}',email='${Email}',mobile_no='${MobileNo}',PRN='${PRN}' where id='${id}'`
    let sql = `UPDATE students SET name= ? , branch= ? , email=? , mobile_no= ?  where PRN=?' and status='active'`
    con_updateStudent.query(sql, [Name, Branch, Email, MobileNo, PRN], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).json({
                status: 0,
                message: "Error occured",
                error: err.sqlMessage
            })
            return;
        } else {
            if (res.length > 0) {
                res.status(200).json({
                    status: 1,
                    message: "Student Information Updated Successfully",
                    data: result
                })
                return;
            } else {
                res.status(501).json({
                    status: 0,
                    message: "Failed to Update Student Information",
                    data: result
                })
                return;
            }
        }
    })
}


exports.displayStudent = (req, res) => {

    let con_displayStudent = ConnectionRequest.Connector();

    let sql = `SELECT * FROM students`
    con_displayStudent.query(sql, function(err, result) {

        if (err) {
            res.status(500).json({
                status: 0,
                message: "Error occured",
                error: err.sqlMessage
            })
            return;
        } else {
            if (result.length > 0) {
                res.status(200).json({
                    status: 1,
                    message: "List of All students",
                    data: result
                })
                return;
            } else {
                res.status(501).json({
                    status: 0,
                    message: "students are not found",
                    data: result
                })
                return;
            }

        }
    })
}
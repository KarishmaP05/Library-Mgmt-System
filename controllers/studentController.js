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
    let select_sql = `SELECT * from users where PRN='${PRN}'`
    con_addStudent.query(select_sql, function(err, result) {
        if (result) {
            res.status(500).json({
                status: 0,
                message: "Student is Already Added...."
            });
        } else {
            let sql = `INSERT INTO students(name,branch,roll_no,email,mobile_no,PRN) VALUES ('${Name}','${Branch}','${RollNo}','${Email}','${MobileNo}','${PRN}')`
            con_addStudent.query(sql, function(err, result) {
                if (err) {
                    res.status(500).json({
                        status: 0,
                        message: "Error occured",
                        error: err.sqlMessage
                    })
                } else {
                    res.status(200).json({
                        status: 1,
                        message: "student has been added successfully"
                    })
                }
            })
        }
    })
}



exports.deleteStudent = (req, res) => {
    let PRN = req.body.PRN
    let con_deleteStudent = ConnectionRequest.Connector();
    let sql = `DELETE  FROM students where PRN= ? `

    con_deleteStudent.query(sql, [PRN], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).json({
                status: 0,
                message: "Error occured",
                error: err.sqlMessage
            })

        } else {
            res.status(200).json({
                status: 1,
                message: "User deleted Successfully",

            })
        }

    })
}

exports.updateStudent = (req, res) => {
    let Name = req.body.name;
    let Branch = req.body.branch;
    let RollNo = req.body.rollno;
    let Email = req.body.email;
    let MobileNo = req.body.mobileno;
    let PRN = req.body.prn;

    let con_updateStudent = ConnectionRequest.Connector();
    // let sql = `UPDATE students SET name='${Name}',branch='${Branch}',roll_no='${RollNo}',email='${Email}',mobile_no='${MobileNo}',PRN='${PRN}' where id='${id}'`
    let sql = `UPDATE students SET name= ? , branch= ? , roll_no= ? , email=? , mobile_no= ?  where PRN=? `
    con_updateStudent.query(sql, [Name, Branch, RollNo, Email, MobileNo, PRN], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).json({
                status: 0,
                message: "Error occured",
                error: err.sqlMessage
            })
        } else {
            res.status(200).json({
                status: 1,
                message: "Student Information Updated Successfully",
                data: result
            })
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

        } else {
            res.status(200).json({
                status: 0,
                message: "List of All students",
                data: result
            })

        }
    })


}
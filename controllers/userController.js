const bcrypt = require("bcrypt");
const ConnectionRequest = require("../services/DBConnection");
const JWT = require("jsonwebtoken");
const JWTConfig = require("../config/jwt-config");



exports.createUser = (req, res) => {
    let Name = req.body.name;
    let Email = req.body.email;
    let MobileNo = req.body.mobile_no
    let Password = bcrypt.hashSync(req.body.password, 10);

    let con_createUser = ConnectionRequest.Connector();

    let select_sql = `SELECT * from users where email='${Email}'`

    con_createUser.query(select_sql, function(err, result) {
        if (result.length > 0) {
            res.status(500).json({
                status: 0,
                message: "user has been already registered with this Email ID....",
            });
        } else {
            let sql = `INSERT INTO users(name,email,mobile_no,password)VALUES('${Name}','${Email}','${MobileNo}','${Password}')`

            con_createUser.query(sql, function(err, result) {
                if (err) {
                    res.status(500).json({
                        status: 0,
                        message: "Error occured",
                        error: err.sqlMessage
                    })

                } else {
                    res.status(200).json({
                        status: 1,
                        message: "User has been Registered successfully"
                    })
                }
            });
        }
    })
}



// LoginUser

exports.loginUser = (req, res) => {
    let Email = req.body.email;
    let Password = req.body.password;

    let con_loginUser = ConnectionRequest.Connector();


    let sql = `SELECT id ,password FROM users where email='${Email}'`

    con_loginUser.query(sql, function(err, result) {

        if (err) {
            res.status(502).json({
                status: 0,
                message: "error occured....",


            });
        } else {
            if (result.length > 0) {
                if (bcrypt.compareSync(Password, result[0].password)) {

                    let userToken = JWT.sign({
                        email: Email,
                        id: result[0].id
                    }, JWTConfig.secret, {
                        expiresIn: JWTConfig.expiresIn, // configuration
                        notBefore: JWTConfig.notBefore,
                        audience: JWTConfig.audience,
                        issuer: JWTConfig.issuer,
                        algorithm: JWTConfig.algorithm

                    });

                    res.status(200).json({
                        status: 1,
                        message: "user Logged in Successfully",
                        token: userToken
                    })
                } else {
                    res.status(500).json({
                        status: 0,
                        message: "Incorrect Password"
                    })
                }
            } else {
                res.status(501).json({
                    status: 0,
                    message: "User not registered with This email Id"
                })
            }



        }

    })






}
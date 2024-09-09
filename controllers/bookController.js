const bcrypt = require("bcrypt");
const ConnectionRequest = require("../services/DBConnection");
const JWT = require("jsonwebtoken");
const JWTConfig = require("../config/jwt-config");


exports.addBook = (req, res) => {
    let Bookcode = req.body.bookcode
    let Title = req.body.title;
    let Author = req.body.author;
    let Publication = req.body.publication;
    let ISBN = req.body.ISBN;
    let Price = req.body.price;

    let con_addBook = ConnectionRequest.Connector();

    let select_sql = `SELECT * FROM books where book_code='${Bookcode}'`

    con_addBook.query(select_sql, function(err, result) {
        console.log(result);
        if (err) {
            res.status(500).json({
                status: 0,
                message: "Error occured",
                error: err.sqlMessage
            });
            return;
        } else {
            if (result.length > 0) {
                res.status(400).json({
                    status: 0,
                    message: "Book is Already Added....",
                });
                return;
            } else {
                let select_sql = `SELECT * FROM books where title='${Title}'`
                con_addBook.query(select_sql, function(err, result) {
                    if (err) {
                        res.status(500).json({
                            status: 0,
                            message: "Error occured",
                            error: err.sqlMessage
                        });
                        return;
                    } else {
                        if (res.length > 0) {
                            res.status(400).json({
                                status: 0,
                                message: "Book is Already exist with this Title....",
                            });
                            return;
                        } else {
                            let select_sql = `SELECT * FROM books where ISBN='${ISBN}'`
                            con_addBook.query(select_sql, function(err, result) {
                                if (err) {
                                    res.status(500).json({
                                        status: 0,
                                        message: "Error occured",
                                        error: err.sqlMessage
                                    });
                                    return;
                                } else {
                                    if (res.length > 0) {
                                        res.status(400).json({
                                            status: 0,
                                            message: "Book is Already exist with this ISBN number...."
                                        });
                                        return;
                                    } else {
                                        let sql = `INSERT INTO books(book_code,title,author,publication,ISBN,price) VALUES ('${Bookcode}','${Title}','${Author}','${Publication}',${ISBN},${Price})`
                                        con_addBook.query(sql, function(err, result) {
                                            console.log(err);
                                            if (err) {
                                                res.status(500).json({
                                                    status: 0,
                                                    message: "error Occured",
                                                });
                                                return;
                                            } else {
                                                if (res.length > 0) {
                                                    res.status(200).json({
                                                        status: 1,
                                                        message: "Book Added Successfully....",
                                                    });
                                                    return;
                                                } else {
                                                    res.status(501).json({
                                                        status: 1,
                                                        message: "Failed to add Book",
                                                    });
                                                    return;
                                                }
                                            }
                                        })

                                    }
                                }
                            })

                        }
                    }
                })
            }
        }
    })
}


exports.removeBook = (req, res) => {
    let Bookcode = req.body.bookcode;
    let status_flag = req.body.status_flag;
    let con_removeBook = ConnectionRequest.Connector();

    let sql = `UPDATE books set status_flag='${status_flag}' where book_code='${Bookcode}'`
    con_removeBook.query(sql, function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).json({
                status: 0,
                message: "error Occured",
            });
            return;
        } else {
            if (res.length > 0) {
                res.status(200).json({
                    status: 1,
                    message: `Book get '${status_flag}' successfully`
                });
                return;
            } else {
                res.status(501).json({
                    status: 0,
                    message: `Failed to '${status_flag}' Book`
                });
                return;
            }
        }
    })
}


exports.updateBook = (req, res) => {
    let Bookcode = req.body.bookcode;
    let Title = req.body.title;
    let Author = req.body.author;
    let Publication = req.body.publication;
    let Price = req.body.price;

    let con_removeBook = ConnectionRequest.Connector();
    let sql = `SELECT * from books where title='${Title}'`
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
                res.status(400).json({
                    status: 0,
                    message: "Book with this title is already exist",
                    data: result
                })
                return;
            } else {
                let sql = `UPDATE books SET title=?, author=?,publication=?,price=? where book_code=?`
                con_removeBook.query(sql, [Title, Author, Publication, Price, Bookcode], function(err, result) {
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
                                message: "Book Information Updated Successfully",
                                data: result
                            })
                            return;
                        } else {
                            res.status(501).json({
                                status: 0,
                                message: "Failed to Update Book Information",
                                data: result
                            })
                            return;
                        }
                    }
                })

            }
        }

    })
}
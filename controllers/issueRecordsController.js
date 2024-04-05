const bcrypt = require("bcrypt");
const ConnectionRequest = require("../services/DBConnection");
const JWT = require("jsonwebtoken");
const JWTConfig = require("../config/jwt-config");
const moment = require('moment'); //date

exports.issueBook = (req, res) => {
    let StudentId = req.body.student_id;
    let BookId = req.body.book_id;
    let Bookcode = req.body.book_code;

    // database connection
    let con_issueBook = ConnectionRequest.Connector();

    let sql = `select * from books where book_code='${Bookcode}' and status='available'`
    con_issueBook.query(sql, function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).json({
                status: 0,
                message: "error occured...."
            });
        } else {
            console.log("result", result);
            const today = new Date(); // Get today's date
            const IssueDate = today.toISOString().split('T')[0];
            const ExpectedReturndate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            console.log("Current Date:", IssueDate);
            console.log("Date after 7 days:", ExpectedReturndate);

            if (result.length > 0) { // book is avilable
                let sql = `INSERT INTO issue_records (student_id,book_id,issue_date,expected_return_date) VALUES (${StudentId},${BookId},'${IssueDate}','${ExpectedReturndate}')`
                con_issueBook.query(sql, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.status(502).json({
                            status: 0,
                            message: "error occured...."
                        });
                    } else {
                        let sql = `UPDATE books SET status='issued' where book_code='${Bookcode}'`
                        con_issueBook.query(sql, function(err, result) {
                            if (err) {
                                console.log(err);
                                res.status(502).json({
                                    status: 0,
                                    message: "error occured...."
                                });
                            } else {
                                res.status(200).json({
                                    status: 1,
                                    message: "Book has been successfully Issued...."
                                });
                            }
                        })
                    }
                })
            } else {
                res.status(501).json({
                    status: 0,
                    message: "Book is not Available...."
                });
            }
        }
    })
}



exports.returnBook = (req, res) => {
    let StudentId = req.body.student_id;
    let BookId = req.body.book_id;
    let Bookcode = req.body.book_code;

    // database Connection
    let con_returnBook = ConnectionRequest.Connector();

    const today = new Date(); // actual returned date
    const ActualReturnDate = today.toISOString().split('T')[0];
    console.log(ActualReturnDate) // current date

    let sql = `SELECT id, issue_date,expected_return_date FROM issue_records WHERE student_id=${StudentId} and book_id=${BookId} and status='issued'`
    con_returnBook.query(sql, function(err, result) {
        if (err) { // any error
            console.log(err);
            res.status(500).json({
                status: 0,
                message: "error occured....",
                error: err
            });
        } else {
            console.log("result ", result);
            if (result[0]) {
                ExpectedReturndate = result[0].expected_return_date.toISOString().split('T')[0];
                if (ExpectedReturndate < ActualReturnDate) { // calculate date and add penalty
                    let date1 = moment(ExpectedReturndate);
                    let date2 = moment(ActualReturnDate);
                    let differenceInDays = date2.diff(date1, 'days');
                    console.log('Difference in days:', differenceInDays);
                    let bookPenalty = differenceInDays * 5;

                    let sql = `UPDATE issue_records SET penalty=${bookPenalty}, actual_return_date='${ActualReturnDate}',status='returned' where book_id=${BookId}`
                    con_returnBook.query(sql, function(err, result) {
                        if (err) {
                            res.status(500).json({
                                status: 0,
                                message: "error occured...."
                            });
                        } else {
                            let sql = `UPDATE books SET status='available' where book_code='${Bookcode}'`
                            con_issueBook.query(sql, function(err, result) {
                                if (err) {
                                    console.log(err);
                                    res.status(502).json({
                                        status: 0,
                                        message: "error occured...."
                                    });
                                } else {
                                    let sql1 = `UPDATE students SET  penalty=${bookPenalty} where id=${StudentId} `
                                    con_returnBook.query(sql1, function(err, result) {
                                        if (err) {
                                            res.status(500).json({
                                                status: 0,
                                                message: "error occured...."
                                            });
                                        } else {
                                            res.status(200).json({
                                                status: 1,
                                                message: ` Book has been returned successfully with ${bookPenalty} Penalty on '${ActualReturnDate}'....`
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    })
                } else { //  without penalty
                    let sql = `UPDATE issue_records SET actual_return_date='${ActualReturnDate}',status='returned' where book_id=${BookId} `
                    con_returnBook.query(sql, function(err, result) {
                        if (err) {
                            res.status(500).json({
                                status: 0,
                                message: "error occured....",
                                error: err.message
                            });
                        } else {
                            let sql = `UPDATE books SET status='available' where book_code='${Bookcode}'`
                            con_returnBook.query(sql, function(err, result) {
                                if (err) {
                                    console.log(err);
                                    res.status(502).json({
                                        status: 0,
                                        message: "error occured...."
                                    });
                                } else {
                                    res.status(200).json({
                                        status: 1,
                                        message: " Book has been returned successfully with 0.0 penalty...."
                                    });
                                }
                            })
                        }
                    })
                }
            } else {
                res.status(200).json({
                    status: 1,
                    message: " This Book has been already returned...."
                });
            }
        }
    })
}

exports.issuedBooks = (req, res) => {
    let StudentId = req.body.student_id;
    // Database connection
    let con_lostBook = ConnectionRequest.Connector();

    let sql = `SELECT book_id from issue_records where student_id=${StudentId} and status='issued'`
    con_lostBook.query(sql, function(err, result) {
        console.log(result);
        if (err) {
            res.status(500).json({
                status: 0,
                message: "error occured",
                error: err
            })
        } else {
            if (result.length > 0) {
                res.status(200).json({
                    status: 1,
                    message: "List of all Issued Books",
                    data: result
                })
            } else {
                res.status(500).json({
                    status: 0,
                    message: "No Book is Issued",
                    error: err
                })
            }
        }
    })
}


exports.lostBook = (req, res) => {
    let StudentId = req.body.student_id;
    let BookId = req.body.book_id;
    let Bookcode = req.body.book_code;

    // Database connection
    let con_lostBook = ConnectionRequest.Connector();
    const today = new Date();
    const ActualReturnDate = today.toISOString().split('T')[0];
    let sql = `SELECT ir.book_id, b.price 
               FROM issue_records ir 
               INNER JOIN books b ON ir.book_id = b.id
               WHERE ir.student_id=${StudentId} AND ir.status='issued'`;

    con_lostBook.query(sql, function(err, result) {
        if (err) {
            res.status(500).json({
                status: 0,
                message: "error occured",
                error: err
            })
        } else {
            if (result.length > 0) {
                let bookPrice = result[0].price; // Extracting book price from the result

                let sql = `SELECT id, issue_date,expected_return_date FROM issue_records WHERE book_id=${BookId} `
                con_lostBook.query(sql, function(err, result) {
                    if (err) {
                        res.status(500).json({
                            status: 0,
                            message: "error occured",
                            error: err
                        })
                    } else {
                        if (result[0]) {
                            ExpectedReturndate = result[0].expected_return_date.toISOString().split('T')[0];
                            // add penalty after book lost and delay
                            if (ExpectedReturndate < ActualReturnDate) { // calculate date and add penalty
                                let date1 = moment(ExpectedReturndate);
                                let date2 = moment(ActualReturnDate);

                                let differenceInDays = date2.diff(date1, 'days');

                                console.log('Difference in days:', differenceInDays);

                                let bookPenalty = differenceInDays * 5 + bookPrice;

                                let sql = `UPDATE issue_records SET penalty=${bookPenalty}, actual_return_date='${ActualReturnDate}',status='lost' where book_id=${BookId} and student_id=${StudentId} and status='issued'`
                                console.log("query", sql);
                                con_lostBook.query(sql, function(err, result) {
                                    if (err) {
                                        res.status(502).json({
                                            status: 0,
                                            message: "error occured...."
                                        });

                                    } else {
                                        let sql = `UPDATE books SET status='lost' where book_code=${Bookcode} and status='issued'`

                                        con_lostBook.query(sql, function(err, result) {
                                            if (err) {
                                                res.status(502).json({
                                                    status: 0,
                                                    message: "error occured...."
                                                });
                                            } else {
                                                res.status(200).json({
                                                    status: 1,
                                                    message: ` Book has been returned successfully with ${bookPenalty} Penalty on '${ActualReturnDate}'....`
                                                });
                                            }
                                        })
                                    }
                                })
                            } else { // add penalty for book lost

                                let bookPenalty = bookPrice;
                                let sql = `UPDATE issue_records SET penalty=${bookPenalty}, actual_return_date='${ActualReturnDate}',status='lost' where book_id=${BookId} and student_id=${StudentId} and status='issued' `
                                con_lostBook.query(sql, function(err, result) {
                                    if (err) {
                                        res.status(502).json({
                                            status: 0,
                                            message: "error occured...."
                                        });

                                    } else {
                                        let sql1 = `UPDATE students SET  penalty=${bookPenalty} where id=${StudentId} `
                                        con_lostBook.query(sql1, function(err, result) {
                                            if (err) {
                                                res.status(500).json({
                                                    status: 0,
                                                    message: "error occured...."
                                                });
                                            } else {
                                                res.status(200).json({
                                                    status: 1,
                                                    message: ` Book has been returned successfully with ${bookPenalty} Penalty on '${ActualReturnDate}'....`
                                                });
                                            }
                                        })
                                    }
                                })
                            }

                        } else {
                            res.status(200).json({
                                status: 1,
                                message: `Book is not available in queue `
                            });

                        }
                    }
                })
            } else {
                res.status(200).json({
                    status: 1,
                    message: `Book is not available  `
                });
            }
        }
    })
}
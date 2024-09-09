const bcrypt = require("bcrypt");
const ConnectionRequest = require("../services/DBConnection");
const JWT = require("jsonwebtoken");
const JWTConfig = require("../config/jwt-config");
const moment = require('moment'); //date

exports.issueBook = (req, res) => {
    let PRN = req.body.PRN;
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
            return;
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
                        res.status(500).json({
                            status: 0,
                            message: "error occured...."
                        });
                        return;
                    } else {
                        if (res.length > 0) {
                            let sql = `UPDATE books SET status='issued' where book_code='${Bookcode}'`
                            con_issueBook.query(sql, function(err, result) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).json({
                                        status: 0,
                                        message: "error occured...."
                                    });
                                    return;
                                } else {
                                    if (res.length > 0) {
                                        res.status(200).json({
                                            status: 1,
                                            message: "Book has been successfully Issued...."
                                        });
                                        return;
                                    } else {
                                        res.status(501).json({
                                            status: 0,
                                            message: "Failed to Issued Book"
                                        });
                                        return;
                                    }
                                }
                            })
                        } else {
                            res.status(501).json({
                                status: 0,
                                message: "Failed to Insert Issue_record Details"
                            });
                            return;
                        }
                    }
                })
            } else {
                res.status(400).json({
                    status: 0,
                    message: "Book is not Available...."
                });
                return;
            }

        }
    })
}

exports.returnBook = (req, res) => {
    let PRN = req.body.PRN;
    let Bookcode = req.body.book_code;

    // database Connection
    let con_returnBook = ConnectionRequest.Connector();

    const today = new Date(); // actual returned date
    const ActualReturnDate = today.toISOString().split('T')[0];

    let sql = `SELECT id, issue_date,expected_return_date FROM issue_records WHERE PRN='${PRN}' and book_code='${Bookcode}' and status='issued'`
    con_returnBook.query(sql, function(err, result) {
        if (err) { // any error
            console.log(err);
            res.status(500).json({
                status: 0,
                message: "error occured....",
                error: err
            });
            return;
        } else {
            if (result > 0) {
                ExpectedReturndate = result[0].expected_return_date.toISOString().split('T')[0];
                if (ExpectedReturndate < ActualReturnDate) { // calculate date and add penalty
                    let date1 = moment(ExpectedReturndate);
                    let date2 = moment(ActualReturnDate);
                    let differenceInDays = date2.diff(date1, 'days');
                    console.log('Difference in days:', differenceInDays);
                    let bookPenalty = differenceInDays * 5;

                    let sql = `UPDATE issue_records SET penalty=${bookPenalty}, actual_return_date='${ActualReturnDate}',status='returned' where book_code='${Bookcode}'`
                    con_returnBook.query(sql, function(err, result) {
                        if (err) {
                            res.status(500).json({
                                status: 0,
                                message: "error occured...."
                            });
                            return;
                        } else {
                            if (res.length > 0) {
                                let sql = `UPDATE books SET status='available' where book_code='${Bookcode}'`
                                con_issueBook.query(sql, function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).json({
                                            status: 0,
                                            message: "error occured...."
                                        });
                                        return;
                                    } else {
                                        if (res.length > 0) {
                                            let sql1 = `UPDATE students SET  penalty=${bookPenalty} where PRN='${PRN}' `
                                            con_returnBook.query(sql1, function(err, result) {
                                                if (err) {
                                                    res.status(500).json({
                                                        status: 0,
                                                        message: "error occured...."
                                                    });
                                                    return;
                                                } else {
                                                    if (res.length > 0) {
                                                        res.status(200).json({
                                                            status: 1,
                                                            message: ` Book has been returned successfully with ${bookPenalty} Penalty on '${ActualReturnDate}'....`
                                                        });
                                                        return;
                                                    } else {
                                                        res.status(501).json({
                                                            status: 0,
                                                            message: ` Failed to returned book `
                                                        });
                                                        return;
                                                    }
                                                }
                                            })
                                        } else {
                                            res.status(501).json({
                                                status: 0,
                                                message: `Failed to set Status as book available `
                                            });
                                            return;

                                        }
                                    }
                                })

                            } else {
                                res.status(501).json({
                                    status: 0,
                                    message: ` Failed to set Penalty `
                                });
                                return;
                            }
                        }
                    })
                } else { //  without penalty
                    let sql = `UPDATE issue_records SET actual_return_date='${ActualReturnDate}',status='returned' where book_code='${Bookcode}' `
                    con_returnBook.query(sql, function(err, result) {
                        if (err) {
                            res.status(500).json({
                                status: 0,
                                message: "error occured....",
                                error: err.message
                            });
                        } else {
                            if (res.length > 0) {
                                let sql = `UPDATE books SET status='available' where book_code='${Bookcode}'`
                                con_returnBook.query(sql, function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).json({
                                            status: 0,
                                            message: "error occured...."
                                        });
                                    } else {
                                        if (res.length > 0) {
                                            res.status(200).json({
                                                status: 1,
                                                message: " Book has been returned successfully with 0.0 penalty...."
                                            });
                                        } else {
                                            res.status(501).json({
                                                status: 0,
                                                message: ` Failed to set status of book as available `
                                            });
                                        }
                                    }
                                })
                            } else {
                                res.status(501).json({
                                    status: 0,
                                    message: ` Failed to set Status as book returned`
                                });
                            }
                        }
                    })
                }
            } else {
                res.status(500).json({
                    status: 0,
                    message: " This Book has been already returned...."
                });
            }
        }
    })
}

exports.issuedBooks = (req, res) => {
    let PRN = req.body.PRN;
    // Database connection
    let con_lostBook = ConnectionRequest.Connector();

    let sql = `SELECT book_code from issue_records where PRN='${PRN}' and status='issued'`
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
    let PRN = req.body.PRN;
    let Bookcode = req.body.book_code;

    // Database connection
    let con_lostBook = ConnectionRequest.Connector();
    const today = new Date();
    const ActualReturnDate = today.toISOString().split('T')[0];
    let sql = `SELECT ir.book_id, ir.student_id ,b.price 
               FROM issue_records ir 
               INNER JOIN books b ON ir.book_id = b.id
               INNER JOIN students s ON ir.student_id=s.id
               WHERE s.PRN='${PRN}' AND ir.status='issued'`;

    con_lostBook.query(sql, function(err, result) {
        if (err) {
            res.status(500).json({
                status: 0,
                message: "error occured",
                error: err
            })
            return;
        } else {
            if (result.length > 0) {
                let bookPrice = result[0].price; // Extracting book price from the result

                let sql = `SELECT id, issue_date,expected_return_date FROM issue_records WHERE book_code='${Bookcode}' `
                con_lostBook.query(sql, function(err, result) {
                    if (err) {
                        res.status(500).json({
                            status: 0,
                            message: "error occured",
                            error: err
                        })
                        return;
                    } else {
                        if (result.length > 0) {
                            ExpectedReturndate = result[0].expected_return_date.toISOString().split('T')[0];

                            // add penalty for book lost but informed after expected returned date
                            if (ExpectedReturndate < ActualReturnDate) { // calculate date and add penalty
                                let date1 = moment(ExpectedReturndate);
                                let date2 = moment(ActualReturnDate);

                                let differenceInDays = date2.diff(date1, 'days');

                                console.log('Difference in days:', differenceInDays);

                                let bookPenalty = differenceInDays * 5 + bookPrice; // after expected date

                                let sql = `UPDATE issue_records SET penalty=${bookPenalty}, actual_return_date='${ActualReturnDate}',status='lost' where book_code='${Bookcode}' and PRN='${PRN}' and status='issued'`
                                console.log("query", sql);
                                con_lostBook.query(sql, function(err, res) {
                                    if (err) {
                                        res.status(500).json({
                                            status: 0,
                                            message: "error occured...."
                                        });
                                        return;
                                    } else {
                                        let sql = `UPDATE books SET status='lost' where book_code='${Bookcode}' and status='issued'`

                                        con_lostBook.query(sql, function(err, res) {
                                            if (err) {
                                                res.status(500).json({
                                                    status: 0,
                                                    message: "error occured...."
                                                });
                                                return;
                                            } else {
                                                res.status(200).json({
                                                    status: 1,
                                                    message: ` Book has been returned successfully with ${bookPenalty} Penalty on '${ActualReturnDate}'....`
                                                });
                                                return;
                                            }
                                        })
                                    }
                                })
                            } else { // add penalty for book lost but informed before expected returned date

                                let bookPenalty = bookPrice;
                                let sql = `UPDATE issue_records SET penalty=${bookPenalty}, actual_return_date='${ActualReturnDate}',status='lost' where Book_code='${Bookcode}' and PRN='${PRN}' and status='issued' `
                                con_lostBook.query(sql, function(err, res) {
                                    if (err) {
                                        res.status(500).json({
                                            status: 0,
                                            message: "error occured...."
                                        });
                                        return;
                                    } else {
                                        let sql1 = `UPDATE students SET  penalty=${bookPenalty} where PRN='${PRN}' `
                                        con_lostBook.query(sql1, function(err, res) {
                                            if (err) {
                                                res.status(500).json({
                                                    status: 0,
                                                    message: "error occured...."
                                                });
                                                return;
                                            } else {
                                                if (res.length > 0) {
                                                    let sql = `UPDATE books SET status='lost' where book_code='${Bookcode}' `
                                                    con_lostBook.query(sql, function(err, res) {
                                                        if (err) {
                                                            res.status(500).json({
                                                                status: 0,
                                                                message: "error occured...."
                                                            });
                                                            return;
                                                        } else {
                                                            if (res.length > 0) {
                                                                res.status(200).json({
                                                                    status: 1,
                                                                    message: ` Bookk has been returned successfully with ${bookPenalty} Penalty on '${ActualReturnDate}'....`
                                                                });
                                                            } else {
                                                                res.status(500).json({
                                                                    status: 0,
                                                                    message: `Failed to set status of book as lost`
                                                                });
                                                            }
                                                        }

                                                    })
                                                } else {
                                                    res.status(501).json({
                                                        status: 0,
                                                        message: `Failed to set Penalty of Student`
                                                    })
                                                    return;
                                                }
                                            }
                                        })
                                    }
                                })
                            }

                        } else {
                            res.status(501).json({
                                status: 0,
                                message: `Book is not available in queue `
                            });
                            return;

                        }
                    }
                })
            } else {
                res.status(501).json({
                    status: 0,
                    message: `Book is not available `
                });
                return;
            }
        }
    })
}
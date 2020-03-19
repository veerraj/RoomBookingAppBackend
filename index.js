var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cors = require('cors')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var path=require('path')

var app = express();
var con = mysql.createConnection({
    // database:'User',
    host: 'remotemysql.com',
    user: 'k7k9vXrkXQ',
    password: 'QRtKa1ghOb',
    database: "k7k9vXrkXQ"
});

// app.use(cors({ origin: "http://localhost:4200" }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));
// app.use(function(req, res, next) {
//   res.setHeader("Content-Type", "application/json");
//   next();
// });

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    //   var sql = "CREATE TABLE roominfo (location VARCHAR(255), contact VARCHAR(255),price INT,description VARCHAR(255),image LONGTEXT)";
    //   con.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log("Table created");
    //   });
});

app.post('/register', (req, res) => {

    console.log(req.body);
    //  var id=Date.now();
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        var sql = `INSERT INTO customers (name,email,password,role) VALUES ('${req.body.name}', '${req.body.email}','${hash}','${req.body.role}')`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            //console.log("1 record inserted");
            //res.header('Content-Type','application/json')
            res.send("inserted")

        });
    })

})

app.post('/login', (req, res) => {

   // console.log(req.body);
    //  var id=Date.now();
    //   bcrypt.hash(req.body.password, 10, function (err, hash) {
    var email = req.body.email;
    var password = req.body.password;
    // bcrypt.compare(req.body.password, user.password, function (err, result) {
    con.query('SELECT * FROM customers WHERE email = ?', [email], function (error, results, fields) {
        if (error) {
            res.json({
                status: false,
                message: 'there are some error with query'
            })
        } else {
            if (results.length > 0) {
                bcrypt.compare(req.body.password, results[0].password, function (err, resultPassword) {
                    console.log(resultPassword)
                    if (resultPassword) {
                        var token=jwt.sign({name:results[0].name,email:email,role:results[0].role},"top-secret")
                        res.json({
                            status: true,
                            message: 'successfully authenticated',
                            token:token
                        })
                    } else {
                        res.json({
                            status: false,
                            message: "Email and password does not match"
                        });
                    }


                })
            }

            else {
                res.json({
                    status: false,
                    message: "Email does not exists"
                });
            }
        }
    });
    // })



})

app.post('/rooms', (req, res) => {

    console.log(req.body);
    //  var id=Date.now();
    // bcrypt.hash(req.body.password, 10, function (err, hash) {
        var sql = `INSERT INTO roominfo (location,contact,price,description,image) VALUES ('${req.body.location}', '${req.body.contact}','${req.body.price}','${req.body.description}','${req.body.image}')`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            //console.log("1 record inserted");
            //res.header('Content-Type','application/json')
            res.send("room inserted")

        });
   // })

})

app.get('/rooms',(req,res)=>{
    con.query('SELECT * FROM roominfo',function (error, results, fields) {
        if (error) {
            res.json({
                status: false,
                message: 'there are some error with query'
            })
        } else {
            res.send(results)
            // res.json({
            //     status: true,
            //     result: results
            // })
        }
    })
})

app.delete('/rooms/:id',(req,res)=>{
    
    console.log(req.params.id)
    var sql = `DELETE FROM roominfo WHERE Id = ${req.params.id}`;
    con.query(sql, function (err, result) {
    if (err) throw err;
    // console.log("Number of records deleted: " + result.affectedRows);
    res.send("Number of rooms deleted: " + result.affectedRows)
    
  });
})

app.put('/rooms/:id',(req,res)=>{
    
    var sql = `UPDATE roominfo SET location='${req.body.location}', contact = '${req.body.contact}',price = '${req.body.price}',
    description = '${req.body.description}',image = '${req.body.image}' WHERE Id = ${req.params.id}`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
      res.send(result.affectedRows + " record(s) updated")
      
    });
})



app.use(express.static(path.join(__dirname + '/roomBookingSystem')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname + '/roomBookingSystem/index.html'));
});

var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: keys.serverPW,
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    firstPrompt();
  });

function firstPrompt() {
    
        inquirer
          .prompt([{
            name: "id",
            type: "input",
            message: "What is product ID?",
            validate: function(value) {
              if (isNaN(value) === false) {
                return true;
              }
              return false;
            }
          },
          {
              name: "count",
              type: "input",
              message: "How many do you want to buy?",
              validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
              }
          }])
          .then(function(answer) {
            var query = "SELECT * FROM products WHERE ?";
                connection.query(query, {item_id: answer.id}, function (error,response){
        
                    var quantity = response[0].stock_quantity;
                    if (quantity > answer.count) {
                        console.log("There is enough!");
                    }
                })
          });
}

function allItems() {
    connection.query("SELECT * FROM products", function(err, res) {
        for (var i = 0; i < res.length; i++) {
        console.log(res);
        }
        console.log("-----------------------------------");
    });
}
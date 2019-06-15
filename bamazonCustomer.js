var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");
var table = require("table");

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
    routeHandling();
  });

function routeHandling() {
    inquirer
    .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
        "View Products for Sale",
        "Buy an item",
        "exit"
        ]
    })
    .then(function(answer) {
        switch (answer.action) {
        case "View Products for Sale":
        allItems();
        break;

        case "Buy an item":
        firstPrompt();
        break;
        
        case "exit":
        connection.end();
        break;
        }
    });
}

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
    
                connection.query("SELECT * FROM products WHERE ?", {item_id: answer.id}, function (err,res){
        
                    var quantity = res[0].stock_quantity;
                    var newTotal = quantity - answer.count;

                    if (quantity > answer.count) {
                        console.log("There is enough!");
                        connection.query( 
                            "UPDATE products SET ? WHERE ?",
                            [
                              {
                                stock_quantity: newTotal
                              },
                              {
                                item_id: answer.id
                              }
                            ],
                            function(error) {
                              if (error) throw err;
                              console.log("Updating inventory!");
                              totalSales(res, answer.id, answer.count);
                            }
                          );
                    }
                    else {
                        console.log("Insufficient quantity!");
                    }
                })
          });
}

function allItems() {
    connection.query("SELECT * FROM products", function(err, res) {
        console.table(res);
        routeHandling();
    });
}

function totalSales(res, id, count) {

    var price = res[0].price;
    var totalCost = (count * price) + res[0].product_sales;

    console.log("Total cost: $" + totalCost);

    connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          product_sales: totalCost
        },
        {
          item_id: id
        }
      ],
      function(err, res) {
        console.log(res.affectedRows + " products updated!\n");
        routeHandling();

      }
    );
  }
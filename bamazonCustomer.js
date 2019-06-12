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
    allItems();
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
    
                connection.query("SELECT * FROM products WHERE ?", {item_id: answer.id}, function (error,response){
        
                    var quantity = response[0].stock_quantity;
                    var newTotal = quantity - answer.count;

                    var price = response[0].price;

                    var totalCost = answer.count * price;

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
                            }
                          );
                          console.log("Total cost: " + totalCost);
                    }
                    else {
                        console.log("Insufficient quantity!");
                    }
                })
          });
}

function allItems() {
    connection.query("SELECT * FROM products", function(err, res) {
        for (var i = 0; i < res.length; i++) {
        console.log("\nProduct: " + res[i].product_name + "\nPrice: $" + res[i].price + "\nStock: " + res[i].stock_quantity + "\n-----------------------------------");
        }
        firstPrompt();
    });
}

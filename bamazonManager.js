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
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product",
        "exit"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case "View Products for Sale":
        allItems();
        break;

      case "View Low Inventory":
        lowInventory();
        break;

      case "Add to Inventory":
        addInventory();
        break;

      case "Add New Product":
        addProduct();
        break;
          
      case "exit":
        connection.end();
        break;
      }
    });
}

// View all items 
function allItems() {
    connection.query("SELECT * FROM products", function(err, res) {
        console.table(res);
        routeHandling();
    });
}

// View all items where inventory is less than 5
function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) {
            console.log(err);
            console.log("All products have more than 5 in their inventory.");
        }
        else {
            for (var i = 0; i < res.length; i++) {
            console.log("\ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nPrice: $" + res[i].price + "\nStock: " + res[i].stock_quantity + "\n-----------------------------------");
            }
        }
        routeHandling();
    });
}

// increase quantity into existing item
function addInventory() {
    inquirer
  .prompt([{
      name: "id",
      type: "input",
      message: "What is the item ID?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
  },{
    name: "count",
    type: "input",
    message: "How much do you want to add?",
    validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
  }])
  .then(answers => {

    connection.query("SELECT * FROM products WHERE ?", {item_id: answers.id}, function (error,response){
        
        var quantity = response[0].stock_quantity;
        var newTotal = quantity + parseInt(answers.count);

        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
                {
                stock_quantity: newTotal
                },
                {
                item_id: answers.id
                }
            ],
            function(error) {
                if (error) throw err;
                console.log("Updating inventory!");
                routeHandling();
            }
        );
    })
  });
}

// Add a new item into products database
function addProduct() {
    inquirer
  .prompt([{
        name: "id",
        type: "input",
        message: "What is product ID?",
        validateInt: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },{
        name: "product_name",
        type: "input",
        message: "What is the product?"
      },{
        name: "department_name",
        type: "input",
        message: "For which department?"
      },{
        name: "price",
        type: "input",
        message: "What is the price of the product?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },{
        name: "stock_quantity",
        type: "input",
        message: "What's the total inventory?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
  ])
  .then(answers => {
    connection.query(
        "SELECT * FROM products WHERE ?", {item_id: parseInt(answers.id)},
        function(err, res) {
            if(res[0]) {
                console.log(res);
                console.log("ID already exists!");
                routeHandling();
            }
            else {
                console.log(res)
                connection.query(
                    "INSERT INTO products SET ?",
                    {
                    item_id: answers.id,
                    product_name: answers.product_name,
                    department_name: answers.department_name,
                    price: answers.price,
                    stock_quantity: answers.stock_quantity
                    },
                    function(err, res) {
                    console.log(res.affectedRows + " product inserted!\n");
                    routeHandling();
                    }
                )
            }
        }
    )
}
);}

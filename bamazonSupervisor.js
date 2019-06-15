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
        "View Product Sales",
        "Create New Department",
        "exit"
        ]
    })
    .then(function(answer) {
        switch (answer.action) {
        case "View Product Sales":
        productSales();
        break;

        case "Create New Department":
        newDepart();
        break;
        
        case "exit":
        connection.end();
        break;
        }
    });
}

function productSales() {
    connection.query("SELECT department_id, departments.department_name, SUM(product_sales), over_head_costs, SUM(product_sales - over_head_costs) AS total_profit FROM products RIGHT JOIN departments ON products.department_name = departments.department_name GROUP BY department_name, department_id;", function(err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log(res);
        console.table(res);
        routeHandling();
    });
}

function newDepart() {
    inquirer
    .prompt([{
            name: "id",
            type: "input",
            message: "What is department ID?",
            validateInt: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
            },
        },{
            name: "department_name",
            type: "input",
            message: "For which department?"
        },{
            name: "over_head_costs",
            type: "input",
            message: "What is the over-head cost for the department?",
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
            "SELECT * FROM departments WHERE EXISTS (SELECT * FROM departments WHERE ?)", {department_name: answers.name},
            function(err, res) {
                if(res) {
                    
                    console.log("Department already exists!");
                    routeHandling();
                }
                else {
                    console.log(res)
                    connection.query(
                        "INSERT INTO departments SET ?",
                        {
                        department_id: answers.id,
                        department_name: answers.department_name,
                        over_head_costs: answers.over_head_costs
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


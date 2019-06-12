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
        "View Product Sales",
        "Create New Department",
        "exit"
        ]
    })
    .then(function(answer) {
        switch (answer.action) {
        case "View Product Sales":
        allSales();
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

function allSales() {

}

function newDepart() {
    
}
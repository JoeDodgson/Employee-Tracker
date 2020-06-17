// Require in modules
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const mysql = require("mysql");
const questions = require("./questions");
const ChoiceQuestion = questions.ChoiceQuestion;
const PromptQuestion = questions.PromptQuestion;
const util = require("util");

// Promisify the connection.query method
const queryAsync = util.promisify(connection.query).bind(connection);

// Create connection to the SQL server
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employeetracker"
})

// Create the initial connection, call viewAllEmployees function
function openConnection() {
    connection.connect(function(err) {
        if (err) console.error(err);
        console.log("connected as id " + connection.threadId);
        viewAllEmployees();
    })
}

// Call the openConnection function
openConnection();

// View all function displays all employees from the employees table
async function viewAllEmployees() {
    try {
        
        selectAction();
    }
    catch {
        console.log("ERROR - app.js - viewAllEmployees(): " + error);
    }
}

function selectAction() {

}
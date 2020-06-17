// Require in modules
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const questions = require("./questions");
const ChoiceQuestion = questions.ChoiceQuestion;
const PromptQuestion = questions.PromptQuestion;
const util = require("util");
const { table, log } = require("console");

// Create connection to the SQL server
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employeetracker"
})

// Promisify the connection.query method
const queryAsync = util.promisify(connection.query).bind(connection);

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
        const employeesData = await queryAsync("SELECT * FROM employee LEFT JOIN role ON employee.role_id = role.id");
        
        const employeesTable = cTable.getTable(employeesData);
        console.log(employeesTable);
        // selectAction();
    }
    catch {
        console.log("ERROR - app.js - viewAllEmployees(): " + error);
    }
}

function selectAction() {

}
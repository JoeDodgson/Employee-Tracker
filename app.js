// Require in modules
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const mysql = require("mysql");
const questions = require("./questions");
const ChoiceQuestion = questions.ChoiceQuestion;
const PromptQuestion = questions.PromptQuestion;

// Create connection to the SQL server
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employeetracker"
})

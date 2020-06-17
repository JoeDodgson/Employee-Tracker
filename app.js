// Require in modules
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const questions = require("./questions");
const Questions = questions.Questions;
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
        // Left join role and department tables onto the employee table
        const employeesData = await queryAsync("SELECT A.id, A.first_name, A.last_name, title, salary, CONCAT(B.first_name, ' ', B.last_name) AS manager_name, name AS department FROM employee AS A LEFT JOIN employee AS B ON A.manager_id = B.id LEFT JOIN role ON A.role_id = role.id  LEFT JOIN department ON role.department_id = department.id ORDER BY A.id;");
        
        // Use cTable to store nicely formatted table of results to display in console.log
        const employeesTable = cTable.getTable(employeesData);

        // Display full list of employees
        console.log("Full list of employees:\n" + employeesTable);

        selectAction();
    }
    catch {
        console.log("ERROR - app.js - viewAllEmployees(): " + error);
    }
}

async function selectAction() {
    try {
        // What would you like to do?
        const { action } = await inquirer.prompt(Questions.question1.returnString());
        
        // Handle the various cases - do different functions
        switch(action) {
            case Questions.question1.choices[0]:
                viewAllEmployees();
            case Questions.question1.choices[1]:
                viewEmployeesByDepartment();
            case Questions.question1.choices[2]:
                viewEmployeesByManager();
            case Questions.question1.choices[3]:
                addEmployee();
            case Questions.question1.choices[4]:
                removeEmployee();
            case Questions.question1.choices[5]:
                updateEmployeeRole();
            case Questions.question1.choices[6]:
                updateEmployeeManager();
            case Questions.question1.choices[7]:
                addRole();
            case Questions.question1.choices[8]:
                removeRole();
            case Questions.question1.choices[9]:
                addDepartment();
            case Questions.question1.choices[10]:
                removeDepartment();
            case Questions.question1.choices[11]:
                viewDepartmentSalary();
            case Questions.question1.choices[12]:
                exit();
        }
    }
    catch {
        console.log(error);
    }
}

async function viewAllEmployees() {

}

async function viewEmployeesByDepartment() {

}

async function viewEmployeesByManager() {

}

async function addEmployee() {

}

async function removeEmployee() {

}

async function updateEmployeeRole() {

}

async function updateEmployeeManager() {

}

async function addRole() {

}

async function removeRole() {

}

async function addDepartment() {

}

async function removeDepartment() {

}

async function viewDepartmentSalary() {

}

async function exit() {

}
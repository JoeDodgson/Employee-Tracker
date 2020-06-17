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
                break;
            case Questions.question1.choices[1]:
                viewEmployeesByDepartment();
                break;
            case Questions.question1.choices[2]:
                viewEmployeesByManager();
                break;
            case Questions.question1.choices[3]:
                addEmployee();
                break;
            case Questions.question1.choices[4]:
                removeEmployee();
                break;
            case Questions.question1.choices[5]:
                updateEmployeeRole();
                break;
            case Questions.question1.choices[6]:
                updateEmployeeManager();
                break;
            case Questions.question1.choices[7]:
                addRole();
                break;
            case Questions.question1.choices[8]:
                removeRole();
                break;
            case Questions.question1.choices[9]:
                addDepartment();
                break;
            case Questions.question1.choices[10]:
                removeDepartment();
                break;
            case Questions.question1.choices[11]:
                viewDepartmentSalary();
                break;
            case Questions.question1.choices[12]:
                exit();
                break;
        }
    }
    catch {
        console.log(error);
    }
}

async function viewEmployeesByDepartment() {
    console.log("viewEmployeesByDepartment function" );
    
}

async function viewEmployeesByManager() {
    console.log("viewEmployeesByManager function" );

    selectAction();
}

async function addEmployee() {
    console.log("addEmployee function" );

    selectAction();
}

async function removeEmployee() {
    console.log("removeEmployee function" );
    
    selectAction();
    selectAction();
}

async function updateEmployeeRole() {
    console.log("updateEmployeeRole function" );
    
    selectAction();
}

async function updateEmployeeManager() {
    console.log("updateEmployeeManager function" );
    
    selectAction();
}

async function addRole() {
    console.log("addRole function" );
    
    selectAction();
}

async function removeRole() {
    console.log("removeRole function" );
    
    selectAction();
}

async function addDepartment() {
    console.log("addDepartment function" );
    
    selectAction();
}

async function removeDepartment() {
    console.log("removeDepartment function" );
    
    selectAction();
}

async function viewDepartmentSalary() {
    console.log("viewDepartmentSalary function" );
    
    selectAction();
}

async function exit() {
    console.log("exit function" );
    
    selectAction();
}
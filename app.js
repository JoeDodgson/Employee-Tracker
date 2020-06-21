// Require in modules
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const util = require("util");
const { table, log } = require("console");

// Require in files
const questions = require("./questions");
const Questions = questions.Questions;
const sqlQueries = require("./sql-queries");

let error = "";

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

// View all function displays all employees from the employees table
async function viewAllEmployees() {
    try {
        // Left join role and department tables onto the employee table
        const employeesData = await queryAsync("SELECT A.id, A.first_name, A.last_name, title, salary, CONCAT(B.first_name, ' ', B.last_name) AS manager_name, name AS department FROM employee AS A LEFT JOIN employee AS B ON A.manager_id = B.id LEFT JOIN role ON A.role_id = role.id  LEFT JOIN department ON role.department_id = department.id ORDER BY A.id;");
        
        // Display full list of employees using cTable formatting
        const employeesTable = cTable.getTable(employeesData);
        console.log("Full list of employees:\n" + employeesTable);

        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewAllEmployees(): " + error);
    }
}

// User selects an action. Different functions are called depending on the user's selection
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
                viewRoles();
                break;
            case Questions.question1.choices[8]:
                addRole();
                break;
            case Questions.question1.choices[9]:
                removeRole();
                break;
            case Questions.question1.choices[10]:
                viewDepartments();
                break;
            case Questions.question1.choices[11]:
                addDepartment();
                break;
            case Questions.question1.choices[12]:
                removeDepartment();
                break;
            case Questions.question1.choices[13]:
                viewDepartmentSalary();
                break;
            case Questions.question1.choices[14]:
                exit();
                break;
        }
    }
    catch (error) {
        console.log("ERROR - app.js - selectAction(): " + error);
    }
}

async function viewEmployeesByDepartment() {
    try {
        // Query the database for departments names. Use names as question choices
        Questions.question2.choices = await sqlQueries.selectTableCol("name", "department");
        
        // Ask the user to select a department
        const { department } = await inquirer.prompt(Questions.question2.returnString());
        
        // Query the database for all employees using the selected department
        const employeesInDepartment = await sqlQueries.employeesInDepartment(department);
        
        // Display list of employees in the selected department using cTable formatting
        const employeesInDepartmentTable = cTable.getTable(employeesInDepartment);
        console.log(`List of employees in the ${department} department:\n\n` + employeesInDepartmentTable);
        
        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewEmployeesByDepartment(): " + error);
    }
}

async function viewEmployeesByManager() {
    try {
        // Query the database for managers. Use managers as question choices
        Questions.question3.choices = await sqlQueries.managersList();
        
        // Ask the user to select a manager
        const { manager } = await inquirer.prompt(Questions.question3.returnString());
        
        // Query the database for all employees who work for the selected manager
        const employeesUnderManager = await sqlQueries.employeesUnderManager(manager);
        
        // Display list of employees who work for the selected manager using cTable formatting
        const employeesUnderManagerTable = cTable.getTable(employeesUnderManager);
        console.log(`List of employees who work for ${manager}:\n\n` + employeesUnderManagerTable);
        
        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewEmployeesByManager(): " + error);        
    }
}

async function addEmployee() {
    try {
        // Query the database for roles. Use roles as question choices
        Questions.question4c.choices = await sqlQueries.selectTableCol("title", "role");
        
        // Query the database for employees. Use employees as manager choices. Include 'no manager' option
        Questions.question4d.choices = await sqlQueries.employeesList();
        Questions.question4d.choices.push("No manager");
        
        // Prompt the user to input details for new employee: first name, last name, role, manager
        const newEmployee = await inquirer.prompt([Questions.question4a.returnString(), Questions.question4b.returnString(), Questions.question4c.returnString(), Questions.question4d.returnString()]);

        // Query the database to find the corresponding role id
        newEmployee.roleId = await sqlQueries.returnRoleId(newEmployee.role);
        
        // Set the value of managerId property of newEmployee to null if no manager, or managerId otherwise
        if (newEmployee.manager === "No manager") {
            newEmployee.managerId = null;
        }
        else {
            // Query the database to find the corresponding manager id
            newEmployee.managerId = await sqlQueries.returnManagerId(newEmployee.manager);
        }
        
        // Assign record values into colValues object
        const colValues = {
            first_name: newEmployee.firstName,
            last_name: newEmployee.lastName,
            role_id: newEmployee.roleId,
            manager_id: newEmployee.managerId
        };
        
        // Insert new entry into the database
        const addEmployee = await sqlQueries.insertRecord("employee", colValues);

        // Display confirmation to state that employee has been added to database
        console.log(`${newEmployee.firstName} ${newEmployee.lastName} has been added to the database`);

        // Display full list of employees (so user can see their new employee has been added)
        viewAllEmployees();
    }
    catch (error) {
        console.log("ERROR - app.js - addEmployee(): " + error);        
    }
}

async function removeEmployee() {
    try {
        // Query the database for employees. Use employees as question choices
        Questions.question5a.choices = await sqlQueries.employeesList();

        // Prompt user to select an employee
        const { employee } = await inquirer.prompt(Questions.question5a.returnString());
        
        // Prompt "When you remove an employer from this database, you cannot retrieve it. Do you still wish to remove this employee?"
        const { confirmYN } = await inquirer.prompt(Questions.question5b.returnString());

        // If yes, perform SQL deletion of record
        if (confirmYN === "Yes") {
            // Query the employee.id of the employee to be removed
            const employeeId = await sqlQueries.returnEmployeeId(employee);
                        
            // Delete the record of the employee from the employee table
            const deleteEmployee = await sqlQueries.deleteRecord("employee", "id", employeeId);

            // Display confirmation to state that employee has been removed from database
            console.log(`${employee} was removed from the database\n`);
        }

        // If no, confirm that the employee was not removed from the database
        else {
            console.log(`${employee} was not removed from the database\n`);
        }

        // Display full list of employees (so user can see their new employee has been added)
        viewAllEmployees();
    }
    catch (error) {
        console.log("ERROR - app.js - removeEmployee(): " + error);
    }
}

async function updateEmployeeRole() {
    try {
        // Query the database for employees. Use employees as question choices
        Questions.question6a.choices = await sqlQueries.employeesList();
        
        // Query the database for roles. Use roles as question choices
        Questions.question6b.choices = await sqlQueries.selectTableCol("title", "role");
    
        // Prompts user to select an employee
        const { employee } = await inquirer.prompt(Questions.question6a.returnString());
        
        // Prompts user to select a new role for the employee
        const { role } = await inquirer.prompt(Questions.question6b.returnString());
    
        // Query the employee.id of the employee to be have role changed
        const employeeId = await sqlQueries.returnEmployeeId(employee);
        
        // Query the role id of the new role selected
        const roleId = await sqlQueries.returnRoleId(role);

        // Amend the role of the employee
        const updateEmployee = await sqlQueries.updateRecord("employee", "role_id", roleId, "id", employeeId);
    
        // Display confirmation to state that the role of the employee was updated
        console.log(`\nThe role of ${employee} was successfully changed to ${role}\n`);
    
        // Display full list of employees (so user can see their new employee has been added)
        viewAllEmployees();

    }
    catch (error) {
        console.log("ERROR - app.js - updateEmployeeRole(): " + error);
    }
}

async function updateEmployeeManager() {
    try {
        // Query the database for employees. Use employees as choices for employees and manager questions
        Questions.question7a.choices = await sqlQueries.employeesList();
        Questions.question7b.choices = Questions.question7a.choices;

        // Prompts user to select an employee
        const { employee } = await inquirer.prompt(Questions.question7a.returnString());
        
        // Prompts user to select a new manager for the employee
        const { manager } = await inquirer.prompt(Questions.question7b.returnString());

        // Query the employee.id of the employee to be have manager changed
        const employeeId = await sqlQueries.returnEmployeeId(employee);

        // Query the employee.id of the new manager selected
        const managerId = await sqlQueries.returnEmployeeId(manager);

        // Amend the manager_id of the employee
        const updateEmployee = await sqlQueries.updateRecord("employee", "manager_id", managerId, "id", employeeId);
    
        // Display confirmation to state that the manager of the employee was updated
        console.log(`\n${employee}'s manager was successfully changed to ${manager}\n`);

        // Display full list of employees (so user can see their new employee has been added)
        viewAllEmployees();

    }
    catch (error) {
        console.log("ERROR - app.js - updateEmployeeRole(): " + error);
    }
}

async function viewRoles() {
    try { 
        // Query the database for all roles, including salary and department
        const rolesDetails = await sqlQueries.rolesDetails();
        
        // Display list of roles using cTable formatting
        const rolesDetailsTable = cTable.getTable(rolesDetails);
        console.log(`List of all roles:\n\n` + rolesDetailsTable);
        
        // Return to selectAction function
        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewRoles(): " + error);
    }
}

async function addRole() {
    try {
        // Query the database for departments. Use departments as question choices
        Questions.question8c.choices = await sqlQueries.selectTableCol("name", "department");
        
        // Prompt the user to input details for new role: title, salary, department
        const newRole = await inquirer.prompt([Questions.question8a.returnString(), Questions.question8b.returnString(), Questions.question8c.returnString()]);

        // Query the database to find the corresponding department id
        newRole.departmentId = await sqlQueries.returnDepartmentId(newRole.department);
                
        // Assign record values into colValues object
        const colValues = {
            title: newRole.title,
            salary: newRole.salary,
            department_id: newRole.departmentId
        };
        
        // Insert new entry into the database
        const addRole = await sqlQueries.insertRecord("role", colValues);

        // Display confirmation to state that role has been added to database
        console.log(`\nThe new role of ${newRole.title} was successfully added\n`);

        // Display full list of roles (so user can see their new role has been added)
        viewRoles();
    }
    catch (error) {
        console.log("ERROR - app.js - addRole(): " + error);        
    }
}

async function removeRole() {
    try {
        // Query the database for roles. Use roles as question choices
        Questions.question9a.choices = await sqlQueries.selectTableCol("title", "role");

        // Prompt user to select an role
        const { role } = await inquirer.prompt(Questions.question9a.returnString());
        
        // Prompt "When you remove a role from this database, you cannot retrieve it. Do you still wish to remove this role?"
        const { confirmYN } = await inquirer.prompt(Questions.question9b.returnString());

        // If yes, perform SQL deletion of record
        if (confirmYN === "Yes") {
            // Query the role.id of the role to be removed
            const roleId = await sqlQueries.returnRoleId(role);
                        
            // Delete the record of the role from the role table
            const deleteRole = await sqlQueries.deleteRecord("role", "id", roleId);            

            // Display confirmation to state that role has been removed from database
            console.log(`\nThe role of ${role} was successfully removed from the database\n`);
        }
        
        // If no, confirm that the employee was not removed from the database
        else {
            console.log(`\nThe role of ${role} was not removed from the database\n`);
        }

        // Display full list of roles (so user can see their new role has been removed)
        viewRoles();
    }
    catch (error) {
        console.log("ERROR - app.js - removeRole(): " + error);
    }
}

async function viewDepartments() {
    try { 
        // Query the database for all roles, including salary and department
        const departments = await sqlQueries.selectTableCol("name", "department");
        
        // Display list of roles using cTable formatting
        const departmentsTable = cTable.getTable(departments);
        console.log(`List of all departments:\n\n` + departmentsTable);
        
        // Return to selectAction function
        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewDepartments(): " + error);
    }
}

async function addDepartment() {
    try {
        // Prompt the user to input the title of the new department
        const { name } = await inquirer.prompt(Questions.question10.returnString());
                        
        // Assign record values into colValues object
        const colValues = {
            name: name
        };
        
        // Insert new entry into the database
        const addDepartment = await sqlQueries.insertRecord("department", colValues);

        // Display confirmation to state that department has been added to database
        console.log(`\nThe new ${name} department was successfully added\n`);

        // Display full list of departments (so user can see their new department has been added)
        viewDepartments();
    }
    catch (error) {
        console.log("ERROR - app.js - addDepartment(): " + error);        
    }
}

async function removeDepartment() {
    try {
        // Query the database for departments. Use departments as question choices
        Questions.question11a.choices = await sqlQueries.selectTableCol("name", "department");

        // Prompt user to select an department to remove
        const { department } = await inquirer.prompt(Questions.question11a.returnString());
        
        // Prompt "When you remove a department from this database, you cannot retrieve it. Do you still wish to remove this department?"
        const { confirmYN } = await inquirer.prompt(Questions.question11b.returnString());

        // If yes, perform SQL deletion of record
        if (confirmYN === "Yes") {
            // Query the department.id of the department to be removed
            const departmentId = await sqlQueries.returnDepartmentId(department);
                        
            // Delete the record of the department from the department table
            const deleteDepartment = await sqlQueries.deleteRecord("department", "id", departmentId);

            // Display confirmation to state that department has been removed from database
            console.log(`\nThe ${department} department was successfully removed\n`);
        }
        
        // If no, confirm that the employee was not removed from the database
        else {
            console.log(`\nThe ${department} department was not removed\n`);
        }

        // Display full list of departments (so user can see their new department has been removed)
        viewDepartments();
    }
    catch (error) {
        console.log("ERROR - app.js - removeDepartment(): " + error);
    }
}

async function viewDepartmentSalary() {
    try {
        // Query the database for departments. Use departments as question choices

        // Prompt user to select an department to see salary
        
        // Query the department.id of the department to see salary
                    
        // Query the database for total salary

        // Display total salary of department in a console log

        // Return to selectAction function
        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewDepartmentSalary(): " + error);
    }
}

// Displays exit message and ends database connection 
function exit() {
    console.log("Exiting application");
    connection.end();
}

// Call the openConnection function which initiates the application
openConnection();
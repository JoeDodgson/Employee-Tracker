// Require in modules
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const questions = require("./questions");
const Questions = questions.Questions;
const util = require("util");
const { table, log } = require("console");

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
    catch (error) {
        console.log("ERROR - app.js - selectAction(): " + error);
    }
}

async function viewEmployeesByDepartment() {
    try {
        // Query the database to return a list of departments
        const departmentsListData = await queryAsync("SELECT name FROM department;");
        const departmentsList = departmentsListData.map(department => department.name);
        
        // Generate a question using the returned departments
        Questions.question2.choices = departmentsList;
        
        // Ask the user to select a department
        const { department } = await inquirer.prompt(Questions.question2.returnString());
        
        // Query the database for all employees using the selected department
        const employeesInDepartment = await queryAsync(`SELECT A.id, CONCAT(A.first_name, ' ', A.last_name) AS name, title, salary, CONCAT(B.first_name, ' ', B.last_name) AS manager_name FROM employee AS A LEFT JOIN employee AS B ON A.manager_id = B.id LEFT JOIN role ON A.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.name = '${department}';`);
        
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
        // Query the database to return a list of managers
        const managersListData = await queryAsync("SELECT DISTINCT CONCAT(B.first_name, ' ', B.last_name) AS name FROM employee AS A INNER JOIN employee AS B ON A.manager_id = B.id;");
        const managersList = managersListData.map(manager => manager.name);
        
        // Generate a question using the returned managers
        Questions.question3.choices = managersList;
        
        // Ask the user to select a manager
        const { manager } = await inquirer.prompt(Questions.question3.returnString());
        
        // Query the database for all employees who work for the selected manager
        const employeesUnderManager = await queryAsync(`SELECT A.id, CONCAT(A.first_name, ' ', A.last_name) AS name, title, salary, department.name AS department FROM employee AS A LEFT JOIN employee AS B ON A.manager_id = B.id LEFT JOIN role ON A.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE CONCAT(B.first_name, ' ', B.last_name) = '${manager}';`);
        
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
        // Query the database to return a list of roles
        const rolesListData = await queryAsync("SELECT title FROM role;");
        const rolesList = rolesListData.map(role => role.title);
        
        // Generate a question using the returned roles
        Questions.question4c.choices = rolesList;
        
        // Query the database to return a list of employees
        const employeesListData = await queryAsync("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee;");
        const employeesList = employeesListData.map(employee => employee.name);
        employeesList.push("No manager");

        // Generate a question using the returned employees
        Questions.question4d.choices = employeesList;
        
        // Prompt the user to input details for new employee: first name, last name, role, manager
        const newEmployee = await inquirer.prompt([Questions.question4a.returnString(), Questions.question4b.returnString(), Questions.question4c.returnString(), Questions.question4d.returnString()]);

        // Query the database to find the corresponding role id
        const queryRoleId = await queryAsync(`SELECT id AS roleId FROM role WHERE title = '${newEmployee.role}'`);
        newEmployee.roleId = queryRoleId[0].roleId;
        
        // Set the value of managerId property of newEmployee to null if no manager, or managerId otherwise
        if (newEmployee.manager === "No manager") {
            newEmployee.managerId = null;
        }
        else {
            // Query the database to find the corresponding manager id
            const queryManagerId = await queryAsync(`SELECT id AS managerId FROM employee WHERE CONCAT(first_name, ' ', last_name) = '${newEmployee.manager}'`);
            newEmployee.managerId = queryManagerId[0].managerId;
        }

        // Insert new entry into the database
        const addEmployee = await queryAsync("INSERT INTO employee SET ?",
            {
                first_name: newEmployee.firstName,
                last_name: newEmployee.lastName,
                role_id: newEmployee.roleId,
                manager_id: newEmployee.managerId
            }
        );
        
        // Throw error if there are no or multiple affected rows 
        if (addEmployee.affectedRows > 1) {
            error = "More than one entry was added to the employee table";
            throw error;
        }
        else if (addEmployee.affectedRows === 0) {
            error = "No entries were added to the employee table";
            throw error;
        }

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
        // Query the database to return a list of employees
        const employeesListData = await queryAsync("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee;");
        const employeesList = employeesListData.map(employee => employee.name);

        // Generate a question using the returned employees
        Questions.question5a.choices = employeesList;

        // Prompts user to select an employee
        const { employee } = await inquirer.prompt(Questions.question5a.returnString());
        
        // Prompts "When you remove an employer from this database, you cannot retrieve it. Do you still wish to remove this employee?"
        const { confirmYN } = await inquirer.prompt(Questions.question5b.returnString());

        // If yes, perform SQL deletion of record
        if (confirmYN === "Yes") {
            // Query the employee.id of the employee to be removed
            const employeeIdData = await queryAsync(`SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = '${employee}'`);
            const employeeId = employeeIdData[0].id;
            
            // Amend manager_id to null for records where the removed employee was selected as a manager
            const updateEmployeeManager = await queryAsync(`UPDATE employee SET manager_id = null WHERE manager_id = '${employeeId}'`);
            
            // Delete the record of the employee from the employee table
            const deleteEmployee = await queryAsync(`DELETE FROM employee WHERE id = ${employeeId}`);

            // Throw error if there are no affected rows 
            if (deleteEmployee.affectedRows > 1) {
                error = "More than one entry was removed from the employee tablean";
                throw error;
            }
            else if (deleteEmployee.affectedRows === 0) {
                error = "No entries were removed from the employee table\n";
                throw error;
            }

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
        // Query the database to return a list of employees
        const employeesListData = await queryAsync("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee;");
        const employeesList = employeesListData.map(employee => employee.name);

        // Generate a question using the returned employees
        Questions.question6a.choices = employeesList;
        
        // Query the database to return a list of roles
        const rolesListData = await queryAsync("SELECT title FROM role;");
        const rolesList = rolesListData.map(role => role.title);
        
        // Generate a question using the returned roles
        Questions.question6b.choices = rolesList;
    
        // Prompts user to select an employee
        const { employee } = await inquirer.prompt(Questions.question6a.returnString());
        
        // Prompts user to select a new role for the employee
        const { role } = await inquirer.prompt(Questions.question6b.returnString());
    
        // Query the employee.id of the employee to be have role changed
        const employeeIdData = await queryAsync(`SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = '${employee}'`);
        const employeeId = employeeIdData[0].id;
        
        // Query the role id of the new role selected
        const roleIdData = await queryAsync(`SELECT id FROM role WHERE title = '${role}'`);
        const roleId = roleIdData[0].id;

        // Amend the role of the employee
        const updateEmployee = await queryAsync(`UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId};`);
    
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
        // Query the database to return a list of employees
        const employeesListData = await queryAsync("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee;");
        const employeesList = employeesListData.map(employee => employee.name);

        // Generate a question using the returned employees
        Questions.question7a.choices = employeesList;

        // Query the database to return a list of managers
        const managersListData = await queryAsync("SELECT DISTINCT CONCAT(B.first_name, ' ', B.last_name) AS name FROM employee AS A INNER JOIN employee AS B ON A.manager_id = B.id;");
        const managersList = managersListData.map(manager => manager.name);

        // Generate a question using the returned managers
        Questions.question7b.choices = employeesList;

        // Prompts user to select an employee
        const { employee } = await inquirer.prompt(Questions.question7a.returnString());
        
        // Prompts user to select a new manager for the employee
        const { manager } = await inquirer.prompt(Questions.question7b.returnString());

        // Query the employee.id of the employee to be have manager changed
        const employeeIdData = await queryAsync(`SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = '${employee}'`);
        const employeeId = employeeIdData[0].id;

        // Query the employee.id of the new manager selected
        const managerIdData = await queryAsync(`SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = '${manager}'`);
        const managerId = employeeIdData[0].id;

        // Amend the manager_id of the employee

        // Display confirmation to state that the manager of the employee was updated

        // Display full list of employees (so user can see their new employee has been added)
        selectAction();

    }
    catch (error) {
        console.log("ERROR - app.js - updateEmployeeRole(): " + error);
    }
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

// Displays exit message and ends database connection 
function exit() {
    console.log("Exiting application");
    connection.end();
}

// Call the openConnection function which initiates the application
openConnection();
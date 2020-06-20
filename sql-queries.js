// Require in modules
const mysql = require("mysql");
const util = require("util");

// Create connection to the SQL server
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employeetracker"
});

// Promisify the connection.query method
const queryAsync = util.promisify(connection.query).bind(connection);

const sqlQueries = {
    // Database query for one column in one table
    selectTableCol: async (column, table) => {
        try {
            const data = await queryAsync(`SELECT ${column} FROM ${table};`);
            const dataList = data.map(item => item[column]);
            return dataList;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.selectTableCol(): " + error);
        }
    },
    
    // Database query for all employees in a department
    employeesInDepartment: async department => {
        try {
            const data = await queryAsync(`SELECT A.id, CONCAT(A.first_name, ' ', A.last_name) AS name, title, salary, CONCAT(B.first_name, ' ', B.last_name) AS manager_name FROM employee AS A LEFT JOIN employee AS B ON A.manager_id = B.id LEFT JOIN role ON A.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.name = '${department}';`);
            return data;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.employeesInDepartment(): " + error);
        }
    },

    // Database query for all managers
    managersList: async () => {
        try {
            const data = await queryAsync("SELECT DISTINCT CONCAT(B.first_name, ' ', B.last_name) AS name FROM employee AS A INNER JOIN employee AS B ON A.manager_id = B.id;");
            const dataList = data.map(manager => manager.name);
            return dataList;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.managersList(): " + error);
        }
    },

    // Database query for all employees
    employeesList: async () => {
        try {
            const data = await queryAsync("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee;");
            const dataList = data.map(employee => employee.name);
            return dataList;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.employeesList(): " + error);
        }
    },

    // Database query for all employees who work for specified manager
    employeesUnderManager: async manager => {
        try {
            const data = await queryAsync(`SELECT A.id, CONCAT(A.first_name, ' ', A.last_name) AS name, title, salary, department.name AS department FROM employee AS A LEFT JOIN employee AS B ON A.manager_id = B.id LEFT JOIN role ON A.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE CONCAT(B.first_name, ' ', B.last_name) = '${manager}';`);
            return data;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.employeesUnderManager(): " + error);
        }
    }
}

module.exports = sqlQueries;
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
    // End connection
    endConnection: () => {
        connection.end();
    },
    
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
    
    // Insert record into database
    insertRecord: async (table, colValues) => {
        try {
            const data = await queryAsync(`INSERT INTO ${table} SET ?`, colValues);
            // Throw error if there are no or multiple affected rows 
            if (data.affectedRows > 1) {
                error = `More than one entry was added to the ${table} table`;
                throw error;
            }
            else if (data.affectedRows === 0) {
                error = `No entries were added to the ${table} table`;
                throw error;
            }
            return data;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.insertRecord(): " + error);
        }
    },
    
    // Delete record into database
    deleteRecord: async (table, columnName, columnValue) => {
        try {
            const data = await queryAsync(`DELETE FROM ${table} WHERE ${columnName} = ${columnValue}`);
            // Throw error if there are no or multiple affected rows 
            if (data.affectedRows > 1) {
                error = `More than one entry was deleted from the ${table} table`;
                throw error;
            }
            else if (data.affectedRows === 0) {
                error = `No entries were deleted from the ${table} table`;
                throw error;
            }
            return data;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.deleteRecord(): " + error);
        }
    },
    
    // Update record into database
    updateRecord: async (table, setColName, setColValue, whereColName, whereColValue) => {
        try {
            const data = await queryAsync(`UPDATE ${table} SET ${setColName} = ${setColValue} WHERE ${whereColName} = ${whereColValue};`);
            // Throw error if there are no or multiple affected rows 
            if (data.affectedRows > 1) {
                error = `More than one entry was updated in the ${table} table`;
                throw error;
            }
            else if (data.affectedRows === 0) {
                error = `No entries were updated in the ${table} table`;
                throw error;
            }
            return data;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.updateRecord(): " + error);
        }
    },
    
    // Database query for all employees
    employeesDetails: async () => {
        try {
            const data = await queryAsync(`SELECT A.id, A.first_name, A.last_name, title, salary, CONCAT(B.first_name, ' ', B.last_name) AS manager_name, name AS department FROM employee AS A LEFT JOIN employee AS B ON A.manager_id = B.id LEFT JOIN role ON A.role_id = role.id  LEFT JOIN department ON role.department_id = department.id ORDER BY A.id;`);
            return data;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.employeesDetails(): " + error);
        }
    },
    
    // Database query for all roles
    rolesDetails: async () => {
        try {
            const data = await queryAsync(`SELECT role.id, title, salary, department.name AS department FROM role LEFT JOIN department ON department_id = department.id ORDER BY role.id;`);
            return data;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.rolesDetails(): " + error);
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
    },

    // Database query for employeeId based on employee name
    returnEmployeeId: async employee => {
        try {
            const data = await queryAsync(`SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = '${employee}'`);
            const employeeId = data[0].id;
            return employeeId;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.returnEmployeeId(): " + error);
        }
    },

    // Database query for roleId based on role title
    returnRoleId: async role => {
        try {
            const data = await queryAsync(`SELECT id AS roleId FROM role WHERE title = '${role}'`);
            const roleId = data[0].roleId;
            return roleId;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.returnRoleId(): " + error);
        }
    },

    // Database query for departmentId based on department name
    returnDepartmentId: async department => {
        try {
            const data = await queryAsync(`SELECT id AS departmentId FROM department WHERE name = '${department}'`);
            const departmentId = data[0].departmentId;
            return departmentId;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.returnDepartmentId(): " + error);
        }
    },

    // Database query for total salary of department based on department ID
    totalDepartmentSalary: async departmentId => {
        try {
            const data = await queryAsync(`SELECT SUM(salary) AS totalSalary FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE department_id = ${departmentId};`);
            const totalSalary = data[0].totalSalary;
            return totalSalary;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.totalDepartmentSalary(): " + error);
        }
    }
}

module.exports = sqlQueries;
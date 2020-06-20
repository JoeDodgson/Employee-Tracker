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
    // Method for selecting one column in a table
    selectTableCol: async (column, table) => {
        try {
            const data = await queryAsync(`SELECT ${column} FROM ${table};`);
            const dataList = data.map(item => item[column]);
            return dataList;
        }
        catch (error) {
            console.log("ERROR - sql-queries.js - sqlQueries.selectTableCol(): " + error);
        }
    }
}

module.exports = sqlQueries;
// Class for all questions
class PromptQuestion {
    constructor (message, name) {
        this.message = message;
        this.name = name;
    }

    returnString() {
        return JSON.parse(`{"message" : "${this.message}",
        "name" : "${this.name}"}`);
    }
}

// Class for 'list' type questions
class ChoiceQuestion extends PromptQuestion {
    constructor (message, name, choices) {
        super(message, name);
        this.type = "list";
        this.choices = choices;
    }

    stringifyChoices() {
        return this.choices.join('","') + '"';
    }

    returnString() {
        return JSON.parse(`{"type" : "list",
        "message" : "${this.message}",
        "name" : "${this.name}",
        "choices" : ["${this.stringifyChoices()}]}`);
    }
}

// Generate questions which will be used in app.js
const Questions = {};

Questions.question1 = new ChoiceQuestion("What would you like to do?", "action", ["View all employees", "View all employees by department", "View all employees by manager", "Add employee", "Remove employee", "Update employee role", "Update employee manager", "Add role", "Remove role", "Add department", "Remove department", "View total salary for a department", "Exit"]);
Questions.question2 = new ChoiceQuestion("Select a department", "department", []);
Questions.question3 = new ChoiceQuestion("Select a manager", "manager", []);
Questions.question4a = new PromptQuestion("Enter the new employee's first name", "firstName");
Questions.question4b = new PromptQuestion("Enter employee's last name", "lastName");
Questions.question4c = new ChoiceQuestion("Select a role", "role", []);
Questions.question4d = Questions.question3;

// Export classes
module.exports = {
    Questions : Questions
};
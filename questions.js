// Class for all questions
class PromptQuestion {
    constructor (message, name) {
        this.message = message;
        this.name = name;
    }

    returnString() {
        return `{"message" : "${this.message}",
        "name" : "${this.name}"}`
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

const Questions = {};

Questions.question1 = new ChoiceQuestion("What would you like to do?", "action", ["View all employees", "View all employees by department", "View all employees by manager", "Add employee", "Remove employee", "Update employee role", "Update employee manager", "Add role", "Remove role", "Add department", "Remove department", "View total salary for a department", "Exit"]);

// Export classes
module.exports = {
    Questions : Questions
};
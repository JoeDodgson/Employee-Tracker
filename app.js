// Require in modules
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const mysql = require("mysql");
const questions = require("./questions");
const ChoiceQuestion = questions.ChoiceQuestion;
const PromptQuestion = questions.PromptQuestion;
USE employeeTracker;
    
INSERT INTO department (name)
VALUES 
	("Engineering"),
    ("Safety"),
	("Assurance"),
    ("Project Management");

INSERT INTO role (title, salary, department_id)
VALUES 
	("Engineering Team Manager", 70000, 1),
    ("Senior Engineer", 50000, 1),
	("Engineer", 40000, 1),
	("Graduate Engineer", 27500, 1),
    ("Apprentice", 15000, 1),
	("Safety Team Manager", 65000, 2),
    ("Safety Consultant", 45000, 2),
	("Assurance Team Manager", 60000, 3),
    ("Assurance Consultant", 40000, 3),
	("Assurance Graduate", 27500, 3),
 	("Project Management Team Manager", 70000, 4),
    ("Senior Project Manager", 55000, 4),
	("Project Manager", 40000, 4),
	("Graduate Project Manager", 27500, 4);
    
INSERT INTO employee (first_name, last_name, role_id)
VALUES
	("Margaret", "Fishwick", 1),
	("Barbara", "Furlough", 6),
	("Juliette", "Marriott", 8),
	("Barry", "Wilson", 11);
    
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Roger", "Smith", 2, 1),
	("Ron", "Truffle", 3, 1),
	("Gary", "Lemongrass", 4, 1),
    ("John", "Duffer", 5, 1),
    ("Kevin", "Buckle", 7, 2),
    ("Fran", "Wiggins", 9, 3),
	("Lenny", "Bytheway", 10, 3),
    ("Pauline", "Ellen", 12, 4),
	("Matilda", "Waffle", 13, 4),
	("Colin", "Fox", 14, 4);
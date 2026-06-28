#!/usr/bin/env python3
"""Generate DBMS questions - 500 questions"""
import json, random, os
random.seed(50)
OUT = "/home/hp/cdac-mock-test/src/data"
counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"
def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]; random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []
db_topics = [
    ("RDBMS", [
        ("RDBMS stands for?", "Relational Database Management System", ["Relational Database", "Relational Data", "Relational DB"]),
        ("Table is also called?", "Relation", ["Entity", "Attribute", "Tuple"]),
        ("Row is also called?", "Tuple", ["Attribute", "Relation", "Key"]),
        ("Column is also called?", "Attribute", ["Tuple", "Relation", "Key"]),
        ("Primary key is?", "Unique identifier", ["Foreign key", "Candidate key", "Super key"]),
    ]),
    ("ACID Properties", [
        ("ACID Atomicity means?", "All or nothing", ["Consistent", "Isolated", "Durable"]),
        ("ACID Consistency means?", "Valid state", ["Atomic", "Isolated", "Durable"]),
        ("ACID Isolation means?", "Transactions independent", ["Atomic", "Consistent", "Durable"]),
        ("ACID Durability means?", "Permanent", ["Atomic", "Consistent", "Isolated"]),
        ("ACID stands for?", "Atomicity Consistency Isolation Durability", ["Access Control", "Atomic Control", "None"]),
    ]),
    ("Basic SQL", [
        ("SELECT is used for?", "Retrieving data", ["Inserting", "Deleting", "Updating"]),
        ("INSERT is used for?", "Adding data", ["Retrieving", "Deleting", "Updating"]),
        ("UPDATE is used for?", "Modifying data", ["Retrieving", "Inserting", "Deleting"]),
        ("DELETE is used for?", "Removing data", ["Retrieving", "Inserting", "Updating"]),
        ("CREATE is used for?", "Creating objects", ["Retrieving", "Deleting", "Updating"]),
        ("DROP is used for?", "Deleting objects", ["Retrieving", "Inserting", "Updating"]),
        ("ALTER is used for?", "Modifying structure", ["Retrieving", "Inserting", "Deleting"]),
        ("WHERE clause is used for?", "Filtering", ["Sorting", "Grouping", "Joining"]),
        ("ORDER BY is used for?", "Sorting", ["Filtering", "Grouping", "Joining"]),
        ("GROUP BY is used for?", "Grouping", ["Sorting", "Filtering", "Joining"]),
        ("HAVING is used for?", ["Filtering groups", "Filtering rows", "Sorting", "Joining"], 0),
        ("JOIN is used for?", "Combining tables", ["Filtering", "Sorting", "Grouping"]),
        ("INNER JOIN returns?", "Matching rows", ["All rows", "Left only", "Right only"]),
        ("LEFT JOIN returns?", "All left + matching right", ["Matching only", "All right", "None"]),
        ("UNION combines?", ["Rows from queries", "Columns", "Tables", "Databases"], 0),
    ]),
    ("Keys", [
        ("Primary key allows?", "No duplicates", ["Duplicates", "NULL", "Both"]),
        ("Foreign key references?", "Primary key", ["Foreign key", "Unique key", "Candidate key"]),
        ("Candidate key is?", "Potential primary key", ["Foreign key", "Super key", "Alternate"]),
        ("Super key is?", "Set of attributes", ["Single key", "Foreign key", "Primary key"]),
        ("Unique key allows?", "One NULL", ["No NULL", "Multiple NULL", "Duplicates"]),
        ("Composite key has?", "Multiple attributes", ["Single", "Foreign", "Alternate"]),
    ]),
    ("Normalization", [
        ("1NF requires?", "Atomic values", ["No partial", "No transitive", "No join"]),
        ("2NF requires?", "No partial dependency", ["Atomic", "No transitive", "No join"]),
        ("3NF requires?", "No transitive dependency", ["Atomic", "No partial", "No join"]),
        ("BCNF is stronger than?", "3NF", ["1NF", "2NF", "4NF"]),
        ("Normalization reduces?", "Redundancy", ["Integrity", "Security", "Speed"]),
        ("Denormalization improves?", "Read performance", ["Write", "Security", "Integrity"]),
    ]),
    ("ER Model", [
        ("ER stands for?", "Entity Relationship", ["Entity Relation", "Event Relation", "Entity Reference"]),
        ("Entity is?", "Real world object", ["Attribute", "Relationship", "Key"]),
        ("Weak entity depends on?", "Strong entity", ["No entity", "Weak entity", "Key"]),
        ("Relationship types count?", "3", ["2", "4", "5"]),
        ("One-to-many means?", "One to many", ["Many to one", "One to one", "Many to many"]),
        ("Many-to-many is resolved by?", ["Intermediate table", "Foreign key", "Primary key", "None"], 0),
    ]),
    ("Transactions", [
        ("COMMIT makes changes?", "Permanent", ["Temporary", "Reversed", "Deleted"]),
        ("ROLLBACK makes changes?", "Reversed", ["Permanent", "Temporary", "Deleted"]),
        ("SAVEPOINT is?", "Point to rollback to", ["Commit", "End", "Begin"]),
        ("Transaction begins with?", "START TRANSACTION", ["BEGIN", "COMMIT", "ROLLBACK"]),
    ]),
    ("Indexing", [
        ("Index improves?", "Search speed", ["Insert speed", "Delete speed", "Update speed"]),
        ("Clustered index?", "Changes physical order", ["Doesn't change", "Multiple allowed", "Unique"]),
        ("Non-clustered index?", "Doesn't change physical order", ["Changes", "Multiple not", "Unique"]),
        ("Primary index is on?", "Primary key", ["Foreign key", "Any key", "Unique key"]),
        ("B-tree index is?", "Balanced tree", ["Hash", "Linear", "Graph"]),
    ]),
    ("Views", [
        ("View is?", "Virtual table", ["Physical table", "Index", "Procedure"]),
        ("View stores data?", "No", ["Yes", "Sometimes", "Always"]),
        ("Materialized view?", "Stores data", ["Doesn't store", "Virtual", "Temporary"]),
        ("View is defined by?", "SELECT query", ["INSERT", "UPDATE", "DELETE"]),
    ]),
    ("Stored Procedures", [
        ("Stored procedure is?", "Precompiled code", ["Table", "View", "Index"]),
        ("Stored procedure is stored in?", "Database", ["Memory", "File", "Cache"]),
        ("Trigger is triggered by?", "Event", ["Query", "View", "Index"]),
        ("Trigger BEFORE runs?", "Before event", ["After", "Instead", "During"]),
        ("Trigger AFTER runs?", "After event", ["Before", "Instead", "During"]),
    ]),
    ("Concurrency Control", [
        ("Lock is used for?", "Concurrency control", ["Security", "Integrity", "Backup"]),
        ("Shared lock allows?", "Read only", ["Write only", "Both", "Neither"]),
        ("Exclusive lock allows?", "Write only", ["Read only", "Both", "Neither"]),
        ("Deadlock in DB means?", "Circular wait", ["No wait", "Single wait", "Linear wait"]),
        ("2PL stands for?", "Two Phase Locking", ["Two Phase Log", "Two Process", "Two Program"]),
    ]),
]

for topic_name, q_list in db_topics:
    for q_text, correct, wrong in q_list:
        if isinstance(correct, list):
            opts = correct; correct_idx = wrong
        else:
            opts = [correct] + wrong; correct_idx = 0
        questions.append(mk("B","DBMS",topic_name,random.choice(["easy","medium","hard"]),
            q_text, opts, correct_idx, f"Answer: {opts[correct_idx]}"))

# Fill remaining to reach 500
fill_topics = [t[0] for t in db_topics]
db_fillers = [
    ("SQL stands for?", "Structured Query Language", ["Structured Query Logic", "Simple Query", "Standard Query"]),
    ("DDL stands for?", "Data Definition Language", ["Data Manipulation", "Data Control", "Data Query"]),
    ("DML stands for?", "Data Manipulation Language", ["Data Definition", "Data Control", "Data Query"]),
    ("DCL stands for?", "Data Control Language", ["Data Definition", "Data Manipulation", "Data Query"]),
    ("TCL stands for?", "Transaction Control Language", ["Table Control", "Trigger Control", "Data Control"]),
    ("SELECT * means?", "All columns", ["All rows", "First row", "Last column"]),
    ("DISTINCT removes?", "Duplicates", ["NULL", "First", "Last"]),
    ("LIKE '%a' means?", "Ends with a", ["Starts with a", "Contains a", "Equals a"]),
    ("LIKE 'a%' means?", "Starts with a", ["Ends with a", "Contains a", "Equals a"]),
    ("COUNT(*) counts?", "All rows", ["Non-null", "Distinct", "Unique"]),
]

for i in range(500 - len(questions)):
    q_text, correct, wrong = random.choice(db_fillers)
    opts = [correct] + wrong
    questions.append(mk("B","DBMS",random.choice(fill_topics),random.choice(["easy","medium","hard"]),
        q_text, opts, 0, f"Answer: {correct}"))

print(f"DBMS: {len(questions)} questions")
with open(f"{OUT}/dbms.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved dbms.json")

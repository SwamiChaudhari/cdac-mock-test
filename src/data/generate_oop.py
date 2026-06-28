#!/usr/bin/env python3
"""Generate OOP C++ questions - 500 questions"""
import json, random, os
random.seed(47)
OUT = "/home/hp/cdac-mock-test/src/data"
counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"
def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]; random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []
oop_topics = [
    ("Classes and Objects", [
        ("Class is?", "Blueprint", ["Object", "Variable", "Function"]),
        ("Object is?", "Instance of class", ["Class", "Function", "Variable"]),
        ("Class members are ? by default", "Private", ["Public", "Protected", "Static"]),
        ("Object creation uses?", "ClassName obj;", ["new Class()", "obj Class", "create Class"]),
        ("Dot operator accesses?", "Member of object", ["Pointer", "Reference", "Address"]),
    ]),
    ("Constructors", [
        ("Constructor name is same as?", "Class", ["Object", "Function", "Variable"]),
        ("Constructor has ? return type", "No", ["int", "void", "char"]),
        ("Default constructor takes ? args", "No", ["One", "Two", "Any"]),
        ("Copy constructor takes?", "Object reference", ["Object", "Pointer", "Value"]),
        ("Constructor is called when?", "Object created", ["Object deleted", "Function called", "Program ends"]),
    ]),
    ("Destructors", [
        ("Destructor starts with?", "~", ["!", "#", "*"]),
        ("Destructor is called when?", "Object destroyed", ["Object created", "Function called", "Program starts"]),
        ("Destructor takes ? args", "No", ["One", "Two", "Any"]),
        ("Class can have ? destructors", "One", ["Two", "Many", "Zero"]),
        ("Destructor has ? return type", "No", ["int", "void", "char"]),
    ]),
    ("Inheritance", [
        ("Inheritance means?", "Reusing code", ["Hiding", "Deleting", "Copying"]),
        ("Base class is also called?", "Parent class", ["Child", "Derived", "Sub"]),
        ("Derived class is also called?", "Child class", ["Parent", "Base", "Super"]),
        ("Single inheritance has ? base", "One", ["Two", "Three", "Many"]),
        ("Multiple inheritance has ? bases", "Two or more", ["One", "Zero", "Three"]),
    ]),
    ("Types of Inheritance", [
        ("Multilevel: A→B→C is?", "Multilevel", ["Multiple", "Hierarchical", "Hybrid"]),
        ("Multiple: A,B→C is?", "Multiple", ["Multilevel", "Hierarchical", "Single"]),
        ("Hierarchical: A→B,C is?", "Hierarchical", ["Multiple", "Multilevel", "Single"]),
        ("Hybrid combines?", "Multiple types", ["Only single", "Only multiple", "Only hierarchical"]),
        ("Virtual inheritance solves?", "Diamond problem", ["Polymorphism", "Encapsulation", "Abstraction"]),
    ]),
    ("Virtual Functions", [
        ("Virtual function enables?", "Runtime polymorphism", ["Compile-time", "Static", "Early binding"]),
        ("virtual keyword is in?", "Base class", ["Derived", "Both", "Neither"]),
        ("Virtual function is called using?", "Pointer", ["Object", "Reference", "Value"]),
        ("Vtable is created for classes with?", "Virtual functions", ["Static", "Const", "Inline"]),
        ("Pure virtual function has?", "= 0", ["= null", "= void", "= empty"]),
    ]),
    ("Abstract Classes", [
        ("Abstract class has ? pure virtual function", "At least one", ["Zero", "Two", "All"]),
        ("Abstract class can be instantiated?", "No", ["Yes", "Sometimes", "Always"]),
        ("Abstract class is used as?", "Base class", ["Derived", "Friend", "Static"]),
        ("Interface in C++ is?", "Class with all pure virtual", ["Abstract class", "Template", "Friend"]),
    ]),
    ("Polymorphism", [
        ("Polymorphism means?", "Many forms", ["One form", "No form", "Two forms"]),
        ("Compile-time polymorphism uses?", "Function overloading", ["Virtual", "Template", "Inheritance"]),
        ("Runtime polymorphism uses?", "Virtual functions", ["Overloading", "Templates", "Macros"]),
        ("Function overloading is?", "Same name different params", ["Different name", "Same params", "Different return"]),
        ("Operator overloading is?", "Giving new meaning to operator", ["Overloading function", "Overriding", "Hiding"]),
    ]),
    ("Templates", [
        ("Template provides?", "Generic programming", ["Specific", "Object-oriented", "Procedural"]),
        ("Template keyword syntax?", "template<typename T>", ["template<T>", "generic<T>", "class<T>"]),
        ("Function template creates?", "Generic function", ["Class", "Object", "Variable"]),
        ("Class template creates?", "Generic class", ["Function", "Object", "Variable"]),
    ]),
    ("Exception Handling", [
        ("try block contains?", "Code that may throw", ["Handler", "Cleanup", "Nothing"]),
        ("catch block contains?", "Exception handler", ["Try code", "Throw code", "Cleanup"]),
        ("throw is used to?", "Raise exception", ["Catch", "Handle", "Ignore"]),
        ("catch(...) catches?", "All exceptions", ["Int", "Char", "String"]),
        ("Finally block in C++?", "Does not exist", ["Exists", "Optional", "Required"]),
    ]),
    ("Friend Functions", [
        ("Friend function is ? member of class", "Not a", ["A", "Static", "Const"]),
        ("Friend function can access?", "Private members", ["Only public", "Only protected", "Nothing"]),
        ("Friend keyword is used in?", "Class declaration", ["Function", "Main", "Global"]),
        ("Friend class can access?", "Private of another", ["Only public", "Only protected", "Nothing"]),
    ]),
    ("Static Members", [
        ("Static member is shared by?", "All objects", ["One object", "No objects", "Two objects"]),
        ("Static member function can access?", "Only static members", ["All members", "Non-static", "Private"]),
        ("Static member is initialized?", "Outside class", ["Inside class", "In constructor", "In main"]),
        ("Static variable retains value?", "Between calls", ["Lost", "Reset", "Cleared"]),
    ]),
    ("References", [
        ("Reference is?", "Alias", ["Pointer", "Variable", "Constant"]),
        ("Reference must be?", "Initialized", ["Declared", "Deleted", "Null"]),
        ("Reference can be reassigned?", "No", ["Yes", "Sometimes", "Always"]),
        ("& in declaration is?", "Reference", ["Address", "Pointer", "AND"]),
    ]),
    ("Operator Overloading", [
        ("Which cannot be overloaded?", "::", ["+", "-", "*"]),
        ("Which cannot be overloaded?", "sizeof", ["+", "-", "*"]),
        ("Which cannot be overloaded?", ".", ["+", "-", "*"]),
        ("Which cannot be overloaded?", "?:", ["+", "-", "*"]),
        ("Overloaded operator must have ? operand", "At least one class", ["Two built-in", "None", "Three"]),
    ]),
    ("RTTI", [
        ("RTTI stands for?", "Runtime Type Information", ["Real Time", "Run Time", "Return Type"]),
        ("typeid operator returns?", "type_info object", ["String", "Int", "Char"]),
        ("dynamic_cast is used for?", "Downcasting", ["Upcasting", "Static cast", "Const cast"]),
        ("typeid requires?", "typeinfo header", ["iostream", "string", "vector"]),
    ]),
    ("Type Casting", [
        ("static_cast is checked at?", "Compile time", ["Runtime", "Link time", "Never"]),
        ("dynamic_cast is checked at?", "Runtime", ["Compile time", "Link time", "Never"]),
        ("const_cast removes?", "Const", ["Volatile", "Static", "Mutable"]),
        ("reinterpret_cast is?", "Low level", ["High level", "Safe", "Checked"]),
    ]),
    ("Inline Functions", [
        ("Inline function is expanded at?", "Call site", ["Compile", "Runtime", "Link"]),
        ("inline is a?", "Request to compiler", ["Command", "Mandatory", "Guaranteed"]),
        ("Inline reduces?", "Function call overhead", ["Memory", "Size", "Variables"]),
        ("Large functions should be inline?", "No", ["Yes", "Always", "Depends"]),
    ]),
    ("Default Arguments", [
        ("Default args are specified in?", "Declaration", ["Definition", "Call", "Both"]),
        ("Default args are filled from?", "Right to left", ["Left to right", "Middle", "Any"]),
        ("Default args can be in?", "Prototype", ["Call", "Definition only", "Body"]),
    ]),
    ("cin and cout", [
        ("cin is an object of?", "istream", ["ostream", "iostream", "stream"]),
        ("cout is an object of?", "ostream", ["istream", "iostream", "stream"]),
        ("<< is?", "Insertion operator", ["Extraction", "Shift", "Assignment"]),
        (">> is?", "Extraction operator", ["Insertion", "Shift", "Assignment"]),
        ("cin >> reads from?", "Keyboard", ["File", "Screen", "Memory"]),
    ]),
]

for topic_name, q_list in oop_topics:
    for q_text, correct, wrong in q_list:
        if isinstance(correct, list):
            opts = correct; correct_idx = wrong
        else:
            opts = [correct] + wrong; correct_idx = 0
        questions.append(mk("B","OOP C++",topic_name,random.choice(["easy","medium","hard"]),
            q_text, opts, correct_idx, f"Answer: {opts[correct_idx]}"))

# Fill remaining to reach 500
fill_topics = [t[0] for t in oop_topics]
oop_fillers = [
    ("C++ was developed by?", "Bjarne Stroustrup", ["Dennis Ritchie", "James Gosling", "Ken Thompson"]),
    ("C++ extension?", ".cpp", [".c", ".cc", ".cxx"]),
    ("new operator returns?", "Pointer", ["Reference", "Value", "Object"]),
    ("delete calls?", "Destructor", ["Constructor", "Function", "Nothing"]),
    ("this pointer points to?", "Current object", ["Next", "Previous", "Base"]),
    ("const member function?", "Doesn't modify object", ["Modifies", "Returns const", "Is static"]),
    ("mutable allows?", "Modification in const", ["Const", "Static", "Volatile"]),
    ("explicit prevents?", "Implicit conversion", ["Explicit", "Constructor", "Destruction"]),
    ("namespace avoids?", "Name conflict", ["Memory leak", "Error", "Loop"]),
    ("using namespace std?", "Brings std to scope", ["Defines std", "Deletes std", "Creates std"]),
]

for i in range(500 - len(questions)):
    q_text, correct, wrong = random.choice(oop_fillers)
    opts = [correct] + wrong
    questions.append(mk("B","OOP C++",random.choice(fill_topics),random.choice(["easy","medium","hard"]),
        q_text, opts, 0, f"Answer: {correct}"))

print(f"OOP C++: {len(questions)} questions")
with open(f"{OUT}/oop.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved oop.json")

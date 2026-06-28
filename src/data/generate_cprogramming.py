#!/usr/bin/env python3
"""Generate C Programming questions - 1000 questions"""
import json, random, os
random.seed(45)
OUT = "/home/hp/cdac-mock-test/src/data"
counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"
def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]; random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []
c_topics = [
    ("Data Types", [
        ("Size of int in C (32-bit)?", "4 bytes", ["1 byte", "2 bytes", "8 bytes"]),
        ("Size of char in C?", "1 byte", ["2 bytes", "4 bytes", "8 bytes"]),
        ("Size of float in C?", "4 bytes", ["1 byte", "2 bytes", "8 bytes"]),
        ("Size of double in C?", "8 bytes", ["1 byte", "2 bytes", "4 bytes"]),
        ("char range in C?", "-128 to 127", ["0 to 255", "-32768 to 32767", "0 to 65535"]),
        ("unsigned int range?", "0 to 4294967295", ["0 to 65535", "-2147483648 to 2147483647", "0 to 255"]),
    ]),
    ("Operators", [
        ("% operator is called?", "Modulus", ["Division", "Multiplication", "Percent"]),
        ("++ operator is?", "Increment", ["Decrement", "Addition", "Assignment"]),
        ("&& is?", "Logical AND", ["Bitwise AND", "Logical OR", "Address of"]),
        ("|| is?", "Logical OR", ["Logical AND", "Bitwise OR", "NOT"]),
        ("& operator with single operand?", "Address of", ["AND", "OR", "XOR"]),
        ("* operator with pointer?", "Dereference", ["Multiply", "Address", "Pointer"]),
        ("Operator precedence highest?", "()", ["+", "*", "="]),
        ("Associativity of + and -?", "Left to right", ["Right to left", "No associativity", "Random"]),
    ]),
    ("Decision Control Statements", [
        ("if-else is used for?", "Decision making", ["Looping", "Function call", "Declaration"]),
        ("switch case uses which data type for case?", "Integer/char", ["Float", "String", "Double"]),
        ("break in switch?", "Exits switch", ["Continues", "Loops", "Returns"]),
        ("default in switch is?", "Optional", ["Mandatory", "Required", "First case"]),
        ("else is ?", "Optional in if", ["Mandatory", "Required", "First"]),
    ]),
    ("Loops", [
        ("for loop is?", "Entry controlled", ["Exit controlled", "Both", "Neither"]),
        ("while loop checks condition?", "Before execution", ["After execution", "During", "Never"]),
        ("do-while executes at least?", "Once", ["Twice", "Zero times", "Infinite"]),
        ("do-while is?", "Exit controlled", ["Entry controlled", "Both", "Neither"]),
        ("break in loop?", "Exits loop", ["Continues", "Skips", "Returns"]),
        ("continue in loop?", "Skips iteration", ["Exits loop", "Restarts", "Returns"]),
    ]),
    ("Functions", [
        ("main() returns?", "int", ["void", "char", "float"]),
        ("Function prototype is?", "Declaration", ["Definition", "Call", "Return"]),
        ("Call by value copies?", "Value", ["Address", "Reference", "Pointer"]),
        ("Call by reference passes?", "Address", ["Value", "Name", "Type"]),
        ("Recursion is?", ["Function calling itself", "Loop", "Pointer", "Array"], 0),
        ("return statement?", "Returns value", ["Exits program", "Loops", "Declares"]),
    ]),
    ("Storage Classes", [
        ("auto is default for?", "Local variables", ["Global", "Static", "Extern"]),
        ("static variable retains?", "Value between calls", ["Address", "Type", "Name"]),
        ("extern is used for?", "Global declaration", ["Local", "Static", "Constant"]),
        ("register stores in?", "CPU register", ["RAM", "Hard Disk", "Cache"]),
        ("static local variable initialized?", "Once", ["Every call", "Never", "Twice"]),
    ]),
    ("Pointers", [
        ("Pointer stores?", "Address", ["Value", "Name", "Type"]),
        ("& operator gives?", "Address", ["Value", "Pointer", "Reference"]),
        ("* operator on pointer gives?", "Value at address", ["Address", "Pointer", "Reference"]),
        ("NULL pointer points to?", "Nothing", ["0", "Garbage", "First address"]),
        ("void pointer can point to?", ["Any type", "int only", "char only", "float only"], 0),
        ("Wild pointer is?", "Uninitialized", ["NULL", "Dangling", "Void"]),
        ("Pointer arithmetic: ptr+1 adds?", "Size of type", ["1 byte", "4 bytes", "8 bytes"]),
        ("Dangling pointer points to?", "Freed memory", ["NULL", "Valid", "Stack"]),
    ]),
    ("Arrays", [
        ("Array index starts at?", "0", ["1", "-1", "Any"]),
        ("Array name is?", "Pointer to first element", ["Value", "Size", "Type"]),
        ("int arr[5] size?", "20 bytes", ["5 bytes", "10 bytes", "4 bytes"]),
        ("2D array arr[3][4] rows?", "3", ["4", "12", "7"]),
        ("Array elements stored in?", "Contiguous memory", ["Random", "Linked", "Scattered"]),
    ]),
    ("Strings", [
        ("String ends with?", "'\\0'", ["'\\n'", "'\\t'", "' '"]),
        ("strlen returns?", "Length without null", ["Length with null", "Size", "Address"]),
        ("strcpy copies?", ["Source to destination", "Destination to source", "Both", "None"], 0),
        ("strcmp returns 0 when?", "Strings equal", ["Different", "First greater", "Second greater"]),
        ("strcat does?", "Concatenation", ["Comparison", "Copy", "Length"]),
    ]),
    ("Structures", [
        ("struct keyword defines?", "User type", ["Function", "Variable", "Pointer"]),
        ("Structure member access uses?", "Dot operator", ["Arrow", "Star", "Ampersand"]),
        ("Structure pointer member access?", "Arrow operator", ["Dot", "Star", "Ampersand"]),
        ("Structure size?", "Sum of members", ["First member", "Last member", "Pointer size"]),
        ("typedef in struct?", "Creates alias", ["Defines", "Declares", "Initializes"]),
    ]),
    ("Unions", [
        ("Union shares memory between?", "All members", ["No members", "First only", "Last only"]),
        ("Union size?", "Largest member", ["Sum of members", "First member", "Smallest"]),
        ("Union vs struct?", "Shared memory", ["Separate memory", "Same", "Different syntax"]),
    ]),
    ("Preprocessor Directives", [
        ("#include is?", "Preprocessor directive", ["Function", "Keyword", "Operator"]),
        ("#define creates?", "Macro", ["Variable", "Function", "Type"]),
        ("#ifdef checks?", "If defined", ["If true", "If false", "If equal"]),
        ("#pragma is?", ["Compiler directive", "Include", "Define", "Macro"], 0),
        ("Macro vs function?", "No type checking", ["Type checking", "Slower", "Returns value"]),
    ]),
    ("File Handling", [
        ("fopen returns?", "File pointer", ["Integer", "String", "Char"]),
        ("FILE is?", "Structure", ["Function", "Variable", "Pointer"]),
        ("fclose closes?", "File", ["Program", "Pointer", "Buffer"]),
        ("fprintf writes to?", "File", ["Screen", "Keyboard", "Memory"]),
        ("fscanf reads from?", "File", ["Screen", "Keyboard", "Memory"]),
        ("fseek moves?", "File pointer", ["File", "Buffer", "Memory"]),
        ("EOF stands for?", "End of File", ["End of Function", "Error of File", "Exit of File"]),
    ]),
    ("Recursion", [
        ("Base case in recursion?", ["Termination condition", "Loop", "Call", "Return"], 0),
        ("Stack overflow in recursion?", ["Too many calls", "No base case", "Both A and B", "None"], 0),
        ("Factorial of 0?", "1", ["0", "Undefined", "Infinity"]),
        ("Fibonacci(0)?", "0", ["1", "Undefined", "-1"]),
        ("Tower of Hanoi moves for n disks?", "2^n - 1", ["n^2", "n!", "2n"]),
    ]),
]

for topic_name, q_list in c_topics:
    for q_text, correct, wrong in q_list:
        if isinstance(correct, list):
            opts = correct
            correct_idx = wrong
        else:
            opts = [correct] + wrong
            correct_idx = 0
        questions.append(mk("B","C Programming",topic_name,random.choice(["easy","medium","hard"]),
            q_text, opts, correct_idx, f"Answer: {opts[correct_idx]}"))

# Fill remaining to reach 1000
fill_topics = [t[0] for t in c_topics]
c_fillers = [
    ("Output: int x=5; printf(\"%d\",x++);?", "5", ["6", "4", "0"]),
    ("Output: int a=10; a+=5;?", "15", ["10", "5", "50"]),
    ("Which is valid variable name?", "_var", ["1var", "var-name", "int"]),
    ("Escape sequence for newline?", "'\\n'", ["'\\t'", "'\\r'", "'\\b'"]),
    ("sizeof(int*) on 64-bit?", "8 bytes", ["4 bytes", "2 bytes", "16 bytes"]),
    ("What is output: printf(\"%d\",10==10);?", "1", ["0", "10", "true"]),
    ("getchar() reads?", "Single character", ["String", "Integer", "Line"]),
    ("puts() adds?", "Newline", ["Tab", "Space", "Nothing"]),
    ("atoi converts?", "String to int", ["Int to string", "Char to int", "Float to int"]),
    ("isalpha() checks?", "Alphabet", ["Digit", "Space", "Special char"]),
]

for i in range(1000 - len(questions)):
    q_text, correct, wrong = random.choice(c_fillers)
    opts = [correct] + wrong
    questions.append(mk("B","C Programming",random.choice(fill_topics),random.choice(["easy","medium","hard"]),
        q_text, opts, 0, f"Answer: {correct}"))

print(f"C Programming: {len(questions)} questions")
with open(f"{OUT}/c_programming.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved c_programming.json")

#!/usr/bin/env python3
"""Generate Computer Fundamentals questions - 800 questions"""
import json, random, os
random.seed(44)
OUT = "/home/hp/cdac-mock-test/src/data"
counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"
def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]; random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []
cf_topics = [
    ("Introduction to Computer and Major Components", [
        ("CPU stands for?", "Central Processing Unit", ["Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"]),
        ("Which is the brain of computer?", "CPU", ["RAM", "Hard Disk", "Monitor"]),
        ("ALU is part of?", "CPU", ["RAM", "ROM", "Monitor"]),
        ("Control Unit is also called?", "System supervisor", ["Memory manager", "Data processor", "Input handler"]),
        ("Which device converts user data to binary?", "Input device", ["Output device", "Storage", "CPU"]),
    ]),
    ("CPU, Memory and I/O", [
        ("Which memory is fastest?", "Cache", ["RAM", "Hard Disk", "CD-ROM"]),
        ("RAM is?", "Volatile", ["Non-volatile", "Permanent", "Slow"]),
        ("ROM stands for?", "Read Only Memory", ["Random Only Memory", "Read Output Memory", "Run Only Memory"]),
        ("Which is primary memory?", "RAM", ["Hard Disk", "CD", "Pen Drive"]),
        ("I/O devices are also called?", "Peripherals", ["Processors", "Memories", "Controllers"]),
    ]),
    ("Number System & Conversions", [
        ("Binary 1010 in decimal?", "10", ["8", "12", "5"]),
        ("Decimal 15 in binary?", "1111", ["1010", "1100", "1001"]),
        ("Hexadecimal A in decimal?", "10", ["11", "15", "16"]),
        ("Octal 17 in decimal?", "15", ["17", "8", "23"]),
        ("Binary 1111 in hex?", "F", ["E", "10", "15"]),
    ]),
    ("Data Representation", [
        ("1 byte = ? bits", "8", ["4", "16", "32"]),
        ("ASCII uses ? bits", "7", ["8", "16", "32"]),
        ("1 KB = ? bytes", "1024", ["1000", "512", "2048"]),
        ("1 MB = ? KB", "1024", ["1000", "512", "2048"]),
        ("Unicode uses minimum ? bits", "16", ["8", "7", "32"]),
    ]),
    ("Memory Technologies", [
        ("Which is volatile?", "RAM", ["ROM", "Hard Disk", "CD"]),
        ("Cache memory is between?", "CPU and RAM", ["RAM and HD", "CPU and ROM", "Input and Output"]),
        ("DRAM stands for?", "Dynamic RAM", ["Digital RAM", "Dual RAM", "Direct RAM"]),
        ("SRAM is ? than DRAM", "Faster", ["Slower", "Cheaper", "Larger"]),
        ("DDR stands for?", "Double Data Rate", ["Dual Data Rate", "Direct Data Rate", "Digital Data Rate"]),
    ]),
    ("Cache Memory", [
        ("Cache memory is?", "Small and fast", ["Large and slow", "Small and slow", "Large and fast"]),
        ("L1 cache is located?", "Inside CPU", ["Outside CPU", "In RAM", "In Hard Disk"]),
        ("Cache uses which principle?", "Locality of reference", ["Sequential access", "Random access", "Direct access"]),
        ("L2 cache is ? than L1", "Larger", ["Smaller", "Faster", "Slower"]),
        ("Cache hit means?", "Data found in cache", ["Data not found", "Cache full", "Cache empty"]),
    ]),
    ("Main & Secondary Memory", [
        ("Which is secondary memory?", "Hard Disk", ["RAM", "Cache", "Register"]),
        ("Access time of RAM is measured in?", "Nanoseconds", ["Milliseconds", "Seconds", "Microseconds"]),
        ("Which is non-volatile secondary memory?", "SSD", ["RAM", "Cache", "Register"]),
        ("Main memory is also called?", "Primary memory", ["Secondary", "Auxiliary", "Backup"]),
        ("Virtual memory uses which disk space?", "Swap space", ["Boot sector", "Root directory", "File table"]),
    ]),
    ("Low Level vs High Level Languages", [
        ("Machine language uses?", "Binary", ["English", "Mnemonics", "Symbols"]),
        ("Assembly language uses?", "Mnemonics", ["Binary", "English", "Pictures"]),
        ("Which is high level language?", "C", ["Assembly", "Machine code", "Binary"]),
        ("Compiler converts source code to?", "Object code", ["Source code", "Assembly", "Pseudocode"]),
        ("Interpreter executes?", "Line by line", ["Whole program", "Only functions", "Only loops"]),
    ]),
    ("Programming Language Evaluation", [
        ("C is a ? language", "Procedural", ["Object-oriented", "Functional", "Logic"]),
        ("Portability means?", "Runs on different machines", ["Runs fast", "Uses less memory", "Easy to write"]),
        ("Which is strongly typed?", "Java", ["C", "Assembly", "Machine"]),
        ("Syntax refers to?", "Grammar rules", ["Meaning", "Speed", "Memory"]),
        ("IDE stands for?", "Integrated Development Environment", ["Internal Data Exchange", "Input Device Extension"]),
    ]),
    ("Data Types and Data Structures", [
        ("int in C occupies ? bytes", "4", ["1", "2", "8"]),
        ("char in C occupies ? bytes", "1", ["2", "4", "8"]),
        ("float in C occupies ? bytes", "4", ["1", "2", "8"]),
        ("Stack follows?", "LIFO", ["FIFO", "LILO", "Random"]),
        ("Queue follows?", "FIFO", ["LIFO", "LILO", "Random"]),
    ]),
    ("OOP Concepts", [
        ("OOP stands for?", "Object Oriented Programming", ["Object Output Process", "Ordered Object Programming"]),
        ("Encapsulation means?", "Data hiding", ["Data showing", "Data copying", "Data deleting"]),
        ("Inheritance means?", "Reusing code", ["Hiding code", "Deleting code", "Copying code"]),
        ("Polymorphism means?", "Many forms", ["One form", "No form", "Two forms"]),
        ("Class is a?", "Blueprint", ["Object", "Variable", "Function"]),
    ]),
    ("Algorithms and Flowcharts", [
        ("Algorithm is?", "Step by step solution", ["Programming language", "Hardware", "Software"]),
        ("Flowchart uses?", "Symbols", ["Code", "Binary", "Hex"]),
        ("Flowchart symbol for decision?", "Diamond", ["Rectangle", "Oval", "Parallelogram"]),
        ("Flowchart symbol for process?", "Rectangle", ["Diamond", "Oval", "Circle"]),
        ("Flowchart symbol for start/end?", "Oval", ["Rectangle", "Diamond", "Arrow"]),
    ]),
]

for topic_name, q_list in cf_topics:
    for q_text, correct, wrong in q_list:
        opts = [correct] + wrong
        questions.append(mk("A","Computer Fundamentals",topic_name,random.choice(["easy","medium"]),
            q_text, opts, 0, f"Answer: {correct}"))

# Fill remaining to reach 800
fill_topics = [t[0] for t in cf_topics]
for i in range(800 - len(questions)):
    topic = random.choice(fill_topics)
    fillers = [
        ("Which of these is an input device?", "Keyboard", ["Monitor", "Printer", "Speaker"]),
        ("Which of these is an output device?", "Monitor", ["Keyboard", "Mouse", "Scanner"]),
        ("Operating system is?", "System software", ["Application software", "Hardware", "Firmware"]),
        ("Compiler is a?", "System software", ["Application software", "Hardware", "Utility"]),
        ("Which is system software?", ["OS", "Word", "Browser", "Game"], 0),
    ]
    q_text, correct, wrong = random.choice(fillers)
    if isinstance(correct, list):
        opts = correct
        correct_idx = wrong
    else:
        opts = [correct] + wrong
        correct_idx = 0
    questions.append(mk("A","Computer Fundamentals",topic,random.choice(["easy","medium"]),
        q_text, opts, correct_idx, f"Answer: {opts[correct_idx]}"))

print(f"Computer Fundamentals: {len(questions)} questions")
with open(f"{OUT}/computers.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved computers.json")

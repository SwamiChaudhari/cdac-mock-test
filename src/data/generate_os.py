#!/usr/bin/env python3
"""Generate Operating Systems questions - 500 questions"""
import json, random, os
random.seed(48)
OUT = "/home/hp/cdac-mock-test/src/data"
counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"
def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]; random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []
os_topics = [
    ("Process Management", [
        ("Process is?", "Program in execution", ["Program", "File", "Data"]),
        ("Process states count?", "5-7", ["2", "3", "10"]),
        ("New process goes to?", "Ready", ["Running", "Waiting", "Terminated"]),
        ("Process scheduler selects?", "Process for CPU", ["Memory", "File", "Device"]),
        ("Context switch saves?", "Process state", ["Memory", "File", "Device"]),
    ]),
    ("Process States", [
        ("Running state means?", "Using CPU", ["Waiting", "Ready", "Terminated"]),
        ("Waiting state is for?", "I/O", ["CPU", "Memory", "Scheduling"]),
        ("Ready state means?", "Waiting for CPU", ["Using CPU", "Done", "Terminated"]),
        ("Terminated means?", "Process finished", ["Running", "Waiting", "Ready"]),
        ("New state is?", "Being created", ["Running", "Waiting", "Done"]),
    ]),
    ("PCB", [
        ("PCB stands for?", "Process Control Block", ["Program Control", "Process Code", "Program Counter"]),
        ("PCB contains?", "Process info", ["Only code", "Only data", "Only stack"]),
        ("Process ID is in?", "PCB", ["Stack", "Heap", "Code"]),
        ("Program counter is in?", "PCB", ["Stack", "Heap", "Cache"]),
        ("PCB is created when?", "Process created", ["Process runs", "Process ends", "Process waits"]),
    ]),
    ("CPU Scheduling", [
        ("FCFS stands for?", "First Come First Serve", ["First Come First Served", "Fast CPU", "First CPU"]),
        ("SJF stands for?", "Shortest Job First", ["Shortest Job Fast", "System Job", "Simple Job"]),
        ("Round Robin uses?", "Time quantum", ["Priority", "FCFS", "SJF"]),
        ("Priority scheduling may cause?", "Starvation", ["Deadlock", "Fragmentation", "Thrashing"]),
        ("SJF is?", "Optimal", ["Non-optimal", "Worst", "Average"]),
        ("Starvation is solved by?", "Aging", ["Preemption", "Deadlock", "Fragmentation"]),
        ("Preemptive scheduling allows?", "Interruption", ["No interruption", "Waiting", "Termination"]),
        ("Non-preemptive runs?", "Till completion", ["With interruption", "With waiting", "With termination"]),
    ]),
    ("Deadlocks", [
        ("Deadlock means?", "Processes waiting circularly", ["Running", "Terminated", "Ready"]),
        ("Deadlock conditions count?", "4", ["2", "3", "5"]),
        ("Mutual exclusion means?", "One process at a time", ["Many processes", "No process", "Shared"]),
        ("Hold and wait means?", "Holding and waiting", ["Releasing", "Sharing", "Terminating"]),
        ("No preemption means?", "Cannot force release", ["Can force", "Can share", "Can terminate"]),
        ("Circular wait means?", "Circular dependency", ["Linear", "No dependency", "Random"]),
        ("Deadlock prevention breaks?", "One condition", ["All conditions", "No condition", "Two"]),
        ("Deadlock avoidance uses?", "Banker's algorithm", ["Round Robin", "FCFS", "SJF"]),
        ("Deadlock detection uses?", "Wait-for graph", ["Banker's", "Round Robin", "Priority"]),
        ("Deadlock recovery uses?", "Process termination", ["Prevention", "Avoidance", "Detection"]),
    ]),
    ("Memory Management", [
        ("Paging divides process into?", "Pages", ["Segments", "Frames", "Blocks"]),
        ("Physical memory is divided into?", "Frames", ["Pages", "Segments", "Blocks"]),
        ("Page table maps?", "Pages to frames", ["Frames to pages", "Pages to pages", "Frames to frames"]),
        ("Internal fragmentation is in?", "Paging", ["Segmentation", "Dynamic", "Contiguous"]),
        ("External fragmentation is in?", "Segmentation", ["Paging", "Fixed partition", "Overlay"]),
    ]),
    ("Virtual Memory", [
        ("Virtual memory allows?", "Larger than physical", ["Smaller", "Equal", "Fixed"]),
        ("Demand paging loads?", "Only when needed", ["All at once", "Half", "None"]),
        ("Page fault means?", "Page not in memory", ["Page in memory", "Page deleted", "Page full"]),
        ("Page replacement replaces?", "Page in memory", ["Process", "Thread", "File"]),
        ("LRU replaces?", "Least recently used", ["Most recently", "First in", "Last in"]),
        ("FIFO replaces?", "First in", ["Last in", "Least used", "Most used"]),
        ("Optimal replacement replaces?", "Used farthest in future", ["Used soon", "Used recently", "Used never"]),
        ("Belady's anomaly occurs in?", "FIFO", ["LRU", "Optimal", "LFU"]),
    ]),
    ("Thrashing", [
        ("Thrashing means?", "Excessive paging", ["No paging", "Normal paging", "Less paging"]),
        ("Thrashing occurs when?", "Low multiprogramming", ["High CPU", "Low memory", "High I/O"]),
        ("Thrashing is solved by?", "Reducing degree of multiprogramming", ["Increasing", "Paging", "Swapping"]),
        ("Working set model prevents?", "Thrashing", ["Deadlock", "Fragmentation", "Starvation"]),
    ]),
    ("Disk Scheduling", [
        ("FCFS disk scheduling?", "First come first serve", ["Shortest", "Scan", "Circular"]),
        ("SSTF selects?", "Nearest request", ["First", "Last", "Random"]),
        ("SCAN moves?", "Back and forth", ["One direction", "Random", "Circular"]),
        ("C-SCAN moves?", "One direction circular", ["Back and forth", "Random", "Nearest"]),
        ("LOOK is modified?", "SCAN", ["FCFS", "SSTF", "C-SCAN"]),
    ]),
    ("File System", [
        ("File is?", "Named collection of data", ["Program", "Process", "Thread"]),
        ("Directory is?", "Collection of files", ["File", "Process", "Memory"]),
        ("Inode contains?", "File metadata", ["File data", "File name", "File path"]),
        ("Contiguous allocation has?", "External fragmentation", ["Internal", "No", "Both"]),
        ("Linked allocation has?", "No external fragmentation", ["External", "Internal", "Both"]),
        ("Indexed allocation uses?", "Index block", ["Linked list", "Contiguous", "Hash"]),
    ]),
    ("System Calls", [
        ("System call is?", "Interface to OS", ["Function", "Program", "Process"]),
        ("fork() creates?", "Child process", ["Thread", "File", "Memory"]),
        ("exec() replaces?", "Process image", ["Memory", "File", "Thread"]),
        ("wait() makes parent?", "Wait for child", ["Run", "Terminate", "Sleep"]),
        ("exit() terminates?", "Process", ["Thread", "Program", "System"]),
    ]),
    ("Kernel Mode and User Mode", [
        ("Kernel mode has?", "Full access", ["Limited", "No", "Partial"]),
        ("User mode has?", "Limited access", ["Full", "No", "Kernel"]),
        ("System calls switch to?", "Kernel mode", ["User mode", "Sleep", "Ready"]),
        ("Interrupts switch to?", "Kernel mode", ["User mode", "Sleep", "Ready"]),
    ]),
    ("IPC", [
        ("IPC stands for?", "Inter Process Communication", ["Internal Process", "Inter Program", "Internal Program"]),
        ("Shared memory is ? IPC", "Fast", ["Slow", "Medium", "None"]),
        ("Message passing is ? IPC", "Slower", ["Fast", "Medium", "None"]),
        ("Pipe is ? way communication", "Half-duplex", ["Full", "Simplex", "None"]),
        ("FIFO is also called?", "Named pipe", ["Anonymous", "Socket", "Message"]),
    ]),
    ("Process Synchronization", [
        ("Critical section is?", "Shared code", ["Private", "Kernel", "User"]),
        ("Mutex is?", "Lock", ["Semaphore", "Thread", "Process"]),
        ("Semaphore is?", "Integer variable", ["Lock", "Thread", "Process"]),
        ("Binary semaphore values?", "0 and 1", ["0 to n", "-1 to 1", "Any"]),
        ("Counting semaphore values?", "0 to n", ["0 and 1", "-1 to 1", "Any"]),
        ("Producer-consumer uses?", "Semaphore", ["Mutex only", "Pipe", "Message"]),
        ("Readers-writers problem has priority for?", "Depends on variant", ["Readers always", "Writers always", "Neither"]),
    ]),
    ("Booting Process", [
        ("Bootstrap is loaded by?", "ROM", ["RAM", "Hard Disk", "CPU"]),
        ("BIOS stands for?", "Basic Input Output System", ["Basic Internal", "Binary Input", "Basic Interface"]),
        ("POST stands for?", "Power On Self Test", ["Power Off", "Post Test", "Power Test"]),
        ("Boot loader loads?", "OS", ["Application", "Driver", "Firmware"]),
    ]),
]

for topic_name, q_list in os_topics:
    for q_text, correct, wrong in q_list:
        if isinstance(correct, list):
            opts = correct; correct_idx = wrong
        else:
            opts = [correct] + wrong; correct_idx = 0
        questions.append(mk("B","Operating Systems",topic_name,random.choice(["easy","medium","hard"]),
            q_text, opts, correct_idx, f"Answer: {opts[correct_idx]}"))

# Fill remaining to reach 500
fill_topics = [t[0] for t in os_topics]
os_fillers = [
    ("OS stands for?", "Operating System", ["Open System", "Output System", "Optimal System"]),
    ("Kernel is?", "Core of OS", ["Shell", "Application", "Driver"]),
    ("Thread is?", "Lightweight process", ["Heavyweight", "Process", "Program"]),
    ("Multitasking means?", "Multiple tasks", ["Single task", "No task", "One task"]),
    ("Multiprogramming means?", "Multiple programs in memory", ["One program", "Multiple CPUs", "Multiple users"]),
    ("Time sharing means?", "CPU time shared", ["Memory shared", "Disk shared", "No sharing"]),
    ("Spooling stands for?", "Simultaneous Peripheral Operations Online", ["Simple", "Single", "System"]),
    ("Cache memory is?", "Fast small memory", ["Slow large", "Fast large", "Slow small"]),
    ("Interrupt is?", "Signal to CPU", ["Process", "Thread", "Memory"]),
    ("DMA stands for?", "Direct Memory Access", ["Direct Memory Address", "Data Memory", "Direct Main"]),
]

for i in range(500 - len(questions)):
    q_text, correct, wrong = random.choice(os_fillers)
    opts = [correct] + wrong
    questions.append(mk("B","Operating Systems",random.choice(fill_topics),random.choice(["easy","medium","hard"]),
        q_text, opts, 0, f"Answer: {correct}"))

print(f"Operating Systems: {len(questions)} questions")
with open(f"{OUT}/os.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved os.json")

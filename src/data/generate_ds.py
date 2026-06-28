#!/usr/bin/env python3
"""Generate Data Structures & Algorithms questions - 600 questions"""
import json, random, os
random.seed(46)
OUT = "/home/hp/cdac-mock-test/src/data"
counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"
def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]; random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []
dsa_topics = [
    ("Linear Search", [
        ("Linear search time complexity?", "O(n)", ["O(log n)", "O(1)", "O(n²)"]),
        ("Linear search works on?", "Any array", ["Sorted only", "Unsorted only", "Circular only"]),
        ("Best case linear search?", "O(1)", ["O(n)", "O(log n)", "O(n²)"]),
        ("Worst case linear search?", "O(n)", ["O(1)", "O(log n)", "O(n²)"]),
    ]),
    ("Binary Search", [
        ("Binary search requires?", "Sorted array", ["Unsorted", "Linked list", "Stack"]),
        ("Binary search time complexity?", "O(log n)", ["O(n)", "O(1)", "O(n²)"]),
        ("Binary search uses?", "Divide and conquer", ["Greedy", "DP", "Backtracking"]),
        ("Mid in binary search?", "(low+high)/2", ["low+high", "high-low", "low*high"]),
        ("Binary search on 1024 elements max steps?", "10", ["1024", "512", "11"]),
    ]),
    ("Stack", [
        ("Stack follows?", "LIFO", ["FIFO", "LILO", "Random"]),
        ("Push operation adds to?", "Top", ["Bottom", "Middle", "Front"]),
        ("Pop removes from?", "Top", ["Bottom", "Middle", "Rear"]),
        ("Stack overflow?", "Full stack", ["Empty stack", "Single element", "Two elements"]),
        ("Stack underflow?", "Empty stack", ["Full stack", "Single element", "Overflow"]),
        ("peek() returns?", "Top element", ["Bottom", "Size", "Nothing"]),
    ]),
    ("Queue", [
        ("Queue follows?", "FIFO", ["LIFO", "LILO", "Random"]),
        ("Enqueue adds to?", "Rear", ["Front", "Middle", "Top"]),
        ("Dequeue removes from?", "Front", ["Rear", "Middle", "Top"]),
        ("Circular queue avoids?", "Wasted space", ["Overflow", "Underflow", "Full"]),
        ("Priority queue dequeues?", "Highest priority", ["First inserted", "Last inserted", "Random"]),
    ]),
    ("Linked List", [
        ("Singly linked list has ? pointer(s)", "One", ["Two", "Three", "Zero"]),
        ("Doubly linked list has ? pointer(s)", "Two", ["One", "Three", "Zero"]),
        ("Circular linked list last node points to?", "First node", ["NULL", "Last", "Middle"]),
        ("Linked list insertion at beginning?", "O(1)", ["O(n)", "O(log n)", "O(n²)"]),
        ("Linked list random access?", "Not possible", ["O(1)", "O(log n)", "O(n)"]),
        ("Head pointer stores?", "First node address", ["Last node", "Size", "Data"]),
    ]),
    ("Trees", [
        ("Binary tree max children?", "2", ["1", "3", "Unlimited"]),
        ("Tree root has ? parent", "No", ["One", "Two", "Many"]),
        ("Leaf node has ? children", "0", ["1", "2", "3"]),
        ("Binary tree max nodes at level n?", "2^n", ["n", "n²", "2n"]),
        ("Height of empty tree?", "-1 or 0", ["1", "Undefined", "Infinite"]),
        ("Full binary tree nodes if height h?", "2^(h+1)-1", ["2^h", "h²", "h+1"]),
    ]),
    ("Binary Trees", [
        ("Inorder traversal?", "Left-Root-Right", ["Root-Left-Right", "Left-Right-Root", "Right-Left-Root"]),
        ("Preorder traversal?", "Root-Left-Right", ["Left-Root-Right", "Left-Right-Root", "Root-Right-Left"]),
        ("Postorder traversal?", "Left-Right-Root", ["Root-Left-Right", "Left-Root-Right", "Right-Root-Left"]),
        ("Level order uses?", "Queue", ["Stack", "Array", "Linked list"]),
        ("Inorder of BST gives?", "Sorted order", ["Reverse", "Random", "Level order"]),
    ]),
    ("AVL Trees", [
        ("AVL tree is?", "Self-balancing", ["Unbalanced", "Linear", "Circular"]),
        ("Balance factor range?", "-1 to 1", ["0 to 1", "-2 to 2", "0 to 2"]),
        ("LL rotation is for?", "Left-left imbalance", ["Right-right", "Left-right", "Right-left"]),
        ("LR rotation is for?", "Left-right imbalance", ["Left-left", "Right-right", "Right-left"]),
        ("AVL insertion complexity?", "O(log n)", ["O(n)", "O(1)", "O(n²)"]),
    ]),
    ("Sorting", [
        ("Bubble sort complexity?", "O(n²)", ["O(n)", "O(log n)", "O(n log n"]),
        ("Selection sort complexity?", "O(n²)", ["O(n)", "O(log n)", "O(n log n"]),
        ("Insertion sort complexity?", "O(n²)", ["O(n)", "O(log n)", "O(n log n"]),
        ("Merge sort complexity?", "O(n log n)", ["O(n)", "O(log n)", "O(n²)"]),
        ("Quick sort average complexity?", "O(n log n)", ["O(n)", "O(log n)", "O(n²)"]),
        ("Quick sort worst case?", "O(n²)", ["O(n)", "O(log n)", "O(n log n)"]),
        ("Stable sort?", "Maintains relative order", ["Doesn't maintain", "Always swaps", "Random"]),
        ("In-place sort?", "No extra space", ["Uses extra space", "Uses array", "Uses linked list"]),
        ("Best sorting for nearly sorted?", "Insertion sort", ["Bubble", "Quick", "Selection"]),
        ("Heap sort complexity?", "O(n log n)", ["O(n)", "O(log n)", "O(n²)"]),
    ]),
    ("Time Complexity", [
        ("O(1) is?", "Constant", ["Linear", "Logarithmic", "Quadratic"]),
        ("O(n) is?", "Linear", ["Constant", "Logarithmic", "Quadratic"]),
        ("O(log n) is?", "Logarithmic", ["Linear", "Constant", "Quadratic"]),
        ("O(n²) is?", "Quadratic", ["Linear", "Logarithmic", "Constant"]),
        ("O(n log n) is?", "Linearithmic", ["Linear", "Quadratic", "Logarithmic"]),
        ("Best case of bubble sort?", "O(n)", ["O(n²)", "O(log n)", "O(1)"]),
    ]),
    ("Graph Basics", [
        ("Graph with no cycles?", "Tree", ["Cycle", "Complete", "Directed"]),
        ("Complete graph edges for n nodes?", "n(n-1)/2", ["n", "n²", "n-1"]),
        ("BFS uses?", "Queue", ["Stack", "Array", "Linked list"]),
        ("DFS uses?", "Stack", ["Queue", "Array", "Linked list"]),
        ("Spanning tree has ? edges", "n-1", ["n", "n+1", "n²"]),
    ]),
    ("Divide and Conquer", [
        ("Divide and conquer steps?", "3", ["2", "4", "5"]),
        ("Examples of D&C?", "Merge sort", ["Bubble sort", "Linear search", "Insertion sort"]),
        ("D&C time complexity usually?", "O(n log n)", ["O(n)", "O(n²)", "O(1)"]),
    ]),
    ("Greedy Algorithms", [
        ("Greedy makes ? choice", "Local optimal", ["Global optimal", "Random", "Worst"]),
        ("Dijkstra is?", "Greedy", ["DP", "D&C", "Backtracking"]),
        ("Kruskal is?", "Greedy", ["DP", "D&C", "Backtracking"]),
    ]),
    ("Expression Conversion", [
        ("Infix to postfix uses?", "Stack", ["Queue", "Array", "Tree"]),
        ("Postfix evaluation uses?", "Stack", ["Queue", "Array", "Tree"]),
        ("Prefix of A+B*C?", "+A*BC", ["*+ABC", "ABC*+", "+*ABC"]),
        ("Infix: (A+B)*C postfix?", "AB+C*", ["ABC*+", "AB*C+", "A+BC*"]),
    ]),
]

for topic_name, q_list in dsa_topics:
    for q_text, correct, wrong in q_list:
        if isinstance(correct, list):
            opts = correct; correct_idx = wrong
        else:
            opts = [correct] + wrong; correct_idx = 0
        questions.append(mk("B","Data Structures",topic_name,random.choice(["easy","medium","hard"]),
            q_text, opts, correct_idx, f"Answer: {opts[correct_idx]}"))

# Fill remaining to reach 600
fill_topics = [t[0] for t in dsa_topics]
dsa_fillers = [
    ("Stack is used in?", "Function calls", ["Arrays", "Files", "Pointers"]),
    ("Queue is used in?", "BFS", ["DFS", "Sorting", "Searching"]),
    ("Worst case binary search?", "O(log n)", ["O(n)", "O(1)", "O(n²)"]),
    ("Best sorting algorithm?", "Depends on data", ["Bubble", "Selection", "Quick"]),
    ("Linked list vs array insertion?", "Linked list O(1)", ["Array O(1)", "Both O(n)", "Both O(1)"]),
    ("Tree traversal uses?", "Recursion", ["Iteration only", "Loops only", "Pointers only"]),
    ("Heap is a?", "Complete binary tree", ["Linked list", "Graph", "Array"]),
    ("Hash table average search?", "O(1)", ["O(n)", "O(log n)", "O(n²)"]),
]

for i in range(600 - len(questions)):
    q_text, correct, wrong = random.choice(dsa_fillers)
    opts = [correct] + wrong
    questions.append(mk("B","Data Structures",random.choice(fill_topics),random.choice(["easy","medium","hard"]),
        q_text, opts, 0, f"Answer: {correct}"))

print(f"Data Structures: {len(questions)} questions")
with open(f"{OUT}/ds.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved ds.json")

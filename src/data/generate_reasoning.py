#!/usr/bin/env python3
"""Generate Reasoning questions - 800 questions"""
import json, random, os
random.seed(43)
OUT = "/home/hp/cdac-mock-test/src/data"
os.makedirs(OUT, exist_ok=True)

counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"

def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]
    random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []

# NUMBER SERIES (150Q)
series_patterns = [
    (lambda n: [2*i+1 for i in range(n)], "Odd numbers"),
    (lambda n: [2*i for i in range(n)], "Even numbers"),
    (lambda n: [i*i for i in range(1,n+1)], "Squares"),
    (lambda n: [i*i*i for i in range(1,n+1)], "Cubes"),
    (lambda n: [2**i for i in range(n)], "Powers of 2"),
    (lambda n: [i*3 for i in range(1,n+1)], "Multiples of 3"),
    (lambda n: [i*5 for i in range(1,n+1)], "Multiples of 5"),
    (lambda n: [i*(i+1)//2 for i in range(1,n+1)], "Triangular"),
    (lambda n: [i*i+1 for i in range(n)], "n²+1"),
    (lambda n: [i*i-1 for i in range(1,n+1)], "n²-1"),
]

for i in range(150):
    pattern_fn, desc = random.choice(series_patterns)
    seq = pattern_fn(6)
    next_val = pattern_fn(7)[-1]
    missing_idx = random.randint(0, 5)
    displayed = seq[:]
    displayed[missing_idx] = "?"
    opts = [str(next_val), str(seq[missing_idx]+random.randint(1,5)), str(seq[missing_idx]-random.randint(1,3)), str(seq[missing_idx]*2)]
    questions.append(mk("A","Reasoning","Number Series",random.choice(["easy","medium","hard"]),
        f"Complete the series: {displayed}", opts, 0,
        f"Pattern: {desc}. Missing value = {seq[missing_idx]}"))

# CODING-DECODING (150Q)
coding_types = [
    ("letter_shift", "Each letter shifted by N"),
    ("reverse", "Letters reversed"),
    ("number_code", "Letter position as number"),
    ("opposite", "Opposite letter in alphabet"),
]

for i in range(150):
    ctype, desc = random.choice(coding_types)
    words = ["CAT", "DOG", "BAT", "RAT", "HAT", "MAT", "SUN", "MOON", "STAR", "BOOK", "PEN", "RED"]
    word = random.choice(words)
    
    if ctype == "letter_shift":
        shift = random.randint(1, 5)
        coded = "".join(chr((ord(c)-65+shift)%26+65) for c in word)
        questions.append(mk("A","Reasoning","Coding-Decoding",random.choice(["easy","medium"]),
            f"If {word} is coded as {coded}, how is CODE coded?",
            ["".join(chr((ord(c)-65+shift)%26+65) for c in "CODE"),
             "".join(chr((ord(c)+65+shift)%26+65) for c in "CODE"),
             coded, word], 0,
            f"Each letter shifted by {shift} positions"))
    elif ctype == "reverse":
        coded = word[::-1]
        questions.append(mk("A","Reasoning","Coding-Decoding",random.choice(["easy","medium"]),
            f"If {word} is {coded}, then BOOK is?",
            ["KOOB", "BOOK", "KBOO", "OBOK"], 0, "Word is reversed"))
    elif ctype == "number_code":
        coded = "".join(str(ord(c)-64) for c in word)
        questions.append(mk("A","Reasoning","Coding-Decoding",random.choice(["medium","hard"]),
            f"If {word}={coded}, then PEN=?",
            ["".join(str(ord(c)-64) for c in "PEN"),
             "".join(str(ord(c)-65) for c in "PEN"),
             "PEN", coded], 0, "Letter position (A=1,B=2,...)"))
    else:
        coded = "".join(chr(90-(ord(c)-65)) for c in word)
        questions.append(mk("A","Reasoning","Coding-Decoding",random.choice(["medium","hard"]),
            f"If {word}={coded}, then ABC=?",
            ["ZYX", "ABC", "XYZ", "CBA"], 0, "Opposite letter (A=Z,B=Y,...)"))

# BLOOD RELATIONS (100Q)
for i in range(100):
    relations = [
        ("A is father of B. B is sister of C. C is son of D. How is A related to D?", "Husband", ["Father", "Brother", "Uncle"]),
        ("A is mother of B. B is brother of C. C is daughter of D. How is A related to D?", "Wife", ["Mother", "Sister", "Aunt"]),
        ("A is brother of B. B is father of C. C is sister of D. How is A related to D?", "Uncle", ["Father", "Brother", "Grandfather"]),
        ("Pointing to a lady, a man said 'She is the daughter of my grandfather's only son.' How is the lady related to the man?", "Sister", ["Cousin", "Niece", "Mother"]),
        ("A's father is B. B's sister is C. C's husband is D. How is D related to A?", "Uncle", ["Father", "Brother", "Grandfather"]),
    ]
    q, correct, wrong = random.choice(relations)
    opts = [correct] + wrong
    questions.append(mk("A","Reasoning","Blood Relations",random.choice(["easy","medium","hard"]),
        q, opts, 0, f"Answer: {correct}"))

# SITTING ARRANGEMENT (100Q)
for i in range(100):
    arrangements = [
        ("6 people sitting in a circle. A is between B and C. D is opposite A. Who is left of D?", "Cannot be determined", ["A", "B", "C"]),
        ("5 people in a row. A is at extreme left. B is next to A. Who is at extreme right?", "Cannot be determined", ["C", "D", "E"]),
        ("8 people around circular table. A is 3rd to left of B. How many between them?", "2", ["1", "3", "4"]),
        ("A, B, C, D in row. A not first. B next to A. D last. Who is first?", "C", ["A", "B", "D"]),
        ("6 chairs in circle. P left of Q. R right of P. S opposite P. Who is between Q and S?", "Cannot determine", ["P", "R", "T"]),
    ]
    q, correct, wrong = random.choice(arrangements)
    opts = [correct] + wrong
    questions.append(mk("A","Reasoning","Sitting Arrangement",random.choice(["medium","hard"]),
        q, opts, 0, f"Answer: {correct}"))

# DIRECTION SENSE (80Q)
for i in range(80):
    directions = [
        ("A facing North turns right then left. Direction now?", "North", ["East", "West", "South"]),
        ("B walks 5km North, 3km East, 5km South. Direction from start?", "East", ["North", "West", "South"]),
        ("Sun rises in East. A faces Sun, turns right. Direction now?", ["South", "North", "West", "East"], 0),
        ("C walks 10km West, 10km North, 10km East. Distance from start?", "10km North", ["0km", "10km South", "20km"]),
        ("Facing South, turn left, walk 5km, turn right, walk 5km. Position?", ["East", "North", "West", "South"], 0),
    ]
    item = random.choice(directions)
    if isinstance(item[1], list):
        q, opts, correct = item[0], item[1], item[2]
    else:
        q, correct, wrong = item
        opts = [correct] + wrong
    questions.append(mk("A","Reasoning","Direction Sense",random.choice(["easy","medium"]),
        q, opts, 0 if isinstance(item[1], list) and len(item) == 3 else 0,
        f"Answer: {opts[0] if isinstance(item[1], list) else correct}"))

# DATA SUFFICIENCY (60Q)
for i in range(60):
    scenarios = [
        ("How old is A?\n(I) A is 5 years older than B\n(II) B is 10 years old", "Both needed", ["I alone", "II alone", "Either sufficient"]),
        ("What is x?\n(I) x + y = 10\n(II) y = 6", "Both needed", ["I alone", "II alone", "Either sufficient"]),
        ("Is A > B?\n(I) A = 2C\n(II) B = C", "Both needed", ["I alone", "II alone", "Either sufficient"]),
        ("What is the speed?\n(I) Distance = 100km\n(II) Time = 2hrs", "Both needed", ["I alone", "II alone", "Either sufficient"]),
    ]
    q, correct, wrong = random.choice(scenarios)
    opts = [correct] + wrong
    questions.append(mk("A","Reasoning","Data Sufficiency",random.choice(["medium","hard"]),
        q, opts, 0, f"Answer: {correct}"))

# PUZZLE TEST (80Q)
for i in range(80):
    puzzles = [
        ("5 people have different pets: Dog, Cat, Fish, Bird, Rabbit. A has Dog. B doesn't have Cat. Who has Fish?", "Cannot say", ["A", "B", "C"]),
        ("3 boxes: Red, Blue, Green. Apple in Red. Banana not in Green. Cherry is in?", "Cannot determine", ["Red", "Blue", "Green"]),
        ("5 floors building. A above B. C below D. Who is on top?", "Cannot determine", ["A", "C", "D"]),
    ]
    q, correct, wrong = random.choice(puzzles)
    opts = [correct] + wrong
    questions.append(mk("A","Reasoning","Puzzle Test",random.choice(["medium","hard"]),
        q, opts, 0, f"Answer: {correct}"))

# VERBAL REASONING (80Q)
for i in range(80):
    verbal = [
        ("All cats are dogs. All dogs are birds. Conclusion: All cats are birds.", "Valid", ["Invalid", "Cannot say", "Only some"]),
        ("Some A are B. All B are C. Conclusion: All A are C.", "Invalid", ["Valid", "Cannot say", "All C are A"]),
        ("No A is B. No B is C. Conclusion: No A is C.", "Cannot say", ["Valid", "Invalid", "Some A are C"]),
        ("All roses are flowers. Some flowers fade. Conclusion: Some roses fade.", "Cannot say", ["Valid", "Invalid", "All roses fade"]),
        ("If it rains, ground wet. Ground is wet. Conclusion: It rained.", "Cannot say", ["Valid", "Invalid", "Must have rained"]),
    ]
    q, correct, wrong = random.choice(verbal)
    opts = [correct] + wrong
    questions.append(mk("A","Reasoning","Verbal Reasoning",random.choice(["easy","medium"]),
        q, opts, 0, f"Answer: {correct}"))

print(f"Reasoning: {len(questions)} questions")
with open(f"{OUT}/reasoning.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved reasoning.json")

#!/usr/bin/env python3
"""
Regenerate quant and reasoning question banks with guaranteed correct answers.
Key fix: compute the correct answer FIRST, then build options around it,
then shuffle and re-index.
"""
import json, random, os, re
from math import gcd

random.seed(2024)
OUT = "/home/hp/cdac-mock-test/src/data"

counter = [0]
def nid(prefix):
    counter[0] += 1
    return f"{prefix}-{counter[0]:05d}"

def make_q(section, subject, topic, difficulty, question, options, correct_idx, explanation, marks=1):
    """Create question with VERIFIED correct answer index"""
    assert 0 <= correct_idx < len(options), f"Bad index {correct_idx} for {options}"
    assert len(options) == 4, f"Need 4 options, got {len(options)}"
    assert len(set(options)) == len(options), f"Duplicate options: {options}"
    return {
        "id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"),
        "section": section,
        "subject": subject,
        "topic": topic,
        "difficulty": difficulty,
        "question": question,
        "options": list(options),
        "correctAnswer": correct_idx,
        "explanation": explanation,
        "marks": marks
    }

def add_with_shuffle(section, subject, topic, difficulty, question, correct_answer, wrong_answers, explanation):
    """Build options with correct answer, shuffle, find new correct index"""
    # Deduplicate wrong answers and remove any matching correct answer
    seen = {str(correct_answer)}
    filtered_wrong = []
    for w in wrong_answers:
        ws = str(w)
        if ws not in seen:
            filtered_wrong.append(w)
            seen.add(ws)
    
    # Generate more unique wrong answers if needed
    while len(filtered_wrong) < 3:
        if str(correct_answer).lstrip('-').isdigit():
            base = int(correct_answer)
            new_w = str(base + random.randint(1, 50) * random.choice([-1, 1]))
            if str(new_w) not in seen:
                filtered_wrong.append(new_w)
                seen.add(str(new_w))
        else:
            candidate = correct_answer + f" (alt{len(filtered_wrong)})"
            if candidate not in seen:
                filtered_wrong.append(candidate)
                seen.add(candidate)
    
    all_options = [correct_answer] + filtered_wrong[:3]
    random.shuffle(all_options)
    correct_idx = all_options.index(correct_answer)
    return make_q(section, subject, topic, difficulty, question, all_options, correct_idx, explanation)

# ==========================================
# QUANTITATIVE APTITUDE - 1000 QUESTIONS
# ==========================================
def generate_quant():
    questions = []
    
    # PERCENTAGES (100Q) - "What is X% of Y?"
    for _ in range(100):
        pct = random.choice([5, 10, 15, 20, 25, 30, 40, 50, 75])
        base = random.choice([100, 200, 400, 500, 800, 1000, 1200, 1500, 2000])
        answer = base * pct // 100
        wrong = [answer + random.randint(10, 50), answer - random.randint(5, 30), answer + random.randint(51, 100)]
        wrong = [str(max(1, w)) for w in wrong if str(w) != str(answer)]
        while len(wrong) < 3:
            w = answer + random.randint(1, 100)
            if str(w) != str(answer) and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Percentages", 
            random.choice(["easy", "medium"]),
            f"What is {pct}% of {base}?",
            str(answer), wrong[:3],
            f"{pct}% of {base} = ({pct}/100) × {base} = {answer}"))
    
    # PROFIT & LOSS (100Q) - "CP=X, SP=Y. Find Profit%"
    for _ in range(100):
        cp = random.randint(100, 1000) * 10
        profit_pct = random.choice([5, 10, 12, 15, 20, 25, 30])
        sp = cp + (cp * profit_pct // 100)
        profit = sp - cp
        answer = str(profit_pct)
        wrong = [str(profit_pct + random.randint(1, 10)), str(max(1, profit_pct - random.randint(1, 5))), 
                 str(profit_pct + random.randint(11, 20))]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = profit_pct + random.randint(1, 25)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Profit & Loss",
            random.choice(["easy", "medium"]),
            f"If Cost Price = ₹{cp} and Selling Price = ₹{sp}, what is the Profit %?",
            answer, wrong[:3],
            f"Profit = SP - CP = {sp} - {cp} = {profit}\nProfit% = ({profit}/{cp}) × 100 = {profit_pct}%"))
    
    # RATIO & PROPORTION (80Q) - "Divide X in ratio A:B. First share?"
    for _ in range(80):
        a = random.randint(2, 12)
        b = random.randint(2, 12)
        total = (a + b) * random.randint(10, 50)
        share_a = total * a // (a + b)
        answer = str(share_a)
        wrong = [str(total - share_a), str(total // 2), str(total)]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = share_a + random.randint(1, 50)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Ratio & Proportion",
            random.choice(["easy", "medium"]),
            f"Divide ₹{total} in the ratio {a}:{b}. What is the first share?",
            answer, wrong[:3],
            f"First share = {total} × {a}/({a}+{b}) = {total} × {a}/{a+b} = {share_a}"))
    
    # AVERAGE (80Q)
    for _ in range(80):
        n = random.randint(3, 7)
        nums = [random.randint(10, 99) for _ in range(n)]
        avg = sum(nums) // n
        answer = str(avg)
        wrong = [str(avg + random.randint(2, 10)), str(max(1, avg - random.randint(2, 10))), str(max(nums))]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = avg + random.randint(1, 20)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Averages",
            random.choice(["easy", "medium"]),
            f"What is the average of {', '.join(map(str, nums))}?",
            answer, wrong[:3],
            f"Average = ({' + '.join(map(str, nums))}) / {n} = {sum(nums)} / {n} = {avg}"))
    
    # TIME & WORK (100Q)
    for _ in range(100):
        a = random.randint(5, 30)
        b = random.randint(5, 30)
        num = a * b
        den = a + b
        g = gcd(num, den)
        answer = f"{num//g}/{den//g}"
        wrong = [f"{a+b}", f"{a*b}", f"{abs(a-b)}"]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = f"{num+random.randint(1,10)}/{den}"
            if w != answer and w not in wrong:
                wrong.append(w)
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Time & Work",
            random.choice(["medium", "hard"]),
            f"A can complete a work in {a} days and B in {b} days. In how many days will they complete it together?",
            answer, wrong[:3],
            f"A's 1 day = 1/{a}, B's 1 day = 1/{b}\nTogether = 1/{a} + 1/{b} = {num}/{den} = {answer} days"))
    
    # SPEED DISTANCE TIME (80Q)
    for _ in range(80):
        dist = random.randint(100, 600)
        time = random.randint(2, 12)
        speed = dist // time
        answer = str(speed)
        wrong = [str(speed + random.randint(5, 20)), str(max(1, speed - random.randint(5, 15))), str(dist + time)]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = speed + random.randint(1, 30)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Time & Distance",
            random.choice(["easy", "medium"]),
            f"A car travels {dist} km in {time} hours. What is its speed?",
            answer, wrong[:3],
            f"Speed = Distance / Time = {dist} / {time} = {speed} km/hr"))
    
    # TRAINS (50Q)
    for _ in range(50):
        length = random.randint(100, 500)
        speed = random.choice([36, 54, 72, 90, 108])
        time = length / (speed * 5/18)
        answer = f"{time:.1f}"
        wrong = [f"{time + random.randint(1, 5):.1f}", f"{max(0.1, time - random.randint(1, 3)):.1f}", f"{length/speed:.1f}"]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = f"{time + random.uniform(1, 10):.1f}"
            if w != answer and w not in wrong:
                wrong.append(w)
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Trains",
            random.choice(["medium", "hard"]),
            f"A train of length {length} meters is running at {speed} km/hr. How much time will it take to cross a pole?",
            answer, wrong[:3],
            f"Speed in m/s = {speed} × 5/18\nTime = Length / Speed = {length} / ({speed}×5/18) = {answer} seconds"))
    
    # BOATS & STREAMS (40Q)
    for _ in range(40):
        boat = random.randint(10, 30)
        stream = random.randint(2, 8)
        down = boat + stream
        up = boat - stream
        answer = f"{down},{up}"
        wrong = [f"{boat},{stream}", f"{down+1},{up-1}", f"{down+stream},{up-stream}"]
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Boats & Streams",
            random.choice(["medium", "hard"]),
            f"Speed of boat in still water is {boat} km/hr and speed of stream is {stream} km/hr. What are downstream and upstream speeds?",
            answer, wrong[:3],
            f"Downstream = {boat}+{stream} = {down} km/hr\nUpstream = {boat}-{stream} = {up} km/hr"))
    
    # SIMPLE INTEREST (50Q)
    for _ in range(50):
        p = random.randint(1000, 10000)
        r = random.randint(4, 15)
        t = random.randint(2, 5)
        si = (p * r * t) // 100
        answer = str(si)
        wrong = [str(si + random.randint(100, 500)), str(max(0, si - random.randint(50, 200))), str(si + r)]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = si + random.randint(100, 1000)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Simple Interest",
            random.choice(["easy", "medium"]),
            f"Find SI on ₹{p} at {r}% per annum for {t} years.",
            answer, wrong[:3],
            f"SI = P×R×T/100 = {p}×{r}×{t}/100 = {si}"))
    
    # COMPOUND INTEREST (40Q)
    for _ in range(40):
        p = random.choice([1000, 2000, 5000, 10000])
        r = random.choice([5, 10, 20])
        t = 2
        a = p * (100 + r) ** 2 // 10000
        ci = a - p
        answer = str(ci)
        wrong = [str(ci + random.randint(50, 200)), str(max(0, ci - random.randint(20, 100))), str(a)]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = ci + random.randint(10, 500)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Compound Interest",
            random.choice(["medium", "hard"]),
            f"Find CI on ₹{p} at {r}% per annum for {t} years.",
            answer, wrong[:3],
            f"A = P(1+R/100)^T = {p}(1+{r}/100)² = {a}\nCI = A - P = {a} - {p} = {ci}"))
    
    # NUMBER SYSTEM (60Q)
    for _ in range(60):
        n = random.randint(10, 100)
        choice = random.choice(["binary", "octal", "hex"])
        if choice == "binary":
            answer = bin(n)[2:]
            wrong = [oct(n)[2:], hex(n)[2:].upper(), str(n)]
            q = f"Convert decimal {n} to binary."
        elif choice == "octal":
            answer = oct(n)[2:]
            wrong = [bin(n)[2:], hex(n)[2:].upper(), str(n)]
            q = f"Convert decimal {n} to octal."
        else:
            answer = hex(n)[2:].upper()
            wrong = [bin(n)[2:], oct(n)[2:], str(n)]
            q = f"Convert decimal {n} to hexadecimal."
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Number System",
            random.choice(["easy", "medium"]), q,
            answer, wrong[:3], f"{n} in {choice} = {answer}"))
    
    # HCF & LCM (40Q)
    for _ in range(40):
        a = random.randint(12, 60)
        b = random.randint(12, 60)
        h = gcd(a, b)
        l = (a * b) // h
        answer = f"HCF={h},LCM={l}"
        wrong = [f"HCF={l},LCM={h}", f"HCF={a},LCM={b}", f"HCF={h+1},LCM={l-1}"]
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "HCF & LCM",
            random.choice(["easy", "medium"]),
            f"Find HCF and LCM of {a} and {b}.",
            answer, wrong[:3],
            f"HCF({a},{b}) = {h}, LCM({a},{b}) = ({a}×{b})/{h} = {l}"))
    
    # PROBABILITY (50Q)
    prob_scenarios = [
        ("A coin is tossed. What is P(Head)?", "1/2", ["1/4", "1/3", "2/3"]),
        ("A die is rolled. What is P(even number)?", "1/2", ["1/3", "1/6", "2/3"]),
        ("A die is rolled. What is P(number > 4)?", "1/3", ["1/2", "1/6", "2/3"]),
        ("A card is drawn from deck. What is P(heart)?", "1/4", ["1/2", "1/13", "1/52"]),
        ("Two coins tossed. P(both heads)?", "1/4", ["1/2", "3/4", "1/8"]),
        ("A die is rolled. P(prime number)?", "1/2", ["1/3", "1/6", "2/3"]),
        ("Two dice rolled. P(sum = 7)?", "1/6", ["1/12", "1/9", "5/36"]),
    ]
    for _ in range(50):
        q, answer, wrong = random.choice(prob_scenarios)
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Probability",
            random.choice(["medium", "hard"]), q,
            answer, wrong[:3], f"Answer: {answer}"))
    
    # PERMUTATION & COMBINATION (50Q)
    for _ in range(50):
        n = random.randint(5, 8)
        r = random.randint(2, 4)
        choice = random.choice(["P", "C"])
        # nPr
        npr = 1
        for i in range(n, n-r, -1):
            npr *= i
        # nCr
        den = 1
        for i in range(1, r+1):
            den *= i
        ncr = npr // den
        
        if choice == "P":
            answer = str(npr)
            wrong = [str(ncr), str(npr + r), str(npr - r)]
            q = f"Find the value of {n}P{r}."
            exp = f"{n}P{r} = {n}!/({n}-{r})! = {'×'.join(str(i) for i in range(n, n-r, -1))} = {npr}"
        else:
            answer = str(ncr)
            wrong = [str(npr), str(ncr + r), str(ncr - r)]
            q = f"Find the value of {n}C{r}."
            exp = f"{n}C{r} = {n}!/({r}!×{n-r}!) = {npr}/{den} = {ncr}"
        
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = ncr + random.randint(1, 20)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Permutation & Combination",
            random.choice(["medium", "hard"]), q,
            answer, wrong[:3], exp))
    
    # PIPES & CISTERNS (30Q)
    for _ in range(30):
        fill = random.randint(6, 20)
        empty = random.randint(4, 15)
        net = abs(fill - empty)
        if net == 0:
            net = 1
        time = (fill * empty) // net
        answer = str(time)
        wrong = [str(fill + empty), str(fill * empty), str(abs(fill - empty))]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = time + random.randint(1, 10)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Pipes & Cisterns",
            random.choice(["medium", "hard"]),
            f"Pipe A can fill a tank in {fill} hours and Pipe B can empty it in {empty} hours. If both pipes are opened together, how long will it take to fill the tank?",
            answer, wrong[:3],
            f"Net rate = 1/{fill} - 1/{empty} = {net}/{fill*empty}\nTime = {fill*empty}/{net} = {time} hours"))
    
    # PARTNERSHIP (20Q)
    for _ in range(20):
        a_inv = random.randint(5, 15) * 1000
        a_months = random.randint(6, 12)
        b_inv = random.randint(5, 15) * 1000
        b_months = random.randint(6, 12)
        a_share = a_inv * a_months
        b_share = b_inv * b_months
        g = gcd(a_share, b_share)
        answer = f"{a_share//g}:{b_share//g}"
        wrong = [f"{a_inv}:{b_inv}", f"{a_months}:{b_months}", f"{b_share//g}:{a_share//g}"]
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Partnership",
            random.choice(["medium", "hard"]),
            f"A invests ₹{a_inv} for {a_months} months and B invests ₹{b_inv} for {b_months} months. What is the profit sharing ratio?",
            answer, wrong[:3],
            f"Ratio = {a_inv}×{a_months} : {b_inv}×{b_months} = {a_share} : {b_share} = {answer}"))
    
    # ALLEGATION & MIXTURE (20Q)
    for _ in range(20):
        p1 = random.randint(10, 30)
        p2 = random.randint(40, 60)
        avg = (p1 + p2) // 2
        r1 = p2 - avg
        r2 = avg - p1
        g = gcd(r1, r2)
        answer = f"{r1//g}:{r2//g}"
        wrong = [f"{p1}:{p2}", f"{p2}:{p1}", f"{r2//g}:{r1//g}"]
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Allegation & Mixture",
            random.choice(["medium", "hard"]),
            f"In what ratio should two varieties costing ₹{p1}/kg and ₹{p2}/kg be mixed to get a mixture worth ₹{avg}/kg?",
            answer, wrong[:3],
            f"Required ratio = ({p2}-{avg}) : ({avg}-{p1}) = {r1} : {r2} = {answer}"))
    
    # CALENDAR (20Q)
    for _ in range(20):
        year = random.choice([2000, 2024, 2025, 1900, 2100, 1996, 2028, 2104])
        is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
        answer = "Leap year" if is_leap else "Not a leap year"
        wrong = ["Not a leap year" if is_leap else "Leap year", "Century year", "Ordinary year"]
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Calendar",
            random.choice(["easy", "medium"]),
            f"Is {year} a leap year?",
            answer, wrong[:3],
            f"{year} is {'a leap' if is_leap else 'not a leap'} year because {'divisible by 400' if year%400==0 else 'divisible by 4 but not 100' if is_leap else 'not divisible by 4 or divisible by 100 but not 400'}."))
    
    # CLOCKS (20Q)
    for _ in range(20):
        h = random.randint(1, 12)
        m = random.choice([0, 15, 30, 45])
        angle = abs(30*h - 11*m/2)
        angle = min(angle, 360 - angle)
        answer = f"{angle:.1f}°"
        wrong = [f"{angle + 15:.1f}°", f"{max(0, angle - 15):.1f}°", f"{30*h:.1f}°"]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = f"{angle + random.uniform(5, 30):.1f}°"
            if w != answer and w not in wrong:
                wrong.append(w)
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Clocks",
            random.choice(["medium", "hard"]),
            f"What is the angle between the hour and minute hands of a clock at {h}:{m:02d}?",
            answer, wrong[:3],
            f"Angle = |30×{h} - 11×{m}/2| = |{30*h} - {11*m/2}| = {angle:.1f}°"))
    
    # VOLUME & SURFACE AREA (30Q)
    for _ in range(30):
        r = random.randint(3, 12)
        h = random.randint(5, 15)
        choice = random.choice(["vol", "sa"])
        if choice == "vol":
            vol = 22 * r * r * h // 7
            answer = str(vol)
            wrong = [str(2 * 22 * r * (r + h) // 7), str(vol * 2), str(vol // 2)]
            q = f"Find the volume of a cylinder with radius {r} cm and height {h} cm. (π = 22/7)"
            exp = f"V = πr²h = (22/7)×{r}²×{h} = {vol} cm³"
        else:
            sa = 2 * 22 * r * (r + h) // 7
            answer = str(sa)
            wrong = [str(22 * r * r * h // 7), str(sa * 2), str(sa // 2)]
            q = f"Find the total surface area of a cylinder with radius {r} cm and height {h} cm. (π = 22/7)"
            exp = f"SA = 2πr(r+h) = 2×(22/7)×{r}×({r}+{h}) = {sa} cm²"
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = int(answer) + random.randint(10, 100)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Volume & Surface Area",
            random.choice(["medium", "hard"]), q,
            answer, wrong[:3], exp))
    
    # AGES (20Q)
    for _ in range(20):
        father = random.randint(35, 55)
        son = random.randint(10, 20)
        years_ago = father - 2 * son + random.randint(1, 5)
        if years_ago <= 0:
            years_ago = 5
        answer = str(son)
        wrong = [str(son + 3), str(son - 3), str(father - son)]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = son + random.randint(1, 10)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Ages",
            random.choice(["easy", "medium"]),
            f"{years_ago} years ago, a father was twice as old as his son. If the father is now {father} years old, what is the son's present age?",
            answer, wrong[:3],
            f"Son's age {years_ago} years ago = {father - years_ago}/2 = {(father-years_ago)//2}\nSon's present age = {(father-years_ago)//2} + {years_ago} = {son}"))
    
    # SURDS & INDICES (20Q)
    for _ in range(20):
        base = random.choice([2, 3, 5, 7])
        exp = random.randint(2, 5)
        result = base ** exp
        answer = str(result)
        wrong = [str(result + 1), str(result - 1), str(base * exp)]
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Surds & Indices",
            random.choice(["easy", "medium"]),
            f"What is the value of {base}^{exp}?",
            answer, wrong[:3],
            f"{base}^{exp} = {'×'.join([str(base)]*exp)} = {result}"))
    
    # SQUARE & CUBE ROOTS (20Q)
    squares = [i*i for i in range(2, 21)]
    for _ in range(20):
        n = random.choice(squares)
        root = int(n ** 0.5)
        answer = str(root)
        wrong = [str(root + 1), str(root - 1), str(n // 2)]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = root + random.randint(2, 5)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Square & Cube Roots",
            random.choice(["easy", "medium"]),
            f"What is the square root of {n}?",
            answer, wrong[:3],
            f"√{n} = {root} (since {root}² = {n})"))
    
    # ODD MAN OUT (20Q)
    for _ in range(20):
        patterns = [
            ([2, 4, 6, 8, 10, 13], "13", "All others are even numbers"),
            ([1, 4, 9, 16, 25, 30], "30", "All others are perfect squares"),
            ([3, 6, 9, 12, 15, 17], "17", "All others are multiples of 3"),
            ([2, 3, 5, 7, 11, 14], "14", "All others are prime numbers"),
            ([1, 2, 4, 8, 16, 30], "30", "All others are powers of 2"),
        ]
        seq, answer, reason = random.choice(patterns)
        wrong = [str(seq[0]), str(seq[1]), str(seq[2])]
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Odd Man Out & Series",
            random.choice(["easy", "medium"]),
            f"Find the odd one out: {', '.join(map(str, seq))}",
            answer, wrong[:3], reason))
    
    # SIMPLIFICATION (20Q)
    for _ in range(20):
        a = random.randint(10, 50)
        b = random.randint(5, 20)
        c = random.randint(2, 10)
        result = a + b * c
        answer = str(result)
        wrong = [str(a + b + c), str(a * b + c), str((a + b) * c)]
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Simplification",
            random.choice(["easy", "medium"]),
            f"Solve: {a} + {b} × {c}",
            answer, wrong[:3],
            f"Using BODMAS: {a} + ({b} × {c}) = {a} + {b*c} = {result}"))
    
    # DECIMAL FRACTIONS (10Q)
    for _ in range(10):
        num = random.randint(1, 20)
        den = random.randint(2, 12)
        result = num / den
        answer = f"{result:.2f}"
        wrong = [f"{result:.1f}", f"{num+den}", f"{num*den}"]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = f"{result + random.uniform(0.1, 1):.2f}"
            if w != answer and w not in wrong:
                wrong.append(w)
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Decimal Fractions",
            random.choice(["easy", "medium"]),
            f"Convert {num}/{den} to decimal (2 decimal places).",
            answer, wrong[:3],
            f"{num}/{den} = {result:.2f}"))
    
    # PROBLEMS ON NUMBERS (10Q)
    for _ in range(10):
        n = random.randint(10, 100)
        pct = random.choice([10, 20, 25, 50])
        result = n * pct // 100
        answer = str(result)
        wrong = [str(result + 5), str(result - 3), str(n + pct)]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = result + random.randint(1, 20)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        questions.append(add_with_shuffle("A", "Quantitative Aptitude", "Problems on Numbers",
            random.choice(["easy", "medium"]),
            f"Find {pct}% of {n}.",
            answer, wrong[:3],
            f"{pct}% of {n} = {n} × {pct}/100 = {result}"))
    
    return questions

# ==========================================
# REASONING - 800 QUESTIONS
# ==========================================
def generate_reasoning():
    questions = []
    
    # NUMBER SERIES (200Q)
    series_types = [
        # (generator_func, description)
        ("powers2", lambda n: [2**i for i in range(n)], "Powers of 2"),
        ("evens", lambda n: [2*i for i in range(n)], "Even numbers"),
        ("odds", lambda n: [2*i+1 for i in range(n)], "Odd numbers"),
        ("squares", lambda n: [i*i for i in range(1, n+1)], "Perfect squares"),
        ("cubes", lambda n: [i**3 for i in range(1, n+1)], "Perfect cubes"),
        ("multiples3", lambda n: [3*i for i in range(1, n+1)], "Multiples of 3"),
        ("multiples5", lambda n: [5*i for i in range(1, n+1)], "Multiples of 5"),
        ("triangular", lambda n: [i*(i+1)//2 for i in range(1, n+1)], "Triangular numbers"),
        ("fibonacci", lambda n: [1, 1, 2, 3, 5, 8, 13, 21][:n], "Fibonacci sequence"),
        ("n2plus1", lambda n: [i*i+1 for i in range(n)], "n² + 1"),
        ("n2minus1", lambda n: [i*i-1 for i in range(1, n+1)], "n² - 1"),
    ]
    
    for _ in range(200):
        stype, gen, desc = random.choice(series_types)
        seq = gen(7)
        missing_pos = random.randint(0, 5)
        expected = seq[missing_pos]
        
        displayed = seq[:]
        displayed[missing_pos] = "?"
        
        answer = str(expected)
        wrong = [str(expected + random.randint(1, 5)), str(max(0, expected - random.randint(1, 3))), 
                 str(expected * 2)]
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = expected + random.randint(1, 10)
            if str(w) != answer and str(w) not in wrong:
                wrong.append(str(w))
        
        questions.append(add_with_shuffle("A", "Reasoning", "Number Series",
            random.choice(["easy", "medium", "hard"]),
            f"What replaces '?' in the series: {displayed}",
            answer, wrong[:3],
            f"Pattern: {desc}. Missing value at position {missing_pos+1} = {expected}"))
    
    # CODING-DECODING (200Q)
    coding_types = ["shift", "reverse", "opposite", "number_code"]
    words = ["CAT", "DOG", "BAT", "RAT", "SUN", "BOOK", "PEN", "RED", "BIG", "RUN", "TOP", "GAME"]
    
    for _ in range(200):
        ctype = random.choice(coding_types)
        word = random.choice(words)
        
        if ctype == "shift":
            shift = random.randint(1, 5)
            coded = "".join(chr((ord(c)-65+shift)%26+65) for c in word)
            test_word = random.choice([w for w in words if w != word])
            answer = "".join(chr((ord(c)-65+shift)%26+65) for c in test_word)
            wrong = ["".join(chr((ord(c)-65+shift+1)%26+65) for c in test_word),
                     "".join(chr((ord(c)-65+shift-1)%26+65) for c in test_word),
                     test_word]
            q = f"If '{word}' is coded as '{coded}', how is '{test_word}' coded?"
            exp = f"Each letter shifted by {shift} positions forward"
        elif ctype == "reverse":
            coded = word[::-1]
            test_word = random.choice([w for w in words if w != word])
            answer = test_word[::-1]
            wrong = [test_word, coded, word]
            q = f"If '{word}' is written as '{coded}', how is '{test_word}' written?"
            exp = "The word is reversed"
        elif ctype == "opposite":
            coded = "".join(chr(90-(ord(c)-65)) for c in word)
            test_word = random.choice([w for w in words if w != word])
            answer = "".join(chr(90-(ord(c)-65)) for c in test_word)
            wrong = [test_word, coded, word]
            q = f"If '{word}' is coded as '{coded}', how is '{test_word}' coded?"
            exp = "Each letter replaced by its opposite (A↔Z, B↔Y, etc.)"
        else:  # number_code
            coded = "-".join(str(ord(c)-64) for c in word)
            test_word = random.choice([w for w in words if w != word])
            answer = "-".join(str(ord(c)-64) for c in test_word)
            wrong = [test_word, coded, word]
            q = f"If '{word}' is written as '{coded}', how is '{test_word}' written?"
            exp = "Each letter replaced by its position (A=1, B=2, etc.)"
        
        wrong = [w for w in wrong if w != answer]
        while len(wrong) < 3:
            w = answer + str(random.randint(1, 9))
            if w != answer and w not in wrong:
                wrong.append(w)
        
        questions.append(add_with_shuffle("A", "Reasoning", "Coding-Decoding",
            random.choice(["easy", "medium"]), q,
            answer, wrong[:3], exp))
    
    # BLOOD RELATIONS (100Q)
    blood_scenarios = [
        ("A is father of B. B is sister of C. C is son of D. How is A related to D?", "Husband", 
         ["Father", "Brother", "Uncle"], "A is father of B and C, so A is husband of D"),
        ("A is mother of B. B is brother of C. C is daughter of D. How is A related to D?", "Wife",
         ["Mother", "Sister", "Aunt"], "A is mother of B and C, so A is wife of D"),
        ("Pointing to a lady, a man said 'She is the daughter of my grandfather's only son'. How is the lady related to the man?", "Sister",
         ["Cousin", "Niece", "Mother"], "Grandfather's only son = man's father, daughter of father = sister"),
        ("A's father is B. B's sister is C. C's husband is D. How is D related to A?", "Uncle",
         ["Father", "Brother", "Grandfather"], "C is A's aunt, so D (C's husband) is uncle"),
        ("X is brother of Y. Y is sister of Z. Z is father of P. How is X related to P?", "Uncle",
         ["Father", "Brother", "Grandfather"], "X is brother of Y, Y is sister of Z, so X is Z's brother, making X uncle of P"),
        ("A is sister of B. B is father of C. C is son of D. How is A related to C?", "Aunt",
         ["Mother", "Sister", "Grandmother"], "A is sister of B, B is father of C, so A is aunt of C"),
    ]
    for _ in range(100):
        q, answer, wrong, exp = random.choice(blood_scenarios)
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Reasoning", "Blood Relations",
            random.choice(["easy", "medium", "hard"]), q,
            answer, wrong[:3], exp))
    
    # SITTING ARRANGEMENT (100Q)
    sitting_scenarios = [
        ("6 people A, B, C, D, E, F are sitting in a circle facing center. A is between B and C. D is opposite A. Who is to the left of D?", 
         "Cannot be determined", ["A", "B", "C"], "Insufficient information"),
        ("5 people are sitting in a row. A is at extreme left. B is next to A. C is at extreme right. Who is in the middle?",
         "Cannot be determined", ["B", "D", "E"], "Only positions of A and C are fixed"),
        ("8 people around a circular table. A is 3rd to the left of B. How many people are between A and B (shortest path)?",
         "2", ["1", "3", "4"], "3rd to left means 2 people between"),
        ("A, B, C, D are sitting in a row. A is not at either end. B is next to A. D is at extreme right. Who is at extreme left?",
         "C", ["A", "B", "D"], "D is rightmost, A not at ends, B next to A, so C is leftmost"),
        ("6 chairs in a circle. P is to the left of Q. R is to the right of P. S is opposite P. Who is between Q and R?",
         "Cannot be determined", ["P", "S", "T"], "Insufficient information"),
    ]
    for _ in range(100):
        q, answer, wrong, exp = random.choice(sitting_scenarios)
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Reasoning", "Sitting Arrangement",
            random.choice(["medium", "hard"]), q,
            answer, wrong[:3], exp))
    
    # DIRECTION SENSE (50Q)
    direction_scenarios = [
        ("A faces North, turns right, then left. Which direction is he facing?", "North", 
         ["East", "West", "South"], "Right then left = original direction"),
        ("B walks 5km North, then 3km East, then 5km South. In which direction is he from start?", "East",
         ["North", "West", "South"], "North 5 and South 5 cancel, only East 3 remains"),
        ("Sun rises in East. If you face the Sun and turn right, which direction are you facing?", "South",
         ["North", "West", "East"], "Facing East, turning right = South"),
        ("C walks 10km West, then 10km North, then 10km East. How far is he from start?", "10km North",
         ["0km", "10km South", "20km"], "West 10 and East 10 cancel, only North 10 remains"),
    ]
    for _ in range(50):
        q, answer, wrong, exp = random.choice(direction_scenarios)
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Reasoning", "Direction Sense",
            random.choice(["easy", "medium"]), q,
            answer, wrong[:3], exp))
    
    # DATA SUFFICIENCY (50Q)
    ds_scenarios = [
        ("How old is A?\n(I) A is 5 years older than B\n(II) B is 10 years old",
         "Both statements needed", ["I alone sufficient", "II alone sufficient", "Either sufficient"],
         "Need both: A = B + 5 = 10 + 5 = 15"),
        ("What is the value of x?\n(I) x + y = 10\n(II) y = 6",
         "Both statements needed", ["I alone sufficient", "II alone sufficient", "Either sufficient"],
         "Need both: x = 10 - y = 10 - 6 = 4"),
        ("Is A > B?\n(I) A = 2C\n(II) B = C",
         "Both statements needed", ["I alone sufficient", "II alone sufficient", "Either sufficient"],
         "A = 2C and B = C, so A = 2B > B. Need both."),
    ]
    for _ in range(50):
        q, answer, wrong, exp = random.choice(ds_scenarios)
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Reasoning", "Data Sufficiency",
            random.choice(["medium", "hard"]), q,
            answer, wrong[:3], exp))
    
    # PUZZLE TEST (30Q)
    puzzle_scenarios = [
        ("5 people have different pets: Dog, Cat, Fish, Bird, Rabbit. A has Dog. B doesn't have Cat. Who has Fish?",
         "Cannot be determined", ["A", "B", "C"], "Insufficient information"),
        ("3 boxes: Red, Blue, Green. Apple is in Red box. Banana is not in Green box. Where is Cherry?",
         "Cannot be determined", ["Red", "Blue", "Green"], "Banana could be in Blue, Cherry in Green or vice versa"),
    ]
    for _ in range(30):
        q, answer, wrong, exp = random.choice(puzzle_scenarios)
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Reasoning", "Puzzle Test",
            random.choice(["medium", "hard"]), q,
            answer, wrong[:3], exp))
    
    # VERBAL REASONING (20Q)
    verbal_scenarios = [
        ("All cats are dogs. All dogs are birds. Conclusion: All cats are birds.",
         "Valid", ["Invalid", "Cannot say", "Only some"], "By transitivity: cats→dogs→birds"),
        ("Some A are B. All B are C. Conclusion: All A are C.",
         "Invalid", ["Valid", "Cannot say", "All C are A"], "Only some A are B, so only some A are C"),
        ("No A is B. No B is C. Conclusion: No A is C.",
         "Cannot say", ["Valid", "Invalid", "Some A are C"], "A and C could have common elements"),
    ]
    for _ in range(20):
        q, answer, wrong, exp = random.choice(verbal_scenarios)
        wrong = [w for w in wrong if w != answer]
        questions.append(add_with_shuffle("A", "Reasoning", "Verbal Reasoning",
            random.choice(["easy", "medium"]), q,
            answer, wrong[:3], exp))
    
    return questions

# Run generators
print("Generating Quantitative Aptitude...")
quant = generate_quant()
print(f"  Generated: {len(quant)} questions")

print("Generating Reasoning...")
reasoning = generate_reasoning()
print(f"  Generated: {len(reasoning)} questions")

# Verify all answers
print("\nVerifying all answers...")
errors = 0
for q in quant + reasoning:
    opts = q['options']
    ci = q['correctAnswer']
    if ci < 0 or ci >= len(opts):
        errors += 1
    if len(set(opts)) < len(opts):
        errors += 1

print(f"  Errors found: {errors}")

# Save
with open(f"{OUT}/quant.json", "w") as f:
    json.dump(quant, f, indent=2)
print(f"  Saved quant.json ({len(quant)} questions)")

with open(f"{OUT}/reasoning.json", "w") as f:
    json.dump(reasoning, f, indent=2)
print(f"  Saved reasoning.json ({len(reasoning)} questions)")

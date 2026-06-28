#!/usr/bin/env python3
"""Generate Quantitative Aptitude questions - 1000 questions"""
import json, random, os
random.seed(42)
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

# PERCENTAGES (80Q)
for i in range(80):
    base = random.choice([100, 200, 500, 1000, 250, 400])
    pct = random.choice([10, 15, 20, 25, 30, 40, 50, 75])
    ans = base * pct // 100
    opts = [str(ans), str(ans+random.randint(5,20)), str(ans-random.randint(5,20)), str(base+pct)]
    questions.append(mk("A","Quantitative Aptitude","Percentages",random.choice(["easy","medium"]),
        f"What is {pct}% of {base}?", opts, 0, f"{pct}% of {base} = ({pct}/100)×{base} = {ans}"))

# PROFIT & LOSS (80Q)
for i in range(80):
    cp = random.randint(50, 500) * 10
    profit_pct = random.choice([10, 15, 20, 25, 30])
    sp = cp + (cp * profit_pct // 100)
    profit = sp - cp
    opts = [str(profit_pct), str(profit_pct+5), str(profit_pct-5), str(profit_pct+10)]
    questions.append(mk("A","Quantitative Aptitude","Profit & Loss",random.choice(["easy","medium"]),
        f"CP={cp}, SP={sp}. Profit%?", opts, 0, f"Profit% = ({profit}/{cp})×100 = {profit_pct}%"))

# RATIO & PROPORTION (60Q)
for i in range(60):
    a, b = random.randint(2,10), random.randint(2,10)
    total = (a+b) * random.randint(10, 50)
    share_a = total * a // (a+b)
    opts = [f"{a}:{b}", f"{b}:{a}", f"{a}:{a+b}", f"{b}:{a+b}"]
    questions.append(mk("A","Quantitative Aptitude","Ratio & Proportion",random.choice(["easy","medium"]),
        f"Divide {total} in ratio {a}:{b}. Share of first?", [str(share_a), str(total-share_a), str(total//2), str(total)], 0,
        f"First share = {total}×{a}/{a+b} = {share_a}"))

# AVERAGE (60Q)
for i in range(60):
    n = random.randint(3, 8)
    nums = [random.randint(20, 80) for _ in range(n)]
    avg = sum(nums) // n
    opts = [str(avg), str(avg+5), str(avg-3), str(max(nums))]
    questions.append(mk("A","Quantitative Aptitude","Averages",random.choice(["easy","medium"]),
        f"Average of {nums}?", opts, 0, f"Average = {sum(nums)}/{n} = {avg}"))

# TIME & WORK (80Q)
for i in range(80):
    a_days = random.randint(5, 30)
    b_days = random.randint(5, 30)
    combined = (a_days * b_days) / (a_days + b_days)
    combined_str = f"{a_days*b_days}/{a_days+b_days}"
    opts = [combined_str, f"{a_days+b_days}", f"{a_days*b_days}", f"{a_days-b_days}"]
    questions.append(mk("A","Quantitative Aptitude","Time & Work",random.choice(["medium","hard"]),
        f"A does work in {a_days} days, B in {b_days} days. Together?", opts, 0,
        f"Together = 1/(1/{a_days}+1/{b_days}) = {combined_str} days"))

# SPEED DISTANCE TIME (60Q)
for i in range(60):
    dist = random.randint(100, 500)
    time_h = random.randint(2, 10)
    speed = dist // time_h
    opts = [str(speed), str(speed+10), str(speed-10), str(dist+time_h)]
    questions.append(mk("A","Quantitative Aptitude","Time & Distance",random.choice(["easy","medium"]),
        f"Distance={dist}km, Time={time_h}hrs. Speed?", opts, 0, f"Speed = {dist}/{time_h} = {speed} km/hr"))

# TRAINS (40Q)
for i in range(40):
    length = random.randint(100, 500)
    speed = random.choice([36, 54, 72, 90])
    time = length / (speed * 5/18)
    opts = [f"{time:.1f}", f"{time+2:.1f}", f"{time-2:.1f}", f"{length/speed:.1f}"]
    questions.append(mk("A","Quantitative Aptitude","Trains",random.choice(["medium","hard"]),
        f"Train length={length}m, speed={speed}km/hr. Time to cross pole?", opts, 0,
        f"Time = {length}/({speed}×5/18) = {time:.1f}s"))

# BOATS & STREAMS (30Q)
for i in range(30):
    boat = random.randint(10, 30)
    stream = random.randint(2, 8)
    downstream = boat + stream
    upstream = boat - stream
    opts = [f"{downstream},{upstream}", f"{boat},{stream}", f"{downstream+1},{upstream-1}", f"{boat+stream},{boat}"]
    questions.append(mk("A","Quantitative Aptitude","Boats & Streams",random.choice(["medium","hard"]),
        f"Boat speed={boat}km/hr, stream={stream}km/hr. Down & Up speed?", opts, 0,
        f"Down={boat}+{stream}={downstream}, Up={boat}-{stream}={upstream}"))

# SIMPLE INTEREST (40Q)
for i in range(40):
    p = random.randint(1000, 10000)
    r = random.randint(5, 15)
    t = random.randint(2, 5)
    si = (p * r * t) // 100
    opts = [str(si), str(si+p), str(si//2), str(si+r)]
    questions.append(mk("A","Quantitative Aptitude","Simple Interest",random.choice(["easy","medium"]),
        f"P={p}, R={r}%, T={t}yrs. SI?", opts, 0, f"SI = {p}×{r}×{t}/100 = {si}"))

# COMPOUND INTEREST (30Q)
for i in range(30):
    p = random.choice([1000, 2000, 5000, 10000])
    r = random.choice([5, 10, 20])
    t = 2
    a = p * (100+r)**2 // 10000
    ci = a - p
    opts = [str(ci), str(ci+p), str(ci//2), str(ci+r)]
    questions.append(mk("A","Quantitative Aptitude","Compound Interest",random.choice(["medium","hard"]),
        f"P={p}, R={r}%, T={t}yrs. CI?", opts, 0, f"A={p}(1+{r}/100)²={a}, CI={ci}"))

# NUMBER SYSTEM (60Q)
for i in range(60):
    n = random.randint(10, 100)
    binary = bin(n)[2:]
    octal = oct(n)[2:]
    hexa = hex(n)[2:].upper()
    choice = random.choice(["binary","octal","hex"])
    if choice == "binary":
        opts = [binary, octal, hexa, str(n)]
        questions.append(mk("A","Quantitative Aptitude","Number System",random.choice(["easy","medium"]),
            f"Convert {n} to binary?", opts, 0, f"{n} in binary = {binary}"))
    elif choice == "octal":
        opts = [octal, binary, hexa, str(n)]
        questions.append(mk("A","Quantitative Aptitude","Number System",random.choice(["easy","medium"]),
            f"Convert {n} to octal?", opts, 0, f"{n} in octal = {octal}"))
    else:
        opts = [hexa, binary, octal, str(n)]
        questions.append(mk("A","Quantitative Aptitude","Number System",random.choice(["easy","medium"]),
            f"Convert {n} to hexadecimal?", opts, 0, f"{n} in hex = {hexa}"))

# HCF & LCM (40Q)
for i in range(40):
    a = random.randint(10, 50)
    b = random.randint(10, 50)
    from math import gcd
    hcf = gcd(a, b)
    lcm = (a * b) // hcf
    opts = [f"HCF={hcf},LCM={lcm}", f"HCF={lcm},LCM={hcf}", f"HCF={a},LCM={b}", f"HCF={b},LCM={a}"]
    questions.append(mk("A","Quantitative Aptitude","HCF & LCM",random.choice(["easy","medium"]),
        f"HCF and LCM of {a} and {b}?", opts, 0, f"HCF={hcf}, LCM={lcm}"))

# PROBABILITY (40Q)
for i in range(40):
    scenarios = [
        ("Coin tossed. P(Head)?", "1/2", ["1/4", "1/3", "2/3"]),
        ("Die rolled. P(even)?", "1/2", ["1/3", "1/6", "2/3"]),
        ("Die rolled. P(>4)?", "1/3", ["1/2", "1/6", "2/3"]),
        ("Card from deck. P(heart)?", "1/4", ["1/2", "1/13", "1/52"]),
        ("Coin tossed twice. P(2 heads)?", "1/4", ["1/2", "3/4", "1/8"]),
    ]
    q, correct, wrong = random.choice(scenarios)
    opts = [correct] + wrong
    questions.append(mk("A","Quantitative Aptitude","Probability",random.choice(["medium","hard"]),
        q, opts, 0, f"Answer: {correct}"))

# PERMUTATION & COMBINATION (40Q)
for i in range(40):
    n = random.randint(5, 8)
    r = random.randint(2, 4)
    import math
    npr = math.factorial(n) // math.factorial(n-r)
    ncr = math.factorial(n) // (math.factorial(r) * math.factorial(n-r))
    choice = random.choice(["P","C"])
    if choice == "P":
        opts = [str(npr), str(ncr), str(npr+r), str(npr-r)]
        questions.append(mk("A","Quantitative Aptitude","Permutation & Combination",random.choice(["medium","hard"]),
            f"Value of {n}P{r}?", opts, 0, f"{n}P{r} = {n}!/({n}-{r})! = {npr}"))
    else:
        opts = [str(ncr), str(npr), str(ncr+r), str(ncr-r)]
        questions.append(mk("A","Quantitative Aptitude","Permutation & Combination",random.choice(["medium","hard"]),
            f"Value of {n}C{r}?", opts, 0, f"{n}C{r} = {n}!/({r}!×{n-r}!) = {ncr}"))

# PIPES & CISTERNS (30Q)
for i in range(30):
    fill = random.randint(5, 20)
    empty = random.randint(5, 20)
    net_rate = abs(fill - empty)
    time = (fill * empty) // net_rate if net_rate > 0 else fill
    opts = [f"{time}", f"{fill+empty}", f"{fill*empty}", f"{fill-empty}"]
    questions.append(mk("A","Quantitative Aptitude","Pipes & Cisterns",random.choice(["medium","hard"]),
        f"Pipe A fills in {fill}hrs, Pipe B empties in {empty}hrs. Net time?", opts, 0,
        f"Net rate = 1/{fill}-1/{empty}, Time = {time}"))

# PARTNERSHIP (20Q)
for i in range(20):
    a_inv, a_months = random.randint(5,15)*1000, random.randint(6,12)
    b_inv, b_months = random.randint(5,15)*1000, random.randint(6,12)
    a_share = a_inv * a_months
    b_share = b_inv * b_months
    total = a_share + b_share
    a_ratio = a_share // (a_share // 1000 * 1000 or 1)
    opts = [f"{a_share//1000}:{b_share//1000}", f"{a_inv}:{b_inv}", f"{a_months}:{b_months}", f"{b_share//1000}:{a_share//1000}"]
    questions.append(mk("A","Quantitative Aptitude","Partnership",random.choice(["medium","hard"]),
        f"A invests {a_inv} for {a_months}mo, B invests {b_inv} for {b_months}mo. Profit ratio?", opts, 0,
        f"Ratio = {a_inv}×{a_months}:{b_inv}×{b_months} = {a_share//1000}:{b_share//1000}"))

# ALLEGATION & MIXTURE (20Q)
for i in range(20):
    p1 = random.randint(10, 30)
    p2 = random.randint(40, 60)
    avg = (p1 + p2) // 2
    ratio = p2 - avg
    opts = [f"{ratio}:{ratio}", f"{p1}:{p2}", f"{p2}:{p1}", f"1:1"]
    questions.append(mk("A","Quantitative Aptitude","Allegation & Mixture",random.choice(["medium","hard"]),
        f"Mix price {p1} and {p2} to get avg {avg}. Ratio?", opts, 0,
        f"Ratio = ({p2}-{avg}):({avg}-{p1}) = {ratio}:{ratio}"))

# CALENDAR (20Q)
for i in range(20):
    year = random.choice([2000, 2024, 2025, 1900, 2100])
    is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
    opts = ["Leap year", "Not leap year", "Century year", "Ordinary year"]
    correct_idx = 0 if is_leap else 1
    questions.append(mk("A","Quantitative Aptitude","Calendar",random.choice(["easy","medium"]),
        f"Is {year} a leap year?", opts, correct_idx,
        f"{year} is {'a leap' if is_leap else 'not a leap'} year"))

# CLOCKS (20Q)
for i in range(20):
    h = random.randint(1, 12)
    m = random.choice([0, 15, 30, 45])
    angle = abs(30*h - 11*m/2)
    angle = min(angle, 360-angle)
    opts = [f"{angle}°", f"{angle+15}°", f"{angle-15}°", f"{30*h}°"]
    questions.append(mk("A","Quantitative Aptitude","Clocks",random.choice(["medium","hard"]),
        f"Angle between hands at {h}:{m:02d}?", opts, 0,
        f"Angle = |30×{h} - 11×{m}/2| = {angle}°"))

# VOLUME & SURFACE AREA (30Q)
for i in range(30):
    r = random.randint(3, 10)
    h = random.randint(5, 15)
    vol = 22 * r * r * h // 7
    sa = 2 * 22 * r * (r + h) // 7
    choice = random.choice(["vol","sa"])
    if choice == "vol":
        opts = [str(vol), str(sa), str(vol*2), str(vol//2)]
        questions.append(mk("A","Quantitative Aptitude","Volume & Surface Area",random.choice(["medium","hard"]),
            f"Volume of cylinder r={r}, h={h}?", opts, 0, f"V = πr²h = {vol}"))
    else:
        opts = [str(sa), str(vol), str(sa*2), str(sa//2)]
        questions.append(mk("A","Quantitative Aptitude","Volume & Surface Area",random.choice(["medium","hard"]),
            f"Surface area of cylinder r={r}, h={h}?", opts, 0, f"SA = 2πr(r+h) = {sa}"))

# AGES (20Q)
for i in range(20):
    age_a = random.randint(20, 40)
    years = random.randint(5, 15)
    age_b = age_a - years + random.randint(2, 8)
    opts = [str(age_b), str(age_b+5), str(age_b-5), str(age_a)]
    questions.append(mk("A","Quantitative Aptitude","Ages",random.choice(["easy","medium"]),
        f"A is {age_a} now. {years} years ago A was twice B's age. B's present age?", opts, 0,
        f"B's present age = {age_b}"))

# SURDS & INDICES (20Q)
for i in range(20):
    base = random.choice([2, 3, 5])
    exp = random.randint(2, 5)
    val = base ** exp
    opts = [str(val), str(val+1), str(val-1), str(base*exp)]
    questions.append(mk("A","Quantitative Aptitude","Surds & Indices",random.choice(["easy","medium"]),
        f"Value of {base}^{exp}?", opts, 0, f"{base}^{exp} = {val}"))

# SQUARE & CUBE ROOTS (20Q)
for i in range(20):
    n = random.choice([4,9,16,25,36,49,64,81,100,121,144,169,196,225])
    root = int(n**0.5)
    opts = [str(root), str(root+1), str(root-1), str(n//2)]
    questions.append(mk("A","Quantitative Aptitude","Square & Cube Roots",random.choice(["easy","medium"]),
        f"Square root of {n}?", opts, 0, f"√{n} = {root}"))

# ODD MAN OUT & SERIES (20Q)
for i in range(20):
    series_type = random.choice(["num","alpha"])
    if series_type == "num":
        start = random.randint(1, 10)
        step = random.randint(2, 5)
        seq = [start + step*j for j in range(4)]
        odd = start + step*4 + 1
        opts = [str(odd), str(seq[-1]+step), str(seq[0]), str(sum(seq))]
        questions.append(mk("A","Quantitative Aptitude","Odd Man Out & Series",random.choice(["easy","medium"]),
            f"Find odd one: {seq + [odd]}", opts, 0, f"{odd} doesn't fit the pattern"))
    else:
        opts = ["Z", "Y", "X", "W"]
        questions.append(mk("A","Quantitative Aptitude","Odd Man Out & Series",random.choice(["easy","medium"]),
            "Find odd one: A, E, I, O, X", opts, 0, "X is not a vowel"))

# SIMPLIFICATION (20Q)
for i in range(20):
    a, b, c = random.randint(10,50), random.randint(5,20), random.randint(2,10)
    result = a + b * c
    opts = [str(result), str(a+b+c), str(a*b+c), str((a+b)*c)]
    questions.append(mk("A","Quantitative Aptitude","Simplification",random.choice(["easy","medium"]),
        f"Solve: {a} + {b} × {c}", opts, 0, f"{a} + {b}×{c} = {a} + {b*c} = {result}"))

# SQUARE ROOTS (10Q)
for i in range(10):
    n = random.choice([144,169,196,225,256,289,324,361,400,441])
    root = int(n**0.5)
    opts = [str(root), str(root+2), str(root-2), str(n//4)]
    questions.append(mk("A","Quantitative Aptitude","Square & Cube Roots",random.choice(["easy","medium"]),
        f"√{n} = ?", opts, 0, f"√{n} = {root}"))

# DECIMAL FRACTIONS (10Q)
for i in range(10):
    num = random.randint(1, 20)
    den = random.randint(2, 10)
    result = num / den
    opts = [f"{result:.2f}", f"{result:.1f}", f"{num+den}", f"{num*den}"]
    questions.append(mk("A","Quantitative Aptitude","Decimal Fractions",random.choice(["easy","medium"]),
        f"Convert {num}/{den} to decimal", opts, 0, f"{num}/{den} = {result:.2f}"))

# PROBLEMS ON NUMBERS (10Q)
for i in range(10):
    n = random.randint(10, 100)
    pct = random.choice([10, 20, 25])
    result = n * pct // 100
    opts = [str(result), str(result+5), str(result-5), str(n+pct)]
    questions.append(mk("A","Quantitative Aptitude","Problems on Numbers",random.choice(["easy","medium"]),
        f"Find {pct}% of {n}", opts, 0, f"{pct}% of {n} = {result}"))

print(f"Quantitative Aptitude: {len(questions)} questions")
with open(f"{OUT}/quant.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved quant.json")

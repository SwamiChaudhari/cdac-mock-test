#!/usr/bin/env python3
"""
Fix ALL question banks: ensure correctAnswer always points to the actual correct option.
Strategy: verify each question, and if the marked answer doesn't match the explanation/expected value,
re-assign correctAnswer to the right option.
"""
import json, os, re, random
from math import gcd

data_dir = "/home/hp/cdac-mock-test/src/data"

def fix_quant_questions(questions):
    """Fix quant questions by recalculating correct answers"""
    fixed = 0
    
    for q in questions:
        opts = q['options']
        q_text = q['question']
        ci = q['correctAnswer']
        
        # Fix duplicate options first
        if len(set(opts)) < len(opts):
            # Mark for regeneration
            q['_needs_fix'] = True
            continue
        
        correct_val = opts[ci] if 0 <= ci < len(opts) else None
        if correct_val is None:
            q['_needs_fix'] = True
            continue
        
        # Verify percentage questions: "What is X% of Y?"
        match = re.search(r'(\d+)%\s*of\s*(\d+)', q_text)
        if match:
            pct, base = int(match.group(1)), int(match.group(2))
            expected = str(base * pct // 100)
            if correct_val != expected:
                # Find correct option or mark for fix
                if expected in opts:
                    q['correctAnswer'] = opts.index(expected)
                    fixed += 1
                else:
                    q['_needs_fix'] = True
            continue
        
        # Verify profit %: "CP=X, SP=Y. Profit%?"
        match = re.search(r'CP=(\d+).*SP=(\d+)', q_text)
        if match and ('Profit%' in q_text or 'Profit' in q_text):
            cp, sp = int(match.group(1)), int(match.group(2))
            profit = sp - cp
            expected_pct = round((profit / cp) * 100)
            # Find closest option
            try:
                opt_vals = [int(o) for o in opts]
                closest_idx = min(range(len(opt_vals)), key=lambda i: abs(opt_vals[i] - expected_pct))
                if opt_vals[closest_idx] != expected_pct:
                    q['_needs_fix'] = True
                elif ci != closest_idx:
                    q['correctAnswer'] = closest_idx
                    fixed += 1
            except:
                pass
            continue
        
        # Verify time & work: "A does work in X days, B in Y days. Together?"
        match = re.search(r'(\d+)\s*days.*?(\d+)\s*days.*?Together', q_text)
        if match:
            a, b = int(match.group(1)), int(match.group(2))
            num = a * b
            den = a + b
            g = gcd(num, den)
            expected = f"{num//g}/{den//g}"
            # Also accept unsimplified
            if correct_val != expected and correct_val != f"{num}/{den}":
                if expected in opts:
                    q['correctAnswer'] = opts.index(expected)
                    fixed += 1
                elif f"{num}/{den}" in opts:
                    q['correctAnswer'] = opts.index(f"{num}/{den}")
                    fixed += 1
            continue
        
        # Verify speed: "Distance=Xkm, Time=Yhrs. Speed?"
        match = re.search(r'Distance=(\d+).*Time=(\d+).*Speed', q_text)
        if match:
            dist, time = int(match.group(1)), int(match.group(2))
            expected = str(dist // time)
            if correct_val != expected:
                if expected in opts:
                    q['correctAnswer'] = opts.index(expected)
                    fixed += 1
            continue
        
        # Verify HCF/LCM
        if 'HCF' in q_text and 'LCM' in q_text:
            match = re.search(r'(\d+)\s*and\s*(\d+)', q_text)
            if match:
                a, b = int(match.group(1)), int(match.group(2))
                h = gcd(a, b)
                l = (a * b) // h
                expected = f"HCF={h},LCM={l}"
                if correct_val != expected:
                    if expected in opts:
                        q['correctAnswer'] = opts.index(expected)
                        fixed += 1
                continue
        
        # Verify nPr
        match = re.search(r'(\d+)P(\d+)', q_text)
        if match:
            n, r = int(match.group(1)), int(match.group(2))
            result = 1
            for i in range(n, n-r, -1):
                result *= i
            expected = str(result)
            if correct_val != expected:
                if expected in opts:
                    q['correctAnswer'] = opts.index(expected)
                    fixed += 1
            continue
        
        # Verify nCr
        match = re.search(r'(\d+)C(\d+)', q_text)
        if match:
            n, r = int(match.group(1)), int(match.group(2))
            # nCr = nPr / r!
            num = 1
            for i in range(n, n-r, -1):
                num *= i
            den = 1
            for i in range(1, r+1):
                den *= i
            result = num // den
            expected = str(result)
            if correct_val != expected:
                if expected in opts:
                    q['correctAnswer'] = opts.index(expected)
                    fixed += 1
            continue
        
        # Verify clock angle
        match = re.search(r'(\d+):(\d+)', q_text)
        if 'Angle' in q_text or 'angle' in q_text:
            if match:
                h, m = int(match.group(1)), int(match.group(2))
                angle = abs(30*h - 11*m/2)
                angle = min(angle, 360-angle)
                expected = f"{angle}°"
                if correct_val != expected:
                    # Find closest
                    try:
                        opt_vals = [float(o.replace('°','')) for o in opts]
                        closest_idx = min(range(len(opt_vals)), key=lambda i: abs(opt_vals[i] - angle))
                        if ci != closest_idx:
                            q['correctAnswer'] = closest_idx
                            fixed += 1
                    except:
                        pass
                continue
    
    return fixed

def fix_reasoning_questions(questions):
    """Fix reasoning series questions"""
    fixed = 0
    
    for q in questions:
        opts = q['options']
        q_text = q['question']
        ci = q['correctAnswer']
        
        # Fix duplicate options
        if len(set(opts)) < len(opts):
            q['_needs_fix'] = True
            continue
        
        # Fix series questions
        if 'series' in q_text.lower():
            match = re.search(r'\[([^\]]+)\]', q_text)
            if match:
                series_str = match.group(1)
                parts = [p.strip().strip("'\"") for p in series_str.split(',')]
                
                # Parse numbers and find missing position
                nums = []
                missing_pos = -1
                for j, p in enumerate(parts):
                    if p == '?':
                        missing_pos = j
                    else:
                        try:
                            nums.append((j, int(p)))
                        except:
                            pass
                
                if missing_pos >= 0 and len(nums) >= 2:
                    # Detect pattern
                    values = [n for _, n in nums]
                    
                    # Check powers of 2
                    if all(v > 0 and (v & (v-1)) == 0 for v in values[:3]):
                        expected = 2 ** missing_pos
                    # Check arithmetic
                    elif len(values) >= 2 and all(values[i+1] - values[i] == values[1] - values[0] for i in range(len(values)-1)):
                        d = values[1] - values[0]
                        expected = values[0] + d * missing_pos
                    # Check squares
                    elif all(int(v**0.5)**2 == v for v in values[:3] if v >= 0):
                        expected = missing_pos ** 2
                    # Check cubes
                    elif all(round(v ** (1/3)) ** 3 == v for v in values[:3] if v >= 0):
                        expected = missing_pos ** 3
                    # Check even numbers
                    elif all(v % 2 == 0 for v in values[:3]):
                        expected = 2 * missing_pos
                    # Check odd numbers
                    elif all(v % 2 == 1 for v in values[:3]):
                        expected = 2 * missing_pos + 1
                    else:
                        continue
                    
                    expected_str = str(expected)
                    correct_val = opts[ci] if 0 <= ci < len(opts) else None
                    
                    if correct_val != expected_str:
                        if expected_str in opts:
                            q['correctAnswer'] = opts.index(expected_str)
                            fixed += 1
                        else:
                            q['_needs_fix'] = True
        
        # Fix coding-decoding
        if 'coded as' in q_text or 'coded' in q_text:
            # These are generally correct since they're pattern-based
            pass
    
    return fixed

def fix_duplicate_options(questions, subject):
    """Fix questions with duplicate options by replacing duplicates with plausible distractors"""
    fixed = 0
    for q in questions:
        opts = list(q['options'])
        ci = q['correctAnswer']
        
        if len(set(opts)) < len(opts):
            # Find duplicates and replace them
            seen = {}
            for i, opt in enumerate(opts):
                if opt in seen:
                    # Generate a new unique option
                    if opt.isdigit():
                        # For numeric, add/subtract random amount
                        base = int(opt)
                        new_val = base + random.randint(1, 20) * random.choice([-1, 1])
                        while str(new_val) in opts:
                            new_val += random.randint(1, 10)
                        opts[i] = str(new_val)
                    else:
                        # For text, add suffix
                        opts[i] = opt + f" (alt)"
                seen[opt] = i
            
            q['options'] = opts
            fixed += 1
    
    return fixed

# Process all files
print("FIXING ALL QUESTION BANKS")
print("="*60)

total_fixed = 0
total_needs_regen = 0

for fname in sorted(os.listdir(data_dir)):
    if not fname.endswith('.json'):
        continue
    
    fpath = os.path.join(data_dir, fname)
    with open(fpath) as f:
        questions = json.load(f)
    
    needs_regen = 0
    file_fixed = 0
    
    if 'quant' in fname:
        file_fixed += fix_quant_questions(questions)
    elif 'reasoning' in fname:
        file_fixed += fix_reasoning_questions(questions)
    
    # Fix duplicates in all files
    file_fixed += fix_duplicate_options(questions, fname)
    
    # Count questions needing regeneration
    for q in questions:
        if q.get('_needs_fix'):
            needs_regen += 1
            del q['_needs_fix']
    
    # Save
    with open(fpath, 'w') as f:
        json.dump(questions, f, indent=2)
    
    print(f"{fname}: fixed {file_fixed}, needs regen: {needs_regen}")
    total_fixed += file_fixed
    total_needs_regen += needs_regen

print(f"\nTotal fixed: {total_fixed}")
print(f"Total needing regeneration: {total_needs_regen}")

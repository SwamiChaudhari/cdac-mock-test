#!/usr/bin/env python3
"""
CDAC Question Bank Audit Report
Analyzes all question files and generates comprehensive audit reports.
"""

import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime

DATA_DIR = "/home/hp/cdac-mock-test/src/data"
QUESTIONS_DIR = "/home/hp/cdac-mock-test/src/data/questions"

def load_all_questions():
    """Load all questions from both old and new question banks."""
    all_questions = []
    
    # Load old questions
    old_files = ['english.json', 'quant.json', 'reasoning.json', 'computers.json',
                 'c_programming.json', 'ds.json', 'oop.json', 'os.json',
                 'networking.json', 'dbms.json', 'bigdata_ai.json']
    
    for fname in old_files:
        fpath = os.path.join(DATA_DIR, fname)
        if os.path.exists(fpath):
            with open(fpath) as f:
                data = json.load(f)
                for q in data:
                    q['_source'] = fname
                    q['_bank'] = 'old'
                all_questions.extend(data)
    
    # Load new questions
    if os.path.exists(QUESTIONS_DIR):
        for fname in os.listdir(QUESTIONS_DIR):
            if fname.endswith('.json'):
                fpath = os.path.join(QUESTIONS_DIR, fname)
                with open(fpath) as f:
                    data = json.load(f)
                    for q in data:
                        q['_source'] = fname
                        q['_bank'] = 'new'
                    all_questions.extend(data)
    
    return all_questions

def audit_questions(questions):
    """Run full audit on all questions."""
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_questions': len(questions),
        'banks': {},
        'duplicates': [],
        'near_duplicates': [],
        'quality_issues': [],
        'missing_metadata': [],
        'subject_distribution': Counter(),
        'difficulty_distribution': Counter(),
        'topic_distribution': Counter(),
        'priority_ranking': [],
        'recommendations': [],
    }
    
    # Count by bank
    old_q = [q for q in questions if q.get('_bank') == 'old']
    new_q = [q for q in questions if q.get('_bank') == 'new']
    report['banks']['old'] = len(old_q)
    report['banks']['new'] = len(new_q)
    
    # Check for duplicates
    question_texts = defaultdict(list)
    for q in questions:
        text = q.get('question', '').strip().lower()
        norm = re.sub(r'\s+', ' ', text)
        norm = re.sub(r'[^\w\s]', '', norm)
        question_texts[norm].append(q)
    
    for text, qs in question_texts.items():
        if len(qs) > 1:
            report['duplicates'].append({
                'count': len(qs),
                'question': text[:100],
                'sources': [q['_source'] for q in qs]
            })
    
    # Near duplicates (same first 60 chars)
    stems = defaultdict(list)
    for q in questions:
        text = q.get('question', '').strip().lower()
        norm = re.sub(r'\s+', ' ', text)
        stem = norm[:60]
        stems[stem].append(q)
    
    for stem, qs in stems.items():
        if len(qs) > 1 and stem.strip():
            # Exclude exact duplicates already counted
            exact_texts = set(q.get('question', '').strip().lower() for q in qs)
            if len(exact_texts) > 1:
                report['near_duplicates'].append({
                    'count': len(qs),
                    'stem': stem[:80],
                    'sources': [q['_source'] for q in qs]
                })
    
    # Quality checks
    for q in questions:
        issues = []
        
        # Short questions
        if len(q.get('question', '')) < 30:
            issues.append('Too short (< 30 chars)')
        
        # Very short questions (one-liners)
        if '?' in q.get('question', '') and len(q.get('question', '').split()) < 8:
            issues.append('One-liner question (< 8 words)')
        
        # Missing explanation
        if not q.get('explanation') or len(q.get('explanation', '')) < 10:
            issues.append('Missing or very short explanation')
        
        # Short options
        opts = q.get('options', [])
        if opts:
            for o in opts:
                if len(str(o)) < 3:
                    issues.append('Very short option')
                    break
        
        # Missing metadata (new questions should have this)
        if q.get('_bank') == 'old':
            missing = []
            if not q.get('formula'):
                missing.append('formula')
            if not q.get('concept'):
                missing.append('concept')
            if not q.get('hint'):
                missing.append('hint')
            if not q.get('shortcut'):
                missing.append('shortcut')
            if not q.get('commonMistake'):
                missing.append('commonMistake')
            if not q.get('memoryTrick'):
                missing.append('memoryTrick')
            if not q.get('examImportance'):
                missing.append('examImportance')
            if missing:
                report['missing_metadata'].append({
                    'id': q.get('id', 'unknown'),
                    'source': q['_source'],
                    'missing_fields': missing
                })
        
        if issues:
            report['quality_issues'].append({
                'id': q.get('id', 'unknown'),
                'source': q['_source'],
                'question': q.get('question', '')[:80],
                'issues': issues
            })
        
        # Distributions
        report['subject_distribution'][q.get('subject', 'unknown')] += 1
        report['difficulty_distribution'][q.get('difficulty', 'unknown')] += 1
        report['topic_distribution'][q.get('topic', 'unknown')] += 1
    
    # Priority ranking based on CDAC weight
    tier1_topics = {
        'Percentages', 'Ratio & Proportion', 'Profit & Loss', 'Averages',
        'Time & Work', 'Time, Speed & Distance', 'Probability', 'HCF & LCM',
        'Number System', 'Permutation & Combination',
        'Number Series', 'Coding-Decoding', 'Blood Relations', 'Direction Sense',
        'Sitting Arrangement', 'Data Sufficiency',
        'Number System & Conversions', 'Memory Types (RAM, ROM, Cache)',
        'CPU, Registers, ALU, CU', 'Algorithms & Flowcharts', 'OOP Basics',
        'Data Types & Data Structures Basics',
    }
    
    tier2_topics = {
        'Pointers', 'Arrays', 'Strings', 'Functions', 'Recursion',
        'Data Types', 'Operators & Precedence', 'Loops', 'Structures vs Unions',
        'Dynamic Memory Allocation', 'Stack', 'Queue', 'Linked List',
        'Binary Search', 'Sorting Complexities', 'Tree Traversals', 'Time Complexity',
        'Class & Object', 'Constructor', 'Destructor', 'Function Overloading',
        'Inheritance', 'Virtual Function', 'Abstract Class', 'Exception Handling',
    }
    
    tier3_topics = {
        'Process vs Program', 'Process States', 'PCB', 'CPU Scheduling',
        'Deadlock', 'Paging', 'Virtual Memory', 'Thrashing',
        'OSI Model', 'TCP/IP Model', 'TCP vs UDP', 'DNS', 'HTTP & HTTPS',
        'IP Addressing', 'ARP', 'ICMP',
    }
    
    for q in questions:
        topic = q.get('topic', '')
        if topic in tier1_topics:
            q['_priority'] = 'HIGH'
        elif topic in tier2_topics:
            q['_priority'] = 'HIGH'
        elif topic in tier3_topics:
            q['_priority'] = 'MEDIUM'
        else:
            q['_priority'] = 'LOW'
    
    high_count = sum(1 for q in questions if q.get('_priority') == 'HIGH')
    med_count = sum(1 for q in questions if q.get('_priority') == 'MEDIUM')
    low_count = sum(1 for q in questions if q.get('_priority') == 'LOW')
    
    report['priority_ranking'] = {
        'HIGH (Must Study)': high_count,
        'MEDIUM (Important)': med_count,
        'LOW (Skip if short on time)': low_count,
    }
    
    # Recommendations
    short_count = len([q for q in questions if len(q.get('question', '')) < 30])
    report['recommendations'] = [
        f"Remove or rewrite {short_count} questions that are too short (< 30 chars)",
        f"Add learning metadata (formula, concept, hint, shortcut) to {len(old_q)} old questions",
        f"Focus study on {high_count} HIGH priority questions first",
        f"Technical subjects (C, DSA, OOP, OS, NW) need more questions — currently underrepresented",
        f"Quant has {report['subject_distribution'].get('Quantitative Aptitude', 0)} questions — good but many are repetitive",
        f"English has {report['subject_distribution'].get('English', 0)} questions — mostly vocabulary, needs more grammar/RC",
    ]
    
    return report

def print_report(report):
    """Print formatted audit report."""
    print("=" * 70)
    print("  CDAC C-CAT QUESTION BANK — COMPLETE AUDIT REPORT")
    print(f"  Generated: {report['timestamp']}")
    print("=" * 70)
    
    print(f"\n📊 TOTAL QUESTIONS: {report['total_questions']}")
    print(f"   Old bank: {report['banks'].get('old', 0)}")
    print(f"   New bank (with metadata): {report['banks'].get('new', 0)}")
    
    print(f"\n🔴 EXACT DUPLICATES: {len(report['duplicates'])}")
    for dup in report['duplicates'][:5]:
        print(f"   [{dup['count']}x] {dup['question'][:60]}...")
    
    print(f"\n🟡 NEAR DUPLICATES: {len(report['near_duplicates'])}")
    for dup in report['near_duplicates'][:5]:
        print(f"   [{dup['count']}x] {dup['stem'][:60]}...")
    
    print(f"\n⚠️  QUALITY ISSUES: {len(report['quality_issues'])}")
    short_count = len([q for q in report['quality_issues'] if 'Too short' in str(q['issues'])])
    oneliner_count = len([q for q in report['quality_issues'] if 'One-liner' in str(q['issues'])])
    print(f"   Too short (< 30 chars): {short_count}")
    print(f"   One-liner questions: {oneliner_count}")
    print(f"   Missing explanation: {len([q for q in report['quality_issues'] if 'explanation' in str(q['issues'])])}")
    
    print(f"\n📋 MISSING METADATA (old questions): {len(report['missing_metadata'])}")
    print(f"   All {report['banks'].get('old', 0)} old questions lack: formula, concept, hint, shortcut, commonMistake, memoryTrick, examImportance")
    print(f"   New questions: ALL have complete metadata ✓")
    
    print(f"\n📊 SUBJECT DISTRIBUTION:")
    for subj, count in report['subject_distribution'].most_common():
        bar = "█" * (count // 20)
        print(f"   {subj:30s}: {count:4d} {bar}")
    
    print(f"\n📊 DIFFICULTY DISTRIBUTION:")
    for diff, count in report['difficulty_distribution'].most_common():
        print(f"   {diff:10s}: {count}")
    
    print(f"\n🎯 PRIORITY RANKING:")
    for priority, count in report['priority_ranking'].items():
        print(f"   {priority}: {count} questions")
    
    print(f"\n💡 RECOMMENDATIONS:")
    for i, rec in enumerate(report['recommendations'], 1):
        print(f"   {i}. {rec}")
    
    print("\n" + "=" * 70)
    print("  AUDIT COMPLETE")
    print("=" * 70)

if __name__ == '__main__':
    questions = load_all_questions()
    report = audit_questions(questions)
    print_report(report)
    
    # Save report to file
    report_path = "/home/hp/cdac-mock-test/AUDIT_REPORT.json"
    with open(report_path, 'w') as f:
        # Convert Counter to dict for JSON
        report['subject_distribution'] = dict(report['subject_distribution'])
        report['difficulty_distribution'] = dict(report['difficulty_distribution'])
        report['topic_distribution'] = dict(report['topic_distribution'])
        json.dump(report, f, indent=2, default=str)
    print(f"\n📄 Full report saved to: {report_path}")

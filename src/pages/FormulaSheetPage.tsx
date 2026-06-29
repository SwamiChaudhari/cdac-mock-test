import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Formula {
  topic: string
  subject: string
  formula: string
  example: string
  memoryTrick?: string
}

const FORMULAS: Formula[] = [
  // Quantitative Aptitude
  { topic: "Percentages", subject: "Quant", formula: "% = (Part / Whole) × 100", example: "50 out of 200 = (50/200)×100 = 25%", memoryTrick: "Part over Whole, times 100" },
  { topic: "Successive %", subject: "Quant", formula: "Net% = a + b + ab/100", example: "10% then 20% increase = 10+20+200/100 = 32%", memoryTrick: "ABCD: Always Both Combine Directly" },
  { topic: "Same % up/down", subject: "Quant", formula: "Net loss% = p²/100", example: "20% up then 20% down = -400/100 = 4% loss", memoryTrick: "Same % up then down = ALWAYS a loss" },
  { topic: "Profit & Loss", subject: "Quant", formula: "P% = (SP-CP)/CP × 100", example: "CP=100, SP=120 → P% = 20/100×100 = 20%", memoryTrick: "Profit% is ALWAYS on CP, not SP" },
  { topic: "SP with markup & discount", subject: "Quant", formula: "SP = MP×(1-D%) where MP = CP×(1+M%)", example: "CP=100, M=40%, D=20% → MP=140, SP=112", memoryTrick: "Markup builds up, discount knocks down" },
  { topic: "Average", subject: "Quant", formula: "Average = Sum / n", example: "10,20,30,40 → Avg = 100/4 = 25", memoryTrick: "Sum divided by count" },
  { topic: "Average Speed", subject: "Quant", formula: "Avg Speed = 2v₁v₂/(v₁+v₂) [equal distance]", example: "40 km/h and 60 km/h → 2×40×60/100 = 48 km/h", memoryTrick: "NOT (v1+v2)/2! Use harmonic mean." },
  { topic: "Time & Work", subject: "Quant", formula: "Combined days = AB/(A+B)", example: "A=10 days, B=15 days → 150/25 = 6 days", memoryTrick: "Product over Sum" },
  { topic: "Pipes & Cisterns", subject: "Quant", formula: "Net rate = Fill rate - Empty rate", example: "Fill=1/12, Empty=1/10 → Net = 1/12-1/10 = -1/60 (empties)", memoryTrick: "Fill = positive, Empty = negative" },
  { topic: "TSD", subject: "Quant", formula: "Speed = Distance / Time", example: "360 km in 6 hrs = 60 km/h", memoryTrick: "D/S/T triangle" },
  { topic: "Trains", subject: "Quant", formula: "Time = (Train length + Platform length) / Speed", example: "200m train + 300m platform at 72 km/h = 500/20 = 25 sec", memoryTrick: "Total distance = train + object being crossed" },
  { topic: "Boats & Streams", subject: "Quant", formula: "Man = (Down+Up)/2, Stream = (Down-Up)/2", example: "Down=12, Up=8 → Man=10, Stream=2", memoryTrick: "Average the two for man, half difference for stream" },
  { topic: "Probability", subject: "Quant", formula: "P(E) = Favorable / Total", example: "Head on coin = 1/2", memoryTrick: "Good outcomes over all outcomes" },
  { topic: "P&C", subject: "Quant", formula: "nPr = n!/(n-r)!, nCr = n!/[r!(n-r)!]", example: "5P2 = 20, 5C2 = 10", memoryTrick: "Permutation = order matters. Combination = order doesn't." },
  { topic: "HCF & LCM", subject: "Quant", formula: "HCF × LCM = Product of two numbers", example: "12 and 18: HCF=6, LCM=36, 6×36=216=12×18", memoryTrick: "HCF times LCM = Product" },
  { topic: "CI", subject: "Quant", formula: "A = P(1 + R/100)^T, CI = A - P", example: "P=1000, R=10%, T=2 → A=1210, CI=210", memoryTrick: "Compound = Compound growth" },
  { topic: "Clock Angle", subject: "Quant", formula: "Angle = |30H - 11M/2|", example: "3:15 → |90-82.5| = 7.5°", memoryTrick: "30 per hour hand, 5.5 per minute relative" },
  { topic: "Leap Year", subject: "Quant", formula: "Divisible by 4 (century: by 400)", example: "2000=Leap, 1900=Not Leap, 2024=Leap", memoryTrick: "4 yes, 100 no, 400 yes" },
  { topic: "Ratio", subject: "Quant", formula: "Combined ratio: make common term equal using LCM", example: "A:B=3:4, B:C=6:5 → A:B:C=9:12:10", memoryTrick: "Bridge the common term with LCM" },
  { topic: "Partnership", subject: "Quant", formula: "Profit ratio = Capital × Time", example: "A: 10000×12=120K, B: 20000×6=120K → 1:1", memoryTrick: "Money × Months = Share" },
  { topic: "Volume: Cube", subject: "Quant", formula: "V = a³, SA = 6a²", example: "Side=3 → V=27, SA=54", memoryTrick: "Cube: 6 faces, 8 vertices, 12 edges" },
  { topic: "Volume: Cylinder", subject: "Quant", formula: "V = πr²h, SA = 2πr(r+h)", example: "r=3,h=5 → V=45π, SA=48π", memoryTrick: "Cylinder = circle area × height" },
  { topic: "Volume: Sphere", subject: "Quant", formula: "V = 4/3 πr³, SA = 4πr²", example: "r=3 → V=36π, SA=36π", memoryTrick: "Sphere: 4/3 for volume, 4 for surface" },

  // Computer Fundamentals
  { topic: "Binary to Decimal", subject: "CompFund", formula: "Sum of (digit × 2^position) from right", example: "1011 = 8+0+2+1 = 11", memoryTrick: "Positions: 8,4,2,1" },
  { topic: "Decimal to Binary", subject: "CompFund", formula: "Repeated division by 2, read remainders bottom-up", example: "13 → 13/2=6R1, 6/2=3R0, 3/2=1R1, 1/2=0R1 → 1101", memoryTrick: "Divide by 2, collect remainders backwards" },
  { topic: "Binary to Octal", subject: "CompFund", formula: "Group binary digits in 3s from right", example: "101101 → 101 101 → 55", memoryTrick: "3 bits = 1 octal digit" },
  { topic: "Binary to Hex", subject: "CompFund", formula: "Group binary digits in 4s from right", example: "11011110 → 1101 1110 → DE", memoryTrick: "4 bits = 1 hex digit" },
  { topic: "1s Complement", subject: "CompFund", formula: "Flip all bits (0→1, 1→0)", example: "1011 → 0100", memoryTrick: "Just flip every bit" },
  { topic: "2s Complement", subject: "CompFund", formula: "1s complement + 1", example: "1011 → 0100+1 = 0101", memoryTrick: "Flip bits, then add 1" },

  // OS
  { topic: "CPU Scheduling: FCFS", subject: "OS", formula: "WT = Sum of burst times of previous processes", example: "P1=6,P2=8,P3=7 → WT: 0,6,14", memoryTrick: "FCFS = First Come, First Served" },
  { topic: "Turnaround Time", subject: "OS", formula: "TAT = Completion - Arrival = WT + Burst", example: "Arrival=0, Burst=6, Completion=6 → TAT=6", memoryTrick: "Total time from arrival to completion" },
  { topic: "Paging", subject: "OS", formula: "Offset bits = log₂(Page size)", example: "4KB page = 2^12 → 12 offset bits", memoryTrick: "Page size exponent = offset bits" },
  { topic: "Page Fault Rate", subject: "OS", formula: "Effective Access Time = (1-p)×memory + p×page_fault_time", example: "p=0.1, mem=100ns, fault=10ms → 0.9×100+0.1×10M ≈ 1ms", memoryTrick: "Faults are expensive!" },

  // Networking
  { topic: "OSI Layers", subject: "Networking", formula: "7 layers: App-Pres-Session-Transport-Network-DataLink-Physical", example: "Mnemonic: 'All People Seem To Need Data Processing'", memoryTrick: "Top to bottom: A-P-S-T-N-D-P" },
  { topic: "Bandwidth", subject: "Networking", formula: "Bandwidth = Data / Time", example: "100 MB in 10 sec = 10 MB/s", memoryTrick: "Data pipe capacity" },
  { topic: "Subnet Hosts", subject: "Networking", formula: "Hosts = 2^(host_bits) - 2", example: "/26 → 2^6-2 = 62 hosts", memoryTrick: "Subtract 2 for network and broadcast" },
]

export default function FormulaSheetPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  const subjects = ['all', ...Array.from(new Set(FORMULAS.map(f => f.subject)))]

  const filtered = FORMULAS.filter(f => {
    const matchesSearch = search === '' ||
      f.topic.toLowerCase().includes(search.toLowerCase()) ||
      f.formula.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || f.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">📐 Formula Sheet</h1>
            <p className="text-xs text-gray-400">Quick reference for CDAC C-CAT</p>
          </div>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search formulas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-2 flex-wrap">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  selectedSubject === s
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Formula Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-purple-400">{f.subject}</span>
                <span className="text-[10px] text-gray-500">{f.topic}</span>
              </div>
              <p className="text-sm font-mono text-white bg-black/20 px-3 py-2 rounded mb-2">{f.formula}</p>
              <p className="text-[11px] text-gray-400">e.g., {f.example}</p>
              {f.memoryTrick && (
                <p className="text-[10px] text-yellow-400 mt-1">🧠 {f.memoryTrick}</p>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No formulas found for "{search}"</p>
          </div>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">
          {filtered.length} formulas • Last updated: June 2026
        </p>
      </div>
    </div>
  )
}

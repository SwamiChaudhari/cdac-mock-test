#!/usr/bin/env python3
"""Generate Networking questions - 500 questions"""
import json, random, os
random.seed(49)
OUT = "/home/hp/cdac-mock-test/src/data"
counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"
def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]; random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []
nw_topics = [
    ("OSI Model", [
        ("OSI has ? layers", "7", ["5", "4", "6"]),
        ("Physical layer deals with?", "Bits", ["Frames", "Packets", "Segments"]),
        ("Data link layer deals with?", "Frames", ["Bits", "Packets", "Segments"]),
        ("Network layer deals with?", "Packets", ["Bits", "Frames", "Segments"]),
        ("Transport layer deals with?", "Segments", ["Bits", "Frames", "Packets"]),
        ("Session layer manages?", "Sessions", ["Bits", "Frames", "Packets"]),
        ("Presentation layer does?", "Encryption", ["Routing", "Framing", "Bits"]),
        ("Application layer provides?", "User interface", ["Routing", "Framing", "Bits"]),
        ("Layer 1 is?", "Physical", ["Data link", "Network", "Transport"]),
        ("Layer 4 is?", "Transport", ["Physical", "Network", "Session"]),
    ]),
    ("TCP/IP Model", [
        ("TCP/IP has ? layers", "4", ["5", "7", "6"]),
        ("Network access layer is also called?", "Link layer", ["Physical", "Data link", "Internet"]),
        ("Internet layer protocol?", "IP", ["TCP", "UDP", "HTTP"]),
        ("Transport layer protocols?", "TCP and UDP", ["IP", "HTTP", "FTP"]),
        ("Application layer includes?", "HTTP FTP DNS", ["TCP", "IP", "ARP"]),
    ]),
    ("IP", [
        ("IPv4 address size?", "32 bits", ["16 bits", "64 bits", "128 bits"]),
        ("IPv6 address size?", "128 bits", ["32 bits", "64 bits", "256 bits"]),
        ("IP address class A range?", "1-126", ["128-191", "192-223", "224-239"]),
        ("IP address class B range?", "128-191", ["1-126", "192-223", "224-239"]),
        ("IP address class C range?", "192-223", ["1-126", "128-191", "224-239"]),
        ("Loopback address?", "127.0.0.1", ["192.168.1.1", "10.0.0.1", "172.16.0.1"]),
        ("Private IP 10.x.x.x is class?", "A", ["B", "C", "D"]),
        ("Private IP 192.168.x.x is class?", "C", ["A", "B", "D"]),
        ("Subnet mask for class C?", "255.255.255.0", ["255.0.0.0", "255.255.0.0", "255.255.255.255"]),
        ("Default gateway is?", "Router address", ["DNS", "IP", "MAC"]),
    ]),
    ("TCP", [
        ("TCP is?", "Connection-oriented", ["Connectionless", "Both", "Neither"]),
        ("TCP guarantees?", "Delivery", ["Speed", "No order", "Nothing"]),
        ("TCP uses?", "3-way handshake", ["2-way", "4-way", "1-way"]),
        ("TCP port number range?", "0-65535", ["0-255", "0-1024", "0-1000"]),
        ("HTTP uses port?", "80", ["21", "25", "53"]),
        ("HTTPS uses port?", "443", ["80", "21", "25"]),
        ("FTP uses port?", "21", ["80", "25", "53"]),
        ("SMTP uses port?", "25", ["80", "21", "53"]),
        ("DNS uses port?", "53", ["80", "21", "25"]),
        ("SSH uses port?", "22", ["80", "21", "25"]),
    ]),
    ("UDP", [
        ("UDP is?", "Connectionless", ["Connection-oriented", "Both", "Neither"]),
        ("UDP is ? than TCP", "Faster", ["Slower", "Same", "Reliable"]),
        ("UDP does not guarantee?", "Delivery", ["Speed", "Port", "Address"]),
        ("DNS uses?", "UDP", ["TCP", "Both", "Neither"]),
        ("DHCP uses?", "UDP", ["TCP", "Both", "Neither"]),
        ("Video streaming uses?", "UDP", ["TCP", "Both", "Neither"]),
    ]),
    ("ARP", [
        ("ARP stands for?", "Address Resolution Protocol", ["Address Routing", "Advanced Routing", "Address Register"]),
        ("ARP maps?", "IP to MAC", ["MAC to IP", "IP to Port", "Port to IP"]),
        ("ARP request is?", "Broadcast", ["Unicast", "Multicast", "Anycast"]),
        ("ARP reply is?", "Unicast", ["Broadcast", "Multicast", "Anycast"]),
        ("RARP stands for?", "Reverse ARP", ["Routing ARP", "Remote ARP", "Random ARP"]),
    ]),
    ("ICMP", [
        ("ICMP stands for?", "Internet Control Message Protocol", ["Internet Connection", "Internal Control", "Internet Control"]),
        ("Ping uses?", "ICMP", ["TCP", "UDP", "ARP"]),
        ("ICMP is used for?", "Error reporting", ["Data transfer", "Routing", "Addressing"]),
        ("Traceroute uses?", "ICMP", ["TCP", "UDP", "ARP"]),
    ]),
    ("DNS", [
        ("DNS stands for?", "Domain Name System", ["Domain Name Server", "Data Network", "Digital Name"]),
        ("DNS maps?", "Domain to IP", ["IP to MAC", "IP to Port", "Port to IP"]),
        ("DNS uses port?", "53", ["80", "21", "25"]),
        ("DNS uses protocol?", "UDP", ["TCP", "Both", "Neither"]),
        ("Root DNS servers count?", "13", ["10", "15", "20"]),
    ]),
    ("HTTP", [
        ("HTTP stands for?", "HyperText Transfer Protocol", ["HyperText Transfer Program", "High Transfer", "Hyper Transfer"]),
        ("HTTP is ? protocol", "Stateless", ["Stateful", "Connected", "Session"]),
        ("HTTP GET is used for?", "Retrieving data", ["Sending", "Deleting", "Updating"]),
        ("HTTP POST is used for?", "Sending data", ["Retrieving", "Deleting", "Updating"]),
        ("HTTP status 200 means?", "OK", ["Not Found", "Error", "Redirect"]),
        ("HTTP status 404 means?", "Not Found", ["OK", "Error", "Redirect"]),
        ("HTTP status 500 means?", "Server Error", ["OK", "Not Found", "Redirect"]),
        ("HTTP status 301 means?", "Redirect", ["OK", "Not Found", "Error"]),
    ]),
    ("FTP", [
        ("FTP stands for?", "File Transfer Protocol", ["File Transfer Program", "Fast Transfer", "File Transport"]),
        ("FTP uses port?", "21", ["80", "25", "53"]),
        ("FTP control port?", "21", ["20", "22", "80"]),
        ("FTP data port?", "20", ["21", "22", "80"]),
        ("SFTP stands for?", "SSH File Transfer Protocol", ["Secure FTP", "Simple FTP", "Standard FTP"]),
    ]),
    ("IP Addressing", [
        ("Subnet mask is used for?", "Network identification", ["Host identification", "Port", "Protocol"]),
        ("CIDR notation /24 means?", "255.255.255.0", ["255.0.0.0", "255.255.0.0", "255.255.255.255"]),
        ("CIDR /16 means?", "255.255.0.0", ["255.0.0.0", "255.255.255.0", "255.255.255.255"]),
        ("CIDR /8 means?", "255.0.0.0", ["255.255.0.0", "255.255.255.0", "255.255.255.255"]),
        ("Broadcast address has all host bits?", "1", ["0", "Alternating", "Random"]),
        ("Network address has all host bits?", "0", ["1", "Alternating", "Random"]),
    ]),
    ("Client-Server Computing", [
        ("Client-server model has?", "Client requests server", ["Server requests client", "Peer to peer", "None"]),
        ("Web browser is?", "Client", ["Server", "Both", "Neither"]),
        ("Web server software?", "Apache", ["Chrome", "Firefox", "Safari"]),
        ("Three-tier architecture has?", "3 layers", ["2", "4", "1"]),
    ]),
    ("Cloud Computing", [
        ("SaaS stands for?", "Software as a Service", ["Service as", "System as", "Storage as"]),
        ("PaaS stands for?", "Platform as a Service", ["Program as", "Process as", "Platform and"]),
        ("IaaS stands for?", "Infrastructure as a Service", ["Internet as", "Internal as", "Information as"]),
        ("Public cloud is?", "Shared", ["Private", "Hybrid", "Community"]),
        ("Private cloud is?", "Dedicated", ["Shared", "Hybrid", "Public"]),
        ("Hybrid cloud combines?", "Public and private", ["Only public", "Only private", "Community"]),
    ]),
]

for topic_name, q_list in nw_topics:
    for q_text, correct, wrong in q_list:
        if isinstance(correct, list):
            opts = correct; correct_idx = wrong
        else:
            opts = [correct] + wrong; correct_idx = 0
        questions.append(mk("B","Networking",topic_name,random.choice(["easy","medium","hard"]),
            q_text, opts, correct_idx, f"Answer: {opts[correct_idx]}"))

# Fill remaining to reach 500
fill_topics = [t[0] for t in nw_topics]
nw_fillers = [
    ("Router operates at?", "Network layer", ["Physical", "Data link", "Transport"]),
    ("Switch operates at?", "Data link layer", ["Physical", "Network", "Transport"]),
    ("Hub operates at?", "Physical layer", ["Data link", "Network", "Transport"]),
    ("Bridge connects?", "Two LANs", ["Two WANs", "LAN and WAN", "Computers"]),
    ("Gateway connects?", "Different protocols", ["Same protocol", "Same LAN", "Same WAN"]),
    ("MAC address size?", "48 bits", ["32 bits", "64 bits", "128 bits"]),
    ("MAC address is also called?", "Physical address", ["Logical", "IP", "Port"]),
    ("Bandwidth is?", "Data rate", ["Delay", "Error", "Distance"]),
    ("Latency is?", "Delay", ["Bandwidth", "Error", "Speed"]),
    ("Throughput is?", "Actual data rate", ["Maximum", "Minimum", "Average"]),
]

for i in range(500 - len(questions)):
    q_text, correct, wrong = random.choice(nw_fillers)
    opts = [correct] + wrong
    questions.append(mk("B","Networking",random.choice(fill_topics),random.choice(["easy","medium","hard"]),
        q_text, opts, 0, f"Answer: {correct}"))

print(f"Networking: {len(questions)} questions")
with open(f"{OUT}/networking.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved networking.json")

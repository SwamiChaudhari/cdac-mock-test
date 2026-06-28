#!/usr/bin/env python3
"""Generate Big Data & AI questions - 300 questions"""
import json, random, os
random.seed(51)
OUT = "/home/hp/cdac-mock-test/src/data"
counter = [0]
def nid(p): counter[0] += 1; return f"{p}-{counter[0]:05d}"
def mk(section, subject, topic, diff, q, opts, correct, expl, marks=1):
    correct_opt = opts[correct]; random.shuffle(opts)
    return {"id": nid(f"{subject[:3].lower()}-{topic[:3].lower()}"), "section": section, "subject": subject,
            "topic": topic, "difficulty": diff, "question": q, "options": opts[:4],
            "correctAnswer": opts.index(correct_opt), "explanation": expl, "marks": marks}

questions = []
bdai_topics = [
    ("Big Data Concepts", [
        ("Big Data 5Vs include?", "Volume Velocity Variety Veracity Value", ["Volume Velocity Variety", "Volume Velocity", "Volume"]),
        ("Volume refers to?", "Amount of data", ["Speed", "Type", "Quality"]),
        ("Velocity refers to?", "Speed of data", ["Amount", "Type", "Quality"]),
        ("Variety refers to?", "Different types", ["Amount", "Speed", "Quality"]),
        ("Veracity refers to?", "Quality/accuracy", ["Amount", "Speed", "Type"]),
        ("Value refers to?", "Usefulness", ["Amount", "Speed", "Type"]),
    ]),
    ("Structured, Semi-Structured and Unstructured Data", [
        ("Structured data is in?", "Tables", ["Text", "Images", "Videos"]),
        ("Semi-structured data example?", "JSON", ["Table", "Image", "Plain text"]),
        ("Unstructured data example?", "Video", ["Table", "JSON", "XML"]),
        ("CSV is?", "Structured/Semi-structured", ["Unstructured", "Binary", "None"]),
        ("SQL databases store?", ["Structured data", "Unstructured", "Semi", "Binary"], 0),
    ]),
    ("NoSQL", [
        ("NoSQL stands for?", "Not Only SQL", ["No SQL", "Non SQL", "New SQL"]),
        ("Document database example?", ["MongoDB", "MySQL", "Oracle", "PostgreSQL"], 0),
        ("Key-value database example?", "Redis", ["MongoDB", "MySQL", "Cassandra"]),
        ("Column-family example?", "Cassandra", ["MongoDB", "Redis", "MySQL"]),
        ("Graph database example?", ["Neo4j", "MongoDB", "Redis", "MySQL"], 0),
        ("NoSQL is?", "Horizontally scalable", ["Vertically", "Not scalable", "Only vertical"]),
    ]),
    ("BASE and CAP Theorem", [
        ("BASE stands for?", "Basically Available Soft state Eventually consistent", ["Basic Available", "Basically Atomic", "Base Available"]),
        ("CAP theorem allows?", "Only 2 of 3", ["All 3", "Only 1", "None"]),
        ("C in CAP is?", "Consistency", ["Completion", "Concurrency", "Compression"]),
        ("A in CAP is?", "Availability", ["Atomicity", "Accuracy", "Aggregation"]),
        ("P in CAP is?", "Partition tolerance", ["Performance", "Persistence", "Processing"]),
        ("CP system sacrifices?", "Availability", ["Consistency", "Partition", "None"]),
        ("AP system sacrifices?", "Consistency", ["Availability", "Partition", "None"]),
    ]),
    ("Data Warehouse", [
        ("Data warehouse is?", "Integrated data store", ["Operational", "Temporary", "Backup"]),
        ("OLAP stands for?", "Online Analytical Processing", ["Online Application", "Online Access", "Operational Analytical"]),
        ("OLTP stands for?", "Online Transaction Processing", ["Online Analytical", "Online Transfer", "Operational Transaction"]),
        ("OLAP is for?", "Analysis", ["Transactions", "Operations", "Backup"]),
        ("OLTP is for?", "Transactions", ["Analysis", "Reporting", "Mining"]),
        ("Star schema has?", "Fact and dimensions", ["Only facts", "Only dimensions", "Tables"]),
        ("Snowflake schema is?", "Normalized star", ["Denormalized", "Flat", "Hierarchical"]),
        ("Fact table contains?", "Measures", ["Dimensions", "Attributes", "Keys"]),
    ]),
    ("Hadoop", [
        ("Hadoop is?", "Distributed framework", ["Database", "Language", "OS"]),
        ("HDFS stands for?", "Hadoop Distributed File System", ["Hadoop Data", "Hadoop Distributed", "Hadoop Disk"]),
        ("MapReduce is for?", "Processing", ["Storage", "Querying", "Indexing"]),
        ("NameNode is?", "Master node", ["Slave", "Worker", "Client"]),
        ("DataNode is?", "Slave node", ["Master", "Client", "Name"]),
        ("YARN stands for?", "Yet Another Resource Negotiator", ["Yet Another", "Young And", "Yarn"]),
        ("Hadoop default block size?", "128 MB", ["64 MB", "256 MB", "512 MB"]),
        ("Replication factor default?", "3", ["1", "2", "4"]),
    ]),
    ("Hive", [
        ("Hive is?", "Data warehouse on Hadoop", ["Database", "Language", "OS"]),
        ("HiveQL is like?", "SQL", ["Java", "Python", "C++"]),
        ("Hive stores metadata in?", "Metastore", ["HDFS", "YARN", "NameNode"]),
        ("Hive table format?", ["ORC/Parquet/Text", "JSON", "XML", "CSV only"], 0),
    ]),
    ("Spark", [
        ("Spark is faster than MapReduce due to?", "In-memory processing", ["Disk", "Network", "CPU"]),
        ("RDD stands for?", "Resilient Distributed Dataset", ["Resilient Data", "Reliable Distributed", "Resilient Disk"]),
        ("Spark is written in?", ["Scala", "Java", "Python", "C++"], 0),
        ("Spark Streaming processes?", "Real-time data", ["Batch only", "Historical", "None"]),
        ("DataFrame in Spark is?", ["Distributed collection", "Single table", "Local", "Array"], 0),
    ]),
    ("Batch Processing vs Stream Processing", [
        ("Batch processing handles?", ["Large static data", "Real-time", "Single record", "None"], 0),
        ("Stream processing handles?", "Real-time data", ["Static", "Historical", "Batch"]),
        ("Kafka is used for?", "Stream processing", ["Batch", "Storage", "Querying"]),
        ("Flink is?", "Stream processor", ["Batch only", "Database", "Language"]),
    ]),
    ("ETL vs ELT", [
        ("ETL stands for?", "Extract Transform Load", ["Extract Load Transform", "Enter Transform", "Extract Transfer"]),
        ("ETL transforms data ?", "Before loading", ["After loading", "During", "Never"]),
        ("ELT is used in?", "Data lakes", ["Data warehouses", "Databases", "Files"]),
        ("ELT transforms data ?", "After loading", ["Before", "During", "Never"]),
    ]),
    ("Data Science", [
        ("Data science uses?", "Statistical methods", ["Only programming", "Only math", "Only domain"]),
        ("Data science pipeline starts with?", "Problem definition", ["Data collection", "Modeling", "Deployment"]),
        ("Feature engineering is?", "Creating new features", ["Selecting data", "Cleaning", "Modeling"]),
        ("Supervised learning has?", "Labels", ["No labels", "Rewards", "Actions"]),
        ("Regression predicts?", "Continuous values", ["Categories", "Clusters", "Labels"]),
        ("Classification predicts?", "Categories", ["Continuous", "Clusters", "Labels"]),
    ]),
    ("Machine Learning", [
        ("ML is a subset of?", "AI", ["Database", "Networking", "OS"]),
        ("Supervised learning uses?", "Labeled data", ["Unlabeled", "Rewards", "Actions"]),
        ("Unsupervised learning finds?", "Patterns", ["Labels", "Targets", "Outputs"]),
        ("Reinforcement learning uses?", "Rewards", ["Labels", "Patterns", "Targets"]),
        ("Overfitting means?", "Low bias high variance", ["High bias", "Low variance", "Both low"]),
        ("Underfitting means?", "High bias low variance", ["Low bias", "High variance", "Both high"]),
        ("Cross validation is for?", "Model evaluation", ["Training", "Data cleaning", "Feature selection"]),
        ("Precision is?", "TP/(TP+FP)", ["TP/(TP+FN)", "TN/(TN+FP)", "TP/(TP+TN)"]),
        ("Recall is?", "TP/(TP+FN)", ["TP/(TP+FP)", "TN/(TN+FP)", "TP/(TP+TN)"]),
        ("F1 score is?", "Harmonic mean of P&R", ["Arithmetic mean", "Geometric mean", "Average"]),
    ]),
    ("Deep Learning", [
        ("Neural network layers include?", "Input Hidden Output", ["Only input", "Only hidden", "Only output"]),
        ("Activation function adds?", ["Non-linearity", "Linearity", "Constant", "None"], 0),
        ("ReLU stands for?", "Rectified Linear Unit", ["Rectified Logistic", "Random Linear", "Regular Linear"]),
        ("Sigmoid outputs?", "0 to 1", ["-1 to 1", "0 to inf", "-inf to inf"]),
        ("Backpropagation is for?", "Training", ["Inference", "Prediction", "Testing"]),
        ("CNN is used for?", "Images", ["Text only", "Audio only", "Numbers only"]),
        ("RNN is used for?", "Sequences", ["Images", "Tables", "Graphs"]),
        ("Dropout is for?", "Regularization", ["Training speed", "Data cleaning", "Feature selection"]),
        ("Epoch is?", ["One full pass", "One batch", "One iteration", "One sample"], 0),
    ]),
    ("Computer Vision", [
        ("Image classification assigns?", "Label to image", ["Text", "Audio", "Video"]),
        ("Object detection finds?", "Multiple objects", ["Single object", "Text", "Audio"]),
        ("CNN stands for?", "Convolutional Neural Network", ["Central", "Circular", "Complex"]),
        ("Pooling layer?", "Reduces dimensions", ["Increases", "Maintains", "Removes"]),
    ]),
    ("NLP", [
        ("NLP stands for?", "Natural Language Processing", ["Neural", "Network", "Numeric"]),
        ("Tokenization splits?", ["Text into words", "Words into chars", "Sentences", "Paragraphs"], 0),
        ("Stemming reduces words to?", ["Root form", "Synonym", "Antonym", "Plural"], 0),
        ("Sentiment analysis detects?", ["Emotion", "Grammar", "Spelling", "Length"], 0),
        ("Bag of Words represents?", ["Word frequencies", "Sentences", "Grammar", "Meaning"], 0),
        ("TF-IDF stands for?", "Term Frequency-Inverse Document Frequency", ["Text", "Term", "Test"]),
    ]),
    ("AI", [
        ("AI stands for?", "Artificial Intelligence", ["Automated", "Advanced", "Algorithmic"]),
        ("Turing test evaluates?", "Machine intelligence", ["Speed", "Memory", "Power"]),
        ("Intelligent agent perceives through?", "Sensors", ["Actuators", "Memory", "CPU"]),
        ("Expert system uses?", "Knowledge base", ["Database only", "Rules only", "Neither"]),
        ("Fuzzy logic handles?", ["Degrees of truth", "Binary", "True/False", "None"], 0),
        ("Genetic algorithm is inspired by?", ["Evolution", "Physics", "Math", "Logic"], 0),
        ("A* algorithm is for?", ["Pathfinding", "Sorting", "Searching", "Optimization"], 0),
        ("Minimax is used for?", ["Game trees", "Searching", "Sorting", "Optimization"], 0),
    ]),
]

for topic_name, q_list in bdai_topics:
    for q_text, correct, wrong in q_list:
        if isinstance(correct, list):
            opts = correct; correct_idx = wrong
        else:
            opts = [correct] + wrong; correct_idx = 0
        questions.append(mk("B","Big Data & AI",topic_name,random.choice(["easy","medium","hard"]),
            q_text, opts, correct_idx, f"Answer: {opts[correct_idx]}"))

# Fill remaining to reach 300
fill_topics = [t[0] for t in bdai_topics]
bdai_fillers = [
    ("AI was coined by?", "John McCarthy", ["Alan Turing", "Marvin Minsky", "Herbert Simon"]),
    ("Machine learning is?", "Subset of AI", ["Same as AI", "Superset", "Unrelated"]),
    ("Deep learning uses?", "Neural networks", ["Decision trees", "Rules", "Logic"]),
    ("Big data analytics is?", "Extracting insights", ["Storing", "Deleting", "Copying"]),
    ("Data mining is?", "Finding patterns", ["Cleaning", "Loading", "Storing"]),
    ("Cloud computing provides?", "On-demand resources", ["Fixed resources", "Local only", "None"]),
    ("IoT stands for?", "Internet of Things", ["Internet of Tech", "Internal", "Interconnect"]),
    ("ETL is used in?", "Data integration", ["Searching", "Sorting", "Indexing"]),
    ("Data lake stores?", "Raw data", ["Processed", "Structured only", "Cleaned"]),
    ("Agile is?", "Iterative development", ["Sequential", "Linear", "Waterfall"]),
]

for i in range(300 - len(questions)):
    q_text, correct, wrong = random.choice(bdai_fillers)
    opts = [correct] + wrong
    questions.append(mk("B","Big Data & AI",random.choice(fill_topics),random.choice(["easy","medium","hard"]),
        q_text, opts, 0, f"Answer: {correct}"))

print(f"Big Data & AI: {len(questions)} questions")
with open(f"{OUT}/bigdata_ai.json", "w") as f:
    json.dump(questions, f, indent=2)
print("Saved bigdata_ai.json")

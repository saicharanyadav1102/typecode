"""
seed_database.py — Database Seeder for typeCode
Works with both Supabase (PostgreSQL) and MySQL via SQLAlchemy ORM.
Run this script after configuring your DATABASE_URL in .env to seed initial text passages and code snippets.
"""
import os
from app import create_app
from extensions import db
from models.user import User
from models.content import TextContent, CodeSnippet

app = create_app()

TEXT_PASSAGES = [
    # Beginner
    {
        "content": "The morning bus stopped beside the park just as the sun rose above the trees. Children carried bright bags, workers checked their watches, and a baker opened his shop door. The town felt fresh, simple, and ready for another ordinary but hopeful day.",
        "difficulty": "beginner", "word_count": 43, "category": "general"
    },
    {
        "content": "Maya placed a blue cup on the table and poured warm tea into it. Rain tapped softly against the window while her little brother drew pictures on old paper. Nothing exciting happened, yet the quiet room felt safe and full of comfort.",
        "difficulty": "beginner", "word_count": 42, "category": "general"
    },
    {
        "content": "A small dog ran across the garden and chased a yellow ball. Leaves moved in the wind, birds called from the fence, and the grass smelled clean after the rain. Everyone laughed when the dog proudly carried the ball back.",
        "difficulty": "beginner", "word_count": 40, "category": "general"
    },
    {
        "content": "Tom packed an apple, a notebook, and a pencil before leaving for school. He liked walking slowly because every street had something to notice. A red bicycle leaned near a gate, and fresh flowers grew beside the road.",
        "difficulty": "beginner", "word_count": 39, "category": "general"
    },
    {
        "content": "The library was calm in the afternoon. Sunlight touched the wooden tables, and pages turned with a soft sound. Lina chose a story about space, found a chair near the window, and began reading without looking at the clock.",
        "difficulty": "beginner", "word_count": 40, "category": "general"
    },
    # Intermediate
    {
        "content": "Good habits are built through small actions repeated consistently. A person who practices for ten focused minutes each day often improves faster than someone who waits for perfect motivation. Progress becomes easier when the goal is clear and the routine is simple.",
        "difficulty": "intermediate", "word_count": 41, "category": "productivity"
    },
    {
        "content": "Modern teams depend on clear communication as much as technical skill. When people explain decisions, ask direct questions, and document important details, fewer mistakes survive into production. Thoughtful collaboration turns scattered effort into steady progress.",
        "difficulty": "intermediate", "word_count": 35, "category": "communication"
    },
    {
        "content": "Learning to program is not just memorizing syntax. It requires patience, curiosity, and the willingness to debug confusing failures. Each error message is a clue, and each solved problem builds a stronger mental model of how systems behave.",
        "difficulty": "intermediate", "word_count": 39, "category": "programming"
    },
    {
        "content": "Cities change when transportation becomes reliable and affordable. Better trains, safer sidewalks, and thoughtful bike lanes reduce traffic while giving people more freedom. Good design is rarely loud, but it quietly improves daily life for thousands of residents.",
        "difficulty": "intermediate", "word_count": 38, "category": "urban planning"
    },
    {
        "content": "Digital security begins with ordinary choices. Strong passwords, updated software, careful downloads, and healthy skepticism protect personal information from many common attacks. Technology is powerful, but human judgment remains one of the most important defenses.",
        "difficulty": "intermediate", "word_count": 35, "category": "security"
    },
    # Advanced
    {
        "content": "Distributed systems often fail in ways that appear inconsistent from the outside. Network partitions, clock drift, retry storms, and partial deployments can interact unpredictably, forcing engineers to design software that remains observable, recoverable, and honest about uncertainty.",
        "difficulty": "advanced", "word_count": 36, "category": "systems"
    },
    {
        "content": "The economics of attention influence how modern software is designed, measured, and monetized. Interfaces that reward interruption can increase engagement while quietly reducing focus, creating ethical tension between business incentives and the long-term well-being of users.",
        "difficulty": "advanced", "word_count": 36, "category": "technology"
    },
    {
        "content": "Scientific models simplify reality so that complex patterns can be studied, tested, and improved. Their value comes not from perfect representation but from disciplined usefulness: a good model reveals relationships, predicts outcomes, and admits when evidence requires revision.",
        "difficulty": "advanced", "word_count": 39, "category": "science"
    },
    {
        "content": "Language evolves through countless negotiations between tradition, convenience, identity, and power. New words enter common use, old meanings shift, and communities continually reshape grammar to express experiences that previous vocabulary could not easily contain.",
        "difficulty": "advanced", "word_count": 35, "category": "language"
    },
    {
        "content": "Resilient organizations treat incidents as opportunities for learning rather than occasions for blame. By studying contributing factors, improving feedback loops, and sharing context openly, teams can convert painful failures into durable operational knowledge.",
        "difficulty": "advanced", "word_count": 32, "category": "leadership"
    }
]

CODE_SNIPPETS = [
    # Beginner
    {
        "title": "Python List Total", "language": "python", "difficulty": "beginner",
        "description": "Loop over a list and add values",
        "content": 'numbers = [4, 8, 15, 16, 23, 42]\ntotal = 0\n\nfor number in numbers:\n  total += number\n\nprint("Total:", total)'
    },
    {
        "title": "JavaScript Toggle", "language": "javascript", "difficulty": "beginner",
        "description": "Toggle a boolean value",
        "content": 'let isOpen = false;\n\nfunction toggleMenu() {\n  isOpen = !isOpen;\n  console.log("Menu open:", isOpen);\n}\n\ntoggleMenu();'
    },
    {
        "title": "Java Greeting", "language": "java", "difficulty": "beginner",
        "description": "Simple Java greeting program",
        "content": 'public class Greeting {\n  public static void main(String[] args) {\n    String name = "Coder";\n    System.out.println("Hello, " + name);\n  }\n}'
    },
    {
        "title": "HTML Card Structure", "language": "html", "difficulty": "beginner",
        "description": "Basic article layout",
        "content": '<article class="card">\n  <h2>Typing Practice</h2>\n  <p>Build speed with daily sessions.</p>\n  <button>Start</button>\n</article>'
    },
    {
        "title": "CSS Button Hover", "language": "css", "difficulty": "beginner",
        "description": "Button styling with transition",
        "content": '.btn {\n  padding: 10px 20px;\n  background: #3b82f6;\n  color: #ffffff;\n  border-radius: 6px;\n  transition: transform 0.2s ease;\n}\n\n.btn:hover {\n  transform: translateY(-2px);\n}'
    },
    # Intermediate
    {
        "title": "Python Dict Filter", "language": "python", "difficulty": "intermediate",
        "description": "Filter dictionary entries by value",
        "content": 'scores = {"Alice": 88, "Bob": 72, "Charlie": 95, "Dana": 64}\npassed = {name: score for name, score in scores.items() if score >= 75}\n\nprint("Passing students:", passed)'
    },
    {
        "title": "JavaScript Fetch API", "language": "javascript", "difficulty": "intermediate",
        "description": "Fetch user data asynchronously",
        "content": 'async function loadUser(id) {\n  const response = await fetch(`/api/users/${id}`);\n  if (!response.ok) {\n    throw new Error("User not found");\n  }\n  return await response.json();\n}'
    },
    {
        "title": "SQL Join Query", "language": "sql", "difficulty": "intermediate",
        "description": "Get user progress summaries",
        "content": 'SELECT u.username, p.avg_wpm, p.tests_completed\nFROM users u\nJOIN user_progress p ON u.id = p.user_id\nWHERE p.test_mode = \'normal\'\nORDER BY p.avg_wpm DESC\nLIMIT 10;'
    },
    {
        "title": "Java Array Sort", "language": "java", "difficulty": "intermediate",
        "description": "Sort numbers using Arrays class",
        "content": 'import java.util.Arrays;\n\npublic class Sorter {\n  public static void main(String[] args) {\n    int[] speeds = {74, 52, 91, 68, 83};\n    Arrays.sort(speeds);\n    System.out.println(Arrays.toString(speeds));\n  }\n}'
    },
    {
        "title": "C Pointer Basics", "language": "c", "difficulty": "intermediate",
        "description": "Swap values using pointers",
        "content": '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n  int temp = *a;\n  *a = *b;\n  *b = temp;\n}\n\nint main() {\n  int x = 10, y = 20;\n  swap(&x, &y);\n  printf("x=%d, y=%d\\n", x, y);\n  return 0;\n}'
    },
    # Advanced
    {
        "title": "Python Decorator Timer", "language": "python", "difficulty": "advanced",
        "description": "Measure function execution duration",
        "content": 'import time\nfrom functools import wraps\n\ndef timeit(func):\n  @wraps(func)\n  def wrapper(*args, **kwargs):\n    start = time.perf_counter()\n    result = func(*args, **kwargs)\n    elapsed = time.perf_counter() - start\n    print(f"{func.__name__} took {elapsed:.4f}s")\n    return result\n  return wrapper'
    },
    {
        "title": "JavaScript Debounce", "language": "javascript", "difficulty": "advanced",
        "description": "Limit rate of input execution",
        "content": 'function debounce(fn, delay) {\n  let timeoutId;\n  return function (...args) {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn.apply(this, args), delay);\n  };\n}'
    },
    {
        "title": "C++ Smart Pointer Vector", "language": "cpp", "difficulty": "advanced",
        "description": "Manage dynamic objects with unique_ptr",
        "content": '#include <iostream>\n#include <memory>\n#include <vector>\n\nstruct Node {\n  int value;\n  explicit Node(int v) : value(v) {}\n};\n\nint main() {\n  std::vector<std::unique_ptr<Node>> nodes;\n  nodes.push_back(std::make_unique<Node>(42));\n  nodes.push_back(std::make_unique<Node>(99));\n  for (const auto& node : nodes) {\n    std::cout << node->value << " ";\n  }\n  return 0;\n}'
    },
    {
        "title": "SQL Window Function", "language": "sql", "difficulty": "advanced",
        "description": "Rank users by WPM partition",
        "content": 'SELECT\n  user_id,\n  wpm,\n  completed_at,\n  RANK() OVER (PARTITION BY test_mode ORDER BY wpm DESC) AS rank_in_mode\nFROM typing_results\nWHERE duration_seconds >= 60;'
    },
    {
        "title": "Python Async Generator", "language": "python", "difficulty": "advanced",
        "description": "Yield data chunks asynchronously",
        "content": 'import asyncio\n\nasync def stream_data(limit):\n  for i in range(limit):\n    await asyncio.sleep(0.1)\n    yield f"chunk-{i}"\n\nasync def main():\n  async for item in stream_data(5):\n    print("Received:", item)'
    }
]

def seed_db():
    with app.app_context():
        print("Creating tables if not present...")
        db.create_all()

        # Seed Admin User
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            print("Creating default admin account (admin@typecode.com)...")
            admin_user = User(
                username='admin',
                email='admin@typecode.com',
                role='admin'
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created successfully.")
        else:
            print("Admin user already exists.")

        # Seed Text Passages
        print("Seeding text passages...")
        for p in TEXT_PASSAGES:
            exists = TextContent.query.filter_by(content=p["content"]).first()
            if not exists:
                tc = TextContent(
                    content=p["content"],
                    difficulty=p["difficulty"],
                    word_count=p["word_count"],
                    category=p["category"],
                    is_active=True
                )
                db.session.add(tc)
        db.session.commit()

        # Seed Code Snippets
        print("Seeding code snippets...")
        for c in CODE_SNIPPETS:
            exists = CodeSnippet.query.filter_by(title=c["title"]).first()
            if not exists:
                cs = CodeSnippet(
                    title=c["title"],
                    content=c["content"],
                    language=c["language"],
                    difficulty=c["difficulty"],
                    description=c["description"],
                    is_active=True
                )
                db.session.add(cs)
        db.session.commit()

        print("[SUCCESS] Database seeding complete!")

if __name__ == "__main__":
    seed_db()

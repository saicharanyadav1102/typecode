-- ============================================
-- Seed Data for typeCode
-- Run after database.sql to populate initial content.
-- Re-running this file refreshes seed-owned content without duplicating it.
-- ============================================
USE typecode_db;

-- ============================================
-- 1. Admin User (password: admin123)
-- ============================================
INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@typecode.com', '$2b$12$LJ3DWGhVsQX8qZ3KAeS1UOHVpWyHWg7OKJzQ1rE5YA0nL5PGOvS/y', 'admin');

-- Refresh only seed-owned content. User-created content has created_by set.
DELETE FROM text_content WHERE created_by IS NULL;
DELETE FROM code_snippets WHERE created_by IS NULL;

-- ============================================
-- 2. Text Content - Normal Typing
-- Five passages per difficulty level.
-- ============================================
INSERT INTO text_content (content, difficulty, word_count, category) VALUES
('The morning bus stopped beside the park just as the sun rose above the trees. Children carried bright bags, workers checked their watches, and a baker opened his shop door. The town felt fresh, simple, and ready for another ordinary but hopeful day.', 'beginner', 43, 'general'),
('Maya placed a blue cup on the table and poured warm tea into it. Rain tapped softly against the window while her little brother drew pictures on old paper. Nothing exciting happened, yet the quiet room felt safe and full of comfort.', 'beginner', 42, 'general'),
('A small dog ran across the garden and chased a yellow ball. Leaves moved in the wind, birds called from the fence, and the grass smelled clean after the rain. Everyone laughed when the dog proudly carried the ball back.', 'beginner', 40, 'general'),
('Tom packed an apple, a notebook, and a pencil before leaving for school. He liked walking slowly because every street had something to notice. A red bicycle leaned near a gate, and fresh flowers grew beside the road.', 'beginner', 39, 'general'),
('The library was calm in the afternoon. Sunlight touched the wooden tables, and pages turned with a soft sound. Lina chose a story about space, found a chair near the window, and began reading without looking at the clock.', 'beginner', 40, 'general');

INSERT INTO text_content (content, difficulty, word_count, category) VALUES
('Good habits are built through small actions repeated consistently. A person who practices for ten focused minutes each day often improves faster than someone who waits for perfect motivation. Progress becomes easier when the goal is clear and the routine is simple.', 'intermediate', 41, 'productivity'),
('Modern teams depend on clear communication as much as technical skill. When people explain decisions, ask direct questions, and document important details, fewer mistakes survive into production. Thoughtful collaboration turns scattered effort into steady progress.', 'intermediate', 35, 'communication'),
('Learning to program is not just memorizing syntax. It requires patience, curiosity, and the willingness to debug confusing failures. Each error message is a clue, and each solved problem builds a stronger mental model of how systems behave.', 'intermediate', 39, 'programming'),
('Cities change when transportation becomes reliable and affordable. Better trains, safer sidewalks, and thoughtful bike lanes reduce traffic while giving people more freedom. Good design is rarely loud, but it quietly improves daily life for thousands of residents.', 'intermediate', 38, 'urban planning'),
('Digital security begins with ordinary choices. Strong passwords, updated software, careful downloads, and healthy skepticism protect personal information from many common attacks. Technology is powerful, but human judgment remains one of the most important defenses.', 'intermediate', 35, 'security');

INSERT INTO text_content (content, difficulty, word_count, category) VALUES
('Distributed systems often fail in ways that appear inconsistent from the outside. Network partitions, clock drift, retry storms, and partial deployments can interact unpredictably, forcing engineers to design software that remains observable, recoverable, and honest about uncertainty.', 'advanced', 36, 'systems'),
('The economics of attention influence how modern software is designed, measured, and monetized. Interfaces that reward interruption can increase engagement while quietly reducing focus, creating ethical tension between business incentives and the long-term well-being of users.', 'advanced', 36, 'technology'),
('Scientific models simplify reality so that complex patterns can be studied, tested, and improved. Their value comes not from perfect representation but from disciplined usefulness: a good model reveals relationships, predicts outcomes, and admits when evidence requires revision.', 'advanced', 39, 'science'),
('Language evolves through countless negotiations between tradition, convenience, identity, and power. New words enter common use, old meanings shift, and communities continually reshape grammar to express experiences that previous vocabulary could not easily contain.', 'advanced', 35, 'language'),
('Resilient organizations treat incidents as opportunities for learning rather than occasions for blame. By studying contributing factors, improving feedback loops, and sharing context openly, teams can convert painful failures into durable operational knowledge.', 'advanced', 32, 'leadership');

-- ============================================
-- 3. Code Snippets - Programmer Mode
-- Five snippets per difficulty level.
-- ============================================
INSERT INTO code_snippets (title, content, language, difficulty, description) VALUES
('Python List Total', 'numbers = [4, 8, 15, 16, 23, 42]\ntotal = 0\n\nfor number in numbers:\n  total += number\n\nprint("Total:", total)', 'python', 'beginner', 'Loop over a list and add values'),
('JavaScript Toggle', 'let isOpen = false;\n\nfunction toggleMenu() {\n  isOpen = !isOpen;\n  console.log("Menu open:", isOpen);\n}\n\ntoggleMenu();', 'javascript', 'beginner', 'Toggle a boolean value'),
('Java Greeting', 'public class Greeting {\n  public static void main(String[] args) {\n    String name = "Coder";\n    System.out.println("Hello, " + name);\n  }\n}', 'java', 'beginner', 'Simple Java greeting program'),
('C Average', '#include <stdio.h>\n\nint main() {\n  int a = 8;\n  int b = 12;\n  float average = (a + b) / 2.0;\n  printf("Average: %.1f\\n", average);\n  return 0;\n}', 'c', 'beginner', 'Calculate a simple average'),
('SQL Active Users', 'SELECT id, username, email\nFROM users\nWHERE is_active = 1\nORDER BY username ASC;', 'sql', 'beginner', 'Basic filtered select query');

INSERT INTO code_snippets (title, content, language, difficulty, description) VALUES
('Python Word Counts', 'text = "code is clear when names are clear"\ncounts = {}\n\nfor word in text.split():\n  counts[word] = counts.get(word, 0) + 1\n\nprint(counts)', 'python', 'intermediate', 'Build a frequency dictionary'),
('JavaScript Async Loader', 'async function loadUser(id) {\n  const response = await fetch(`/api/users/${id}`);\n  if (!response.ok) {\n    throw new Error("User not found");\n  }\n  return response.json();\n}', 'javascript', 'intermediate', 'Fetch JSON with async and await'),
('Java Book Class', 'public class Book {\n  private final String title;\n  private int pagesRead;\n\n  public Book(String title) {\n    this.title = title;\n    this.pagesRead = 0;\n  }\n\n  public void read(int pages) {\n    pagesRead += pages;\n  }\n}', 'java', 'intermediate', 'Class with private fields and methods'),
('HTML Signup Form', '<form class="signup-form" method="post">\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required>\n\n  <label for="password">Password</label>\n  <input id="password" name="password" type="password" required>\n\n  <button type="submit">Create account</button>\n</form>', 'html', 'intermediate', 'Accessible signup form markup'),
('CSS Responsive Grid', '.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 1rem;\n}\n\n.card {\n  padding: 1rem;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n}', 'css', 'intermediate', 'Responsive card grid');

INSERT INTO code_snippets (title, content, language, difficulty, description) VALUES
('Python Knapsack Memo', 'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef best_value(index, capacity):\n  if index == len(items) or capacity == 0:\n    return 0\n  weight, value = items[index]\n  skip = best_value(index + 1, capacity)\n  if weight > capacity:\n    return skip\n  take = value + best_value(index + 1, capacity - weight)\n  return max(skip, take)', 'python', 'advanced', 'Memoized recursive knapsack'),
('JavaScript Event Emitter', 'class Emitter {\n  constructor() {\n    this.events = new Map();\n  }\n\n  on(name, handler) {\n    const handlers = this.events.get(name) || [];\n    handlers.push(handler);\n    this.events.set(name, handlers);\n  }\n\n  emit(name, payload) {\n    for (const handler of this.events.get(name) || []) {\n      handler(payload);\n    }\n  }\n}', 'javascript', 'advanced', 'Small event emitter class'),
('C++ Unique Handle', 'class FileHandle {\nprivate:\n  FILE* file;\npublic:\n  explicit FileHandle(const char* path) : file(fopen(path, "r")) {}\n  ~FileHandle() {\n    if (file) fclose(file);\n  }\n  FileHandle(const FileHandle&) = delete;\n  FileHandle& operator=(const FileHandle&) = delete;\n};', 'cpp', 'advanced', 'RAII wrapper for a C file handle'),
('SQL Revenue Ranking', 'WITH monthly_revenue AS (\n  SELECT product_id, SUM(quantity * price) AS revenue\n  FROM order_items\n  WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\n  GROUP BY product_id\n)\nSELECT product_id, revenue,\n       RANK() OVER (ORDER BY revenue DESC) AS revenue_rank\nFROM monthly_revenue;', 'sql', 'advanced', 'CTE with a ranking window function'),
('CSS Theme Tokens', ':root {\n  --surface: #ffffff;\n  --text: #111827;\n  --accent: #2563eb;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --surface: #111827;\n    --text: #f9fafb;\n    --accent: #60a5fa;\n  }\n}', 'css', 'advanced', 'Theme tokens with dark mode media query');

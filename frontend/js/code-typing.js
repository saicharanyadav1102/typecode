/* ============================================
   CODE TYPING — typeCode
   Programmer mode: code snippets, language
   selection, syntax-aware typing
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // CODE SNIPPETS DATABASE
  // Real code snippets organized by language and difficulty
  // ============================================
  var codeSnippets = {

    python: {
      beginner: [
        'def greet(name):\n  message = "Hello, " + name\n  print(message)\n  return message\n\ngreet("World")',
        'numbers = [1, 2, 3, 4, 5]\ntotal = 0\nfor num in numbers:\n  total += num\nprint("Sum:", total)',
        'age = 18\nif age >= 18:\n  print("You are an adult")\nelse:\n  print("You are a minor")',
      ],
      intermediate: [
        'def fibonacci(n):\n  if n <= 1:\n    return n\n  a, b = 0, 1\n  for _ in range(2, n + 1):\n    a, b = b, a + b\n  return b\n\nfor i in range(10):\n  print(fibonacci(i))',
        'class Student:\n  def __init__(self, name, grade):\n    self.name = name\n    self.grade = grade\n\n  def is_passing(self):\n    return self.grade >= 60\n\n  def __str__(self):\n    return f"{self.name}: {self.grade}"',
        'def binary_search(arr, target):\n  low, high = 0, len(arr) - 1\n  while low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == target:\n      return mid\n    elif arr[mid] < target:\n      low = mid + 1\n    else:\n      high = mid - 1\n  return -1',
      ],
      advanced: [
        'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef edit_distance(s1, s2):\n  if not s1: return len(s2)\n  if not s2: return len(s1)\n  if s1[-1] == s2[-1]:\n    return edit_distance(s1[:-1], s2[:-1])\n  return 1 + min(\n    edit_distance(s1[:-1], s2),\n    edit_distance(s1, s2[:-1]),\n    edit_distance(s1[:-1], s2[:-1])\n  )',
      ],
    },

    javascript: {
      beginner: [
        'function add(a, b) {\n  return a + b;\n}\n\nconst result = add(5, 3);\nconsole.log("Sum:", result);',
        'const fruits = ["apple", "banana", "cherry"];\nfor (let i = 0; i < fruits.length; i++) {\n  console.log(fruits[i]);\n}',
        'let count = 0;\nfunction increment() {\n  count++;\n  return count;\n}\nconsole.log(increment());',
      ],
      intermediate: [
        'const fetchData = async (url) => {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error("HTTP error: " + response.status);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Fetch failed:", error);\n    return null;\n  }\n};',
        'class LinkedList {\n  constructor() {\n    this.head = null;\n    this.size = 0;\n  }\n\n  add(value) {\n    const node = { value, next: null };\n    if (!this.head) {\n      this.head = node;\n    } else {\n      let current = this.head;\n      while (current.next) {\n        current = current.next;\n      }\n      current.next = node;\n    }\n    this.size++;\n  }\n}',
        'function debounce(func, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      func.apply(this, args);\n    }, delay);\n  };\n}',
      ],
      advanced: [
        'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] <= right[j]) {\n      result.push(left[i++]);\n    } else {\n      result.push(right[j++]);\n    }\n  }\n  return result.concat(left.slice(i), right.slice(j));\n}',
      ],
    },

    java: {
      beginner: [
        'public class Main {\n  public static void main(String[] args) {\n    String name = "World";\n    System.out.println("Hello, " + name);\n  }\n}',
        'int[] numbers = {1, 2, 3, 4, 5};\nint sum = 0;\nfor (int num : numbers) {\n  sum += num;\n}\nSystem.out.println("Sum: " + sum);',
      ],
      intermediate: [
        'public class Stack<T> {\n  private List<T> items = new ArrayList<>();\n\n  public void push(T item) {\n    items.add(item);\n  }\n\n  public T pop() {\n    if (items.isEmpty()) {\n      throw new RuntimeException("Stack is empty");\n    }\n    return items.remove(items.size() - 1);\n  }\n\n  public boolean isEmpty() {\n    return items.isEmpty();\n  }\n}',
      ],
      advanced: [
        'public static <T extends Comparable<T>> void quickSort(T[] arr, int low, int high) {\n  if (low < high) {\n    int pi = partition(arr, low, high);\n    quickSort(arr, low, pi - 1);\n    quickSort(arr, pi + 1, high);\n  }\n}\n\nprivate static <T extends Comparable<T>> int partition(T[] arr, int low, int high) {\n  T pivot = arr[high];\n  int i = low - 1;\n  for (int j = low; j < high; j++) {\n    if (arr[j].compareTo(pivot) < 0) {\n      i++;\n      T temp = arr[i];\n      arr[i] = arr[j];\n      arr[j] = temp;\n    }\n  }\n  T temp = arr[i + 1];\n  arr[i + 1] = arr[high];\n  arr[high] = temp;\n  return i + 1;\n}',
      ],
    },

    c: {
      beginner: [
        '#include <stdio.h>\n\nint main() {\n  int a = 10;\n  int b = 20;\n  int sum = a + b;\n  printf("Sum: %d\\n", sum);\n  return 0;\n}',
      ],
      intermediate: [
        'void bubbleSort(int arr[], int n) {\n  for (int i = 0; i < n - 1; i++) {\n    for (int j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        int temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n}',
      ],
      advanced: [
        'typedef struct Node {\n  int data;\n  struct Node* next;\n} Node;\n\nNode* createNode(int data) {\n  Node* node = (Node*)malloc(sizeof(Node));\n  node->data = data;\n  node->next = NULL;\n  return node;\n}\n\nvoid insertFront(Node** head, int data) {\n  Node* node = createNode(data);\n  node->next = *head;\n  *head = node;\n}',
      ],
    },

    cpp: {
      beginner: [
        '#include <iostream>\nusing namespace std;\n\nint main() {\n  string name;\n  cout << "Enter name: ";\n  cin >> name;\n  cout << "Hello, " << name << endl;\n  return 0;\n}',
      ],
      intermediate: [
        'class Rectangle {\nprivate:\n  double width, height;\npublic:\n  Rectangle(double w, double h) : width(w), height(h) {}\n  double area() const { return width * height; }\n  double perimeter() const { return 2 * (width + height); }\n};',
      ],
      advanced: [
        'template <typename T>\nclass SmartPtr {\nprivate:\n  T* ptr;\n  int* refCount;\npublic:\n  SmartPtr(T* p = nullptr) : ptr(p), refCount(new int(1)) {}\n  SmartPtr(const SmartPtr& other) : ptr(other.ptr), refCount(other.refCount) {\n    (*refCount)++;\n  }\n  ~SmartPtr() {\n    if (--(*refCount) == 0) {\n      delete ptr;\n      delete refCount;\n    }\n  }\n  T& operator*() { return *ptr; }\n  T* operator->() { return ptr; }\n};',
      ],
    },

    html: {
      beginner: [
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>Welcome to my website.</p>\n</body>\n</html>',
      ],
      intermediate: [
        '<nav class="navbar">\n  <div class="logo">Brand</div>\n  <ul class="nav-links">\n    <li><a href="#home">Home</a></li>\n    <li><a href="#about">About</a></li>\n    <li><a href="#contact">Contact</a></li>\n  </ul>\n  <button class="menu-btn" aria-label="Menu">\n    <span></span>\n  </button>\n</nav>',
      ],
      advanced: [
        '<form id="signup-form" novalidate>\n  <div class="form-group">\n    <label for="email">Email</label>\n    <input type="email" id="email" name="email"\n           required pattern="[^@]+@[^@]+\\.[^@]+"\n           aria-describedby="email-error">\n    <span id="email-error" class="error" role="alert"></span>\n  </div>\n  <div class="form-group">\n    <label for="password">Password</label>\n    <input type="password" id="password" name="password"\n           required minlength="8"\n           aria-describedby="password-hint">\n    <span id="password-hint" class="hint">Min 8 characters</span>\n  </div>\n  <button type="submit">Sign Up</button>\n</form>',
      ],
    },

    css: {
      beginner: [
        'body {\n  margin: 0;\n  padding: 0;\n  font-family: Arial, sans-serif;\n  background-color: #f5f5f5;\n  color: #333;\n}\n\nh1 {\n  text-align: center;\n  color: #2c3e50;\n}',
      ],
      intermediate: [
        '.card {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n  border-radius: 16px;\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  padding: 2rem;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n  transition: transform 0.3s ease;\n}\n\n.card:hover {\n  transform: translateY(-4px);\n}',
      ],
      advanced: [
        '@keyframes gradient {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}\n\n.hero {\n  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);\n  background-size: 400% 400%;\n  animation: gradient 15s ease infinite;\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}',
      ],
    },

    sql: {
      beginner: [
        'SELECT first_name, last_name\nFROM employees\nWHERE department = \'Engineering\'\nORDER BY last_name ASC;',
      ],
      intermediate: [
        'SELECT d.name AS department,\n       COUNT(e.id) AS employee_count,\n       AVG(e.salary) AS avg_salary\nFROM departments d\nLEFT JOIN employees e ON d.id = e.department_id\nGROUP BY d.name\nHAVING COUNT(e.id) > 5\nORDER BY avg_salary DESC;',
      ],
      advanced: [
        'WITH ranked_sales AS (\n  SELECT\n    s.product_id,\n    p.name,\n    SUM(s.quantity * s.price) AS total_revenue,\n    RANK() OVER (ORDER BY SUM(s.quantity * s.price) DESC) AS rank\n  FROM sales s\n  JOIN products p ON s.product_id = p.id\n  WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\n  GROUP BY s.product_id, p.name\n)\nSELECT * FROM ranked_sales WHERE rank <= 10;',
      ],
    },
  };

  // ---- State ----
  var selectedLanguage = 'python';
  var selectedDifficulty = 'intermediate';
  var codeLoadId = 0;
  var codePaceByDifficulty = {
    beginner: { cpm: 130, min: 45, max: 90 },
    intermediate: { cpm: 105, min: 90, max: 180 },
    advanced: { cpm: 85, min: 150, max: 300 },
  };

  // ---- Get random snippet ----
  function getSnippet() {
    var langSnippets = codeSnippets[selectedLanguage];
    if (!langSnippets) return '// No snippets available';
    var diffSnippets = langSnippets[selectedDifficulty];
    if (!diffSnippets || diffSnippets.length === 0) {
      // Fallback to beginner
      diffSnippets = langSnippets.beginner || ['// No snippet'];
    }
    return diffSnippets[Math.floor(Math.random() * diffSnippets.length)];
  }

  function updateTitle(title) {
    var el = document.getElementById('snippet-title');
    if (el) {
      if (title) {
        el.textContent = title;
        return;
      }
      var langName = selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1);
      if (selectedLanguage === 'cpp') langName = 'C++';
      var diffName = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
      el.textContent = langName + ' — ' + diffName;
    }
  }

  function getEstimatedDuration(snippet) {
    var pace = codePaceByDifficulty[selectedDifficulty] || codePaceByDifficulty.intermediate;
    var chars = (snippet || '').length;
    var estimated = Math.ceil((chars / pace.cpm) * 60);
    return Math.max(pace.min, Math.min(pace.max, estimated));
  }

  // ---- Initialize ----
  async function initCodeTest() {
    var loadId = ++codeLoadId;
    var snippet = getSnippet();

    try {
      if (typeof API !== 'undefined') {
        var data = await API.getCodeSnippets({
          language: selectedLanguage,
          difficulty: selectedDifficulty,
        });
        if (loadId !== codeLoadId) return;
        if (data && data.content) {
          snippet = data.content;
          updateTitle(data.data && data.data.title);
        } else {
          updateTitle();
        }
      } else {
        updateTitle();
      }
    } catch (e) {
      console.log('Code typing: using local fallback snippet');
      if (loadId !== codeLoadId) return;
      updateTitle();
    }

    if (loadId !== codeLoadId) return;

    TypingEngine.init({
      text: snippet,
      duration: getEstimatedDuration(snippet),
      difficulty: selectedDifficulty,
      mode: 'programmer',
      language: selectedLanguage,
    });
    document.getElementById('typing-input').focus();
    document.getElementById('typing-area').classList.add('active');
  }

  // ---- Language selector ----
  document.querySelectorAll('#language-selector .lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#language-selector .lang-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      selectedLanguage = btn.dataset.language;
      initCodeTest();
    });
  });

  // ---- Difficulty tabs ----
  document.querySelectorAll('#code-difficulty-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#code-difficulty-tabs .tab').forEach(function (t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      selectedDifficulty = tab.dataset.difficulty;
      initCodeTest();
    });
  });

  // ---- Buttons ----
  document.getElementById('restart-btn').addEventListener('click', function () {
    TypingEngine.restart();
    document.getElementById('typing-input').focus();
  });

  document.getElementById('new-snippet-btn').addEventListener('click', function () {
    initCodeTest();
  });

  document.getElementById('result-restart-btn').addEventListener('click', function () {
    TypingEngine.restart();
    document.getElementById('typing-input').focus();
  });

  document.getElementById('result-new-btn').addEventListener('click', function () {
    initCodeTest();
  });

  document.getElementById('result-close-btn').addEventListener('click', function () {
    document.getElementById('result-overlay').classList.remove('active');
    document.getElementById('typing-input').focus();
  });

  // ---- Focus handling ----
  document.getElementById('text-display').addEventListener('click', function () {
    document.getElementById('typing-input').focus();
    document.getElementById('typing-area').classList.add('active');
  });

  var input = document.getElementById('typing-input');
  input.addEventListener('focus', function () {
    document.getElementById('typing-area').classList.add('active');
  });
  input.addEventListener('blur', function () {
    document.getElementById('typing-area').classList.remove('active');
  });

  // Escape to restart
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      TypingEngine.restart();
      document.getElementById('typing-input').focus();
    }
  });

  // ---- Init on load ----
  initCodeTest();

})();

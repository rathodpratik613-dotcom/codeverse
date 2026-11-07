import { Course } from '@/types';

export const pythonCourse: Course = {
  id: 'python-basics',
  languageId: 'python',
  title: 'Python Fundamentals',
  description: 'Master the basics of Python programming',
  level: 1,
  modules: [
    {
      id: 'python-module-1',
      title: 'Introduction to Python',
      order: 1,
      lessons: [
        {
          id: 'python-lesson-1',
          moduleId: 'python-module-1',
          title: 'Your First Python Program',
          content: `# Welcome to Python!

Python is a powerful, easy-to-learn programming language. Let's write your first program.

## What is Python?

Python is a high-level, interpreted programming language known for its simplicity and readability. It's used in:
- Web development
- Data science and AI
- Automation
- Game development

## Your First Program

In Python, we use the \`print()\` function to display text:

\`\`\`python
print("Hello, World!")
\`\`\`

This will output: Hello, World!

## Try It Yourself

Write a program that prints your name to the console.`,
          language: 'python',
          difficulty: 'easy',
          order: 1,
          exercises: [
            {
              id: 'ex-1',
              lessonId: 'python-lesson-1',
              type: 'code',
              question: 'Write a print statement that displays "Hello, World!"',
              starterCode: '# Write your code here\n',
              expectedOutput: 'Hello, World!',
              xpReward: 10,
              coinReward: 5
            }
          ]
        },
        {
          id: 'python-lesson-2',
          moduleId: 'python-module-1',
          title: 'Variables',
          content: `# Variables in Python

Variables are containers for storing data values.

## Creating Variables

In Python, you create a variable by assigning a value to it:

\`\`\`python
name = "Alice"
age = 25
is_student = True
\`\`\`

## Variable Naming Rules

- Variable names must start with a letter or underscore
- They can contain letters, numbers, and underscores
- They are case-sensitive (\`name\` and \`Name\` are different)

## Data Types

Python has several built-in data types:
- \`str\` - strings (text)
- \`int\` - integers (whole numbers)
- \`float\` - floating point numbers (decimals)
- \`bool\` - boolean (True/False)

## Example

\`\`\`python
name = "John"      # string
age = 30           # int
height = 5.9       # float
is_active = True  # bool
\`\`\``,
          language: 'python',
          difficulty: 'easy',
          order: 2,
          exercises: [
            {
              id: 'ex-2',
              lessonId: 'python-lesson-2',
              type: 'code',
              question: 'Create a variable called "greeting" with the value "Hello" and print it',
              starterCode: '# Create your variable and print it\n',
              expectedOutput: 'Hello',
              xpReward: 15,
              coinReward: 5
            }
          ]
        },
        {
          id: 'python-lesson-3',
          moduleId: 'python-module-1',
          title: 'Numbers and Math',
          content: `# Numbers and Math Operations

Python supports various mathematical operations.

## Basic Operators

\`\`\`python
a = 10
b = 3

print(a + b)  # Addition: 13
print(a - b)  # Subtraction: 7
print(a * b)  # Multiplication: 30
print(a / b)  # Division: 3.333...
print(a // b) # Floor division: 3
print(a % b)  # Modulus: 1
print(a ** b) # Exponentiation: 1000
\`\`\`

## Order of Operations

Python follows the standard mathematical order of operations (PEMDAS):
1. Parentheses
2. Exponents
3. Multiplication and Division (left to right)
4. Addition and Subtraction (left to right)

## Example

\`\`\`python
result = (5 + 3) * 2  # 16
print(result)
\`\`\``,
          language: 'python',
          difficulty: 'easy',
          order: 3,
          exercises: [
            {
              id: 'ex-3',
              lessonId: 'python-lesson-3',
              type: 'code',
              question: 'Calculate and print the result of (10 + 5) * 3',
              starterCode: '# Calculate and print the result\n',
              expectedOutput: '45',
              xpReward: 15,
              coinReward: 5
            }
          ]
        }
      ]
    },
    {
      id: 'python-module-2',
      title: 'Control Flow',
      order: 2,
      lessons: [
        {
          id: 'python-lesson-4',
          moduleId: 'python-module-2',
          title: 'If Statements',
          content: `# If Statements

Conditional statements let your code make decisions.

## Basic If Statement

\`\`\`python
age = 18

if age >= 18:
    print("You are an adult")
\`\`\`

## If-Else Statement

\`\`\`python
age = 15

if age >= 18:
    print("You are an adult")
else:
    print("You are a minor")
\`\`\`

## If-Elif-Else

\`\`\`python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
\`\`\`

## Comparison Operators

- \`==\` - equal to
- \`!=\` - not equal to
- \`>\` - greater than
- \`<\` - less than
- \`>=\` - greater than or equal
- \`<=\` - less than or equal`,
          language: 'python',
          difficulty: 'easy',
          order: 1,
          exercises: [
            {
              id: 'ex-4',
              lessonId: 'python-lesson-4',
              type: 'code',
              question: 'Write an if statement that checks if a number is positive and prints "Positive" if true',
              starterCode: 'number = 5\n# Write your if statement here\n',
              expectedOutput: 'Positive',
              xpReward: 20,
              coinReward: 10
            }
          ]
        },
        {
          id: 'python-lesson-5',
          moduleId: 'python-module-2',
          title: 'Loops',
          content: `# Loops in Python

Loops let you repeat code multiple times.

## For Loops

\`\`\`python
for i in range(5):
    print(i)  # Prints 0, 1, 2, 3, 4
\`\`\`

## While Loops

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

## Looping Through Lists

\`\`\`python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)
\`\`\`

## Break and Continue

\`\`\`python
for i in range(10):
    if i == 5:
        break  # Exit the loop
    print(i)
\`\`\``,
          language: 'python',
          difficulty: 'medium',
          order: 2,
          exercises: [
            {
              id: 'ex-5',
              lessonId: 'python-lesson-5',
              type: 'code',
              question: 'Use a for loop to print numbers from 1 to 5',
              starterCode: '# Write your for loop here\n',
              expectedOutput: '1\n2\n3\n4\n5',
              xpReward: 25,
              coinReward: 10
            }
          ]
        }
      ]
    },
    {
      id: 'python-module-3',
      title: 'Functions',
      order: 3,
      lessons: [
        {
          id: 'python-lesson-6',
          moduleId: 'python-module-3',
          title: 'Defining Functions',
          content: `# Functions

Functions are reusable blocks of code.

## Defining a Function

\`\`\`python
def greet():
    print("Hello!")

greet()  # Call the function
\`\`\`

## Functions with Parameters

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # Hello, Alice!
\`\`\`

## Functions with Return Values

\`\`\`python
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8
\`\`\`

## Default Parameters

\`\`\`python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")  # Hello, Alice!
greet("Bob", "Hi")  # Hi, Bob!
\`\`\``,
          language: 'python',
          difficulty: 'medium',
          order: 1,
          exercises: [
            {
              id: 'ex-6',
              lessonId: 'python-lesson-6',
              type: 'code',
              question: 'Create a function called "square" that takes a number and returns its square',
              starterCode: 'def square(num):\n    # Write your code here\n    pass\n\n# Test your function\nprint(square(5))\n',
              expectedOutput: '25',
              xpReward: 30,
              coinReward: 15
            }
          ]
        },
        {
          id: 'python-lesson-7',
          moduleId: 'python-module-3',
          title: 'List Comprehensions',
          content: `# List Comprehensions

List comprehensions let you build lists in a single, readable line.

## The Basic Idea

Instead of writing a loop to build a list, wrap the expression in square brackets:

\`\`\`python
# Long way
squares = []
for n in range(10):
    squares.append(n * n)

# Short way — same result!
squares = [n * n for n in range(10)]
\`\`\`

## Adding a Condition

You can filter while building:

\`\`\`python
evens = [n for n in range(20) if n % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
\`\`\`

## Transforming Strings

\`\`\`python
names = ["alice", "bob", "carol"]
shouted = [name.upper() + "!" for name in names]
# ["ALICE!", "BOB!", "CAROL!"]
\`\`\`

## When to Use Them

- Use comprehensions for simple map/filter operations
- Use regular loops when the logic is complex or multi-step
- They are faster and often easier to read once you are comfortable with them`,
          language: 'python',
          difficulty: 'medium',
          order: 2,
          exercises: [
            {
              id: 'ex-7',
              lessonId: 'python-lesson-7',
              type: 'code',
              question: 'Use a list comprehension to create a list of cubes for numbers 1 through 5, then print the list',
              starterCode: '# Write your list comprehension here\n',
              expectedOutput: '[1, 8, 27, 64, 125]',
              xpReward: 25,
              coinReward: 10
            }
          ]
        }
      ]
    },
    {
      id: 'python-module-4',
      title: 'Data Structures',
      order: 4,
      lessons: [
        {
          id: 'python-lesson-8',
          moduleId: 'python-module-4',
          title: 'Lists',
          content: `# Lists

Lists are ordered collections you can change — the workhorse of Python.

## Creating and Using Lists

\`\`\`python
fruits = ["apple", "banana", "cherry"]
nums = [1, 2, 3, 4, 5]

print(fruits[0])    # apple (index starts at 0)
print(fruits[-1])   # cherry (negative = from the end)
print(len(fruits))  # 3
\`\`\`

## Modifying Lists

\`\`\`python
fruits.append("orange")   # add to the end
fruits.insert(1, "kiwi")  # insert at position
fruits.remove("banana")   # remove by value
last = fruits.pop()       # remove and return last item
\`\`\`

## Slicing

\`\`\`python
nums = [0, 1, 2, 3, 4, 5]
print(nums[1:4])   # [1, 2, 3]
print(nums[:3])    # [0, 1, 2]
print(nums[::2])   # [0, 2, 4] — every second item
\`\`\`

## Checking Membership

\`\`\`python
if "apple" in fruits:
    print("We have apples!")
\`\`\`

Lists can hold mixed types, but keeping one type per list makes code cleaner.`,
          language: 'python',
          difficulty: 'medium',
          order: 1,
          exercises: [
            {
              id: 'ex-8',
              lessonId: 'python-lesson-8',
              type: 'code',
              question: 'Create a list of three colors, append "purple", then print the list length',
              starterCode: 'colors = ["red", "blue", "green"]\n# Add a color and print the length\n',
              expectedOutput: '4',
              xpReward: 20,
              coinReward: 10
            }
          ]
        },
        {
          id: 'python-lesson-9',
          moduleId: 'python-module-4',
          title: 'Dictionaries',
          content: `# Dictionaries

Dictionaries store key-value pairs — perfect for looking things up fast.

## Creating Dictionaries

\`\`\`python
user = {
    "name": "Alice",
    "age": 30,
    "city": "Paris"
}

print(user["name"])       # Alice
print(user.get("age"))    # 30
\`\`\`

## Adding and Updating

\`\`\`python
user["age"] = 31          # update existing key
user["email"] = "a@b.com" # add new key
\`\`\`

## Safe Access

\`\`\`python
# .get() returns None instead of crashing on missing keys
print(user.get("phone", "not set"))
\`\`\`

## Looping Through a Dictionary

\`\`\`python
for key, value in user.items():
    print(f"{key}: {value}")
\`\`\`

## Dictionary Comprehensions

\`\`\`python
squares = {n: n * n for n in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
\`\`\`

Use dictionaries when you need fast lookup by a name or id — like a real dictionary.`,
          language: 'python',
          difficulty: 'medium',
          order: 2,
          exercises: [
            {
              id: 'ex-9',
              lessonId: 'python-lesson-9',
              type: 'code',
              question: 'Create a dictionary with keys "name" and "score", then print the score value',
              starterCode: 'player = {\n    "name": "Sam",\n    "score": 42\n}\n# Print the score\n',
              expectedOutput: '42',
              xpReward: 20,
              coinReward: 10
            }
          ]
        },
        {
          id: 'python-lesson-10',
          moduleId: 'python-module-4',
          title: 'Tuples and Sets',
          content: `# Tuples and Sets

Two more built-in collections: tuples (fixed) and sets (unique items).

## Tuples — Immutable Lists

Tuples cannot be changed after creation. Use them for fixed records:

\`\`\`python
point = (10, 20)
name, age = ("Alice", 30)  # unpacking

print(point[0])   # 10
print(name)       # Alice
\`\`\`

## Sets — Unique Items

Sets automatically remove duplicates and are great for membership tests:

\`\`\`python
ids = {1, 2, 3, 3, 2}
print(ids)        # {1, 2, 3}

print(2 in ids)   # True — very fast
\`\`\`

## Set Operations

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}

print(a | b)   # union: {1, 2, 3, 4, 5}
print(a & b)   # intersection: {3}
print(a - b)   # difference: {1, 2}
\`\`\`

## Quick Reference

| Type | Ordered | Mutable | Duplicates |
|------|---------|---------|------------|
| list | yes | yes | allowed |
| tuple | yes | no | allowed |
| set | no | yes | not allowed |
| dict | yes (3.7+) | yes | keys unique |`,
          language: 'python',
          difficulty: 'medium',
          order: 3,
          exercises: [
            {
              id: 'ex-10',
              lessonId: 'python-lesson-10',
              type: 'code',
              question: 'Create a set from the list [1, 2, 2, 3, 3, 3] and print its length',
              starterCode: 'numbers = [1, 2, 2, 3, 3, 3]\n# Convert to a set and print the length\n',
              expectedOutput: '3',
              xpReward: 20,
              coinReward: 10
            }
          ]
        }
      ]
    },
    {
      id: 'python-module-5',
      title: 'Errors and Files',
      order: 5,
      lessons: [
        {
          id: 'python-lesson-11',
          moduleId: 'python-module-5',
          title: 'Handling Errors',
          content: `# Handling Errors

Programs crash on bad input — learn to catch errors gracefully.

## Try / Except

\`\`\`python
try:
    number = int(input("Enter a number: "))
    print(10 / number)
except ValueError:
    print("That's not a number!")
except ZeroDivisionError:
    print("Can't divide by zero!")
\`\`\`

## Catching Multiple Errors

\`\`\`python
try:
    result = 10 / int("abc")
except (ValueError, ZeroDivisionError) as e:
    print(f"Something went wrong: {e}")
\`\`\`

## Else and Finally

\`\`\`python
try:
    risky()
except Exception as e:
    print("Failed:", e)
else:
    print("Succeeded!")   # runs only if no exception
finally:
    print("Always runs")   # cleanup code
\`\`\`

## Raising Your Own Errors

\`\`\`python
def check_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age
\`\`\`

Good error handling makes programs predictable instead of crashing.`,
          language: 'python',
          difficulty: 'medium',
          order: 1,
          exercises: [
            {
              id: 'ex-11',
              lessonId: 'python-lesson-11',
              type: 'code',
              question: 'Write a try/except that attempts int("hello") and prints "caught" in the except block',
              starterCode: 'try:\n    number = int("hello")\nexcept ValueError:\n    # Print a message here\n    pass\n',
              expectedOutput: 'caught',
              xpReward: 25,
              coinReward: 10
            }
          ]
        },
        {
          id: 'python-lesson-12',
          moduleId: 'python-module-5',
          title: 'Reading and Writing Files',
          content: `# Files

Python makes it easy to read and write text files.

## Writing a File

\`\`\`python
with open("notes.txt", "w") as f:
    f.write("Hello file!\\n")
    f.write("Second line\\n")
\`\`\`

The \`with\` statement closes the file automatically — always use it.

## Reading a File

\`\`\`python
with open("notes.txt", "r") as f:
    content = f.read()       # whole file as one string

with open("notes.txt", "r") as f:
    for line in f:           # line by line
        print(line.strip())
\`\`\`

## Appending

\`\`\`python
with open("notes.txt", "a") as f:
    f.write("Added later\\n")
\`\`\`

## Mode Quick Reference

| Mode | Meaning |
|------|---------|
| \`"r"\` | read (default, file must exist) |
| \`"w"\` | write (creates or overwrites) |
| \`"a"\` | append (creates if missing) |

## Mini Project

Try writing a small program that asks for your name, saves it to \`name.txt\`, then reads it back and greets you.`,
          language: 'python',
          difficulty: 'hard',
          order: 2,
          exercises: [
            {
              id: 'ex-12',
              lessonId: 'python-lesson-12',
              type: 'code',
              question: 'Write code that opens "test.txt" in write mode and writes "Hello File" to it',
              starterCode: '# Use a with block to write to test.txt\n',
              expectedOutput: '',
              xpReward: 30,
              coinReward: 15
            }
          ]
        }
      ]
    }
  ]
};

export const javascriptCourse: Course = {
  id: 'javascript-basics',
  languageId: 'javascript',
  title: 'JavaScript Fundamentals',
  description: 'Master the basics of JavaScript programming',
  level: 1,
  modules: [
    {
      id: 'js-module-1',
      title: 'Introduction to JavaScript',
      order: 1,
      lessons: [
        {
          id: 'js-lesson-1',
          moduleId: 'js-module-1',
          title: 'Your First JavaScript Program',
          content: `// Welcome to JavaScript!

JavaScript is the programming language of the web. It runs in browsers and on servers.

## What is JavaScript?

JavaScript is a versatile language used for:
- Interactive websites
- Web applications
- Server-side development (Node.js)
- Mobile apps

## Your First Program

In JavaScript, we use \`console.log()\` to output text:

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

This will output: Hello, World!

## Variables

JavaScript has three ways to declare variables:

\`\`\`javascript
let name = "Alice";  // Can be reassigned
const age = 25;     // Cannot be reassigned
var old = "legacy"; // Old way (avoid)
\`\`\``,
          language: 'javascript',
          difficulty: 'easy',
          order: 1,
          exercises: [
            {
              id: 'js-ex-1',
              lessonId: 'js-lesson-1',
              type: 'code',
              question: 'Write a console.log statement that displays "Hello, World!"',
              starterCode: '// Write your code here\n',
              expectedOutput: 'Hello, World!',
              xpReward: 10,
              coinReward: 5
            }
          ]
        },
        {
          id: 'js-lesson-2',
          moduleId: 'js-module-1',
          title: 'Data Types',
          content: `// JavaScript Data Types

JavaScript has several primitive data types:

## String

\`\`\`javascript
let text = "Hello";
let text2 = 'World';
\`\`\`

## Number

\`\`\`javascript
let integer = 42;
let decimal = 3.14;
\`\`\`

## Boolean

\`\`\`javascript
let isTrue = true;
let isFalse = false;
\`\`\`

## Null and Undefined

\`\`\`javascript
let empty = null;
let notDefined = undefined;
\`\`\`

## Checking Types

\`\`\`javascript
console.log(typeof "hello");  // "string"
console.log(typeof 42);       // "number"
console.log(typeof true);     // "boolean"
\`\`\``,
          language: 'javascript',
          difficulty: 'easy',
          order: 2,
          exercises: [
            {
              id: 'js-ex-2',
              lessonId: 'js-lesson-2',
              type: 'code',
              question: 'Create a string variable called "message" with value "Hello" and log it',
              starterCode: '// Create your variable and log it\n',
              expectedOutput: 'Hello',
              xpReward: 15,
              coinReward: 5
            }
          ]
        }
      ]
    },
    {
      id: 'js-module-2',
      title: 'Functions and Arrays',
      order: 2,
      lessons: [
        {
          id: 'js-lesson-3',
          moduleId: 'js-module-2',
          title: 'Functions',
          content: `// Functions in JavaScript

Functions package code so you can reuse it.

## Declaring Functions

\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Alice")); // Hello, Alice!
\`\`\`

## Arrow Functions

Modern JavaScript prefers arrow functions:

\`\`\`javascript
const add = (a, b) => a + b;
console.log(add(2, 3)); // 5
\`\`\`

With a body and explicit return:

\`\`\`javascript
const square = (n) => {
  return n * n;
};
\`\`\`

## Default Parameters

\`\`\`javascript
function greet(name = "friend") {
  return "Hello, " + name;
}
\`\`\`

## Function Expressions

\`\`\`javascript
const double = function (n) {
  return n * 2;
};
\`\`\`

Functions are first-class values — you can pass them around like any variable.`,
          language: 'javascript',
          difficulty: 'easy',
          order: 1,
          exercises: [
            {
              id: 'js-ex-3',
              lessonId: 'js-lesson-3',
              type: 'code',
              question: 'Write an arrow function "multiply" that takes two numbers and returns their product, then log multiply(4, 5)',
              starterCode: '// Write your function and log the result\n',
              expectedOutput: '20',
              xpReward: 20,
              coinReward: 10
            }
          ]
        },
        {
          id: 'js-lesson-4',
          moduleId: 'js-module-2',
          title: 'Arrays and Loops',
          content: `// Arrays and Loops

Arrays store ordered lists of values.

## Creating Arrays

\`\`\`javascript
const fruits = ["apple", "banana", "cherry"];
const numbers = [1, 2, 3, 4, 5];
const mixed = ["text", 42, true];
\`\`\`

## Accessing and Changing

\`\`\`javascript
console.log(fruits[0]);   // apple
fruits[1] = "kiwi";       // change element
fruits.push("orange");    // add to end
fruits.pop();             // remove last
console.log(fruits.length); // current size
\`\`\`

## Looping with for...of

\`\`\`javascript
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

## Useful Array Methods

\`\`\`javascript
const doubled = numbers.map(n => n * 2);       // transform
const evens = numbers.filter(n => n % 2 === 0); // filter
const total = numbers.reduce((sum, n) => sum + n, 0); // combine
console.log(numbers.includes(3)); // true
\`\`\`

map/filter/reduce are the heart of modern JavaScript — practice them often.`,
          language: 'javascript',
          difficulty: 'medium',
          order: 2,
          exercises: [
            {
              id: 'js-ex-4',
              lessonId: 'js-lesson-4',
              type: 'code',
              question: 'Create an array [1, 2, 3, 4], use reduce to compute the sum, and log it',
              starterCode: 'const nums = [1, 2, 3, 4];\n// Compute the sum and log it\n',
              expectedOutput: '10',
              xpReward: 25,
              coinReward: 10
            }
          ]
        }
      ]
    }
  ]
};

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
    }
  ]
};

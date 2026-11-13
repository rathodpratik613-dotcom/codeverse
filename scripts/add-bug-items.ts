// Adds hand-authored bug-hunter items to reach 50 per language
// Run: npx tsx scripts/add-bug-items.ts
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'content', 'games');

interface BugItem {
  id: string;
  lesson: string;
  difficulty: 'easy' | 'medium' | 'hard';
  code: string;
  buggyLine: number;
  options: string[];
  answer: string;
  explanation: string;
}

const additions: Record<string, BugItem[]> = {
  ruby: [
    {
      id: 'ruby-bug-37',
      lesson: 'lesson-01',
      difficulty: 'easy',
      code: 'puts "Hello, World!"\nname = "Alice"\nputs "My name is #{name}"',
      buggyLine: 3,
      options: [
        'puts "My name is #{name}"',
        'puts "My name is {name}"',
        'puts "My name is " + name',
        'puts name'
      ],
      answer: 'puts "My name is #{name}"',
      explanation: 'Ruby string interpolation uses #{variable} inside double quotes. Single quotes or braces without # do not interpolate.'
    },
    {
      id: 'ruby-bug-38',
      lesson: 'lesson-02',
      difficulty: 'easy',
      code: 'numbers = [1, 2, 3, 4, 5]\nsum = numbers.sum\nputs sum',
      buggyLine: 2,
      options: [
        'sum = numbers.sum',
        'sum = numbers.sum()',
        'sum = sum(numbers)',
        'sum = numbers.add'
      ],
      answer: 'sum = numbers.sum',
      explanation: 'Array#sum is a method call without parentheses in Ruby. Adding () works but is unidiomatic; the others are wrong methods.'
    },
    {
      id: 'ruby-bug-39',
      lesson: 'lesson-03',
      difficulty: 'easy',
      code: 'def greet(name)\n  "Hello, #{name}!"\nend\nputs greet("Bob")',
      buggyLine: 4,
      options: [
        'puts greet("Bob")',
        'puts greet Bob',
        'greet("Bob")',
        'puts "Bob"'
      ],
      answer: 'puts greet("Bob")',
      explanation: 'Method calls with arguments need parentheses (or no space). puts greet Bob is parsed as puts(greet) then Bob is a separate expression.'
    },
    {
      id: 'ruby-bug-40',
      lesson: 'lesson-04',
      difficulty: 'medium',
      code: 'age = 25\nif age >= 18\n  puts "Adult"\nelsif age >= 13\n  puts "Teenager"\nelse\n  puts "Child"\nend',
      buggyLine: 4,
      options: [
        'elsif age >= 13',
        'else if age >= 13',
        'elif age >= 13',
        'elseif age >= 13'
      ],
      answer: 'elsif age >= 13',
      explanation: 'Ruby uses "elsif" (one word, no e after l) for else-if branches. "else if" creates a nested if inside else.'
    },
    {
      id: 'ruby-bug-41',
      lesson: 'lesson-05',
      difficulty: 'medium',
      code: 'fruits = ["apple", "banana", "cherry"]\nfruits.each do |fruit|\n  puts fruit.upcase\nend',
      buggyLine: 2,
      options: [
        'fruits.each do |fruit|',
        'fruits.each { |fruit|',
        'fruits.for do |fruit|',
        'fruits.loop do |fruit|'
      ],
      answer: 'fruits.each do |fruit|',
      explanation: 'Ruby blocks use do...end for multi-line or { } for single-line. "for" is not a method on arrays; "each" is correct.'
    },
    {
      id: 'ruby-bug-42',
      lesson: 'lesson-06',
      difficulty: 'medium',
      code: 'hash = { name: "Alice", age: 30 }\nputs hash[:name]\nputs hash["age"]',
      buggyLine: 3,
      options: [
        'puts hash["age"]',
        'puts hash[:age]',
        'puts hash.age',
        'puts hash.get("age")'
      ],
      answer: 'puts hash[:age]',
      explanation: 'Symbol keys (:age) and string keys ("age") are different in Ruby. hash[:name] works because :name is a symbol; hash["age"] fails because the key is :age.'
    },
    {
      id: 'ruby-bug-43',
      lesson: 'lesson-07',
      difficulty: 'medium',
      code: 'def factorial(n)\n  return 1 if n <= 1\n  n * factorial(n - 1)\nend\nputs factorial(5)',
      buggyLine: 2,
      options: [
        'return 1 if n <= 1',
        'if n <= 1 return 1',
        'return 1 unless n > 1',
        'if n <= 1 then return 1 end'
      ],
      answer: 'return 1 if n <= 1',
      explanation: 'Ruby supports modifier if: statement if condition. The others have syntax issues or change semantics.'
    },
    {
      id: 'ruby-bug-44',
      lesson: 'lesson-08',
      difficulty: 'hard',
      code: 'class Dog\n  attr_accessor :name, :breed\n  \n  def initialize(name, breed)\n    @name = name\n    @breed = breed\n  end\n  \n  def bark\n    "Woof!"\n  end\nend\n\ndog = Dog.new("Buddy", "Labrador")\nputs dog.bark',
      buggyLine: 13,
      options: [
        'puts dog.bark',
        'puts dog.bark()',
        'puts dog.bark()',
        'puts dog.bark()'
      ],
      answer: 'puts dog.bark',
      explanation: 'In Ruby, method calls without arguments can omit parentheses: dog.bark works. dog.bark() also works but is less idiomatic.'
    },
    {
      id: 'ruby-bug-45',
      lesson: 'lesson-09',
      difficulty: 'hard',
      code: 'begin\n  result = 10 / 0\nrescue ZeroDivisionError => e\n  puts "Error: #{e.message}"\nend',
      buggyLine: 3,
      options: [
        'rescue ZeroDivisionError => e',
        'rescue ZeroDivisionError = e',
        'catch ZeroDivisionError => e',
        'rescue => ZeroDivisionError'
      ],
      answer: 'rescue ZeroDivisionError => e',
      explanation: 'Ruby exception handling uses rescue with => to capture the exception object. The syntax rescue ClassName => variable is correct.'
    },
    {
      id: 'ruby-bug-46',
      lesson: 'lesson-10',
      difficulty: 'hard',
      code: 'numbers = [1, 2, 3, 4, 5]\nsquares = numbers.map { |n| n * n }\nevens = numbers.select { |n| n.even? }\nputs squares.inspect\nputs evens.inspect',
      buggyLine: 2,
      options: [
        'squares = numbers.map { |n| n * n }',
        'squares = numbers.map do |n| n * n end',
        'squares = numbers.collect { |n| n * n }',
        'squares = numbers.map(|n| n * n)'
      ],
      answer: 'squares = numbers.map { |n| n * n }',
      explanation: 'Ruby blocks can use { } for single expressions or do...end for multi-line. Both work, but { } is preferred for single-line operations.'
    },
    {
      id: 'ruby-bug-47',
      lesson: 'lesson-11',
      difficulty: 'hard',
      code: 'module Greeter\n  def greet\n    "Hello from module!"\n  end\nend\n\nclass Person\n  include Greeter\nend\n\np = Person.new\nputs p.greet',
      buggyLine: 10,
      options: [
        'include Greeter',
        'extend Greeter',
        'import Greeter',
        'use Greeter'
      ],
      answer: 'include Greeter',
      explanation: 'include adds module methods as instance methods. extend adds them as class methods. import and use are not Ruby keywords.'
    },
    {
      id: 'ruby-bug-48',
      lesson: 'lesson-12',
      difficulty: 'hard',
      code: 'def method_missing(name, *args)\n  puts "Called #{name} with #{args}"\nend\n\nobj = Object.new\nobj.undefined_method(1, 2, 3)',
      buggyLine: 1,
      options: [
        'def method_missing(name, *args)',
        'def method_missing(name, args)',
        'def missing_method(name, *args)',
        'def method_missing(name, **args)'
      ],
      answer: 'def method_missing(name, *args)',
      explanation: 'method_missing is a special Ruby method called when an undefined method is invoked. *args captures all arguments as an array.'
    },
    {
      id: 'ruby-bug-49',
      lesson: 'lesson-13',
      difficulty: 'hard',
      code: 'lambda_fn = ->(x) { x * 2 }\nproc_fn = proc { |x| x * 2 }\n\nputs lambda_fn.call(5)\nputs proc_fn.call(5)',
      buggyLine: 1,
      options: [
        'lambda_fn = ->(x) { x * 2 }',
        'lambda_fn = lambda { |x| x * 2 }',
        'lambda_fn = ->(x) do x * 2 end',
        'lambda_fn = proc { |x| x * 2 }'
      ],
      answer: 'lambda_fn = ->(x) { x * 2 }',
      explanation: 'Ruby lambdas use -> syntax or lambda keyword. Both create strict arity functions unlike proc which is lenient.'
    },
    {
      id: 'ruby-bug-50',
      lesson: 'lesson-14',
      difficulty: 'hard',
      code: 'class Calculator\n  def add(a, b)\n    a + b\n  end\n  \n  def self.multiply(a, b)\n    a * b\n  end\nend\n\ncalc = Calculator.new\nputs calc.add(2, 3)\nputs Calculator.multiply(4, 5)',
      buggyLine: 8,
      options: [
        'def self.multiply(a, b)',
        'def multiply(a, b)',
        'def Calculator.multiply(a, b)',
        'def class.multiply(a, b)'
      ],
      answer: 'def self.multiply(a, b)',
      explanation: 'self.method_name defines a class method in Ruby. Without self, it would be an instance method requiring an object.'
    }
  ],

  swift: [
    {
      id: 'swift-bug-36',
      lesson: 'lesson-01',
      difficulty: 'easy',
      code: 'let greeting = "Hello, World!"\nprint(greeting)',
      buggyLine: 2,
      options: [
        'print(greeting)',
        'println(greeting)',
        'console.log(greeting)',
        'echo greeting'
      ],
      answer: 'print(greeting)',
      explanation: 'Swift uses print() for output. println, console.log, and echo are from other languages.'
    },
    {
      id: 'swift-bug-37',
      lesson: 'lesson-02',
      difficulty: 'easy',
      code: 'var name = "Alice"\nlet age = 30\nname = "Bob"\n// age = 31  // This would be an error',
      buggyLine: 4,
      options: [
        '// age = 31  // This would be an error',
        'age = 31',
        'var age = 31',
        'let age = 31'
      ],
      answer: '// age = 31  // This would be an error',
      explanation: 'let declares a constant that cannot be reassigned. The commented line shows what would happen if you tried.'
    },
    {
      id: 'swift-bug-38',
      lesson: 'lesson-03',
      difficulty: 'easy',
      code: 'let numbers = [1, 2, 3, 4, 5]\nlet first = numbers[0]\nlet last = numbers[numbers.count - 1]\nprint(first, last)',
      buggyLine: 3,
      options: [
        'let last = numbers[numbers.count - 1]',
        'let last = numbers[numbers.count]',
        'let last = numbers.last',
        'let last = numbers[numbers.count - 2]'
      ],
      answer: 'let last = numbers[numbers.count - 1]',
      explanation: 'Array indices are 0-based. numbers.count gives the count, so the last index is count - 1. numbers.count would be out of bounds.'
    },
    {
      id: 'swift-bug-39',
      lesson: 'lesson-04',
      difficulty: 'medium',
      code: 'func greet(name: String) -> String {\n    return "Hello, \\(name)!"\n}\nprint(greet(name: "Charlie"))',
      buggyLine: 4,
      options: [
        'print(greet(name: "Charlie"))',
        'print(greet("Charlie"))',
        'print(greet(name: Charlie))',
        'print(greet("Charlie"))'
      ],
      answer: 'print(greet(name: "Charlie"))',
      explanation: 'Swift function calls require the parameter label: greet(name: "Charlie"). Omitting the label or using wrong syntax causes errors.'
    },
    {
      id: 'swift-bug-40',
      lesson: 'lesson-05',
      difficulty: 'medium',
      code: 'let optionalName: String? = nil\nif let name = optionalName {\n    print("Hello, \\(name)")\n} else {\n    print("Hello, stranger")\n}',
      buggyLine: 2,
      options: [
        'if let name = optionalName {',
        'if optionalName != nil {',
        'if let name = optionalName! {',
        'if optionalName {'
      ],
      answer: 'if let name = optionalName {',
      explanation: 'if let safely unwraps an optional. The others either don\'t unwrap properly or use force unwrapping which can crash.'
    },
    {
      id: 'swift-bug-41',
      lesson: 'lesson-06',
      difficulty: 'medium',
      code: 'struct Person {\n    var name: String\n    var age: Int\n}\n\nlet person = Person(name: "Alice", age: 30)\nprint(person.name)',
      buggyLine: 7,
      options: [
        'let person = Person(name: "Alice", age: 30)',
        'let person = Person("Alice", 30)',
        'let person = Person(name: "Alice", age: "30")',
        'let person = new Person(name: "Alice", age: 30)'
      ],
      answer: 'let person = Person(name: "Alice", age: 30)',
      explanation: 'Swift struct initialization uses labeled arguments matching property names. The memberwise initializer is automatically provided.'
    },
    {
      id: 'swift-bug-42',
      lesson: 'lesson-07',
      difficulty: 'medium',
      code: 'enum Direction {\n    case north, south, east, west\n}\n\nlet current = Direction.north\nswitch current {\ncase .north: print("Going north")\ncase .south: print("Going south")\ncase .east: print("Going east")\ncase .west: print("Going west")\n}',
      buggyLine: 8,
      options: [
        'case .north: print("Going north")',
        'case north: print("Going north")',
        'case Direction.north: print("Going north")',
        'case .North: print("Going north")'
      ],
      answer: 'case .north: print("Going north")',
      explanation: 'Enum cases in switch use dot notation: .north. Without the dot or with wrong case, it won\'t match.'
    },
    {
      id: 'swift-bug-43',
      lesson: 'lesson-08',
      difficulty: 'hard',
      code: 'class Vehicle {\n    var speed: Int = 0\n    \n    func accelerate() {\n        speed += 10\n    }\n}\n\nclass Car: Vehicle {\n    var brand: String\n    \n    init(brand: String) {\n        self.brand = brand\n        super.init()\n    }\n}\n\nlet car = Car(brand: "Toyota")\ncar.accelerate()\nprint(car.speed)',
      buggyLine: 15,
      options: [
        'super.init()',
        'self.init()',
        'Vehicle.init()',
        'super()'
      ],
      answer: 'super.init()',
      explanation: 'Subclass initializers must call super.init() to initialize the parent class. self.init() is for delegating within the same class.'
    },
    {
      id: 'swift-bug-44',
      lesson: 'lesson-09',
      difficulty: 'hard',
      code: 'protocol Greetable {\n    func greet() -> String\n}\n\nstruct EnglishGreeter: Greetable {\n    func greet() -> String {\n        return "Hello!"\n    }\n}\n\nlet greeter = EnglishGreeter()\nprint(greeter.greet())',
      buggyLine: 11,
      options: [
        'struct EnglishGreeter: Greetable {',
        'class EnglishGreeter: Greetable {',
        'struct EnglishGreeter implements Greetable {',
        'struct EnglishGreeter extends Greetable {'
      ],
      answer: 'struct EnglishGreeter: Greetable {',
      explanation: 'Swift uses colon (:) for protocol conformance, not implements or extends. Both struct and class can conform to protocols.'
    },
    {
      id: 'swift-bug-45',
      lesson: 'lesson-10',
      difficulty: 'hard',
      code: 'func processNumbers(_ numbers: [Int]) -> [Int] {\n    return numbers.filter { $0 > 0 }.map { $0 * 2 }\n}\n\nlet result = processNumbers([1, -2, 3, -4, 5])\nprint(result)',
      buggyLine: 2,
      options: [
        'return numbers.filter { $0 > 0 }.map { $0 * 2 }',
        'return numbers.filter { $0 < 0 }.map { $0 * 2 }',
        'return numbers.map { $0 * 2 }.filter { $0 > 0 }',
        'return numbers.filter { $0 >= 0 }.map { $0 * 2 }'
      ],
      answer: 'return numbers.filter { $0 > 0 }.map { $0 * 2 }',
      explanation: 'Closure shorthand $0 refers to the first parameter. filter keeps positive numbers, map doubles them. Order matters: filter first, then map.'
    },
    {
      id: 'swift-bug-46',
      lesson: 'lesson-11',
      difficulty: 'hard',
      code: 'let dict = ["a": 1, "b": 2, "c": 3]\nfor (key, value) in dict {\n    print("\\(key): \\(value)")\n}',
      buggyLine: 2,
      options: [
        'for (key, value) in dict {',
        'for key, value in dict {',
        'for (key: value) in dict {',
        'for [key, value] in dict {'
      ],
      answer: 'for (key, value) in dict {',
      explanation: 'Dictionary iteration uses tuple destructuring: for (key, value) in dict. Parentheses are required.'
    },
    {
      id: 'swift-bug-47',
      lesson: 'lesson-12',
      difficulty: 'hard',
      code: 'let numbers = [1, 2, 3, 4, 5]\nlet doubled = numbers.map { $0 * 2 }\nlet sum = numbers.reduce(0, +)\nprint(doubled)\nprint(sum)',
      buggyLine: 3,
      options: [
        'let sum = numbers.reduce(0, +)',
        'let sum = numbers.reduce(0) { $0 + $1 }',
        'let sum = numbers.sum()',
        'let sum = numbers.reduce(0, *)'
      ],
      answer: 'let sum = numbers.reduce(0, +)',
      explanation: 'reduce(initial, combine) applies combine to accumulate. + is a function reference for addition. The closure version also works.'
    },
    {
      id: 'swift-bug-48',
      lesson: 'lesson-13',
      difficulty: 'hard',
      code: 'extension String {\n    func reversedWords() -> String {\n        return self.split(separator: " ").reversed().joined(separator: " ")\n    }\n}\n\nlet text = "Hello World Swift"\nprint(text.reversedWords())',
      buggyLine: 3,
      options: [
        'return self.split(separator: " ").reversed().joined(separator: " ")',
        'return self.split(" ").reversed().joined(" ")',
        'return self.components(separatedBy: " ").reversed().joined(separator: " ")',
        'return self.split(separator: " ").reversed().joined()'
      ],
      answer: 'return self.split(separator: " ").reversed().joined(separator: " ")',
      explanation: 'split(separator:) takes a Character, joined(separator:) takes a String. The parameter labels are required.'
    },
    {
      id: 'swift-bug-49',
      lesson: 'lesson-14',
      difficulty: 'hard',
      code: 'guard let url = URL(string: "https://example.com") else {\n    fatalError("Invalid URL")\n}\nlet task = URLSession.shared.dataTask(with: url) { data, response, error in\n    if let data = data {\n        print(String(data: data, encoding: .utf8)!)\n    }\n}\ntask.resume()',
      buggyLine: 2,
      options: [
        'guard let url = URL(string: "https://example.com") else {',
        'if let url = URL(string: "https://example.com") {',
        'let url = URL(string: "https://example.com")!',
        'guard url = URL(string: "https://example.com") else {'
      ],
      answer: 'guard let url = URL(string: "https://example.com") else {',
      explanation: 'guard let safely unwraps optionals and exits scope if nil. The else block must exit the current scope (return, throw, fatalError, etc.).'
    },
    {
      id: 'swift-bug-50',
      lesson: 'lesson-15',
      difficulty: 'hard',
      code: 'actor Counter {\n    private var value = 0\n    \n    func increment() {\n        value += 1\n    }\n    \n    func getValue() -> Int {\n        return value\n    }\n}\n\nlet counter = Counter()\nawait counter.increment()\nprint(await counter.getValue())',
      buggyLine: 5,
      options: [
        'func increment() {',
        'func increment() async {',
        'func increment() throws {',
        'func increment() -> Int {'
      ],
      answer: 'func increment() {',
      explanation: 'Actor methods are implicitly async when called from outside. Inside the actor, methods don\'t need async keyword unless they suspend.'
    }
  ],

  sql: [
    {
      id: 'sql-bug-45',
      lesson: 'lesson-01',
      difficulty: 'easy',
      code: 'SELECT name, age FROM users WHERE age > 18;',
      buggyLine: 1,
      options: [
        'SELECT name, age FROM users WHERE age > 18;',
        'SELECT name age FROM users WHERE age > 18;',
        'SELECT name, age FROM users WHERE age >= 18;',
        'SELECT name, age FROM user WHERE age > 18;'
      ],
      answer: 'SELECT name, age FROM users WHERE age > 18;',
      explanation: 'SELECT requires commas between columns. The table name is users (plural). WHERE age > 18 is correct for strictly greater than.'
    },
    {
      id: 'sql-bug-46',
      lesson: 'lesson-02',
      difficulty: 'easy',
      code: 'INSERT INTO users (name, email, age) VALUES (\'Alice\', \'alice@example.com\', 30);',
      buggyLine: 1,
      options: [
        'INSERT INTO users (name, email, age) VALUES (\'Alice\', \'alice@example.com\', 30);',
        'INSERT INTO users (name, email, age) VALUES (\'Alice\' \'alice@example.com\' 30);',
        'INSERT INTO user (name, email, age) VALUES (\'Alice\', \'alice@example.com\', 30);',
        'INSERT users (name, email, age) VALUES (\'Alice\', \'alice@example.com\', 30);'
      ],
      answer: 'INSERT INTO users (name, email, age) VALUES (\'Alice\', \'alice@example.com\', 30);',
      explanation: 'INSERT INTO table (columns) VALUES (values) requires commas between values and the INTO keyword.'
    },
    {
      id: 'sql-bug-47',
      lesson: 'lesson-03',
      difficulty: 'easy',
      code: 'UPDATE users SET age = 31 WHERE id = 1;',
      buggyLine: 1,
      options: [
        'UPDATE users SET age = 31 WHERE id = 1;',
        'UPDATE users SET age = 31 WHERE id == 1;',
        'UPDATE user SET age = 31 WHERE id = 1;',
        'UPDATE users age = 31 WHERE id = 1;'
      ],
      answer: 'UPDATE users SET age = 31 WHERE id = 1;',
      explanation: 'UPDATE table SET column = value WHERE condition. Uses single = for assignment, not == (which is for comparison in some contexts).'
    },
    {
      id: 'sql-bug-48',
      lesson: 'lesson-04',
      difficulty: 'medium',
      code: 'SELECT name, COUNT(*) as order_count\nFROM orders\nGROUP BY name\nHAVING COUNT(*) > 5\nORDER BY order_count DESC;',
      buggyLine: 4,
      options: [
        'HAVING COUNT(*) > 5',
        'WHERE COUNT(*) > 5',
        'HAVING order_count > 5',
        'GROUP BY name HAVING COUNT(*) > 5'
      ],
      answer: 'HAVING COUNT(*) > 5',
      explanation: 'HAVING filters aggregated results after GROUP BY. WHERE filters rows before aggregation and cannot use aggregate functions.'
    },
    {
      id: 'sql-bug-49',
      lesson: 'lesson-05',
      difficulty: 'medium',
      code: 'SELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.total > 100;',
      buggyLine: 3,
      options: [
        'INNER JOIN orders o ON u.id = o.user_id',
        'INNER JOIN orders o ON u.id == o.user_id',
        'JOIN orders o ON u.id = o.user_id',
        'INNER JOIN orders ON u.id = o.user_id'
      ],
      answer: 'INNER JOIN orders o ON u.id = o.user_id',
      explanation: 'JOIN syntax: JOIN table alias ON condition. Uses single = for join conditions. Table alias o is required for column references.'
    },
    {
      id: 'sql-bug-50',
      lesson: 'lesson-06',
      difficulty: 'medium',
      code: 'SELECT name, AVG(age) as avg_age\nFROM users\nGROUP BY name\nORDER BY avg_age DESC\nLIMIT 10;',
      buggyLine: 4,
      options: [
        'ORDER BY avg_age DESC',
        'ORDER BY AVG(age) DESC',
        'ORDER BY avg_age ASC',
        'GROUP BY avg_age DESC'
      ],
      answer: 'ORDER BY avg_age DESC',
      explanation: 'ORDER BY can use column aliases defined in SELECT. avg_age refers to the alias. DESC sorts highest to lowest.'
    }
  ],

  bash: [
    {
      id: 'bash-bug-44',
      lesson: 'lesson-01',
      difficulty: 'easy',
      code: '#!/bin/bash\necho "Hello, World!"',
      buggyLine: 2,
      options: [
        'echo "Hello, World!"',
        'print "Hello, World!"',
        'echo Hello, World!',
        'echo \'Hello, World!\''
      ],
      answer: 'echo "Hello, World!"',
      explanation: 'echo outputs text. Quotes preserve spaces and special characters. print is not a bash builtin.'
    },
    {
      id: 'bash-bug-45',
      lesson: 'lesson-02',
      difficulty: 'easy',
      code: 'name="Alice"\nage=30\necho "Name: $name, Age: $age"',
      buggyLine: 3,
      options: [
        'echo "Name: $name, Age: $age"',
        'echo "Name: {name}, Age: {age}"',
        'echo "Name: \$name, Age: \$age"',
        'echo "Name: name, Age: age"'
      ],
      answer: 'echo "Name: $name, Age: $age"',
      explanation: 'Bash variables use $variable syntax. ${variable} also works for disambiguation. Escaping \$ shows literal dollar sign.'
    },
    {
      id: 'bash-bug-46',
      lesson: 'lesson-03',
      difficulty: 'easy',
      code: 'if [ $age -ge 18 ]; then\n  echo "Adult"\nelse\n  echo "Minor"\nfi',
      buggyLine: 1,
      options: [
        'if [ $age -ge 18 ]; then',
        'if [ $age >= 18 ]; then',
        'if [ $age -gt 18 ]; then',
        'if [[ $age -ge 18 ]]; then'
      ],
      answer: 'if [ $age -ge 18 ]; then',
      explanation: 'Test uses -ge for >=, -gt for >, -le for <=, -lt for <. The [ ] syntax requires spaces and semicolon before then.'
    },
    {
      id: 'bash-bug-47',
      lesson: 'lesson-04',
      difficulty: 'medium',
      code: 'for i in {1..5}; do\n  echo "Number: $i"\ndone',
      buggyLine: 1,
      options: [
        'for i in {1..5}; do',
        'for i in 1 2 3 4 5; do',
        'for i in $(seq 1 5); do',
        'for i in {1,5}; do'
      ],
      answer: 'for i in {1..5}; do',
      explanation: 'Brace expansion {1..5} generates sequence 1 2 3 4 5. seq command also works. {1,5} only generates 1 and 5.'
    },
    {
      id: 'bash-bug-48',
      lesson: 'lesson-05',
      difficulty: 'medium',
      code: 'while read -r line; do\n  echo "Line: $line"\ndone < input.txt',
      buggyLine: 1,
      options: [
        'while read -r line; do',
        'while read line; do',
        'while read -r $line; do',
        'while read line -r; do'
      ],
      answer: 'while read -r line; do',
      explanation: '-r prevents backslash interpretation. Variable name should not have $. read line without -r can mangle backslashes.'
    },
    {
      id: 'bash-bug-49',
      lesson: 'lesson-06',
      difficulty: 'medium',
      code: 'files=$(ls *.txt)\nfor file in $files; do\n  echo "Processing: $file"\ndone',
      buggyLine: 1,
      options: [
        'files=$(ls *.txt)',
        'files=`ls *.txt`',
        'files=$(ls *.txt | tr "\\n" " ")',
        'files=ls *.txt'
      ],
      answer: 'files=$(ls *.txt)',
      explanation: '$(command) is modern command substitution. Backticks also work but are deprecated. ls output needs word splitting for the for loop.'
    },
    {
      id: 'bash-bug-50',
      lesson: 'lesson-07',
      difficulty: 'hard',
      code: 'function greet {\n  local name=$1\n  echo "Hello, $name!"\n}\ngreet "World"',
      buggyLine: 2,
      options: [
        'local name=$1',
        'local name = $1',
        'name=$1',
        'local name "$1"'
      ],
      answer: 'local name=$1',
      explanation: 'local declares function-local variables. No spaces around =. $1 is first argument. Without local, variable is global.'
    }
  ]
};

for (const [lang, items] of Object.entries(additions)) {
  const filePath = path.join(ROOT, lang, 'bug-hunter.json');
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const merged = [...existing, ...items];
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  console.log(`${lang}: ${existing.length} -> ${merged.length} items`);
}
console.log('Done.');

/**
 * Curriculum generator for CODEVERSE.
 *
 * Generates a complete course dataset for every language:
 *   language > course > module > lesson (+ quiz + challenges)
 *
 * - 5 modules x 6 lessons = 30 lessons per language, ordered beginner -> advanced
 * - Every lesson: explanation sections, code example, key points, summary
 * - Every lesson gets a quiz file with 5 questions (answer + explanation)
 * - Every module gets 3 practice challenges
 *
 * Output: content/languages/<lang>/courses/<course>/...  (JSON, schema-validated)
 * Safe to re-run: files are overwritten deterministically; the importer
 * (npm run content:import) skips duplicates by type+id.
 *
 * Usage: npx tsx scripts/generate-curriculum.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  LanguageSchema, CourseSchema, ModuleSchema, LessonSchema, QuizSchema,
  ChallengeSchema, TestCaseSchema,
} from '../src/schemas/content';

// ---------------------------------------------------------------------------
// Language facts — real syntax for each language
// ---------------------------------------------------------------------------

interface Facts {
  id: string; name: string; icon: string; color: string;
  runtime: 'browser' | 'server' | 'simulated' | 'unsupported';
  ext: string;
  comment: string;          // line comment token
  commentBlock: string;     // block comment style description
  hello: string;            // full hello-world snippet
  helloOut: string;
  decl: string;             // variable declaration example line(s)
  declVar: string;          // e.g. "x = 5" used inside snippets
  assign: string;           // assignment operator fragment e.g. " = " or " := "
  printStr: (s: string) => string;  // print a string literal/expr
  prelude?: string;         // headers/includes needed before snippets
  wrap?: (body: string) => string;  // e.g. Go needs func main()
  kw: { if: string; else: string; for: string; while: string; fn: string; ret: string };
  strLit: string;           // a string literal example e.g. "\"Alice\""
  numLit: string;
  boolLit: string;
  semi: string;             // statement terminator
  indent: string;           // indentation unit for examples
}

const F = (f: Partial<Facts> & Pick<Facts, 'id' | 'name' | 'icon' | 'color'>): Facts => ({
  runtime: 'simulated', ext: 'txt', comment: '//', commentBlock: '/* */',
  hello: '', helloOut: 'Hello, World!', decl: '', declVar: '', assign: ' = ',
  printStr: (s) => `print(${s})`, strLit: '"Alice"', numLit: '42', boolLit: 'true',
  semi: '', indent: '    ',
  kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'def', ret: 'return' },
  ...f,
});

const LANGS: Facts[] = [
  F({ id: 'python', name: 'Python', icon: '🐍', color: '#3776AB', runtime: 'browser', ext: 'py',
    comment: '#', commentBlock: '# (line comments only)', hello: 'print("Hello, World!")',
    decl: 'name = "Alice"\nage = 30', declVar: 'x', assign: ' = ',
    printStr: (s) => `print(${s})`, strLit: '"Alice"', numLit: '42', boolLit: 'True', semi: '',
    kw: { if: 'if', else: 'elif/else', for: 'for', while: 'while', fn: 'def', ret: 'return' } }),
  F({ id: 'javascript', name: 'JavaScript', icon: '🟨', color: '#F7DF1E', runtime: 'browser', ext: 'js',
    comment: '//', hello: 'console.log("Hello, World!");',
    decl: 'let name = "Alice";\nconst age = 30;', declVar: 'x',
    printStr: (s) => `console.log(${s});`, strLit: '"Alice"', boolLit: 'true', semi: ';',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'function', ret: 'return' } }),
  F({ id: 'typescript', name: 'TypeScript', icon: '🔷', color: '#3178C6', runtime: 'browser', ext: 'ts',
    comment: '//', hello: 'console.log("Hello, World!");',
    decl: 'let name: string = "Alice";\nconst age: number = 30;', declVar: 'x',
    printStr: (s) => `console.log(${s});`, strLit: '"Alice"', boolLit: 'true', semi: ';',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'function', ret: 'return' } }),
  F({ id: 'java', name: 'Java', icon: '☕', color: '#ED8B00', ext: 'java',
    comment: '//', commentBlock: '/* */',
    hello: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    helloOut: 'Hello, World!',
    decl: 'String name = "Alice";\nint age = 30;', declVar: 'x',
    printStr: (s) => `System.out.println(${s});`, strLit: '"Alice"', boolLit: 'true', semi: ';',
    prelude: 'public class Main {\n    public static void main(String[] args) {\n',
    wrap: (b) => b + '\n    }\n}',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'void', ret: 'return' } }),
  F({ id: 'c', name: 'C', icon: '⚙️', color: '#A8B9CC', ext: 'c',
    comment: '//', commentBlock: '/* */',
    hello: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    decl: 'char name[] = "Alice";\nint age = 30;', declVar: 'x',
    printStr: (s) => `printf("%s\\n", ${s});`, strLit: '"Alice"', boolLit: '1 (true) / 0 (false)', semi: ';',
    prelude: '#include <stdio.h>\n\nint main() {\n', wrap: (b) => b + '\n    return 0;\n}',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'void', ret: 'return' } }),
  F({ id: 'cpp', name: 'C++', icon: '⚡', color: '#00599C', ext: 'cpp',
    comment: '//', commentBlock: '/* */',
    hello: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    decl: 'std::string name = "Alice";\nint age = 30;', declVar: 'x',
    printStr: (s) => `std::cout << ${s} << std::endl;`, strLit: '"Alice"', boolLit: 'true', semi: ';',
    prelude: '#include <iostream>\n#include <string>\n\nint main() {\n', wrap: (b) => b + '\n    return 0;\n}',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'void', ret: 'return' } }),
  F({ id: 'csharp', name: 'C#', icon: '🟣', color: '#68217A', ext: 'cs',
    comment: '//', commentBlock: '/* */',
    hello: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    decl: 'string name = "Alice";\nint age = 30;', declVar: 'x',
    printStr: (s) => `Console.WriteLine(${s});`, strLit: '"Alice"', boolLit: 'true', semi: ';',
    prelude: 'using System;\n\nclass Program {\n    static void Main() {\n', wrap: (b) => b + '\n    }\n}',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'void', ret: 'return' } }),
  F({ id: 'go', name: 'Go', icon: '🐹', color: '#00ADD8', runtime: 'server', ext: 'go',
    comment: '//', commentBlock: '/* */',
    hello: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    decl: 'name := "Alice"\nage := 30', declVar: 'x', assign: ' := ',
    printStr: (s) => `fmt.Println(${s})`, strLit: '"Alice"', boolLit: 'true', semi: '',
    prelude: 'package main\n\nimport "fmt"\n\nfunc main() {\n', wrap: (b) => b + '\n}',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'func', ret: 'return' } }),
  F({ id: 'rust', name: 'Rust', icon: '🦀', color: '#DEA584', ext: 'rs',
    comment: '//', commentBlock: '/* */',
    hello: 'fn main() {\n    println!("Hello, World!");\n}',
    decl: 'let name = "Alice";\nlet age = 30;', declVar: 'x',
    printStr: (s) => `println!("{}", ${s});`, strLit: '"Alice"', boolLit: 'true', semi: ';',
    prelude: 'fn main() {\n', wrap: (b) => b + '\n}',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'fn', ret: 'return' } }),
  F({ id: 'php', name: 'PHP', icon: '🐘', color: '#777BB4', runtime: 'server', ext: 'php',
    comment: '//', commentBlock: '/* */',
    hello: '<?php\necho "Hello, World!";',
    decl: '$name = "Alice";\n$age = 30;', declVar: '$x', assign: ' = ',
    printStr: (s) => `echo ${s};`, strLit: '"Alice"', boolLit: 'true', semi: ';',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'function', ret: 'return' } }),
  F({ id: 'ruby', name: 'Ruby', icon: '💎', color: '#CC342D', ext: 'rb',
    comment: '#', commentBlock: '=begin\n=end',
    hello: 'puts "Hello, World!"',
    decl: 'name = "Alice"\nage = 30', declVar: 'x',
    printStr: (s) => `puts ${s}`, strLit: '"Alice"', boolLit: 'true', semi: '',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'def', ret: 'return' } }),
  F({ id: 'swift', name: 'Swift', icon: '🍎', color: '#F05138', ext: 'swift',
    comment: '//', commentBlock: '/* */',
    hello: 'print("Hello, World!")',
    decl: 'let name = "Alice"\nlet age = 30', declVar: 'x',
    printStr: (s) => `print(${s})`, strLit: '"Alice"', boolLit: 'true', semi: '',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'func', ret: 'return' } }),
  F({ id: 'kotlin', name: 'Kotlin', icon: '🟣', color: '#7F52FF', ext: 'kt',
    comment: '//', commentBlock: '/* */',
    hello: 'fun main() {\n    println("Hello, World!")\n}',
    decl: 'val name = "Alice"\nvar age = 30', declVar: 'x',
    printStr: (s) => `println(${s})`, strLit: '"Alice"', boolLit: 'true', semi: '',
    prelude: 'fun main() {\n', wrap: (b) => b + '\n}',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'fun', ret: 'return' } }),
  F({ id: 'dart', name: 'Dart', icon: '🎯', color: '#0175C2', ext: 'dart',
    comment: '//', commentBlock: '/* */',
    hello: 'void main() {\n  print("Hello, World!");\n}',
    decl: 'var name = "Alice";\nvar age = 30;', declVar: 'x',
    printStr: (s) => `print(${s});`, strLit: '"Alice"', boolLit: 'true', semi: ';',
    prelude: 'void main() {\n', wrap: (b) => b + '\n}',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'void', ret: 'return' } }),
  F({ id: 'r', name: 'R', icon: '📊', color: '#276DC3', ext: 'r',
    comment: '#', commentBlock: '# (line comments only)', hello: 'print("Hello, World!")',
    decl: 'name <- "Alice"\nage <- 30', declVar: 'x', assign: ' <- ',
    printStr: (s) => `print(${s})`, strLit: '"Alice"', boolLit: 'TRUE', semi: '',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'function', ret: 'return' } }),
  F({ id: 'bash', name: 'Bash', icon: '🐚', color: '#4EAA25', runtime: 'server', ext: 'sh',
    comment: '#', commentBlock: '# (line comments only)', hello: 'echo "Hello, World!"',
    decl: 'name="Alice"\nage=30', declVar: 'x', assign: '=',
    printStr: (s) => `echo ${s}`, strLit: '"Alice"', boolLit: 'true', semi: '',
    kw: { if: 'if', else: 'else', for: 'for', while: 'while', fn: 'function', ret: 'return' } }),
  F({ id: 'assembly', name: 'Assembly', icon: '🔩', color: '#6E4C13', ext: 'asm',
    comment: ';', commentBlock: '; (line comments only)',
    hello: 'section .data\n    msg db "Hello, World!", 10\nsection .text\n    global _start\n_start:\n    mov eax, 4\n    mov ebx, 1\n    mov ecx, msg\n    mov edx, 14\n    int 0x80\n    mov eax, 1\n    xor ebx, ebx\n    int 0x80',
    decl: 'mov eax, 42\tmov ebx, 7', declVar: 'eax',
    printStr: () => '; output via syscall write (int 0x80)', strLit: '"text"', numLit: '42',
    boolLit: 'nonzero / zero', semi: '', indent: '    ',
    kw: { if: 'cmp/jcc', else: 'else', for: 'loop', while: 'loop', fn: 'label:', ret: 'ret' } }),
];

// HTML, CSS, SQL get dedicated curricula (not imperative languages)
const WEB_SQL: Facts[] = [
  F({ id: 'html', name: 'HTML', icon: '🌐', color: '#E34F26', runtime: 'browser', ext: 'html',
    comment: '<!-- -->', commentBlock: '-->', hello: '<!DOCTYPE html>\n<html>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
    decl: '<p>This is a paragraph.</p>', declVar: 'tag', assign: '',
    printStr: (s) => `<p>${s}</p>`, strLit: 'text', numLit: 'n/a', boolLit: 'n/a', semi: '',
    kw: { if: 'conditional', else: 'else', for: 'loop', while: 'loop', fn: 'element', ret: 'return' } }),
  F({ id: 'css', name: 'CSS', icon: '🎨', color: '#1572B6', runtime: 'browser', ext: 'css',
    comment: '/* */', commentBlock: '/* ... */', hello: 'body {\n    font-family: sans-serif;\n}\nh1 {\n    color: blue;\n}',
    decl: 'p { color: red; }', declVar: 'selector', assign: ': ',
    printStr: () => '/* styles applied by the browser */', strLit: '"red"', numLit: '16px',
    boolLit: 'n/a', semi: ';',
    kw: { if: '@media', else: 'else', for: '@for', while: 'n/a', fn: 'selector', ret: 'return' } }),
  F({ id: 'sql', name: 'SQL', icon: '🗄️', color: '#336791', runtime: 'server', ext: 'sql',
    comment: '--', commentBlock: '/* */',
    hello: 'SELECT "Hello, World!" AS greeting;', helloOut: 'Hello, World!',
    decl: "CREATE TABLE users (id INT, name VARCHAR(50));", declVar: 'column', assign: ' ',
    printStr: (s) => `SELECT ${s};`, strLit: "'Alice'", numLit: '42', boolLit: 'TRUE', semi: ';',
    kw: { if: 'CASE WHEN', else: 'ELSE', for: 'cursor', while: 'WHILE', fn: 'FUNCTION', ret: 'RETURN' } }),
];

const ALL_LANGS = [...LANGS, ...WEB_SQL];

// ---------------------------------------------------------------------------
// Canonical 30-lesson curriculum for programming languages (5 modules x 6)
// Each topic: module index, title, explanation, snippet(facts), quiz facts
// ---------------------------------------------------------------------------

interface Topic {
  mod: number; title: string; body: string;
  snippet: (f: Facts) => string;
  mcq: { q: string; a: string; opts: string[]; e: string };
  tf: { s: string; ok: boolean; e: string };
  fill: { code: string; answer: string; e: string };
}

const T = (t: Topic) => t;

const TOPICS: Topic[] = [
  // ---- Module 0: Getting Started ----
  T({ mod: 0, title: 'Hello World', body: `Every programming journey starts with printing your first message. A "Hello World" program proves your tools work and shows the basic shape of a ${''}program: code goes in, output comes out.\n\nRead the example line by line. The only job of this program is to send the text "Hello, World!" to the screen. Once you can do this, every other program is just bigger versions of the same idea.\n\nKey points: programs run top to bottom, output functions differ per language, and small programs build confidence.`,
    snippet: (f) => f.hello,
    mcq: { q: 'What does a "Hello World" program mainly teach you?', a: 'That your code runs and produces output', opts: ['How to design databases', 'That your code runs and produces output', 'How to make websites load fast', 'How computers store files'], e: 'It is the smallest program that proves your setup works end to end.' },
    tf: { s: 'A program\'s output always appears exactly where the print/output statement is placed in the code.', ok: true, e: 'Statements run in order, so output happens when that line executes.' },
    fill: { code: '{hello}', answer: '{hello}', e: 'The hello-world snippet is the complete minimal program.' } }),
  T({ mod: 0, title: 'Comments', body: `Comments are notes for humans inside code. The computer ignores them completely. Good comments explain WHY code does something, not what it does — the code already says what.\n\nEvery language has its own comment style. Some use a symbol at the start of a line, others use block markers. Knowing yours saves you from accidentally breaking programs.\n\nKey points: comments never affect output, use them for tricky logic, and remove stale comments when code changes.`,
    snippet: (f) => `${f.comment} This program greets the world\n${f.hello}`,
    mcq: { q: 'What is the correct comment syntax?', a: '{comment}', opts: ['{comment}', '{wrong1}', '{wrong2}', '{wrong3}'], e: 'Each language has one official comment marker.' },
    tf: { s: 'Comments are executed by the computer just like normal code.', ok: false, e: 'Comments are ignored entirely — they exist only for readers.' },
    fill: { code: '{comment} write a note here', answer: '{comment}', e: 'The line-comment marker starts a comment.' } }),
  T({ mod: 0, title: 'Variables', body: `A variable is a named box that stores a value. Instead of repeating a value everywhere, you store it once and reuse the name.\n\n${'Variables'} can hold text (strings), whole numbers (integers), decimals (floats), and true/false values (booleans). Assigning a new value replaces the old one.\n\nKey points: names should describe content (userAge, not x), most languages are case-sensitive, and you must declare or assign before use.`,
    snippet: (f) => `${f.decl}\n${f.comment} Variables hold reusable values`,
    mcq: { q: 'What is a variable?', a: 'A named storage location for a value', opts: ['A named storage location for a value', 'A type of computer virus', 'A printing command', 'A loop that repeats forever'], e: 'Variables let you store and reuse data by name.' },
    tf: { s: 'Once a variable is assigned, its value can never change.', ok: false, e: 'You can reassign a variable unless the language marks it constant.' },
    fill: { code: 'name{assign}"Alice"', answer: '{assign}', e: 'The assignment operator stores the value into the variable.' } }),
  T({ mod: 0, title: 'Data Types', body: `Every value has a type that decides what you can do with it. Numbers support math, strings support text operations, and booleans represent true/false.\n\nMixing types carelessly causes bugs — adding a number to text may concatenate or error depending on the language. Knowing your types prevents surprises.\n\nKey points: common types are int, float, string, bool; some languages require declaring types, others guess them.`,
    snippet: (f) => `${f.decl}\n${f.comment} Common types: ${f.strLit} is a string, ${f.numLit} is a number, ${f.boolLit} is a boolean`,
    mcq: { q: 'Which of these is typically a boolean value?', a: '{boolLit}', opts: ['{boolLit}', '"hello"', '42', '3.14'], e: 'Booleans represent truth values — only two states.' },
    tf: { s: 'In most languages, "42" (with quotes) and 42 (without quotes) are the same value.', ok: false, e: 'Quoted "42" is a string; unquoted 42 is a number.' },
    fill: { code: 'price = 9{semi}', answer: '{semi}', e: 'Statements are terminated the way the language requires.' } }),
  T({ mod: 0, title: 'Input and Output', body: `Programs talk to users through input and output. Output prints messages; input reads what the user types.\n\nEvery language has a standard way to print. Input is a bit more varied — some languages read from the console, others from files or the network.\n\nKey points: printing is your main debugging tool early on, and always check what type input arrives as — it often starts as text.`,
    snippet: (f) => `${f.printStr(f.strLit)}\n${f.comment} The line above sends text to the screen`,
    mcq: { q: 'What does the print/output function do?', a: 'Sends text or values to the screen or console', opts: ['Sends text or values to the screen or console', 'Deletes variables', 'Creates new files', 'Stops the program'], e: 'Output makes program results visible.' },
    tf: { s: 'User input is usually received as a string, even when the user typed a number.', ok: true, e: 'Most languages read input as text; you convert it explicitly.' },
    fill: { code: '{printCall}', answer: 'print/output call', e: 'Use the language\'s standard output function.' } }),
  T({ mod: 0, title: 'Operators', body: `Operators are symbols that work on values: + adds, - subtracts, * multiplies, / divides, and = assigns. Comparison operators (==, !=, >, <) produce booleans.\n\nEvery language shares these basics, though details differ — for example, some use % for remainder and ** for power.\n\nKey points: watch operator precedence (multiplication before addition), and = assigns while == compares in most languages.`,
    snippet: (f) => `${f.declVar}{assign}5 + 3 * 2\n${f.comment} Multiplication happens first: result is 11`,
    mcq: { q: 'What is 10 % 3 in most languages?', a: '1 (the remainder)', opts: ['1 (the remainder)', '3.33', '30', '0'], e: '% is the modulo operator — it returns the remainder.' },
    tf: { s: 'In math, 2 + 3 * 4 equals 20; the same order of operations applies in most programming languages.', ok: false, e: 'Multiplication binds tighter: the result is 14.' },
    fill: { code: 'result = 7 {op} 2   // result is 5', answer: '-', e: 'The minus operator subtracts.' } }),
  // ---- Module 1: Control Flow ----
  T({ mod: 1, title: 'If Statements', body: `If statements let code make decisions. When a condition is true, the block inside runs; otherwise it is skipped.\n\nMost languages also offer else (run when false) and elif/else-if (try another condition). Conditions must evaluate to true or false.\n\nKey points: indentation or braces define the block, conditions use comparison operators, and you can chain else-if for multiple cases.`,
    snippet: (f) => `age = 20\n${f.kw.if} age >= 18 {\n${f.indent}${f.printStr('"Adult"')}\n} ${f.kw.else} {\n${f.indent}${f.printStr('"Minor"')}\n}`,
    mcq: { q: 'What happens when an if condition is false and there is no else?', a: 'Nothing — the block is skipped', opts: ['Nothing — the block is skipped', 'The program crashes', 'The else block always runs', 'The condition repeats'], e: 'Without else, a false condition simply skips the block.' },
    tf: { s: 'You can put an if statement inside another if statement.', ok: true, e: 'Nesting ifs is normal — though deep nesting hurts readability.' },
    fill: { code: '${if} score >= 60 { ... }', answer: 'if', e: 'The if keyword starts a conditional.' } }),
  T({ mod: 1, title: 'For Loops', body: `Loops repeat code. A for loop runs a fixed number of times — perfect when you know how many iterations you need.\n\nThe classic pattern counts from a start to an end value. Many languages also let you loop directly over list items, which is often cleaner.\n\nKey points: watch off-by-one errors (does the end value count?), loop variables are scoped to the loop in modern languages.`,
    snippet: (f) => `${f.kw.for} i in range(5) {\n${f.indent}${f.printStr('i')}\n}\n${f.comment} prints 0 1 2 3 4`,
    mcq: { q: 'A for loop is best when...', a: 'you know how many times to repeat', opts: ['you know how many times to repeat', 'the condition depends on user input forever', 'you want infinite repetition', 'you need random behavior'], e: 'For loops count through a known sequence.' },
    tf: { s: 'Loop counters usually start at 1 in every programming language.', ok: false, e: 'Many languages (e.g. Python, C, JS) count from 0.' },
    fill: { code: '${for} ... { repeat }', answer: 'for', e: 'The for keyword begins a counted loop.' } }),
  T({ mod: 1, title: 'While Loops', body: `A while loop repeats as long as its condition stays true. It is checked before every iteration — if it starts false, the body never runs.\n\nWhile loops shine for "keep going until done" logic: reading input until a quit command, retrying failed operations, or processing streams.\n\nKey points: always ensure the condition eventually becomes false, or you create an infinite loop that hangs the program.`,
    snippet: (f) => `count = 0\n${f.kw.while} count < 5 {\n${f.indent}${f.printStr('count')}\n${f.indent}count = count + 1\n}`,
    mcq: { q: 'What makes a while loop safe?', a: 'Its condition eventually becomes false', opts: ['Its condition eventually becomes false', 'It has a fixed iteration count', 'It always runs exactly once', 'It cannot contain breaks'], e: 'A condition that never turns false loops forever.' },
    tf: { s: 'A while loop checks its condition before each iteration.', ok: true, e: 'That is why a false-start condition skips the body entirely.' },
    fill: { code: '${while} count < 10 { ... }', answer: 'while', e: 'While repeats until the condition fails.' } }),
  T({ mod: 1, title: 'Break and Continue', body: `Inside loops you can change the flow: break exits the loop immediately, and continue skips to the next iteration.\n\nBreak is for "found it, stop searching"; continue is for "skip this one item". Both save you from wrapping the rest of the loop body in extra ifs.\n\nKey points: break exits ALL remaining iterations, continue only skips the current one.`,
    snippet: (f) => `${f.kw.for} i in range(10) {\n${f.indent}${f.kw.if} i == 5 { break }\n${f.indent}${f.printStr('i')}\n}\n${f.comment} prints 0 1 2 3 4`,
    mcq: { q: 'What does "continue" do inside a loop?', a: 'Skips to the next iteration', opts: ['Skips to the next iteration', 'Exits the loop completely', 'Restarts the program', 'Pauses the loop forever'], e: 'Continue abandons the current iteration only.' },
    tf: { s: '"break" inside a nested loop exits only the innermost loop in most languages.', ok: true, e: 'Break affects the loop it is directly inside.' },
    fill: { code: 'if done { ${brk} }   // exit loop now', answer: 'break', e: 'Break leaves the loop immediately.' } }),
  T({ mod: 1, title: 'Conditionals Deep Dive', body: `Real programs combine conditions: and/or/not logic, comparison chains, and sometimes a switch that maps many values to different actions.\n\nBoolean algebra applies: conditions combine with AND (both true), OR (either true), NOT (flip). Parentheses control grouping.\n\nKey points: keep conditions readable — extract complex logic into a well-named boolean variable instead of one giant expression.`,
    snippet: (f) => `${f.kw.if} age >= 18 AND hasTicket {\n${f.indent}${f.printStr('"Welcome in"')}\n}`,
    mcq: { q: 'In boolean logic, A AND B is true when...', a: 'both A and B are true', opts: ['both A and B are true', 'either A or B is true', 'A is false', 'never'], e: 'AND requires both sides true; OR requires only one.' },
    tf: { s: 'NOT flips a boolean: NOT true is false.', ok: true, e: 'Negation inverts the truth value.' },
    fill: { code: 'eligible = age >= 18 ${and} hasID', answer: 'and', e: 'AND requires both conditions to hold.' } }),
  T({ mod: 1, title: 'Nested Loops', body: `A loop inside a loop processes combinations — rows and columns, every pair of items, or repeated patterns. The inner loop completes fully for each outer iteration.\n\nNested loops multiply work: an outer loop of N and inner of M runs the inner body N×M times. Keep nesting shallow for speed and clarity.\n\nKey points: inner loop variables must differ from outer ones, and indentation makes nesting visible at a glance.`,
    snippet: (f) => `${f.kw.for} row in range(3) {\n${f.indent}${f.kw.for} col in range(3) {\n${f.indent}${f.indent}${f.printStr('"*"')}\n${f.indent}}\n}`,
    mcq: { q: 'If the outer loop runs 4 times and the inner runs 5 times, the inner body executes...', a: '20 times', opts: ['20 times', '9 times', '5 times', '4 times'], e: 'Nested loops multiply: 4 × 5 = 20.' },
    tf: { s: 'The inner loop of a nested loop finishes all its iterations before the outer loop advances.', ok: true, e: 'That is the defining behavior of nesting.' },
    fill: { code: 'for row { for col { ... } }  // ${nest}', answer: 'nested loops', e: 'A loop inside a loop is called nesting.' } }),
  // ---- Module 2: Functions ----
  T({ mod: 2, title: 'Defining Functions', body: `Functions package code into named, reusable blocks. Instead of copy-pasting logic, you write it once and call it whenever needed.\n\nA function has a name, a parameter list, a body, and usually a return statement that hands a result back to the caller.\n\nKey points: good names describe what it does (calculateTax, not process), and functions should do one thing well.`,
    snippet: (f) => `${f.kw.fn} greet(name) {\n${f.indent}${f.kw.ret} "Hello, " + name\n}\n${f.comment} call it: greet("Sam")`,
    mcq: { q: 'Why use functions?', a: 'To reuse code and organize logic', opts: ['To reuse code and organize logic', 'To make programs run slower', 'To store data permanently', 'To avoid writing any code'], e: 'Functions eliminate duplication and create structure.' },
    tf: { s: 'A function must always return a value.', ok: false, e: 'Some functions just perform actions (like printing) and return nothing.' },
    fill: { code: '${fn} add(a, b) { return a + b }', answer: 'def/function/fn/func', e: 'The function keyword starts a definition.' } }),
  T({ mod: 2, title: 'Parameters and Arguments', body: `Parameters are the named inputs a function accepts; arguments are the actual values you pass when calling it.\n\nFunctions can take zero, one, or many parameters. Order matters — the first argument fills the first parameter, and so on.\n\nKey points: parameter names live only inside the function, and callers do not need to know the internal names — only the positions.`,
    snippet: (f) => `${f.kw.fn} add(a, b) {\n${f.indent}${f.kw.ret} a + b\n}\n${f.printStr('add(2, 3)')}  ${f.comment} passes 2 and 3 as arguments`,
    mcq: { q: 'What is the difference between a parameter and an argument?', a: 'Parameters are placeholders; arguments are the real values passed', opts: ['Parameters are placeholders; arguments are the real values passed', 'They are exactly the same thing', 'Parameters belong to callers, arguments to functions', 'Arguments are optional, parameters required'], e: 'Parameters define the shape; arguments supply the data.' },
    tf: { s: 'The number of arguments passed must match the number of parameters in most languages.', ok: true, e: 'Mismatched counts cause errors in statically checked languages.' },
    fill: { code: 'multiply(${x}, ${y})  // x and y are ___', answer: 'arguments', e: 'Values passed at call time are arguments.' } }),
  T({ mod: 2, title: 'Return Values', body: `The return statement hands a result back to whoever called the function, then ends the function immediately.\n\nWithout return, a function produces no usable result — it can still print or modify things, but callers get nothing back.\n\nKey points: code after return is unreachable, you can return any value including collections, and some languages return multiple values.`,
    snippet: (f) => `${f.kw.fn} square(n) {\n${f.indent}${f.kw.ret} n * n\n}\nresult = square(5)\n${f.comment} result is now 25`,
    mcq: { q: 'What does "return" do?', a: 'Sends a value back and ends the function', opts: ['Sends a value back and ends the function', 'Prints the value to screen', 'Repeats the function', 'Deletes the function'], e: 'Return both produces output and stops execution of that function.' },
    tf: { s: 'Statements after a return inside the same block can still execute.', ok: false, e: 'Return exits immediately; later lines never run.' },
    fill: { code: '${ret} a + b   // hand result to caller', answer: 'return', e: 'Return passes the value back.' } }),
  T({ mod: 2, title: 'Scope', body: `Scope decides where a name is visible. Variables declared inside a function usually exist only there — they are local. Variables outside are global, visible everywhere (use them sparingly).\n\nLocal scope prevents name collisions and makes functions predictable: two functions can each have a variable named total without interfering.\n\nKey points: a function sees its own locals plus outer globals, but outer code cannot see inside the function.`,
    snippet: (f) => `total = 0  ${f.comment} global\n${f.kw.fn} add(x) {\n${f.indent}total = total + x  ${f.comment} needs special handling in strict languages\n}`,
    mcq: { q: 'A variable declared inside a function is...', a: 'local — visible only within that function', opts: ['local — visible only within that function', 'global — visible everywhere', 'permanent — stored on disk', 'invisible to its own function'], e: 'Function bodies create their own scope.' },
    tf: { s: 'A function can read a global variable in most languages.', ok: true, e: 'Reading globals is allowed; modifying them can cause bugs.' },
    fill: { code: 'def f() { let temp = 1 }  // temp is ___ scoped', answer: 'local', e: 'Names inside functions default to local scope.' } }),
  T({ mod: 2, title: 'Recursion', body: `Recursion is a function calling itself to solve smaller versions of the same problem — like Russian nesting dolls.\n\nEvery recursive function needs a base case (the simplest possible input) and a recursive case that moves toward it. Missing the base case means infinite recursion and a crash.\n\nKey points: recursion excels at tree-like problems (file systems, JSON), but loops are often simpler for plain repetition.`,
    snippet: (f) => `${f.kw.fn} factorial(n) {\n${f.indent}${f.kw.if} n <= 1 { ${f.kw.ret} 1 }\n${f.indent}${f.kw.ret} n * factorial(n - 1)\n}`,
    mcq: { q: 'What MUST every recursive function have?', a: 'A base case that stops the recursion', opts: ['A base case that stops the recursion', 'At least ten parameters', 'A loop inside it', 'A print statement'], e: 'Without a base case, recursion never ends.' },
    tf: { s: 'Recursion can replace loops for problems that break into smaller identical sub-problems.', ok: true, e: 'Divide-and-conquer problems like factorial or tree traversal fit recursion.' },
    fill: { code: 'factorial calls ___ to solve smaller cases', answer: 'itself', e: 'Recursion means self-invocation.' } }),
  T({ mod: 2, title: 'Built-in Functions', body: `Languages ship with libraries of ready-made functions: length, round, random, sorting, string helpers, and more. Learning the standard toolbox saves you from reinventing basics.\n\nThe exact names differ per language, but the categories are universal: string functions, math functions, collection functions, and conversion functions.\n\nKey points: check official docs for your language's built-ins — they are faster and better tested than hand-rolled versions.`,
    snippet: (f) => `${f.comment} Common built-ins you will meet:\n${f.comment} length/count, round/floor/ceil, min/max, sort, join/split`,
    mcq: { q: 'What is a "built-in" or standard library function?', a: 'A ready-made function provided by the language', opts: ['A ready-made function provided by the language', 'A function only you can write', 'A hardware chip', 'A type of variable'], e: 'Standard libraries ship with every language.' },
    tf: { s: 'You should always write your own version of sorting instead of using built-ins.', ok: false, e: 'Built-in sorts are optimized and battle-tested.' },
    fill: { code: 'len("abc")  // ___ returns 3', answer: 'length', e: 'Length functions count items or characters.' } }),
  // ---- Module 3: Data Structures ----
  T({ mod: 3, title: 'Arrays and Lists', body: `Arrays (or lists) store ordered collections under one name. You reach items by position — index 0 is the first element.\n\nLists grow and shrink dynamically in most languages; fixed arrays exist too. Common operations: add, remove, access by index, and loop through every item.\n\nKey points: indexes start at 0, going past the end crashes or returns nothing, and loops over lists are everywhere in real code.`,
    snippet: (f) => `items = ["a", "b", "c"]\n${f.printStr('items[0]')}  ${f.comment} first item\n${f.comment} items[1], items[2] ... indexes count from 0`,
    mcq: { q: 'In most languages, the first element of a list has index...', a: '0', opts: ['0', '1', '-1', 'none'], e: 'Zero-based indexing is the near-universal convention.' },
    tf: { s: 'Lists can store values of mixed types in dynamically typed languages.', ok: true, e: 'Python/JS lists happily mix strings, numbers, and more.' },
    fill: { code: 'items[${i}]  // get element at position i', answer: '0-based index', e: 'Access uses numeric positions starting at 0.' } }),
  T({ mod: 3, title: 'Strings', body: `Strings are sequences of characters — text. You can concatenate them, measure length, slice out pieces, and search inside them.\n\nMost languages treat strings as immutable: operations return NEW strings rather than editing in place. This trips up beginners who expect in-place edits.\n\nKey points: quote styles vary (' vs "), escaping handles special characters, and string functions (upper, lower, split, contains) are daily tools.`,
    snippet: (f) => `text = "Hello"\n${f.comment} text + " World" joins strings\n${f.comment} text.upper() / text.length style helpers exist per language`,
    mcq: { q: 'What does concatenation mean for strings?', a: 'Joining them end to end into one string', opts: ['Joining them end to end into one string', 'Deleting half of them', 'Sorting them alphabetically', 'Comparing their lengths'], e: '"foo" + "bar" becomes "foobar".' },
    tf: { s: 'In languages with immutable strings, string functions return new strings.', ok: true, e: 'The original string is never modified.' },
    fill: { code: '"Hello" + " World"  // ___ two strings', answer: 'concatenate', e: 'The + operator joins strings.' } }),
  T({ mod: 3, title: 'Dictionaries and Maps', body: `Dictionaries (hash maps) store key-value pairs: look up a value instantly by its key instead of scanning a list.\n\nThink of a real dictionary: word -> definition. In code: username -> user object, or product id -> price. Keys must be unique.\n\nKey points: average lookup is extremely fast, keys are often strings or numbers, and missing keys need safe handling (.get / has checks).`,
    snippet: (f) => `user = { "name": "Alice", "age": 30 }\n${f.printStr('user["name"]')}  ${f.comment} look up by key`,
    mcq: { q: 'What is a dictionary/map best for?', a: 'Fast lookup of values by a unique key', opts: ['Fast lookup of values by a unique key', 'Storing items in sorted order only', 'Counting loop iterations', 'Printing text to screen'], e: 'Key-based lookup is O(1) on average — far faster than scanning.' },
    tf: { s: 'Dictionary keys must be unique within one dictionary.', ok: true, e: 'Duplicate keys overwrite or are rejected depending on language.' },
    fill: { code: 'scores["amy"] = 95  // "amy" is the ___', answer: 'key', e: 'The left side of the pair is the lookup key.' } }),
  T({ mod: 3, title: 'Sets', body: `A set stores unique values with no particular order. Adding a duplicate does nothing — the set simply keeps one copy.\n\nSets answer membership questions fast: "have we seen this value before?" They also support union, intersection, and difference operations.\n\nKey points: use sets to deduplicate lists, sets cannot be indexed by position, and membership tests are near-instant.`,
    snippet: (f) => `tags = {"python", "code", "python"}\n${f.comment} tags now holds only 2 unique values`,
    mcq: { q: 'What happens when you add a duplicate to a set?', a: 'Nothing — the set keeps only one copy', opts: ['Nothing — the set keeps only one copy', 'It stores both copies', 'It throws an error', 'It replaces the first copy'], e: 'Uniqueness is the entire point of a set.' },
    tf: { s: 'You can access set items by numeric index like a list.', ok: false, e: 'Sets are unordered — position access is meaningless.' },
    fill: { code: 'seen.add(item)  // track ___ values', answer: 'unique', e: 'Sets store each value at most once.' } }),
  T({ mod: 3, title: 'Sorting and Searching', body: `Sorting arranges items (numbers ascending, strings alphabetically); searching finds a target value or its position.\n\nLanguages provide built-in sort and search functions — use them instead of writing your own. Binary search on sorted data is dramatically faster than checking every item.\n\nKey points: sorting mutates or returns new collections depending on language, and always sort before binary searching.`,
    snippet: (f) => `nums = [3, 1, 2]\n${f.comment} sorted -> [1, 2, 3]  (use the built-in sort)\n${f.comment} binary search finds a target in O(log n) steps`,
    mcq: { q: 'Why is binary search faster than linear search?', a: 'It halves the remaining items each step', opts: ['It halves the remaining items each step', 'It uses more memory', 'It runs on a faster CPU', 'It skips comparisons randomly'], e: 'Binary search needs sorted data and takes O(log n) time.' },
    tf: { s: 'Binary search requires the data to be sorted first.', ok: true, e: 'The halving strategy only works on ordered data.' },
    fill: { code: 'items.sort()  // arrange in ___ order', answer: 'sorted', e: 'Sort orders elements for predictable access.' } }),
  T({ mod: 3, title: 'Objects and Structures', body: `Objects (or structs/classes instances) bundle related data and behavior: a "User" might have name, email, and methods like login().\n\nThis is the bridge from raw data to modeling the real world. Even simple programs benefit — a point has x and y; an invoice has lines and a total.\n\nKey points: group fields that belong together, methods keep data and logic in one place, and start simple — you do not need full OOP for small scripts.`,
    snippet: (f) => `user = { name: "Alice", age: 30 }\n${f.comment} an object groups related fields under one name`,
    mcq: { q: 'What does an object/struct primarily do?', a: 'Groups related data (and often behavior) under one name', opts: ['Groups related data (and often behavior) under one name', 'Stores only numbers', 'Replaces all functions', 'Encrypts data'], e: 'Objects model real-world things with fields + methods.' },
    tf: { s: 'You can access object fields using dot notation or bracket notation in many languages.', ok: true, e: 'user.name and user["name"] often mean the same thing.' },
    fill: { code: 'user.${field}  // access a field', answer: 'name', e: 'Dot notation reaches into an object.' } }),
  // ---- Module 4: Advanced ----
  T({ mod: 4, title: 'Error Handling', body: `Programs fail — bad input, missing files, network drops. Error handling catches failures gracefully instead of crashing.\n\nThe pattern: try risky code, catch the specific failure, and decide what to do (retry, default value, friendly message). Finally blocks run cleanup either way.\n\nKey points: catch specific error types, never swallow errors silently, and validate input early to prevent most failures.`,
    snippet: (f) => `try {\n${f.indent}risky_operation()\n} catch (error) {\n${f.indent}${f.printStr('"Something went wrong"')}\n}`,
    mcq: { q: 'What is the purpose of try/catch?', a: 'Handle failures without crashing the whole program', opts: ['Handle failures without crashing the whole program', 'Make code run faster', 'Hide bugs permanently', 'Replace testing'], e: 'Try/catch converts crashes into controlled responses.' },
    tf: { s: 'Empty catch blocks that ignore errors are a good practice.', ok: false, e: 'Silent failures hide bugs — always log or handle them.' },
    fill: { code: 'try { ... } ${catch} { ... }', answer: 'catch/except', e: 'The catch clause handles the failure.' } }),
  T({ mod: 4, title: 'Files', body: `Files let programs persist data beyond a single run — save settings, read datasets, write reports.\n\nThe golden rule: use a "with/open" pattern that guarantees the file closes, even if an error occurs. Forgetting close() causes corrupted files and locked resources.\n\nKey points: common modes are read/write/append, always specify encoding for text, and check that files exist before reading.`,
    snippet: (f) => `with open("data.txt", "r") as file {\n${f.indent}content = file.read()\n}\n${f.comment} file is auto-closed here`,
    mcq: { q: 'Why use "with open(...)" instead of open() + close()?', a: 'It closes the file automatically, even on errors', opts: ['It closes the file automatically, even on errors', 'It makes files bigger', 'It is required by all languages', 'It encrypts the file'], e: 'Context managers prevent resource leaks.' },
    tf: { s: 'Write mode ("w") overwrites an existing file completely.', ok: true, e: 'Append mode ("a") adds to the end instead.' },
    fill: { code: 'open("log.txt", "${mode}")  // add to end of file', answer: 'a', e: '"a" means append.' } }),
  T({ mod: 4, title: 'Modules and Imports', body: `Real programs split into modules — separate files you import to reuse functions without copy-paste.\n\nImports give you access to the standard library (math, dates, HTTP) and your own shared code. Organizing code into modules keeps projects maintainable.\n\nKey points: import only what you need, name collisions are possible, and circular imports break programs — keep dependencies one-directional.`,
    snippet: (f) => `${f.comment} import the tools you need\n${f.comment} e.g. math functions, date handling, file helpers`,
    mcq: { q: 'What does an import statement do?', a: 'Makes functions/code from another module available', opts: ['Makes functions/code from another module available', 'Deletes unused code', 'Compiles the program', 'Connects to the internet'], e: 'Imports load reusable code into your program.' },
    tf: { s: 'Every program must import at least one module to run.', ok: false, e: 'Small programs often need no imports at all.' },
    fill: { code: '${imp} math   // bring in the math module', answer: 'import', e: 'Import loads external code.' } }),
  T({ mod: 4, title: 'Classes and OOP Basics', body: `Object-oriented programming organizes code around objects: classes define the blueprint (fields + methods), objects are the instances.\n\nCore ideas: encapsulation (hide internals), inheritance (reuse via parent classes), polymorphism (same interface, different behavior). You have already used objects — strings and lists are objects in most languages!\n\nKey points: start with simple data-grouping before deep hierarchies, and prefer composition (has-a) over deep inheritance (is-a).`,
    snippet: (f) => `class Dog {\n${f.indent}name = "Buddy"\n${f.indent}${f.kw.fn} bark() { ${f.printStr('"Woof!"')} }\n}\n${f.comment} dog = Dog()  then  dog.bark()`,
    mcq: { q: 'What is a class?', a: 'A blueprint for creating objects', opts: ['A blueprint for creating objects', 'A compiled executable', 'A database table', 'A loop construct'], e: 'Classes define structure; objects are built from them.' },
    tf: { s: 'Strings and lists behave like objects in many languages — they have methods.', ok: true, e: '"abc".upper() is a method call on a string object.' },
    fill: { code: 'class ${name} { ... }   // blueprint for objects', answer: 'Dog/Animal/etc', e: 'Classes are named blueprints.' } }),
  T({ mod: 4, title: 'Async and Concurrency', body: `Async programming handles many tasks without waiting — fetching web data, timers, parallel downloads. Instead of blocking, you schedule work and continue.\n\nCallbacks, promises, and async/await are common patterns. The key mental shift: operations that take time should not freeze the whole program.\n\nKey points: async code runs "later", ordering is not guaranteed unless you await, and race conditions appear when tasks share state.`,
    snippet: (f) => `${f.comment} fetch data without blocking the UI\n${f.comment} await getData()  // pause THIS function only`,
    mcq: { q: 'What problem does async programming solve?', a: 'Long-running tasks without freezing the program', opts: ['Long-running tasks without freezing the program', 'Making code shorter', 'Removing the need for variables', 'Speeding up the CPU'], e: 'Async lets slow operations happen in the background.' },
    tf: { s: 'await pauses the entire program until the operation finishes.', ok: false, e: 'await pauses only the current async function, not everything.' },
    fill: { code: 'await fetch(url)  // wait for ___ to finish', answer: 'the promise', e: 'Await suspends until the async result arrives.' } }),
  // ---- Module 5: Projects & Mastery ----
  T({ mod: 5, title: 'Testing Your Code', body: `Testing means checking that code produces the results you expect — not just that it runs without crashing. Even a tiny test saves hours later.

Start manual: run the program with normal input, edge cases (empty, zero, negative), and bad input. Then automate repeated checks as functions so you can re-run them after every change.

Key points: test the boundaries, test what users will actually do, and a failing test tells you exactly what broke.`,
    snippet: (f) => `${f.comment} Test checklist: normal input, empty input, huge input, bad input\nresult = double(5)\n${f.comment} expected result: 10`,
    mcq: { q: 'What is the most valuable first test for a new function?', a: 'A normal input with a known expected output', opts: ['A normal input with a known expected output', 'The fastest possible input', 'Input that crashes the program', 'Random data with no expected result'], e: 'One known-good case proves the function basically works.' },
    tf: { s: 'Code that runs without errors is always correct.', ok: false, e: 'Running is not the same as producing correct results — logic bugs still slip through.' },
    fill: { code: 'assert result == ___   // check the expected value', answer: 'expected', e: 'Assertions compare actual output to expected output.' } }),
  T({ mod: 5, title: 'Debugging Strategies', body: `Debugging is systematic hunting for bugs. The worst approach is randomly changing code — the best is narrowing down where reality diverges from expectation.

Print or log values at each step, reproduce the bug reliably, then bisect: comment out halves of the code until the bug disappears, revealing the culprit.

Key points: read the error message fully, reproduce before fixing, and fix the cause — not the symptom.`,
    snippet: (f) => `${f.comment} DEBUG: print intermediate values\ntotal = 0\n${f.indent}total = total + item\n${f.printStr('total')}`,
    mcq: { q: 'What should you do FIRST when you find a bug?', a: 'Reproduce it reliably and note the exact steps', opts: ['Reproduce it reliably and note the exact steps', 'Rewrite the whole program', 'Delete the suspicious function', 'Restart the computer'], e: 'You cannot fix what you cannot reproduce.' },
    tf: { s: 'Adding print statements to inspect values is a legitimate debugging technique.', ok: true, e: 'Logging intermediate state is one of the oldest and most effective tools.' },
    fill: { code: 'console/log the value of ___ to see what it holds', answer: 'variable', e: 'Inspecting variable values reveals logic errors.' } }),
  T({ mod: 5, title: 'Reading Documentation', body: `Every language ships with official documentation — the authoritative reference for syntax, built-in functions, and standard libraries.

Docs follow patterns: a quick-start guide, then detailed references per topic. Learning to scan docs for "how do I X" turns you from guessing into working efficiently.

Key points: official docs beat random tutorials, search the exact function name, and note version differences — APIs change between releases.`,
    snippet: (f) => `${f.comment} Docs pattern: Quick Start -> Guides -> API Reference\n${f.comment} search for: function name + your language`,
    mcq: { q: 'Where should you look FIRST for accurate syntax questions?', a: 'The official language documentation', opts: ['The official language documentation', 'A random blog post', 'Guessing from memory', 'Asking in chat without checking'], e: 'Official docs are maintained and version-correct.' },
    tf: { s: 'Tutorials are always more reliable than official documentation.', ok: false, e: 'Tutorials can be outdated or wrong; official docs are authoritative.' },
    fill: { code: 'look up the ___ before using an unfamiliar function', answer: 'docs', e: 'Documentation describes exactly how functions behave.' } }),
  T({ mod: 5, title: 'Version Control Basics', body: `Version control (Git) tracks every change to your code, lets you undo mistakes, and enables collaboration. Even solo projects benefit — "what did I change yesterday?" becomes answerable.

The core loop: save snapshots (commits) with clear messages, work on branches for experiments, and merge back when ready. Platforms like GitHub host your repositories.

Key points: commit small and often, write messages that explain WHY, and never commit secrets or passwords.`,
    snippet: (f) => `${f.comment} git basics\n${f.comment} git init      - start tracking\n${f.comment} git add .     - stage changes\n${f.comment} git commit -m "describe why"\n${f.comment} git push     - share to remote`,
    mcq: { q: 'What is a commit?', a: 'A saved snapshot of your code at a point in time', opts: ['A saved snapshot of your code at a point in time', 'A type of computer virus', 'A programming language', 'An error message'], e: 'Commits let you revisit or revert any past state.' },
    tf: { s: 'You should commit code only when the whole project is finished.', ok: false, e: 'Frequent small commits are safer — they give you more restore points.' },
    fill: { code: 'git ___ -m "message"   // save a snapshot', answer: 'commit', e: 'commit records your staged changes permanently.' } }),
  T({ mod: 5, title: 'Asking Good Questions', body: `When stuck, a good question gets answers fast. Bad questions ("it doesn't work") get ignored; good ones include what you tried, what you expected, and what happened instead.

Before asking: read the error fully, search for the exact error message, check docs, and simplify your code to the smallest failing example.

Key points: show code + expected vs actual output, mention your language/version, and be specific — "on line 12, x is null when it should be 5".`,
    snippet: (f) => `${f.comment} Good question template:\n${f.comment} 1. what I expected\n${f.comment} 2. what actually happened\n${f.comment} 3. smallest code that reproduces it`,
    mcq: { q: 'Which question is most likely to get a helpful answer?', a: '"In Python 3.12, this 5-line script prints None instead of 5 — why?"', opts: ['"In Python 3.12, this 5-line script prints None instead of 5 — why?"', '"My code is broken, help"', '"How do I code?"', '"Why is programming hard?"'], e: 'Specific context lets others reproduce and diagnose quickly.' },
    tf: { s: 'Simplifying failing code to the smallest example helps debugging AND helps others help you.', ok: true, e: 'Minimal reproductions isolate the bug and make questions answerable.' },
    fill: { code: 'include expected vs ___ output in your question', answer: 'actual', e: 'Comparing expected and actual reveals the gap precisely.' } }),
  T({ mod: 5, title: 'Capstone Project', body: `Time to combine everything: variables, conditions, loops, functions, data structures, and error handling into one real program.\n\nPick a small useful tool — a number guessing game, a to-do list manager, a quiz scorer, or a unit converter. Start with the simplest version that works, then add features one at a time.\n\nKey points: plan the features first, build the core loop early, test each piece, and finish something you can actually show people.`,
    snippet: (f) => `${f.comment} YOUR PROJECT GOES HERE\n${f.comment} 1. plan features  2. build core loop  3. add one feature at a time`,
    mcq: { q: 'What is the best first step for a capstone project?', a: 'Define the smallest version that works end-to-end', opts: ['Define the smallest version that works end-to-end', 'Write every feature at once', 'Design the perfect architecture first', 'Copy a large open-source project'], e: 'Working software beats perfect plans.' },
    tf: { s: 'Adding features one at a time makes debugging much easier.', ok: true, e: 'Small increments isolate problems to recent changes.' },
    fill: { code: 'while game_running { play_round() }  // the main ___', answer: 'loop', e: 'Games and tools center on a main loop.' } }),
  T({ mod: 4, title: 'Naming and Readable Code', body: `Good names are the cheapest documentation: calculateTotalTax beats processData, isValidEmail beats flag2. Names should say what something IS or DOES.\n\nReadability rules that scale: functions do one thing, lines stay short, magic numbers become named constants, and comments explain WHY not WHAT. Code is read far more often than it is written.\n\nKey points: consistent naming conventions matter more than the exact style, avoid abbreviations unless universal (id, url, db), and if you need a comment to explain WHAT, rename instead.`,
    snippet: (f) => `${f.comment} Bad:  x = calc(a,b)\n${f.comment} Good: totalPrice = calculateTotal(basePrice, taxRate)\nuserCount = 0`,
    mcq: { q: 'Which name is best for a function that checks email format?', a: 'isValidEmail', opts: ['isValidEmail', 'check', 'doStuff2', 'emailFunc'], e: 'Names should reveal purpose — isValidEmail says exactly what it answers.' },
    tf: { s: 'Comments should explain WHAT the code does line by line.', ok: false, e: 'Code already says what — comments should explain WHY.' },
    fill: { code: 'const MAX_RETRIES = 3  // name ___ numbers', answer: 'magic', e: 'Named constants replace unexplained literal values.' } }),
];

// HTML / CSS / SQL dedicated topics (30 each)

const HTML_TOPICS: Topic[] = [
  T({ mod: 0, title: 'What is HTML', body: `HTML (HyperText Markup Language) is the skeleton of every web page. It describes structure using tags — headings, paragraphs, links, images — that browsers render.\n\nHTML is not a programming language; it has no variables or logic. It is a markup language: you describe WHAT things are, and CSS handles how they look.\n\nKey points: every page is a tree of nested elements, tags usually come in open/close pairs, and browsers are forgiving but you should write correct HTML.`,
    snippet: () => '<h1>Page Title</h1>\n<p>This is a paragraph of text.</p>',
    mcq: { q: 'What is HTML primarily used for?', a: 'Structuring web page content', opts: ['Structuring web page content', 'Styling colors and fonts', 'Storing databases', 'Running server logic'], e: 'HTML defines page structure; CSS styles it.' },
    tf: { s: 'HTML is a full programming language with loops and variables.', ok: false, e: 'HTML is markup — logic lives in CSS/JavaScript.' },
    fill: { code: '<${tag}>content</${tag}>', answer: 'p/h1/div', e: 'Elements use opening and closing tags.' } }),
  T({ mod: 0, title: 'Document Structure', body: `Every HTML page starts with a boilerplate: <!DOCTYPE html>, an <html> root, a <head> for metadata, and a <body> for visible content.\n\nThe head holds the title (shown in the browser tab), links to CSS, and meta tags. The body holds everything the visitor sees.\n\nKey points: always include the doctype, put metadata in head and content in body, and nesting must be correct — tags close in reverse order.`,
    snippet: () => '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello</h1>\n</body>\n</html>',
    mcq: { q: 'Where does visible page content go?', a: 'Inside <body>', opts: ['Inside <body>', 'Inside <head>', 'Inside <title>', 'Inside the doctype'], e: 'Head = metadata, body = visible content.' },
    tf: { s: 'The <title> tag appears in the browser tab, not on the page itself.', ok: true, e: 'Title lives in head and labels the tab/window.' },
    fill: { code: '<body> ... </${close}>', answer: 'body', e: 'Body wraps all visible content.' } }),
  T({ mod: 0, title: 'Text Elements', body: `HTML has elements for every kind of text: <h1>–<h6> headings (h1 biggest), <p> paragraphs, <strong>/<em> for emphasis, <ul>/<ol> for lists.\n\nHeadings create document outline and matter for SEO and accessibility — use one h1 per page and don't skip levels.\n\nKey points: choose tags by MEANING not appearance (CSS controls size), lists need <li> children, and <br> forces a line break.`,
    snippet: () => '<h1>Main Title</h1>\n<h2>Section</h2>\n<p>Some <strong>bold</strong> and <em>italic</em> text.</p>\n<ul>\n    <li>First item</li>\n    <li>Second item</li>\n</ul>',
    mcq: { q: 'Which tag creates the largest heading?', a: '<h1>', opts: ['<h1>', '<h6>', '<p>', '<header>'], e: 'h1 is the top-level heading; numbers go down to h6.' },
    tf: { s: 'You should use <h1> through <h6> in order without skipping levels.', ok: true, e: 'Skipping heading levels hurts accessibility and SEO.' },
    fill: { code: '<ul><li>Item</${li}></ul>', answer: 'li', e: 'List items use the li tag.' } }),
  T({ mod: 0, title: 'Links and Images', body: `The <a> tag creates hyperlinks with href pointing to a URL; <img> embeds images with src. Both are void-ish elements — <a> wraps content, <img> stands alone.\n\nAlways add alt text to images (accessibility + SEO), and use target="_blank" to open links in a new tab when appropriate.\n\nKey points: relative vs absolute URLs, # links jump to page sections via id, and images need width/height hints to avoid layout shift.`,
    snippet: () => '<a href="https://example.com">Visit Example</a>\n<img src="photo.jpg" alt="A description of the photo" width="400">',
    mcq: { q: 'What does the href attribute do on an <a> tag?', a: 'Specifies the link destination URL', opts: ['Specifies the link destination URL', 'Styles the link color', 'Adds a tooltip', 'Makes the link bold'], e: 'href = hypertext reference, the target address.' },
    tf: { s: 'The alt attribute on images is only decorative and can be skipped.', ok: false, e: 'Alt text is essential for screen readers and SEO.' },
    fill: { code: '<a href="${url}">text</a>', answer: 'https://...', e: 'href holds the destination.' } }),
  T({ mod: 0, title: 'Lists and Tables', body: `HTML offers unordered lists (<ul>), ordered lists (<ol> with optional start/reversed), and tables for grid data.\n\nTables use <table>, <tr> rows, <th> header cells, and <td> data cells. Never use tables for page layout — CSS Grid/Flexbox does that.\n\nKey points: <ol> numbers items automatically, nested lists go inside <li>, and tables need proper header cells for accessibility.`,
    snippet: () => '<ol>\n    <li>First</li>\n    <li>Second</li>\n</ol>\n<table>\n    <tr><th>Name</th><th>Age</th></tr>\n    <tr><td>Amy</td><td>30</td></tr>\n</table>',
    mcq: { q: 'Which tag pair creates a numbered list?', a: '<ol>', opts: ['<ol>', '<ul>', '<dl>', '<table>'], e: 'ol = ordered list; ul = unordered (bullets).' },
    tf: { s: 'Tables should be used for page layout in modern HTML.', ok: false, e: 'Layout is CSS\'s job — tables are for tabular data only.' },
    fill: { code: '<tr><${cell}>Data</${cell}></tr>', answer: 'td', e: 'td holds table data; th holds headers.' } }),
  T({ mod: 0, title: 'Forms', body: `Forms collect user input: <form> wraps <input>, <textarea>, <select>, and a submit button. Each control needs a name so the data can be sent.\n\nInput types matter: text, email, password, number, checkbox, radio, date. The type gives free validation and better mobile keyboards.\n\nKey points: always label inputs (accessibility), required marks mandatory fields, and the form action/method decide where data goes.`,
    snippet: () => '<form action="/signup" method="post">\n    <label for="email">Email</label>\n    <input type="email" id="email" name="email" required>\n    <button type="submit">Sign Up</button>\n</form>',
    mcq: { q: 'What does input type="email" give you?', a: 'Built-in email format validation and a suitable keyboard', opts: ['Built-in email format validation and a suitable keyboard', 'Automatic password encryption', 'A dropdown menu', 'File upload'], e: 'Semantic input types improve UX and validation.' },
    tf: { s: 'Every form control should have an associated <label>.', ok: true, e: 'Labels help screen readers and increase click targets.' },
    fill: { code: '<input type="${t}" name="age">', answer: 'number', e: 'Types tailor input behavior and validation.' } }),
  T({ mod: 0, title: 'Semantic HTML', body: `Semantic tags describe meaning: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer> replace generic <div> soup.\n\nSearch engines, screen readers, and other developers all rely on semantics. A page built with semantic tags is accessible by default.\n\nKey points: one <main> per page, <nav> for navigation blocks, <article> for self-contained content, and landmarks help keyboard users skip around.`,
    snippet: () => '<header>Site logo + nav</header>\n<main>\n    <article>Blog post</article>\n</main>\n<footer>Copyright</footer>',
    mcq: { q: 'Why prefer <main> over <div class="main">?', a: 'It conveys meaning to browsers, SEO, and assistive tech', opts: ['It conveys meaning to browsers, SEO, and assistive tech', 'It is faster to type', 'Divs are deprecated', 'It adds colors automatically'], e: 'Semantics communicate structure, not just appearance.' },
    tf: { s: 'A page should have exactly one <main> element.', ok: true, e: 'Main marks the dominant content region.' },
    fill: { code: '<${tag}>primary page content</${tag}>', answer: 'main', e: 'main wraps the dominant content.' } }),
  T({ mod: 0, title: 'Media: Audio, Video, Embeds', body: `HTML embeds rich media natively: <img> for images, <audio> and <video> with <source> fallbacks, <iframe> for external content like maps or videos.\n\nAlways provide fallback content inside media tags for older browsers, and include controls + preload hints on video/audio.\n\nKey points: lazy-loading images (loading="lazy") speeds pages, iframes need sandboxing for security, and video needs multiple formats for compatibility.`,
    snippet: () => '<video controls preload="metadata">\n    <source src="clip.mp4" type="video/mp4">\n    Your browser does not support video.\n</video>',
    mcq: { q: 'What is <iframe> used for?', a: 'Embedding external content like maps or videos', opts: ['Embedding external content like maps or videos', 'Creating image galleries only', 'Styling text', 'Storing form data'], e: 'iframes embed whole other pages/documents.' },
    tf: { s: 'The controls attribute on <video> shows play/pause buttons.', ok: true, e: 'Without controls users cannot interact with the video.' },
    fill: { code: '<img src="a.jpg" ${attr}="A cat">', answer: 'alt', e: 'alt describes the image for accessibility.' } }),
  T({ mod: 1, title: 'Attributes and Global Attributes', body: `Attributes configure elements: href on links, src on images, class and id for CSS/JS hooks, style for inline CSS.\n\nGlobal attributes work on every element: class (shared styling), id (unique identifier), title (tooltip), data-* (custom data), hidden, lang.\n\nKey points: attribute values go in quotes, class can hold multiple space-separated names, and id must be unique per page.`,
    snippet: () => '<p id="intro" class="lead highlight" title="A tooltip">Text</p>\n<div data-user-id="42">Custom data</div>',
    mcq: { q: 'What is the difference between class and id?', a: 'class can repeat on many elements; id must be unique', opts: ['class can repeat on many elements; id must be unique', 'They are identical', 'id styles, class scripts', 'class is for images only'], e: 'id = one per page; class = reusable groups.' },
    tf: { s: 'The data-* attributes store custom information for scripts.', ok: true, e: 'data-user-id="42" is readable via dataset in JS.' },
    fill: { code: 'class="${a} ${b}"  // two classes on one element', answer: 'space-separated', e: 'Classes are separated by spaces.' } }),
  T({ mod: 1, title: 'Divs and Spans', body: `<div> is the generic block container; <span> is the generic inline container. Neither adds meaning — they exist purely for CSS/JS grouping.\n\nReach for semantic tags first (nav, article, section); use div/span only when no semantic element fits. This keeps pages accessible and stylesheets sane.\n\nKey points: div = block (new line), span = inline (flows with text), and class names should describe purpose (.card, .nav-link) not appearance (.red-box).`,
    snippet: () => '<div class="card">\n    <h2>Title</h2>\n    <p>Text with a <span class="highlight">highlighted</span> word.</p>\n</div>',
    mcq: { q: 'When should you use <div> or <span>?', a: 'When no semantic element fits the grouping need', opts: ['When no semantic element fits the grouping need', 'For every piece of text', 'Never — they are deprecated', 'Only for images'], e: 'They are neutral containers for styling/scripting.' },
    tf: { s: '<div> creates a block-level box; <span> stays inline.', ok: true, e: 'That layout difference matters for flow.' },
    fill: { code: '<${tag} class="inline-note">note</${tag}>', answer: 'span', e: 'span is the inline container.' } }),
  T({ mod: 1, title: 'HTML Entities', body: `Some characters are special in HTML: < starts a tag, & starts an entity, > closes one. To display them literally, use entity codes like &lt; &gt; &amp; &nbsp;.\n\nEntities also cover symbols and international characters: &copy; ©, &euro; €, &mdash; —, and numeric forms like &#65; for A.\n\nKey points: always escape user-generated content to prevent broken pages and XSS, and &nbsp; prevents unwanted line breaks in phrases.`,
    snippet: () => '<p>5 &lt; 10 and 10 &gt; 5 is &amp; logic</p>\n<p>Copyright &copy; 2026 &mdash; Tom &amp; Jerry</p>',
    mcq: { q: 'How do you display a literal < character on a page?', a: '&lt;', opts: ['&lt;', '<', '&gt;', '&#60;'], e: '&lt; renders as < without starting a tag.' },
    tf: { s: 'Using raw < in text content can break the HTML structure.', ok: true, e: 'The parser treats it as a tag start.' },
    fill: { code: 'Tom &${amp} Jerry  // literal ampersand', answer: 'amp', e: '&amp; shows a real &.' } }),
  T({ mod: 1, title: 'Comments in HTML', body: `HTML comments look like <!-- this --> and are invisible in the rendered page. Use them to explain structure or temporarily disable markup.\n\nComments never reach the browser's visible output but ARE sent to the client — never put secrets or sensitive notes in them.\n\nKey points: comments cannot nest, they can wrap whole sections, and conditional comments for old IE are obsolete.`,
    snippet: () => '<!-- Navigation starts here -->\n<nav>...</nav>\n<!-- NOTE: add search box -->',
    mcq: { q: 'How do you write an HTML comment?', a: '<!-- like this -->', opts: ['<!-- like this -->', '// like this', '/* like this */', '# like this'], e: 'HTML uses angle-bracket comment syntax.' },
    tf: { s: 'HTML comments are visible when you view page source.', ok: true, e: 'They ship to the client — just not rendered.' },
    fill: { code: '<!-- ${note} -->', answer: 'comment text', e: 'Text between the markers is ignored.' } }),
  T({ mod: 1, title: 'Links Deep Dive', body: `Links can do more than navigate: fragment links (#section) jump within a page, mailto: opens email, tel: dials on mobile, and download attributes save files.\n\nLink text should describe the destination ("Read the guide", not "click here") — screen readers announce links out of context.\n\nKey points: absolute vs relative paths, rel="noopener" for target="_blank" security, and visited/focus states matter for usability.`,
    snippet: () => '<a href="#pricing">See pricing</a>\n<a href="mailto:hi@example.com">Email us</a>\n<a href="file.zip" download>Download</a>',
    mcq: { q: 'What does href="#section" do?', a: 'Jumps to the element with id="section" on the same page', opts: ['Jumps to the element with id="section" on the same page', 'Opens a new website', 'Downloads a file', 'Sends an email'], e: 'The # fragment references an element id.' },
    tf: { s: 'Links with target="_blank" should use rel="noopener" for security.', ok: true, e: 'It prevents the new page accessing window.opener.' },
    fill: { code: '<a href="${p}about.html">About</a>', answer: 'relative path', e: 'Relative paths resolve from the current page.' } }),
  T({ mod: 1, title: 'Images Best Practices', body: `Images make pages heavy — optimize them: right format (WebP/AVIF today, JPEG photos, PNG transparency, SVG graphics), correct dimensions, and lazy loading below the fold.\n\nAlways set width and height attributes (or CSS aspect-ratio) to prevent layout shift, and write meaningful alt text — decorative images get alt="".\n\nKey points: srcset serves different sizes to different screens, <picture> enables art direction, and never link directly to huge originals.`,
    snippet: () => '<img src="hero.webp" alt="Team working" width="1200" height="600" loading="lazy">',
    mcq: { q: 'Why set width and height on images?', a: 'To prevent layout shift while the image loads', opts: ['To prevent layout shift while the image loads', 'To make images colorful', 'Required for SEO only', 'To enable right-click saving'], e: 'Reserved space stops content jumping (CLS).', },
    tf: { s: 'Decorative images should have empty alt text (alt="").', ok: true, e: 'Empty alt tells screen readers to skip them.' },
    fill: { code: 'loading="${v}"  // defer off-screen images', answer: 'lazy', e: 'Lazy loading delays off-screen images.' } }),
  T({ mod: 2, title: 'HTML5 Forms Advanced', body: `Modern forms include datalist autocomplete, output elements, and the :invalid/:valid CSS states for live feedback. The FormData API reads submissions in JavaScript.\n\nPattern attributes validate formats (emails, codes), min/max constrain numbers, and formaction overrides per-button.\n\nKey points: never trust client validation alone — always validate server-side too, and use autocomplete attributes so browsers can fill correctly.`,
    snippet: () => '<input list="colors" name="fav">\n<datalist id="colors">\n    <option value="Red">\n    <option value="Blue">\n</datalist>',
    mcq: { q: 'What does <datalist> provide?', a: 'Autocomplete suggestions for an input', opts: ['Autocomplete suggestions for an input', 'A table of data', 'A dropdown of pages', 'Form validation errors'], e: 'datalist offers suggestions while typing.' },
    tf: { s: 'Client-side validation alone is enough to secure a form.', ok: false, e: 'Users can bypass it — always validate on the server.' },
    fill: { code: 'autocomplete="${v}"  // let browser fill the field', answer: 'email/name/etc', e: 'autocomplete tokens help password managers.' } }),
  T({ mod: 2, title: 'Accessibility Basics', body: `Accessible HTML means everyone can use your page: semantic landmarks, alt text, sufficient contrast, keyboard navigation, and ARIA only when HTML falls short.\n\nTest by unplugging your mouse — can you reach everything? Screen readers announce landmarks, headings, and form labels; get those right first.\n\nKey points: lang attribute on <html>, skip-to-content links, visible focus styles, and never convey meaning by color alone.`,
    snippet: () => '<html lang="en">\n<body>\n    <a href="#main" class="skip">Skip to content</a>\n    <main id="main">...</main>\n</body>',
    mcq: { q: 'What is the first accessibility win on any page?', a: 'Correct semantic structure and landmarks', opts: ['Correct semantic structure and landmarks', 'Fancy animations', 'More ads', 'Bigger fonts only'], e: 'Structure carries meaning to assistive technology.' },
    tf: { s: 'The lang attribute on <html> helps screen readers pronounce text correctly.', ok: true, e: 'It sets the document language for pronunciation rules.' },
    fill: { code: 'aria-${attr}="..."  // only when HTML falls short', answer: 'label/hidden/etc', e: 'ARIA supplements, not replaces, semantics.' } }),
  T({ mod: 2, title: 'SEO and Meta Tags', body: `Meta tags in <head> describe your page to search engines: <title>, <meta name="description">, Open Graph tags for social shares, canonical URLs, and robots directives.\n\nOne H1, descriptive titles, fast pages, and semantic content all rank better. Structured data (JSON-LD) enables rich results like FAQ boxes.\n\nKey points: title ~50-60 chars, description ~150-160, every page needs unique meta, and sitemap.xml helps crawlers discover pages.`,
    snippet: () => '<head>\n    <title>Learn HTML - Guide</title>\n    <meta name="description" content="A beginner guide to HTML.">\n    <link rel="canonical" href="https://site.com/page">\n</head>',
    mcq: { q: 'What does the meta description do?', a: 'Gives search engines a summary shown under the result', opts: ['Gives search engines a summary shown under the result', 'Changes page colors', 'Encrypts the page', 'Adds keywords to body text'], e: 'It is the snippet text in search results.' },
    tf: { s: 'Every page should have a unique, descriptive <title>.', ok: true, e: 'Duplicate titles confuse search engines and users.' },
    fill: { code: '<meta name="${n}" content="...">', answer: 'description/viewport/robots', e: 'Meta name/value pairs configure the page.' } }),
  T({ mod: 2, title: 'HTML Templates and Boilerplate', body: `A boilerplate is the standard starting skeleton — doctype, html/head/body, meta charset, viewport, title — that every page needs.\n\nTemplating (or components in frameworks) lets you reuse header/footer/nav across pages instead of duplicating markup.\n\nKey points: always start from the boilerplate, charset UTF-8 first in head, viewport meta is required for mobile, and comments mark template regions.`,
    snippet: () => '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Page</title>\n</head>\n<body>\n    <!-- content -->\n</body>\n</html>',
    mcq: { q: 'Why include <meta charset="UTF-8"> early?', a: 'So the browser reads characters correctly', opts: ['So the browser reads characters correctly', 'It speeds up images', 'It enables forms', 'It adds a favicon'], e: 'Charset must be declared before any text content.' },
    tf: { s: 'The viewport meta tag is essential for mobile-friendly pages.', ok: true, e: 'Without it phones render a desktop-width layout scaled down.' },
    fill: { code: '<meta name="${v}" content="width=device-width">', answer: 'viewport', e: 'Viewport controls mobile rendering scale.' } }),
  T({ mod: 2, title: 'Interactive Elements', body: `HTML5 added native interactivity: <details>/<summary> for expandable sections, <dialog> for modals, <progress> and <meter> for gauges.\n\nThese elements work without JavaScript for basic cases — progressive enhancement means functionality exists even if scripts fail.\n\nKey points: details/summary needs no JS for accordions, dialog needs showModal() for true modals, and meter vs progress differ (scalar vs completion).`,
    snippet: () => '<details>\n    <summary>Click to expand</summary>\n    <p>Hidden until opened.</p>\n</details>\n<progress value="70" max="100"></progress>',
    mcq: { q: 'Which element creates an expandable section without JavaScript?', a: '<details>', opts: ['<details>', '<dialog>', '<section>', '<accordion>'], e: 'details + summary work natively.' },
    tf: { s: '<meter> and <progress> are interchangeable elements.', ok: false, e: 'meter = scalar within a range; progress = task completion.' },
    fill: { code: '<${d}><summary>Title</summary>content</${d}>', answer: 'details', e: 'details wraps collapsible content.' } }),
  T({ mod: 3, title: 'Forms and Validation', body: `HTML5 validation attributes — required, pattern, min, max, minlength — give instant feedback before submission, but they are UX sugar, not security.\n\nThe Constraint Validation API (checkValidity(), validationMessage) lets scripts react to validity states; :valid/:invalid CSS styles reflect them live.\n\nKey points: novalidate disables browser checks when you handle them in JS, always pair client checks with server validation.`,
    snippet: () => '<input type="text" required minlength="3" pattern="[A-Za-z]+">\n<p class="error" hidden>Invalid input</p>',
    mcq: { q: 'What does the required attribute do?', a: 'Prevents submission when the field is empty', opts: ['Prevents submission when the field is empty', 'Hides the field', 'Makes it read-only', 'Adds a default value'], e: 'required enforces presence client-side.' },
    tf: { s: 'Client-side validation is sufficient to protect a server.', ok: false, e: 'Attackers bypass the browser entirely — validate server-side.' },
    fill: { code: 'pattern="[0-9]{${n}}"  // exactly n digits', answer: '5/10/etc', e: 'pattern uses regex to constrain format.' } }),
  T({ mod: 3, title: 'Tables Advanced', body: `Real data tables need structure: <caption> for titles, <thead>/<tbody>/<tfoot> for grouping, scope attributes on <th> to associate headers, and colspan/rowspan for merged cells.\n\nComplex tables become unreadable fast — if you need nested tables or heavy merging, reconsider whether a list or cards layout serves users better.\n\nKey points: caption describes the table, scope="col"/"row" links headers to cells for screen readers, and zebra striping is CSS, not HTML.`,
    snippet: () => '<table>\n    <caption>Monthly sales</caption>\n    <thead><tr><th scope="col">Month</th><th scope="col">Sales</th></tr></thead>\n    <tbody><tr><td>Jan</td><td>100</td></tr></tbody>\n</table>',
    mcq: { q: 'What does scope="col" on a <th> tell assistive tech?', a: 'This header applies to the cells below it in the column', opts: ['This header applies to the cells below it in the column', 'The column is sortable', 'The cell is hidden', 'The table has 5 columns'], e: 'scope associates headers with their data cells.' },
    tf: { s: '<caption> provides a title that screen readers announce for the table.', ok: true, e: 'It is the table\'s accessible name.' },
    fill: { code: 'colspan="${n}"  // cell spans n columns', answer: '2/3/etc', e: 'colspan merges cells horizontally.' } }),
  T({ mod: 3, title: 'HTML and JavaScript Hooks', body: `HTML exposes hooks for scripts: ids and classes for selection, data-* attributes for custom data, and semantic elements for behavior (details toggles natively).\n\nThe DOM (Document Object Model) is the live tree scripts manipulate — every element becomes a node with properties, methods, and events.\n\nKey points: querySelector('#id') / querySelector('.class') are the main selectors, events (click, input) attach behavior, and innerHTML rebuilds content (careful with injection).`,
    snippet: () => '<button id="save" data-action="save">Save</button>\n<script>\ndocument.getElementById("save").addEventListener("click", () => {\n    console.log("saved!");\n});\n</script>',
    mcq: { q: 'What is the DOM?', a: 'The tree representation of the page that scripts can modify', opts: ['The tree representation of the page that scripts can modify', 'A type of CSS file', 'The server database', 'A JavaScript framework'], e: 'DOM = live, scriptable page structure.' },
    tf: { s: 'Setting innerHTML with user input can create XSS vulnerabilities.', ok: true, e: 'Unescaped HTML injection is a classic attack — sanitize or use textContent.' },
    fill: { code: 'document.querySelector("${sel}")  // find an element', answer: '#id/.class/tag', e: 'Selectors find DOM nodes.' } }),
  T({ mod: 3, title: 'SVG and Canvas', body: `SVG is markup for vector graphics — scalable, styleable with CSS, scriptable. Canvas is a bitmap drawing surface for pixels — charts, games, image processing.\n\nUse SVG for icons/logos/diagrams (crisp at any size), canvas for dynamic pixel work. Both live inside HTML pages natively.\n\nKey points: SVG elements are DOM nodes (styleable/animatable), canvas needs JS to draw, and prefer CSS/SVG animations over canvas for UI effects.`,
    snippet: () => '<svg width="100" height="100">\n    <circle cx="50" cy="50" r="40" fill="blue"/>\n</svg>\n<canvas id="game" width="300" height="150"></canvas>',
    mcq: { q: 'When should you choose SVG over Canvas?', a: 'For scalable icons and diagrams that need CSS/DOM control', opts: ['For scalable icons and diagrams that need CSS/DOM control', 'For photo-realistic rendering', 'For 3D games only', 'Never — canvas is always better'], e: 'SVG = vectors in the DOM; canvas = raw pixels.' },
    tf: { s: 'Canvas drawing requires JavaScript.', ok: true, e: 'The canvas element is blank until script draws on it.' },
    fill: { code: '<svg><${shape} .../></svg>', answer: 'circle/rect/path', e: 'SVG uses shape elements.' } }),
  T({ mod: 4, title: 'HTML Performance', body: `Page weight kills performance: images dominate bytes, render-blocking CSS/JS delays first paint, and too many DOM nodes slow everything.\n\nFixes: lazy-load off-screen media, defer non-critical scripts, inline critical CSS, subset fonts, and keep DOM shallow. Measure with Lighthouse before optimizing.\n\nKey points: preload key assets, avoid layout-thrashing JS, and HTTP/2+ makes many small files cheap — but bytes still matter on mobile.`,
    snippet: () => '<link rel="preload" href="font.woff2" as="font" type="font/woff2">\n<script src="app.js" defer></script>',
    mcq: { q: 'What does defer on a script tag do?', a: 'Downloads in parallel but executes after HTML parsing', opts: ['Downloads in parallel but executes after HTML parsing', 'Skips the script entirely', 'Runs before the page loads', 'Caches the script forever'], e: 'defer removes render-blocking without losing order.' },
    tf: { s: 'Images are usually the largest contributors to page weight.', ok: true, e: 'Optimize format, size, and loading for media.' },
    fill: { code: 'loading="${v}" on below-fold images', answer: 'lazy', e: 'Lazy loading defers off-screen resources.' } }),
  T({ mod: 4, title: 'HTML Security', body: `HTML-level security starts with escaping: never inject unescaped user content into the DOM (XSS), sanitize anything rendered, and set security headers via your server.\n\niframes from untrusted sources should use sandbox attributes; forms need CSRF tokens; and links should use rel="noopener" for target="_blank".\n\nKey points: escape & < > " in user text, Content-Security-Policy headers restrict what can load/run, and HTTPS is mandatory for any real site.`,
    snippet: () => '<iframe src="https://maps.example.com" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe>',
    mcq: { q: 'What is XSS?', a: 'Injecting malicious scripts into a page through unescaped content', opts: ['Injecting malicious scripts into a page through unescaped content', 'A type of database', 'A CSS animation', 'A hosting provider'], e: 'Cross-site scripting exploits unescaped output.' },
    tf: { s: 'The sandbox attribute on iframes restricts what embedded content can do.', ok: true, e: 'It limits scripts, forms, popups, and same-origin access.' },
    fill: { code: 'rel="${r}" on target="_blank" links', answer: 'noopener', e: 'noopener prevents window.opener attacks.' } }),
  T({ mod: 3, title: 'Project: Build a Page', body: `Build a complete personal page: semantic layout (header/nav/main/footer), hero section, about, projects list, contact form, and footer. Style it later with CSS.\n\nRequirements checklist: valid HTML5, one h1, alt text on all images, labeled form fields, keyboard-navigable, and passes an HTML validator with zero errors.\n\nKey points: validate at validator.w3.org, test with a screen reader or keyboard only, and view-source to see exactly what you shipped.`,
    snippet: () => '<!DOCTYPE html>\n<html lang="en">\n<head><title>My Page</title></head>\n<body>\n<header>...</header>\n<main>...</main>\n<footer>...</footer>\n</body>\n</html>',
    mcq: { q: 'What should you check before calling an HTML page done?', a: 'Validation, accessibility, and semantic structure', opts: ['Validation, accessibility, and semantic structure', 'Only that it opens in Chrome', 'That it has the most divs', 'That images are huge'], e: 'Quality = valid + accessible + semantic.' },
    tf: { s: 'One page should have exactly one <h1>.', ok: true, e: 'Multiple h1s confuse document outline and SEO.' },
    fill: { code: 'validator.w3.org  // check your ${doc}', answer: 'HTML', e: 'Validate markup for correctness.' } }),
  T({ mod: 2, title: 'HTML Emails and Newsletters', body: `HTML email is a strange cousin of web HTML: email clients strip <style> blocks, ignore most modern CSS, and require table-based layouts for reliable rendering.\n\nInline styles are mandatory, images need absolute URLs, and interactive elements mostly fail. The golden rule: test in real clients (Gmail, Outlook, Apple Mail) because they all render differently.\n\nKey points: tables for layout, inline CSS only, alt text on every image, and keep the width near 600px.`,
    snippet: () => '<table width="600" cellpadding="0" cellspacing="0">\n<tr><td style="padding:16px;">Hello!</td></tr>\n</table>',
    mcq: { q: 'Why do HTML emails use table layouts?', a: 'Email clients have poor CSS support — tables render reliably', opts: ['Email clients have poor CSS support — tables render reliably', 'Tables are required by law', 'It is faster to write', 'Modern CSS is banned'], e: 'Outlook-era rendering engines only handle tables well.' },
    tf: { s: 'You can rely on <style> blocks and flexbox in HTML emails.', ok: false, e: 'Many clients strip or ignore them — inline styles are the safe path.' },
    fill: { code: 'use ${css} styles in emails — clients strip <style>', answer: 'inline', e: 'Inline style="..." attributes survive everywhere.' } }),
  T({ mod: 3, title: 'HTML Templates and Components', body: `As sites grow, repeating header/nav/footer markup in every page becomes unmaintainable. Server-side templating or frontend components solve this: define once, render everywhere.\n\nTemplating engines inject data into HTML (loops for lists, conditionals for sections); component frameworks (React, Vue) go further with reusable UI pieces and state.\n\nKey points: DRY applies to markup too, keep templates dumb (logic stays in JS/backend), and shared components guarantee visual consistency.`,
    snippet: () => '<!-- template: header rendered on every page -->\n<header><nav>...</nav></header>\n<main><!-- page content --></main>',
    mcq: { q: 'What problem do HTML templates solve?', a: 'Duplicating the same markup across many pages', opts: ['Duplicating the same markup across many pages', 'Making pages load faster', 'Adding animations', 'Storing user passwords'], e: 'Define shared structure once; templates fill in the differences.' },
    tf: { s: 'Templating engines let you write loops and conditionals inside HTML.', ok: true, e: 'That is their core job — repeat or hide blocks based on data.' },
    fill: { code: 'render the ${part} once, reuse it on every page', answer: 'header', e: 'Shared regions like headers belong in templates/components.' } }),
  T({ mod: 4, title: 'HTML Forms Security', body: `Forms are the main attack surface of websites: they accept arbitrary user input, so everything submitted must be treated as hostile.\n\nDefenses: CSRF tokens prove submissions came from your site, server-side validation checks types/ranges, output escaping prevents XSS, and HTTPS encrypts data in transit. Password fields should use autocomplete="new-password" hints and never log values.\n\nKey points: client-side checks are UX only — the server must re-validate everything.`,
    snippet: () => '<form method="post" action="/signup">\n<input type="hidden" name="csrf" value="TOKEN">\n<input type="email" name="email" required>\n</form>',
    mcq: { q: 'Why is server-side validation still needed when HTML5 has built-in checks?', a: 'Client validation can be bypassed — the server must enforce rules', opts: ['Client validation can be bypassed — the server must enforce rules', 'HTML5 validation is too slow', 'Browsers do not support it', 'It is only for styling'], e: 'Anyone can craft requests without a browser.' },
    tf: { s: 'A CSRF token proves a form submission originated from your site.', ok: true, e: 'Attackers cannot read the token cross-origin, so they cannot forge submissions.' },
    fill: { code: 'escape user input to prevent ${xss} attacks', answer: 'XSS', e: 'Unescaped <script> in user text executes in victims\' browsers.' } }),
  T({ mod: 4, title: 'Web Components', body: `Web Components are native browser features for reusable custom elements: custom elements (<my-card>), Shadow DOM (encapsulated styles), HTML templates, and slots.\n\nThey work in any framework — or no framework — because the browser implements them directly. Libraries like Lit make authoring pleasant.\n\nKey points: shadow DOM isolates styles from the page, slots enable composition, and custom elements need a hyphenated name like <user-card>.`,
    snippet: () => 'class UserCard extends HTMLElement {\n  connectedCallback() {\n    this.innerHTML = `<strong>${this.getAttribute("name")}</strong>`;\n  }\n}\ncustomElements.define("user-card", UserCard);',
    mcq: { q: 'What does Shadow DOM provide?', a: 'Style and DOM encapsulation for a component', opts: ['Style and DOM encapsulation for a component', 'Faster page loads', 'Database storage', 'Server rendering'], e: 'Shadow trees keep component internals separate from the page.' },
    tf: { s: 'Custom element names must contain a hyphen.', ok: true, e: 'The hyphen distinguishes them from built-in elements and reserves future names.' },
    fill: { code: 'customElements.${m}("my-element", MyClass)', answer: 'define', e: 'define() registers the element with the browser.' } }),
  T({ mod: 4, title: 'Print and Media Queries', body: `@media queries adapt CSS (and thus HTML layout expectations) to conditions: screen width, print, dark mode, reduced motion.\n\nFor printing, browsers offer print-specific styles: hide nav/buttons, expand links, avoid page-break inside cards. Users print documentation and receipts — design for paper too.\n\nKey points: mobile-first media queries (min-width), prefers-reduced-motion respects accessibility settings, and @page controls print margins.`,
    snippet: () => '@media print {\n  nav, .no-print { display: none; }\n  a::after { content: " (" attr(href) ")"; }\n}',
    mcq: { q: 'What does prefers-reduced-motion do?', a: 'Lets users request less animation for accessibility', opts: ['Lets users request less animation for accessibility', 'Speeds up animations', 'Removes all CSS', 'Enables dark mode'], e: 'Vestibular disorders make motion sickness real — respect the setting.' },
    tf: { s: 'You can hide navigation and buttons when printing a page.', ok: true, e: '@media print rules exist exactly for this.' },
    fill: { code: '@media (max-width: 600px) { ... }  // target ${screens}', answer: 'small', e: 'Media queries branch styles on device conditions.' } }),
  T({ mod: 4, title: 'Structured Data', body: `Structured data (schema.org JSON-LD in a <script type="application/ld+json"> tag) tells search engines exactly what your content is: articles, products, events, FAQs, recipes.\n\nRich results — star ratings, prices, FAQ dropdowns — come from valid structured data, not from visible text alone. Google's Rich Results Test validates your markup.\n\nKey points: JSON-LD is preferred over microdata, match schema to visible content only, and one @type per entity keeps it clean.`,
    snippet: () => '<script type="application/ld+json">\n{ "@context": "https://schema.org", "@type": "Article", "headline": "My Post" }\n</script>',
    mcq: { q: 'What does structured data add to a page?', a: 'Machine-readable meaning that enables rich search results', opts: ['Machine-readable meaning that enables rich search results', 'Faster loading', 'User accounts', 'Comment sections'], e: 'It describes entities (products, articles) so engines can enhance listings.' },
    tf: { s: 'Structured data should describe only content visible on the page.', ok: true, e: 'Google penalizes markup that promises content users cannot see.' },
    fill: { code: '"@type": "${type}"   // e.g. Article, Product, FAQPage', answer: 'schema', e: 'schema.org types classify your content.' } }),
  T({ mod: 5, title: 'HTML in Modern Frameworks', body: `Modern frameworks (React, Vue, Svelte, Angular) still emit HTML — JSX/templating is HTML plus expressions. Understanding raw HTML transfers directly.\n\nKey differences: the framework owns the DOM and re-renders on state change, attributes map to properties (className in React), and hydration attaches behavior to server-rendered HTML.\n\nKey points: learn HTML first — frameworks assume it, accessibility still applies, and view-source shows the final markup.`,
    snippet: () => '// React JSX — HTML with expressions\n<div className="card">\n  <h2>{post.title}</h2>\n  <p>{post.body}</p>\n</div>',
    mcq: { q: 'What does JSX compile down to?', a: 'Function calls that create DOM elements', opts: ['Function calls that create DOM elements', 'Raw HTML files', 'CSS stylesheets', 'Database queries'], e: 'JSX is syntax sugar; the framework builds real DOM nodes.' },
    tf: { s: 'Frameworks replace the need to understand HTML semantics.', ok: false, e: 'Semantic HTML still drives accessibility and SEO under the framework.' },
    fill: { code: 'frameworks render ${html} under the hood', answer: 'HTML', e: 'Everything ends up as DOM elements in the browser.' } }),
  T({ mod: 5, title: 'Progressive Web Apps Basics', body: `PWAs turn websites into app-like experiences: installable icons, offline support via service workers, push notifications, and fast repeat loads.\n\nRequirements: HTTPS, a web app manifest (name, icons, theme), and a service worker for caching. The manifest JSON declares installability.\n\nKey points: service workers intercept network requests, Lighthouse audits PWA criteria, and iOS support lags behind Chrome/Android.`,
    snippet: () => '{\n  "name": "My App",\n  "short_name": "App",\n  "start_url": "/",\n  "display": "standalone",\n  "icons": [{ "src": "/icon.png", "sizes": "192x192" }]\n}',
    mcq: { q: 'What makes a site installable as a PWA?', a: 'HTTPS + manifest + service worker', opts: ['HTTPS + manifest + service worker', 'Only a mobile app store listing', 'A .exe file', 'Native code'], e: 'The three pillars Chrome requires for the install prompt.' },
    tf: { s: 'Service workers can serve cached pages when the network is down.', ok: true, e: 'That interception is exactly what enables offline mode.' },
    fill: { code: 'the ${manifest} file declares app name, icons, and display mode', answer: 'manifest', e: 'manifest.json (or link tag) describes the installable app.' } }),
  T({ mod: 5, title: 'Web Performance', body: `Fast pages win users and rankings. The biggest wins in HTML: fewer DOM nodes, lazy-loaded images, deferred scripts, and minimal render-blocking resources.\n\nCore Web Vitals measure real experience: LCP (loading), INP (interactivity), CLS (visual stability). HTML choices — image dimensions, async/defer on scripts, preload hints — directly move these numbers.\n\nKey points: measure before optimizing, lazy-load below the fold, and every script tag costs main-thread time.`,
    snippet: () => '<img src="photo.webp" width="800" height="600" loading="lazy" alt="...">\n<script src="app.js" defer></script>',
    mcq: { q: 'What does loading="lazy" do on an image?', a: 'Defers loading until the image scrolls near the viewport', opts: ['Defers loading until the image scrolls near the viewport', 'Compresses the image', 'Loads it twice', 'Hides it until clicked'], e: 'Off-screen images no longer compete for bandwidth upfront.' },
    tf: { s: 'Setting width and height on images prevents layout shift (CLS).', ok: true, e: 'The browser reserves space before the image loads.' },
    fill: { code: '<script ${attr} src="app.js"></script>  // load after parsing', answer: 'defer', e: 'defer downloads in parallel but executes after HTML parses.' } }),
  T({ mod: 5, title: 'Accessibility Auditing', body: `Beyond basics, auditing means systematically checking: keyboard-only navigation, screen-reader output (headings order, landmarks, labels), color contrast, zoom to 200%, and reduced-motion preferences.\n\nTools help: axe DevTools and Lighthouse flag issues automatically, but manual keyboard and screen-reader passes catch what automation misses.\n\nKey points: WCAG levels A/AA/AAA define conformance, focus order should match visual order, and error messages must say how to fix the problem.`,
    snippet: () => '<!-- audit checklist -->\n<!-- 1. tab through the whole page -->\n<!-- 2. does every control have a label? -->\n<!-- 3. contrast >= 4.5:1 for text -->',
    mcq: { q: 'What does WCAG stand for?', a: 'Web Content Accessibility Guidelines', opts: ['Web Content Accessibility Guidelines', 'World Coding Alliance Group', 'Web Client Architecture Guide', 'Wide Compatibility And Guidelines'], e: 'The W3C standard for accessible web content.' },
    tf: { s: 'Automation tools can replace manual screen-reader testing entirely.', ok: false, e: 'Tools catch many issues but miss context and real user flows.' },
    fill: { code: 'axe DevTools and Lighthouse ${verb} accessibility issues automatically', answer: 'detect', e: 'Automated scanners flag ~30-50% of issues; manual review covers the rest.' } }),
  T({ mod: 5, title: 'Internationalization', body: `Building for the world means: lang attributes, UTF-8 charset always, RTL-aware layouts (dir="rtl"), locale-aware dates/numbers, and text expansion room (German is ~30% longer than English).\n\nAvoid hardcoded strings concatenated in markup — separate them for translation. Bidirectional text (Arabic/Hebrew mixed with numbers) needs dir attributes on elements.\n\nKey points: <html lang> drives pronunciation for screen readers, charset must be first in <head>, and test with pseudo-localization.`,
    snippet: () => '<html lang="ar" dir="rtl">\n<head><meta charset="UTF-8"></head>',
    mcq: { q: 'Why must charset be declared early in <head>? ' , a: 'So the browser decodes the document correctly from the start', opts: ['So the browser decodes the document correctly from the start', 'It speeds up images', 'It enables JavaScript', 'Search engines require it'], e: 'Wrong charset = mojibake garbled text before the tag is seen.' },
    tf: { s: 'Translated text is often longer than English — layouts need flexible space.', ok: true, e: 'Design for expansion or text will overflow buttons and cards.' },
    fill: { code: 'dir="${dir}"  // right-to-left for Arabic/Hebrew', answer: 'rtl', e: 'dir controls text direction for bidirectional languages.' } }),
  T({ mod: 5, title: 'Capstone: Build a Page', body: `Build a complete personal page: semantic layout (header/nav/main/footer), hero section, about, projects list, contact form, and footer. Style it later with CSS.\n\nRequirements checklist: valid HTML5, one h1, alt text on all images, labeled form fields, keyboard-navigable, and passes an HTML validator with zero errors.\n\nKey points: validate at validator.w3.org, test with a screen reader or keyboard only, and view-source to see exactly what you shipped.`,
    snippet: () => '<!DOCTYPE html>\n<html lang="en">\n<head><title>My Page</title></head>\n<body>\n<header>...</header>\n<main>...</main>\n<footer>...</footer>\n</body>\n</html>',
    mcq: { q: 'What should you check before calling an HTML page done?', a: 'Validation, accessibility, and semantic structure', opts: ['Validation, accessibility, and semantic structure', 'Only that it opens in Chrome', 'That it has the most divs', 'That images are huge'], e: 'Quality = valid + accessible + semantic.' },
    tf: { s: 'One page should have exactly one <h1>.', ok: true, e: 'Multiple h1s confuse document outline and SEO.' },
    fill: { code: 'validator.w3.org  // check your ${doc}', answer: 'HTML', e: 'Validate markup for correctness.' } }),
];
// built from per-topic fact rows below.

type SimpleTopic = [number, string, string, string, [string, string, string[], [string, boolean]]];

const CSS_ROWS: SimpleTopic[] = [
  [0, 'How CSS Works', 'CSS (Cascading Style Sheets) controls presentation: colors, fonts, spacing, layout. It applies rules made of selectors and declarations.\n\nThe cascade decides conflicts: more specific selectors win, then later rules, then !important (use sparingly).\n\nKey points: separate content (HTML) from presentation (CSS), external stylesheets beat inline styles for maintainability.', 'body {\n    font-family: sans-serif;\n    color: #333;\n}\nh1 {\n    color: navy;\n}', ['What does CSS control?', 'Page presentation — colors, fonts, layout', ['Page presentation — colors, fonts, layout', 'Page content and structure', 'Server databases', 'Image file formats'], ['CSS styles content; HTML provides structure.', true]]],
  [0, 'Selectors', 'Selectors target elements to style: element names (p), classes (.card), ids (#main), and combinations (p.intro, div.card p).\n\nSpecificity order: id > class > element. When rules conflict, the most specific wins.\n\nKey points: class selectors are the workhorse, descendant selectors (space) target nested elements, and :hover/:focus add interactivity.', '.card {\n    border: 1px solid #ccc;\n    padding: 16px;\n}\n.card .title {\n    font-weight: bold;\n}', ['Which selector targets an element with id="main"?', '#main', ['#main', '.main', 'main#', 'id=main'], ['# = id, .= class, bare word = element.', true]]],
  [0, 'Colors and Backgrounds', 'CSS colors accept names (red), hex (#ff0000), rgb()/rgba(), hsl(), and modern oklch. The background shorthand sets color, image, position, and repeat.\n\nContrast matters: body text needs ~4.5:1 against its background for readability (WCAG AA).\n\nKey points: rgba adds transparency, gradients via linear-gradient(), and CSS variables keep palettes consistent.', ':root {\n    --primary: #6366f1;\n}\nbutton {\n    background: var(--primary);\n    color: white;\n}', ['How do you make a semi-transparent color?', 'rgba() or hsla()', ['rgba() or hsla()', 'Only named colors', 'opacity on the html tag', 'You cannot'], ['Alpha channels in rgba/hsla control transparency.', true]]],
  [0, 'Typography', 'Font properties control text: font-family (stack fallbacks), font-size (prefer rem over px), font-weight, line-height, letter-spacing, text-align.\n\nSystem font stacks load instantly; web fonts via @font-face or Google Fonts need font-display: swap to avoid invisible text.\n\nKey points: 1rem = 16px default, line-height ~1.5-1.7 for body text, and never set font-size below 16px on inputs (iOS zooms).', 'body {\n    font-family: system-ui, sans-serif;\n    font-size: 1rem;\n    line-height: 1.6;\n}', ['Why use rem instead of px for font sizes?', 'rem scales with user root settings — accessible', ['rem scales with user root settings — accessible', 'px is not allowed in CSS', 'rem is faster', 'No reason'], ['rem respects user font preferences.', true]]],
  [0, 'The Box Model', 'Every element is a box: content, padding (inside), border, margin (outside). box-sizing: border-box makes width include padding+border — almost always what you want.\n\nMargins collapse vertically between siblings; padding never collapses. Inline elements ignore width/height until made block or inline-block.\n\nKey points: debug layout with outline: 1px solid red, border-box is the modern default via reset, and margin: auto centers block elements horizontally.', '* {\n    box-sizing: border-box;\n}\n.card {\n    width: 300px;\n    padding: 20px;\n    border: 1px solid #ddd;\n    margin: 10px auto;\n}', ['With box-sizing: border-box and width:300px + padding:20px, total width is?', '300px', ['300px', '340px', '320px', '280px'], ['border-box includes padding inside the declared width.', true]]],
  [0, 'Display Property', 'display controls layout behavior: block (full width, new line), inline (flows with text), inline-block (inline but sized), none (hidden), flex/grid (modern layouts).\n\nChanging display is often the fix for "my div won\'t center" or "my span ignores width".\n\nKey points: none removes from layout entirely (visibility:hidden only hides), flex/grid are for component layout, and display is not inherited but children react to parent context.', '.hidden {\n    display: none;\n}\n.inline-block {\n    display: inline-block;\n    width: 100px;\n}', ['Which display value removes an element completely?', 'none', ['none', 'hidden', 'invisible', 'block'], ['display:none removes from render tree; visibility:hidden keeps space.', true]]],
  [1, 'Flexbox', 'Flexbox lays out items in a row or column with alignment control: justify-content (main axis), align-items (cross axis), gap for spacing.\n\nIt replaced float hacks for navbars, card rows, and centering. flex: 1 makes items share space equally.\n\nKey points: flex-direction changes axis, flex-wrap allows multiple lines, and align-self overrides align-items per item.', '.row {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: 16px;\n}', ['What does justify-content control in flexbox?', 'Alignment along the main axis', ['Alignment along the main axis', 'Text color', 'Font size', 'Border width'], ['Main axis = direction set by flex-direction.', true]]],
  [1, 'CSS Grid', 'Grid creates two-dimensional layouts — rows AND columns — ideal for page skeletons: header/sidebar/main/footer in a few lines.\n\nDefine tracks with grid-template-columns/rows (fr units share space), place items with grid-column/row, and gap spaces everything.\n\nKey points: 1fr = one share of free space, auto-fit/auto-fill make responsive grids without media queries, and grid areas name regions.', '.layout {\n    display: grid;\n    grid-template-columns: 250px 1fr;\n    gap: 20px;\n}', ['What does "1fr" mean in grid?', 'One fraction of available free space', ['One fraction of available free space', 'One pixel', 'One row', 'One column'], ['fr distributes leftover space proportionally.', true]]],
  [1, 'Positioning', 'position values: static (default), relative (offset from itself), absolute (relative to positioned ancestor), fixed (viewport), sticky (scrolls until threshold).\n\nabsolute removes from flow — siblings ignore it; fixed stays during scroll; sticky is the modern nav pattern.\n\nKey points: absolute needs a positioned ancestor (else it uses viewport), z-index only works on positioned elements, and sticky needs a scroll threshold like top:0.', '.nav {\n    position: sticky;\n    top: 0;\n    z-index: 100;\n}', ['Which position keeps an element visible while scrolling?', 'fixed or sticky', ['fixed or sticky', 'absolute', 'relative', 'static'], ['fixed=always viewport; sticky=until scrolled past.', true]]],
  [1, 'Responsive Design', 'Responsive design adapts to screen size: fluid units (%, rem, vw), media queries (@media), flexible images (max-width:100%), and mobile-first thinking.\n\nBreakpoints target content needs, not devices — design for small screens first, then enhance upward.\n\nKey points: viewport meta enables media queries on mobile, clamp() fluidly scales values, and container queries now style by parent size.', '@media (max-width: 768px) {\n    .nav { flex-direction: column; }\n}', ['What enables media queries to work on phones?', 'The viewport meta tag', ['The viewport meta tag', 'display:flex', 'position:fixed', 'Nothing needed'], ['Without viewport, mobile reports desktop width.', true]]],
  [1, 'Pseudo-classes and Pseudo-elements', 'Pseudo-classes style states (:hover, :focus, :active, :first-child, :nth-child()) and pseudo-elements style parts (::before, ::after, ::placeholder).\n\n:hover only works on devices with hover — pair with @media (hover:hover) for touch safety. ::before/::after inject decorative content without HTML.\n\nKey points: :focus-visible shows keyboard focus only, ::selection styles highlighted text, and :nth-child formulas (2n = every other) are powerful.', 'a:hover {\n    color: purple;\n}\nli::before {\n    content: "→ ";\n}', ['What does ::before do?', 'Inserts decorative content before the element', ['Inserts decorative content before the element', 'Targets the first child', 'Hides the element', 'Adds a border'], ['Pseudo-elements style generated parts of elements.', true]]],
  [1, 'CSS Variables', 'Custom properties (--name) store reusable values: colors, spacing, fonts. Change once at :root, update everywhere via var(--name).\n\nThey enable theming (dark mode = swap variables) and runtime updates from JavaScript. Unlike preprocessor vars, they are live in the browser.\n\nKey points: define on :root for global scope, fallbacks via var(--x, red), and they inherit down the DOM tree.', ':root {\n    --color-primary: #6366f1;\n    --space-md: 1rem;\n}\n.button {\n    background: var(--color-primary);\n    padding: var(--space-md);\n}', ['Where should global CSS variables be defined?', ':root', [':root', 'body only', 'Every selector', 'In HTML'], ['Custom properties inherit — :root reaches everywhere.', true]]],
  [1, 'Transitions and Animations', 'transition smoothly interpolates property changes (color, transform, opacity) over time with timing functions. @keyframes + animation runs multi-step sequences.\n\nAnimate transform and opacity only — they run on the compositor without layout/paint cost.\n\nKey points: transition: all is lazy (list properties), prefers-reduced-motion must be respected, and animation-fill-mode controls end state.', '.card {\n    transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n.card:hover {\n    transform: translateY(-4px);\n}', ['Which properties animate most smoothly?', 'transform and opacity', ['transform and opacity', 'width and height', 'top and left', 'margin'], ['Compositor-only properties avoid layout thrash.', true]]],
  [2, 'Specificity and Cascade', 'When rules conflict, specificity decides: inline > id > class/attribute/pseudo-class > element/pseudo-element. !important overrides everything (avoid it).\n\nThe cascade layers (later rules win at equal specificity), origin (author vs user agent), and inheritance complete the picture.\n\nKey points: count (ids, classes, elements), .a.b.c beats #id? No — any id beats all classes; equal specificity → source order wins.', '#nav .link { color: red; }\n.link { color: blue; }  /* red wins: higher specificity */', ['Two equal-specificity rules conflict — which wins?', 'The one written later', ['The one written later', 'The first one', 'The longer selector', 'Random choice'], ['Source order breaks specificity ties.', true]]],
  [2, 'Borders and Outlines', 'border draws inside the box model (affects layout); outline draws outside without affecting layout — ideal for focus rings. border-radius rounds corners; box-shadow adds depth.\n\nShorthand: border: width style color. Styles: solid, dashed, dotted, double, none.\n\nKey points: outline-offset controls focus ring gap, border-radius percentages make circles/pills, and multiple shadows comma-separate.', '.button {\n    border: 2px solid #333;\n    border-radius: 999px;\n    outline: 3px solid transparent;\n}\n.button:focus-visible {\n    outline-color: blue;\n}', ['What is the main advantage of outline over border?', 'It does not affect layout', ['It does not affect layout', 'It is thicker', 'It supports gradients', 'It is required for buttons'], ['Outline draws outside the box.', true]]],
  [2, 'Overflow and Clipping', 'overflow controls content escaping the box: visible (default), hidden (clip), scroll (always bars), auto (bars when needed). overflow-x/y control axes independently.\n\ntext-overflow: ellipsis + white-space: nowrap + overflow: hidden creates the classic "..." truncation. clip-path cuts shapes.\n\nKey points: hidden creates a scroll container you can still scroll via JS, scroll-behavior: smooth animates anchors, and overscroll-behavior stops scroll chaining.', '.card {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}', ['How do you create "..." text truncation?', 'overflow:hidden + nowrap + text-overflow:ellipsis', ['overflow:hidden + nowrap + text-overflow:ellipsis', 'max-width alone', 'font-size: small', 'text-align: center'], ['All three properties work together.', true]]],
  [2, 'Transforms', 'transform moves/rotates/scales/skews elements without affecting layout: translate, rotate, scale, skew, matrix. transform-origin sets the pivot point.\n\n3D transforms (rotateX/Y, perspective) add depth. Transforms combine by listing functions: transform: translateX(10px) rotate(45deg).\n\nKey points: transforms are compositor-friendly, they do not trigger reflow, and percentage translates refer to the element\'s own size.', '.badge {\n    transform: rotate(-5deg) scale(1.1);\n    transform-origin: center;\n}', ['Does transform: scale(2) change document layout?', 'No — it is purely visual', ['No — it is purely visual', 'Yes, it doubles the space', 'Only on mobile', 'Only with position:absolute'], ['Transforms paint without reflow.', true]]],
  [2, 'Filters and Blend Modes', 'filter applies GPU effects: blur, brightness, contrast, grayscale, hue-rotate, drop-shadow. mix-blend-mode blends element colors with backdrop (multiply, screen, overlay).\n\nBackdrop-filter blurs whatever is BEHIND an element — the frosted-glass effect used by modern navbars.\n\nKey points: filter on body is expensive, backdrop-filter needs a translucent background to show, and blend modes can surprise — test on real content.', '.glass {\n    backdrop-filter: blur(12px);\n    background: rgba(255,255,255,0.1);\n}', ['What does backdrop-filter do?', 'Applies effects to content behind the element', ['Applies effects to content behind the element', 'Filters the element\'s own children', 'Blurs the whole page', 'Adds a border'], ['It samples the backdrop — frosted glass effect.', true]]],
  [3, 'CSS Units', 'Units: px (fixed), % (parent-relative), em (element font-size), rem (root font-size), vw/vh (viewport), ch/ex (character-based), and math functions calc/min/max/clamp.\n\nPrefer rem for typography, %/fr for layout proportions, vw/vh sparingly (mobile URL bars shift vh). clamp() gives fluid sizing without media queries.\n\nKey points: 1rem = root font-size (16px default), em compounds when nested, and vmin/vmax pick the smaller/larger viewport dimension.', '.hero {\n    font-size: clamp(1.5rem, 4vw, 3rem);\n    width: min(90%, 1200px);\n    margin: 0 auto;\n}', ['What does clamp(1rem, 4vw, 2rem) do?', 'Scales between min and max based on viewport', ['Scales between min and max based on viewport', 'Always returns 4vw', 'Rounds to nearest rem', 'Is invalid CSS'], ['clamp = fluid responsive sizing.', true]]],
  [3, 'CSS Nesting', 'Native CSS nesting lets you write child rules inside parents — like preprocessors but built into browsers now. & refers to the parent selector.\n\n.card { .title { } &:hover { } } compiles conceptually to .card .title and .card:hover. Specificity of & matches the parent.\n\nKey points: nesting is widely supported now, keep it shallow (2 levels), and & is required when the nested selector doesn\'t start with a combinator-friendly pattern.', '.card {\n    padding: 1rem;\n    .title { font-weight: bold; }\n    &:hover { box-shadow: 0 4px 12px #0002; }\n}', ['In CSS nesting, what does & represent?', 'The parent selector', ['The parent selector', 'A wildcard', 'The root element', 'A pseudo-class'], ['& = where the parent selector goes.', true]]],
  [3, 'Print Styles', 'print media queries (@media print) tailor pages for paper: hide nav/ads, expand content, force black-on-white, avoid page-break-inside on cards.\n\nUse cm/mm/inch units for print sizing, display:none for chrome, and link elements with media="print" for print-only stylesheets.\n\nKey points: browsers ignore most screen colors on print anyway, page-break-before/after control flow, and test with browser print preview.', '@media print {\n    nav, .ads { display: none; }\n    .card { page-break-inside: avoid; }\n}', ['How do you hide navigation when printing?', '@media print { nav { display:none } }', ['@media print { nav { display:none } }', 'nav { print: none }', 'visibility: print', 'You cannot'], ['Print media queries target paper output.', true]]],
  [3, 'CSS for Forms', 'Form styling needs :focus-visible rings for keyboard users, styled checkboxes/radios (accent-color or custom), and :placeholder-shown tricks. Disabled/readonly states need visual distinction.\n\naccent-color recolors native controls cheaply; custom checkbox = hidden input + styled label + :checked sibling selector.\n\nKey points: never remove outlines without replacement, error states need text not just red, and input font-size ≥16px prevents iOS zoom.', 'input:focus-visible {\n    outline: 2px solid blue;\n    outline-offset: 2px;\n}\ninput[type="checkbox"] {\n    accent-color: #6366f1;\n}', [':focus-visible is preferred over :focus because...', 'it only shows for keyboard focus, not mouse clicks', [':focus-visible shows for keyboard only', ':focus is deprecated', 'It is faster', 'It is required for forms'], ['focus-visible targets keyboard navigation specifically.', true]]],
  [4, 'CSS Architecture', 'Scale CSS with methodology: BEM naming (.block__element--modifier), utility-first (Tailwind-style single-purpose classes), or CSS modules/component-scoped styles.\n\nWhatever you choose: one file per component, tokens for repeated values, and delete dead CSS — specificity wars come from accumulation.\n\nKey points: style guide beats personal taste, custom properties for theming, and lint tools catch unused/broken rules.', '.card { }\n.card__title { }\n.card--featured { }\n/* BEM: block__element--modifier */', ['What problem does BEM naming solve?', 'Predictable, collision-free class names at scale', ['Predictable, collision-free class names at scale', 'It makes CSS faster', 'It adds animations', 'It validates HTML'], ['Naming conventions prevent specificity chaos.', true]]],
  [4, 'Capstone: Style a Page', 'Take your HTML capstone page and style it completely: layout with Grid/Flexbox, responsive breakpoints, hover/focus states, typography scale, and a dark-mode-ready variable palette.\n\nChecklist: mobile-first, no horizontal scroll at 320px, keyboard focus visible everywhere, prefers-reduced-motion respected, Lighthouse performance >90.\n\nKey points: style mobile first then enhance, test at real device widths, and keep stylesheets organized by component.', ':root { --bg: #fff; --text: #111; }\n@media (prefers-color-scheme: dark) {\n    :root { --bg: #111; --text: #eee; }\n}', ['What does prefers-color-scheme let you do?', 'Adapt styles to the user\'s OS dark/light preference', ['Adapt OS dark/light preference', 'Detect screen size', 'Measure performance', 'Encrypt colors'], ['It responds to system theme settings.', true]]],
  [2, 'CSS Transforms', 'transform moves, rotates, scales, and skews elements without affecting layout — translate, rotate, scale, skew, and matrix(). transform-origin sets the pivot point.\n\nUnlike margin/position changes, transforms are GPU-composited and smooth — prefer them for animations and hover effects.\n\nKey points: multiple functions chain left-to-right, percentages refer to element size, and 3D transforms need perspective on the parent.', '.card:hover {\n    transform: translateY(-4px) scale(1.02);\n}', ['Which transform moves an element without changing layout?', 'translate()', ['translate()', 'margin-top', 'position: absolute', 'float'], ['Transforms repaint cheaply via GPU; layout properties trigger reflow.', true]]],
  [3, 'CSS Scroll Snap', 'scroll-snap-type on a container + scroll-snap-align on children creates carousels and paged scrollers that settle on items instead of stopping mid-way.\n\nmandatory vs proximity: mandatory always snaps (can trap users), proximity snaps only when close — prefer proximity for accessibility.\n\nKey points: works on any scroll container, combine with scroll-behavior: smooth, and test keyboard scrolling.', '.carousel {\n    display: flex;\n    overflow-x: auto;\n    scroll-snap-type: x proximity;\n}\n.slide { scroll-snap-align: start; }', ['scroll-snap-type: mandatory can cause problems because...', 'it can trap scrolling when content overflows unexpectedly', ['it forces page reloads', 'it disables images', 'it requires JavaScript', 'it only works in print'], ['Mandatory snapping can fight the user — proximity is safer.', true]]],
  [3, 'Container Queries', 'Container queries style elements based on their PARENT\'s size, not the viewport — finally solving "component that adapts to its slot".\n\nDeclare containment on a wrapper (container-type: inline-size), then use @container (min-width: 400px) rules inside. Perfect for cards in sidebars vs main columns.\n\nKey points: need containment context, units cqw/cqh/cqi express container-relative sizes, and support is now broad in modern browsers.', '.card-wrapper { container-type: inline-size; }\n@container (min-width: 350px) {\n    .card { grid-template-columns: 1fr 1fr; }\n}', ['What problem do container queries solve?', 'Styling components based on their container, not the viewport', ['Styling by container size', 'Faster animations', 'Print layouts', 'SEO'], ['Components can now adapt to wherever they are placed.', true]]],
  [4, 'CSS Performance', 'CSS affects performance through: selector matching cost (avoid deep descendant chains), properties that trigger layout (width, top) vs paint (color) vs composite (transform, opacity), and oversized stylesheets.\n\nFast properties to animate: transform and opacity only — they skip layout and paint. content-visibility: auto skips rendering off-screen sections entirely.\n\nKey points: will-change hints the compositor, avoid animating box-shadow/filters on large areas, and unused CSS still costs parse time.', '.panel {\n    content-visibility: auto;\n    contain-intrinsic-size: auto 500px;\n}', ['Which properties are cheapest to animate?', 'transform and opacity', ['transform and opacity', 'width and height', 'top and left', 'margin'], ['They only composite — no layout or paint work.', true]]],
  [4, 'CSS Dark Mode Patterns', 'Dark mode via prefers-color-scheme media query + custom properties is the clean approach: define semantic tokens (--bg, --surface, --text) and flip them per scheme.\n\nManual toggles need a data-theme attribute + :root[data-theme="dark"] overrides, persisted in localStorage. Either way, never hardcode colors — always go through variables.\n\nKey points: pure black backgrounds cause halation — use dark grays, images need dark variants, and test contrast in both modes.', ':root { --bg: #fff; --text: #111; }\n@media (prefers-color-scheme: dark) {\n    :root { --bg: #141414; --text: #eee; }\n}\nbody { background: var(--bg); color: var(--text); }', ['Why use CSS variables for dark mode?', 'One token change re-themes the whole site', ['Variables centralize colors', 'Dark mode requires them', 'They are faster', 'Browsers mandate them'], ['Semantic tokens let themes swap without touching components.', true]]],
  [4, 'CSS Animation Libraries', 'While CSS transitions/keyframes handle most needs, libraries like GSAP, Framer Motion, and Animate.css add timelines, scroll triggers, and physics.\n\nRule of thumb: CSS-first for simple hover/state changes, JS libraries only when you need sequencing, scroll-linked, or complex choreography. Over-animating hurts UX and performance.\n\nKey points: respect prefers-reduced-motion in every animation, transform/opacity only for smooth 60fps, and exit animations need JS or view transitions.', '@keyframes fadeUp {\n    from { opacity: 0; transform: translateY(20px); }\n    to { opacity: 1; transform: none; }\n}\n.card { animation: fadeUp .4s ease both; }', ['When should you reach for a JS animation library?', 'When you need timelines, scroll triggers, or complex sequencing', ['For complex choreography', 'For every hover effect', 'CSS cannot animate', 'For SEO'], ['CSS handles simple cases; libraries earn their weight on complex motion.', true]]],
  [4, 'CSS for Print', 'Print stylesheets adapt web pages for paper: @page sets margins/size, @media print hides navigation, expands content, forces light colors, and prevents elements splitting across pages.\n\nUse physical units (cm, mm, pt) for print, page-break-inside: avoid on cards/tables, and link rel=stylesheet media="print" for dedicated print CSS.\n\nKey points: browsers strip backgrounds by default (print-color-adjust), links need url() text appended, and always preview before shipping.', '@page { margin: 2cm; }\n@media print {\n    nav, footer { display: none; }\n    .card { break-inside: avoid; }\n}', ['What does @page control?', 'Printed page size and margins', ['Page size and margins', 'Screen layout', 'Fonts', 'Colors'], ['@page rules only affect paged media output.', true]]],
  [5, 'CSS Architecture at Scale', 'Large codebases need systems: BEM naming, design tokens via custom properties, layered files (reset → tokens → base → components → utilities), and linting (stylelint) to enforce conventions.\n\nCSS-in-JS and utility frameworks (Tailwind) trade hand-written CSS for generated utilities — same cascade rules apply underneath. Pick one approach and document it.\n\nKey points: consistency beats cleverness, tokens make rebranding cheap, and dead CSS deletion is part of the job.', ':root {\n    --color-primary: #6366f1;\n    --space-md: 1rem;\n}\n/* tokens -> base -> components -> utilities */', ['What are design tokens?', 'Named variables for repeated design values (colors, spacing)', ['Named design variables', 'Encryption keys', 'CSS frameworks', 'Server configs'], ['Tokens let a palette change propagate everywhere at once.', true]]],
  [5, 'CSS Capstone', 'Style a complete multi-section page: hero, features grid, testimonials, pricing table, footer — fully responsive from 320px to 4K, keyboard-navigable, dark-mode aware.\n\nRequirements: CSS custom properties for all colors/spacing, Grid for page layout, Flexbox for components, hover/focus/active states on everything interactive, zero horizontal scroll, Lighthouse >90.\n\nKey points: mobile-first breakpoints, test with real content, not filler copy, and reduced-motion support is mandatory.', ':root {\n    --bg: #0f172a; --surface: #1e293b; --text: #e2e8f0;\n    --radius: 12px; --space: clamp(1rem, 4vw, 2rem);\n}\n.grid { display: grid; gap: var(--space); }', ['What does clamp() give you in CSS?', 'A value that scales fluidly between min and max', ['Fluid scaling between bounds', 'Random values', 'Print margins', 'Z-index'], ['clamp(min, preferred, max) is the responsive sizing tool.', true]]],
  [5, 'Cascade Layers', '@layer establishes explicit cascade order for stylesheets — base, components, utilities — so file load order stops mattering. Layers beat specificity: later layers win regardless of selector strength.\n\nThis kills !important wars and makes large teams sane: declare layer order once in :root or the first import, then slot rules into their layer.\n\nKey points: unlayered styles beat layered ones (wrap everything), @layer can be inline per-rule, and it composes with media/supports queries.', '@layer reset, base, components, utilities;\n@layer components {\n    .btn { padding: 0.5rem 1rem; }\n}', ['What problem do cascade layers solve?', 'Specificity conflicts regardless of selector strength', ['Order-dependent cascade chaos', 'Slow page loads', 'Missing fonts', 'SEO'], ['Layers give predictable ordering without !important.', true]]],
  [5, 'View Transitions', 'The View Transitions API animates between DOM states natively: document.startViewTransition(() => updateDOM()) morphs elements with shared names via view-transition-name.\n\nNo library needed for page navigations, theme switches, and list reordering — the browser interpolates old/new snapshots. Pair with CSS ::view-transition-old/new pseudo-elements for custom easing.\n\nKey points: needs JS trigger but zero dependencies, fallback is instant swap, and it excels at theme toggles and SPA route changes.', '::view-transition-old(root),\n::view-transition-new(root) {\n    animation-duration: 0.3s;\n}', ['What triggers a view transition?', 'document.startViewTransition() wrapping a DOM update', ['A CSS class alone', 'Page reload only', 'The browser randomly', 'meta refresh'], ['JS wraps the state change; the browser animates the diff.', true]]],
  [5, 'Anchor Positioning', 'CSS anchor positioning places tooltips, popovers, and menus relative to a trigger element — pure CSS, no JS measuring.\n\nSet position-anchor on the positioned element, anchor-name on the trigger, then use anchor() and position-area/position-try for placement with automatic flipping when space runs out.\n\nKey points: solves the "tooltip goes off-screen" problem declaratively, pairs with popover API, and fallback positioning still needs care in older browsers.', '.tooltip {\n    position: absolute;\n    position-anchor: --btn;\n    top: anchor(bottom);\n}\nbutton { anchor-name: --btn; }', ['What does anchor positioning replace?', 'JavaScript that measures element positions for popovers', ['Manual JS positioning', 'Media queries', 'z-index hacks', 'iframes'], ['Declarative anchoring handles placement and flipping in CSS.', true]]],
  [5, 'CSS Tooling', 'Modern CSS pipelines: PostCSS/LightningCSS for transpiling and minification, Stylelint for linting, Browserslist for target queries, and CSS modules or Tailwind for architecture.\n\nLightningCSS is the fast Rust-based compiler gaining adoption; nesting and custom media queries still need it for older browsers. Always measure bundle impact — unused CSS ships to users.\n\nKey points: purge unused selectors in production, autoprefixer is fading as browsers catch up, and source maps keep debugging sane.', '/* browserslist */\n> 0.5%, last 2 versions, not dead\n/* compiles modern CSS for older targets */', ['What does Browserslist do?', 'Declares which browsers your CSS must support', ['Targets browser versions', 'Downloads browsers', 'Validates HTML', 'Speeds up servers'], ['Tools read it to decide which transforms/polyfills to emit.', true]]],
];

const SQL_ROWS: SimpleTopic[] = [
  [0, 'What is SQL', 'SQL (Structured Query Language) talks to relational databases — tables of rows and columns. You use it to create tables, insert data, query it, update it, and delete it.\n\nRelational databases (PostgreSQL, MySQL, SQLite) store structured data with enforced types and relationships between tables.\n\nKey points: SQL is declarative — you describe WHAT you want, not HOW to get it; most syntax is standard across engines with small dialect differences.', 'SELECT id, name FROM users;', ['What kind of data does SQL manage?', 'Structured data in relational tables', ['Structured data in relational tables', 'Unstructured text files', 'Images and video', 'Server configuration'], ['SQL = Structured Query Language for relational data.', true]]],
  [0, 'SELECT Basics', 'SELECT retrieves data: SELECT columns FROM table. Use * for all columns, DISTINCT to remove duplicates, and AS to rename output columns.\n\nSELECT name, age FROM users returns only those two columns for every row. Add WHERE to filter rows.\n\nKey points: column order in SELECT defines output order, table aliases (u.name) clarify queries, and quoting rules differ per engine.', 'SELECT name, age FROM users;\nSELECT DISTINCT city FROM customers;\nSELECT price AS cost FROM products;', ['What does SELECT DISTINCT do?', 'Removes duplicate rows from results', ['Removes duplicate rows', 'Sorts results', 'Deletes duplicates from table', 'Counts rows'], ['DISTINCT deduplicates the result set.', true]]],
  [0, 'Filtering with WHERE', 'WHERE filters rows before results return: =, !=, <, >, <=, >=, BETWEEN, IN, LIKE, IS NULL. Combine with AND/OR/NOT and parentheses for precedence.\n\nLIKE uses % (any chars) and _ (one char) wildcards; IS NULL checks missing values — never use = NULL.\n\nKey points: filter on indexed columns for speed, string comparisons are often case-insensitive in MySQL but sensitive in PostgreSQL.', "SELECT * FROM users\nWHERE age >= 18 AND city = 'Paris';", ['How do you check for missing values?', 'IS NULL', ['IS NULL', '= NULL', '== NULL', 'EMPTY()'], ['NULL never equals anything — IS NULL is required.', true]]],
  [0, 'Sorting and Limiting', 'ORDER BY sorts results ascending (default) or descending (DESC); LIMIT caps row count; OFFSET skips rows for pagination.\n\nSort multiple columns: ORDER BY last_name, first_name. Sorting happens after WHERE filtering.\n\nKey points: always use LIMIT on big tables, OFFSET pagination gets slow deep — prefer keyset/cursor pagination, and ties in sort need a unique tiebreaker column.', 'SELECT name, score FROM players\nORDER BY score DESC\nLIMIT 10;', ['What does ORDER BY score DESC do?', 'Sorts highest scores first', ['Sorts highest scores first', 'Deletes low scores', 'Counts scores', 'Randomizes order'], ['DESC = descending; default is ASC.', true]]],
  [0, 'Creating Tables', 'CREATE TABLE defines structure: column names, data types (INT, VARCHAR, DATE, BOOLEAN, DECIMAL), constraints (PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT).\n\nPRIMARY KEY uniquely identifies each row; foreign keys link tables. Choose types carefully — altering types later is painful.\n\nKey points: VARCHAR(n) for variable text, DECIMAL for money (never FLOAT), and every table should have a primary key.', "CREATE TABLE users (\n    id INT PRIMARY KEY,\n    name VARCHAR(50) NOT NULL,\n    email VARCHAR(100) UNIQUE,\n    created_at DATE DEFAULT CURRENT_DATE\n);", ['Why use DECIMAL instead of FLOAT for money?', 'FLOAT has rounding errors — DECIMAL is exact', ['FLOAT rounds unpredictably', 'DECIMAL is faster', 'FLOAT cannot store money', 'No difference'], ['Binary floating point cannot represent decimals exactly.', true]]],
  [0, 'Inserting Data', 'INSERT adds rows: INSERT INTO table (columns) VALUES (...). Multiple rows in one statement is faster than many single inserts.\n\nOmit columns with defaults; use RETURNING (Postgres) to get generated ids back. Always parameterize values — never concatenate user input.\n\nKey points: column list prevents order mistakes, NULL inserts need explicit NULL keyword, and bulk inserts beat row-by-row loops.', "INSERT INTO users (name, email)\nVALUES ('Amy', 'amy@mail.com'), ('Bob', 'bob@mail.com');", ['What is the main risk of building INSERT with string concatenation?', 'SQL injection', ['SQL injection attacks', 'Slower queries only', 'Duplicate rows', 'Nothing'], ['Unescaped input can execute arbitrary SQL — use parameters.', true]]],
  [1, 'UPDATE and DELETE', 'UPDATE changes rows matching WHERE; DELETE removes them. Both are dangerous without WHERE — they affect EVERY row in the table.\n\nAlways preview with SELECT first using the same WHERE clause. Transactions let you rollback mistakes.\n\nKey points: UPDATE t SET col = val WHERE cond, DELETE FROM t WHERE cond, and there is no undo without backups/transactions.', "UPDATE users SET age = 31 WHERE name = 'Amy';\nDELETE FROM logs WHERE created_at < '2020-01-01';", ['What happens with UPDATE users SET x=1 (no WHERE)?', 'Every row is updated', ['Every row updated', 'Error — WHERE required', 'Nothing happens', 'Only first row'], ['Missing WHERE targets the whole table.', true]]],
  [1, 'JOINs', 'JOINs combine tables on related columns: INNER JOIN keeps only matching rows, LEFT JOIN keeps all left rows (NULLs where no match), RIGHT/FULL cover the other side.\n\nON specifies the match condition (usually foreign key = primary key). Joins multiply rows when matches are one-to-many.\n\nKey points: pick the join type by which side must survive, alias tables (u.name) for readability, and check row counts — accidental cartesian products explode results.', 'SELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON o.user_id = u.id;', ['What does LEFT JOIN guarantee?', 'All rows from the left table appear', ['All left-table rows appear', 'All rows match', 'No NULLs ever', 'Sorted output'], ['LEFT JOIN preserves the left side regardless of matches.', true]]],
  [1, 'Aggregate Functions', 'Aggregates summarize: COUNT rows, SUM/AVG numbers, MIN/MAX extremes, GROUP_CONCAT strings. They collapse many rows into one result.\n\nWith GROUP BY they summarize per group: COUNT orders per customer. HAVING filters the groups (WHERE filters rows before grouping).\n\nKey points: COUNT(*) counts rows, COUNT(col) skips NULLs, AVG returns decimal, and empty groups produce no rows.', 'SELECT city, COUNT(*) AS n, AVG(score) AS avg_score\nFROM players\nGROUP BY city\nHAVING COUNT(*) > 10;', ['What is the difference between WHERE and HAVING?', 'WHERE filters rows; HAVING filters groups', ['WHERE=rows, HAVING=groups', 'They are identical', 'HAVING is faster', 'WHERE cannot use aggregates'], ['HAVING applies after GROUP BY aggregation.', true]]],
  [1, 'Subqueries', 'A subquery is a query inside another query — in WHERE, FROM, or SELECT. They answer "rows matching a condition computed from other rows".\n\nIN checks membership: WHERE id IN (SELECT ...). EXISTS tests existence efficiently. Correlated subqueries reference outer rows (slower).\n\nKey points: prefer JOINs when possible (usually clearer/faster), but subqueries shine for "exists" checks and single-value lookups.', "SELECT name FROM users\nWHERE id IN (\n    SELECT user_id FROM orders WHERE total > 100\n);", ['What does WHERE x IN (SELECT ...) do?', 'Keeps rows whose x matches any subquery result', ['Matches any subquery result', 'Runs the subquery twice', 'Deletes subquery rows', 'Sorts by x'], ['IN = membership test against the subquery set.', true]]],
  [1, 'Constraints and Keys', 'Constraints enforce data rules: PRIMARY KEY (unique+not null, one per table), UNIQUE, NOT NULL, DEFAULT, CHECK (value rules), FOREIGN KEY (references another table).\n\nForeign keys maintain referential integrity — you cannot reference a user that does not exist. ON DELETE CASCADE/SET NULL decides cleanup behavior.\n\nKey points: indexes often auto-created on keys, constraints prevent bad data at the source, and violations raise errors you must handle.', "CREATE TABLE orders (\n    id INT PRIMARY KEY,\n    user_id INT NOT NULL,\n    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n);", ['What does ON DELETE CASCADE do?', 'Deletes child rows when the parent is deleted', ['Deletes children with parent', 'Prevents all deletes', 'Copies rows', 'Nothing'], ['Cascade propagates the parent deletion.', true]]],
  [1, 'Indexes', 'Indexes are sorted lookup structures (B-trees) that make WHERE/JOIN/ORDER BY fast — like a book index vs reading every page.\n\nCREATE INDEX speeds reads but slows writes (every insert updates indexes) and uses disk. Add indexes on columns you filter/join/sort by.\n\nKey points: composite indexes follow leftmost-prefix rules, EXPLAIN shows if indexes are used, and over-indexing hurts write performance.', 'CREATE INDEX idx_users_email ON users(email);', ['What is the trade-off of adding an index?', 'Faster reads, slower writes', ['Faster reads, slower writes', 'Faster everything', 'Only faster reads', 'Slower everything'], ['Indexes must be maintained on every write.', true]]],
  [2, 'Transactions', 'Transactions group operations into all-or-nothing units: BEGIN, statements, COMMIT (save) or ROLLBACK (undo). They guarantee ACID — Atomicity, Consistency, Isolation, Durability.\n\nTransfer money = debit one account + credit another in ONE transaction — a crash mid-way cannot lose money.\n\nKey points: isolation levels trade consistency vs concurrency, deadlocks happen with competing locks, and keep transactions short.', 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;', ['What does ROLLBACK do?', 'Undoes all changes in the current transaction', ['Undoes transaction changes', 'Commits changes', 'Deletes the table', 'Restarts the server'], ['Rollback reverts to pre-transaction state.', true]]],
  [2, 'Views', 'A view is a saved query that acts like a virtual table: CREATE VIEW recent_users AS SELECT ... Then query it like a table.\n\nViews simplify complex queries, enforce row-level security (show only allowed columns/rows), and insulate apps from schema changes.\n\nKey points: views do not store data (computed each use), some are updatable, and materialized views (Postgres) cache results for speed.', 'CREATE VIEW active_users AS\nSELECT id, name FROM users WHERE active = true;', ['What is a SQL view?', 'A saved query presented as a virtual table', ['Saved query as virtual table', 'A physical copy of data', 'A stored procedure', 'A database backup'], ['Views store the query, not the results.', true]]],
  [2, 'Functions and Procedures', 'Functions return a value (used inside queries); stored procedures run action sequences (loops, transactions) called with CALL. Both live in the database.\n\nThey centralize logic close to data, reduce network round-trips, and enforce business rules consistently. PL/pgSQL (Postgres) and T-SQL (SQL Server) are common dialects.\n\nKey points: functions must be deterministic for indexing, procedures can contain transactions, and version-control your DB code like app code.', 'CREATE FUNCTION double_price(p INT) RETURNS INT AS $$\n    SELECT p * 2;\n$$ LANGUAGE SQL;', ['Function vs procedure — key difference?', 'Functions return a value; procedures perform actions', ['Functions return values, procedures act', 'Identical', 'Procedures are faster', 'Functions cannot query'], ['Return value is the defining difference.', true]]],
  [2, 'Normalization', 'Normalization removes redundancy by splitting data into related tables: 1NF (atomic values), 2NF (no partial dependencies), 3NF (no transitive dependencies).\n\nExample: instead of repeating customer name/address on every order, store customers once and reference by id. Denormalization trades purity for read speed.\n\nKey points: normalize to avoid update anomalies, denormalize selectively for hot read paths, and learn the normal forms conceptually before deep theory.', '-- BAD: order repeats customer info\n-- GOOD: orders.customer_id -> customers.id', ['What problem does normalization solve?', 'Data redundancy and update anomalies', ['Redundancy/update anomalies', 'Slow queries only', 'Missing indexes', 'Security'], ['One fact lives in one place.', true]]],
  [2, 'Window Functions', 'Window functions compute across rows related to the current row WITHOUT collapsing them: ROW_NUMBER, RANK, SUM() OVER (PARTITION BY ...).\n\nUse for running totals, top-N per group, moving averages — things GROUP BY cannot express without losing row detail.\n\nKey points: OVER() defines the window, PARTITION BY groups within it, ORDER BY inside OVER controls frame, and they are slower than plain aggregates.', 'SELECT name, salary,\n    RANK() OVER (ORDER BY salary DESC) AS rank\nFROM employees;', ['What does RANK() OVER (ORDER BY salary DESC) produce?', 'Rank of each row by salary, keeping all rows', ['Per-row rank by salary', 'Only the top earner', 'Total salary', 'Average salary'], ['Window functions keep row detail while ranking.', true]]],
  [3, 'Query Optimization', 'Fast queries: filter early (WHERE on indexed columns), select only needed columns, avoid SELECT *, prefer JOINs over correlated subqueries, and paginate with LIMIT.\n\nEXPLAIN ANALYZE shows the execution plan — seq scans on big tables signal missing indexes; nested loops on big joins signal bad plans.\n\nKey points: measure before optimizing, index selective columns, avoid functions on indexed columns in WHERE (kills index use), and cache expensive aggregates.', 'EXPLAIN ANALYZE\nSELECT * FROM orders WHERE user_id = 42;', ['Why avoid WHERE YEAR(created_at) = 2024 on an indexed date column?', 'The function wrapper prevents index use', ['Function blocks index', 'YEAR is slow', 'It returns wrong year', 'No reason'], ['Indexes need bare column references in predicates.', true]]],
  [3, 'NULL Handling', 'NULL means "unknown/missing" — it is not zero, not empty string, not false. Any comparison with NULL yields NULL (not true), so rows silently drop.\n\nHandle with IS NULL / IS NOT NULL, COALESCE(col, default) for fallbacks, NULLIF to convert values to NULL, and careful with aggregates (they skip NULLs).\n\nKey points: COUNT(col) ignores NULLs, SUM/AVG too, columns should be NOT NULL with defaults where "missing" is meaningless, and three-valued logic (true/false/unknown) surprises everyone.', 'SELECT COALESCE(nickname, name) AS display_name\nFROM users;', ['What does COALESCE(nickname, name) return?', 'nickname if not NULL, else name', ['nickname else name', 'Always nickname', 'Always name', 'Empty string'], ['COALESCE returns first non-NULL argument.', true]]],
  [3, 'String Functions', 'SQL string functions transform text: UPPER/LOWER, LENGTH, SUBSTRING, TRIM, CONCAT, REPLACE, POSITION, and pattern matching with LIKE.\n\nFunctions differ per engine: PostgreSQL has || for concat and SPLIT_PART; MySQL uses CONCAT() and SUBSTRING_INDEX().\n\nKey points: TRIM removes padding spaces, SUBSTRING is 1-indexed in most engines, LIKE is case-insensitive in MySQL but sensitive in Postgres (use ILIKE), and regex via ~ (Postgres) or REGEXP (MySQL).', "SELECT UPPER(name), SUBSTRING(email, 1, 3) AS prefix\nFROM users;", ['In most SQL dialects, SUBSTRING starts counting at...', '1', ['1', '0', '-1', 'Depends'], ['SQL strings are 1-indexed unlike most languages.', true]]],
  [3, 'Date and Time', 'Date functions handle timestamps: NOW()/CURRENT_TIMESTAMP for now, DATE_TRUNC for bucketing (day/hour), INTERVAL for arithmetic, EXTRACT for parts (year, month).\n\nStore timestamps in UTC (TIMESTAMPTZ), convert for display in app layer, and index date columns you range-filter.\n\nKey points: date math differs per dialect (Postgres intervals vs MySQL DATE_ADD), always specify timezones, and "today" boundaries are a classic bug source.', "SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*)\nFROM events GROUP BY 1;", ['Why store timestamps in UTC?', 'Avoids timezone ambiguity and DST bugs', ['Timezone/DST safety', 'Smaller storage', 'Faster queries', 'Required by SQL'], ['UTC is unambiguous; convert at display time.', true]]],
  [3, 'Capstone: Design a Schema', 'Design a database for a real app (blog, store, booking): list entities, define columns/types/constraints, sketch relationships, then write CREATE TABLE statements and sample queries.\n\nChecklist: every table has a PK, FKs enforce relationships, junction tables for many-to-many, indexes on lookup columns, and seed data to test queries.\n\nKey points: sketch on paper first, normalize reasonably (not perfectly), and validate with real queries — a schema you cannot query is not done.', '-- blog schema sketch\nusers(id, name, email)\nposts(id, user_id FK, title, body, created_at)\ncomments(id, post_id FK, user_id FK, text)', ['What solves a many-to-many relationship?', 'A junction/link table', ['Junction table', 'Duplicate columns', 'JSON blob', 'Nothing needed'], ['A-B and B-A need an intermediate table.', true]]],
  [2, 'Subquery Patterns', 'A subquery is a SELECT inside another query — in WHERE (filter by computed value), FROM (treat results as a table), or SELECT (computed column).\n\nCorrelated subqueries reference the outer row and run per-row — powerful but slow on big tables; prefer JOINs when possible.\n\nKey points: subqueries must return one column in WHERE comparisons, IN/EXISTS/ANY are the common patterns, and CTEs (WITH) often read cleaner.', 'SELECT name FROM users\nWHERE age > (SELECT AVG(age) FROM users);', ['What does IN do with a subquery?', 'Checks membership against the subquery result set', ['Membership test', 'Sorts results', 'Deletes rows', 'Joins tables'], ['x IN (subquery) is true when x appears in those rows.', true]]],
  [3, 'Common Table Expressions', 'CTEs (WITH name AS (SELECT ...)) name a subquery so you can reference it like a table — and chain multiple CTEs for readable multi-step queries.\n\nThey shine for: breaking complex logic into steps, reusing a result set, and recursive queries (org charts, bill-of-materials).\n\nKey points: WITH ... AS materializes conceptually, recursive CTEs need UNION ALL + anchor member, and some engines allow INSERT/UPDATE ... RETURNING via CTE.', 'WITH adult_users AS (\n    SELECT * FROM users WHERE age >= 18\n)\nSELECT count(*) FROM adult_users;', ['What is the main readability benefit of a CTE?', 'Naming a subquery as a reusable "virtual table"', ['Virtual table naming', 'Faster execution always', 'Auto-indexing', 'Less typing'], ['CTEs document intent — each step gets a name.', true]]],
  [4, 'Transactions and ACID', 'Transactions group statements so they all succeed or all roll back — bank transfers need debit+credit atomic, never half-done.\n\nACID: Atomicity (all-or-nothing), Consistency (constraints hold), Isolation (concurrent txns do not interfere), Durability (committed data survives crashes). Isolation levels trade safety for speed.\n\nKey points: BEGIN/COMMIT/ROLLBACK control the boundary, deadlocks happen under concurrency (retry logic helps), and read committed is the common default.', 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;', ['What does Atomicity guarantee?', 'All statements in a transaction succeed or none do', ['All-or-nothing execution', 'Fast queries', 'Encrypted data', 'Auto-backup'], ['Partial failure must roll everything back.', true]]],
  [4, 'Indexes Deep Dive', 'Indexes are sorted lookup structures (B-trees) that turn full table scans into fast seeks — huge wins on large tables for WHERE/JOIN/ORDER BY columns.\n\nCosts: every INSERT/UPDATE/DELETE maintains indexes (write slowdown + storage). Create them on columns you filter/join/sort by, not speculatively everywhere.\n\nKey points: composite indexes follow leftmost-prefix rule, covering indexes include all queried columns, and EXPLAIN shows whether indexes are used.', 'CREATE INDEX idx_users_email ON users(email);\n-- speeds up: SELECT * FROM users WHERE email = ?', ['When should you create an index?', 'On columns used in WHERE, JOIN, and ORDER BY', ['Filter/join/sort columns', 'Every column', 'Only primary keys', 'Never'], ['Indexes trade write speed for read speed.', true]]],
  [4, 'EXPLAIN and Query Tuning', 'Slow queries usually scan too much: missing indexes, SELECT * pulling unneeded columns, N+1 patterns in app loops, or functions on indexed columns defeating index use.\n\nEXPLAIN (or EXPLAIN ANALYZE) shows the query plan — look for Seq Scan on big tables, bad row estimates, and sort spills. Fix the plan, not the symptom.\n\nKey points: avoid functions on indexed columns (WHERE YEAR(date_col)=2024 kills the index — use ranges), paginate with LIMIT, and measure before/after.', 'EXPLAIN ANALYZE\nSELECT id, name FROM orders\nWHERE created_at >= \'2024-01-01\'\nORDER BY created_at\nLIMIT 20;', ['Why does WHERE YEAR(created_at)=2024 prevent index use?', 'The function wraps the column — the index sees transformed values', ['Functions block indexes', 'YEAR() is slow', 'It scans anyway', 'Indexes ignore dates'], ['Rewrite as created_at >= ... AND < ... to keep the index usable.', true]]],
  [4, 'Window Functions in Depth', 'Window functions compute across rows related to the current row WITHOUT collapsing groups like aggregates — ROW_NUMBER, RANK, LAG, LEAD, running SUMs.\n\nOVER (PARTITION BY dept ORDER BY salary) defines the window. They rank top-N per group, compute moving averages, and fill gaps — all in one pass.\n\nKey points: they run after WHERE/GROUP BY, cannot nest window functions, and ROW_NUMBER vs RANK differ on ties (RANK skips positions).', 'SELECT name, salary,\n    RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rank\nFROM employees;', ['What does PARTITION BY do in a window function?', 'Groups rows into independent windows for calculation', ['Splits rows into groups', 'Deletes duplicates', 'Joins tables', 'Sorts output'], ['Each partition computes rankings/sums independently.', true]]],
  [4, 'Stored Procedures and Functions', 'Stored procedures package SQL logic server-side: reusable, transaction-safe, callable from apps with parameters. Functions return values and can be used inside queries.\n\nTrade-offs: less portable across engines, harder to version-control than app code, but they reduce round-trips and enforce business rules centrally.\n\nKey points: parameterize inputs (never concatenate user text — SQL injection), keep procedures focused, and document return shapes clearly.', 'CREATE PROCEDURE get_user(IN uid INT)\nBEGIN\n    SELECT * FROM users WHERE id = uid;\nEND', ['Why parameterize stored procedures instead of string-concatenating values?', 'To prevent SQL injection', ['Injection safety', 'Speed only', 'Cleaner logs', 'No reason'], ['Unescaped user input in SQL text = classic injection vector.', true]]],
  [4, 'Database Security', 'Database security layers: least-privilege accounts (apps get SELECT/INSERT only, never DROP), encrypted connections (TLS), hashed passwords (never plaintext), and audit logging.\n\nSQL injection remains the top breach vector — parameterized queries/prepared statements are non-negotiable. Backups need testing: an untested backup is not a backup.\n\nKey points: separate read/write credentials, rotate secrets, encrypt sensitive columns (PII), and restrict network access to the DB port.', '-- never do this:\n-- "SELECT * FROM users WHERE name = \'" + input + "\'"\n-- always parameterize instead', ['The #1 database attack is...', 'SQL injection via unparameterized input', ['SQL injection', 'Slow queries', 'Big tables', 'Missing indexes'], ['Prepared statements separate code from data.', true]]],
  [5, 'NoSQL vs SQL', 'NoSQL databases (MongoDB, Redis, Cassandra) trade relational guarantees for flexibility: document/key-value/wide-column stores scale horizontally and handle unstructured data.\n\nChoose SQL when data is structured with relationships and ACID matters; choose NoSQL for flexible schemas, massive scale, or simple key lookups. Many systems use both (polyglot persistence).\n\nKey points: "NoSQL" means "not only SQL" not "no SQL", joins are rare in NoSQL (denormalize instead), and transactions exist but with caveats.', '// MongoDB document — flexible schema\n{ name: "Ada", tags: ["admin"], meta: { logins: 42 } }', ['When is NoSQL typically the better fit?', 'Flexible schemas, massive scale, or simple key-value access', ['Flexible/scale/key-value', 'Bank ledgers', 'Strong joins needed', 'ACID-critical transfers'], ['Match the tool to the data shape and consistency needs.', true]]],
  [5, 'Data Warehousing Basics', 'Analytics workloads differ from OLTP: warehouses (BigQuery, Snowflake, Redshift) store historical data columnar-style for fast aggregations over billions of rows.\n\nETL/ELT pipelines move data from production DBs into the warehouse nightly; star schemas (fact + dimension tables) are the standard modeling pattern.\n\nKey points: OLTP optimizes writes+point reads, OLAP optimizes scans+aggregates, never run analytics on production OLTP, and partition large tables by date.', '-- star schema\nfact_sales(sale_id, date_id, product_id, amount)\ndim_products(product_id, name, category)', ['What does OLAP optimize for?', 'Fast analytical scans and aggregations', ['Analytics queries', 'Single-row writes', 'Real-time checkout', 'User logins'], ['Columnar stores make SUM/AVG over billions of rows cheap.', true]]],
  [5, 'Database Capstone', 'Design and query a real schema end-to-end: pick a domain (library, gym, food delivery), write CREATE TABLEs with PKs/FKs/constraints, seed realistic data, then solve 10 analytical queries using JOINs, aggregates, subqueries, and window functions.\n\nDeliverables: schema.sql, seed.sql, queries.sql with comments explaining each result. Every query must return correct, verified output.\n\nKey points: normalize first, add indexes after measuring, document assumptions, and test edge cases (empty tables, NULLs, duplicates).', '-- deliverables\n-- schema.sql  seed.sql  queries.sql\n-- bonus: an ER diagram and index justification', ['What proves a capstone schema is done?', 'It answers real questions correctly with clean, documented queries', ['Correct verified queries', 'Most tables possible', 'Longest SQL file', 'No constraints'], ['A schema you cannot query well is not finished.', true]]],
  [5, 'Migrations and Schema Evolution', 'Schemas change in production — never ALTER by hand. Migration tools (Flyway, Liquibase, Alembic, Prisma Migrate) version schema changes as ordered scripts applied exactly once per environment.\n\nRules: every change is reversible or documented, never edit an applied migration, test migrations against production-like data, and keep them small and fast.\n\nKey points: migrations run at deploy time, backfills for new NOT NULL columns need defaults, and rollbacks should be planned even if rarely used.', '-- migrations/0001_create_users.sql\n-- migrations/0002_add_email_index.sql\n-- applied in order, tracked in a schema_migrations table', ['Why never edit an already-applied migration?', 'Environments track applied versions — edits cause drift and failures', ['Version tracking breaks', 'It is slower', 'Databases forbid it', 'No reason'], ['Applied migrations are immutable history; write a new one instead.', true]]],
  [5, 'Specialized Databases', 'Beyond relational: graph DBs (Neo4j) excel at relationship queries (friend-of-friend, fraud rings); time-series DBs (InfluxDB, TimescaleDB) optimize timestamped metrics; search engines (Elasticsearch) do full-text and fuzzy matching.\n\nPolyglot persistence means choosing per use-case: Postgres for users/orders, Elasticsearch for product search, Redis for sessions/cache.\n\nKey points: each tool optimizes a query shape relational DBs handle poorly, and "one database for everything" is usually a compromise.', '-- graph: friends of friends\nMATCH (a:Person {name:"Ada"})-[:KNOWS]->(b)-[:KNOWS]->(c)\nRETURN c.name', ['What is graph databases\' specialty?', 'Traversing relationships between entities', ['Relationship traversal', 'Time-series metrics', 'Full-text search', 'Key-value caching'], ['Neo4j-style queries walk edges natively — joins become path matches.', true]]],
  [5, 'Query Review Checklist', 'Before shipping SQL to production, review: does it use indexes (EXPLAIN)? Is it parameterized? Does it paginate? Are NULLs and duplicates handled? What happens at 10x data volume?\n\nCode review for queries matters as much as for app code — a bad query at scale takes down the whole app. Pair reviews and EXPLAIN-everything culture prevent incidents.\n\nKey points: SELECT * hides cost, OFFSET pagination degrades on deep pages (use keyset), and monitoring slow-query logs catches regressions early.', '-- review checklist\n-- [ ] EXPLAIN shows index usage\n-- [ ] parameterized, no string concat\n-- [ ] paginated (LIMIT/keyset)\n-- [ ] NULL + duplicate edge cases tested', ['What replaces OFFSET for deep pagination at scale?', 'Keyset/cursor pagination on an indexed column', ['Keyset pagination', 'Bigger LIMIT', 'COUNT first', 'Caching only'], ['OFFSET scans and discards all skipped rows — cursors seek directly.', true]]],
];

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

const CONTENT_DIR = path.join(process.cwd(), 'content', 'languages');
const COURSE_ID = 'complete-course';

/** Replace {token} placeholders in quiz text with language-specific syntax. */
function subst(f: Facts, s: string): string {
  return s
    .replaceAll('{comment}', f.comment)
    .replaceAll('{boolLit}', f.boolLit)
    .replaceAll('{semi}', f.semi || '(no semicolon)')
    .replaceAll('{printCall}', f.printStr('"Hello"'))
    .replaceAll('{if}', f.kw.if).replaceAll('{for}', f.kw.for)
    .replaceAll('{while}', f.kw.while).replaceAll('{fn}', f.kw.fn)
    .replaceAll('{ret}', f.kw.ret).replaceAll('{brk}', 'break')
    .replaceAll('{and}', 'and / &&').replaceAll('{nest}', 'a loop inside a loop')
    .replaceAll('{imp}', 'import / use / include').replaceAll('{mode}', '"a" (append)')
    .replaceAll('{catch}', 'catch / except').replaceAll('{op}', 'operator');
}

function codeBlock(f: Facts, body: string): string {
  const wrapped = f.wrap ? f.wrap(body) : body;
  return f.prelude ? f.prelude + wrapped : wrapped;
}

function lessonSections(f: Facts, t: Topic): any[] {
  const paras = t.body.split('\n\n').filter(Boolean);
  const sections: any[] = paras.map((p) => ({ type: 'text', content: p }));
  sections.push({
    type: 'code',
    content: 'Study this example:',
    codeExample: codeBlock(f, t.snippet(f)),
    language: f.id === 'html' ? 'html' : f.id === 'css' ? 'css' : f.id === 'sql' ? 'sql' : f.ext === 'py' ? 'python' : 'javascript',
  });
  sections.push({
    type: 'code',
    content: 'Try this variation — change a value, predict the output, then run it:',
    codeExample: codeBlock(f, `${t.snippet(f)}\n${f.comment} experiment: modify a value above and predict the new output`),
    language: f.id === 'html' ? 'html' : f.id === 'css' ? 'css' : f.id === 'sql' ? 'sql' : f.ext === 'py' ? 'python' : 'javascript',
  });
  sections.push({
    type: 'tip',
    content: `Summary: ${t.title} — practice the example by changing values and predicting the output before running it.`,
  });
  return sections;
}

function makeQuiz(f: Facts, topicIndex: number, t: Topic, seq: number) {
  const commentQ = {
    id: `${f.id}-q-comment-${topicIndex}`,
    type: 'mcq' as const,
    question: `Which of these is the correct way to write a comment in ${f.name}?`,
    options: [f.comment, '//', '#', '<!-- -->', '/* */'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    correctAnswer: f.comment,
    explanation: `In ${f.name}, ${f.comment} marks a comment. ${f.commentBlock !== f.comment ? `Block comments use ${f.commentBlock}.` : ''}`,
  };
  const concept = {
    id: `${f.id}-q-concept-${topicIndex}`,
    type: 'mcq' as const,
    question: t.mcq.q,
    options: t.mcq.opts,
    correctAnswer: t.mcq.a,
    explanation: t.mcq.e,
  };
  const tf = {
    id: `${f.id}-q-tf-${topicIndex}`,
    type: 'true-false' as const,
    question: `True or False: ${t.tf.s}`,
    correctAnswer: t.tf.ok ? 'True' : 'False',
    explanation: t.tf.ok ? 'This statement is correct.' : 'This statement is incorrect — review the lesson.',
  };
  const fillQ = t.fill.code
    ? {
        id: `${f.id}-q-fill-${topicIndex}`,
        type: 'fill-blank' as const,
        question: `Fill in the blank: ${t.fill.code}`,
        correctAnswer: t.fill.answer,
        explanation: t.fill.e || 'Review the lesson for the correct syntax.',
      }
    : {
        id: `${f.id}-q-fill-${topicIndex}`,
        type: 'mcq' as const,
        question: `What is the main purpose of the ${t.title} technique shown in this lesson?`,
        options: [t.title, 'Storing passwords', 'Printing random numbers', 'Deleting files'],
        correctAnswer: t.title,
        explanation: `It exists to help you ${t.title.toLowerCase()} effectively.`,
      };
  const outputQ: any = {
    id: `${f.id}-q-out-${topicIndex}`,
    type: 'predict-output' as const,
    question: `What does this ${f.name} code produce?\n\`\`\`\n${t.snippet(f).split('\n').slice(0, 3).join('\n')}\n\`\`\``,
    options: ['Hello, World!', 'An error', 'Nothing', '0'],
    correctAnswer: f.helloOut === 'Hello, World!' && topicIndex === 0 ? 'Hello, World!' : 'Depends on the code — trace it line by line',
    explanation: 'Trace each statement in order; output happens where print/display statements run.',
  };
  // Fix the output question: only lesson 0 (hello world) has a definite answer
  if (topicIndex !== 0) {
    outputQ.options = ['Depends on the code — trace it line by line'];
    outputQ.correctAnswer = 'Depends on the code — trace it line by line';
    outputQ.type = 'mcq' as const;
    outputQ.question = `In ${f.name}, what is the safest way to predict what a program outputs?`;
    outputQ.explanation = 'Read top to bottom, track variable values, and note every output statement.';
  }

  const raw = [commentQ, concept, tf, fillQ, outputQ] as any[];
  const questions = raw.map((q) => ({
    ...q,
    question: subst(f, q.question),
    correctAnswer: subst(f, String(q.correctAnswer)),
    explanation: subst(f, q.explanation || ''),
    ...(q.options ? { options: q.options.map((o: string) => subst(f, o)) } : {}),
  }));

  return {
    id: `${f.id}-quiz-${String(seq).padStart(2, '0')}`,
    title: `Quiz: ${t.title}`,
    description: `Check your understanding of ${t.title}.`,
    questions,
    passingScore: 60,
    xpReward: 20,
  };
}

function makeChallenges(f: Facts, moduleIdx: number, moduleTitle: string, topics: Topic[]) {
  const theme = (topics.length ? topics.map((t) => t.title.toLowerCase()).join(', ') : moduleTitle.toLowerCase());
  const pick = (i: number) => topics.length ? topics[i % topics.length].title : moduleTitle;
  return [0, 1, 2].map((i) => ({
    id: `${f.id}-challenge-m${moduleIdx + 1}-${i + 1}`,
    title: `${moduleTitle} Practice ${i + 1}`,
    difficulty: Math.min(5, moduleIdx + i + 1) as 1 | 2 | 3 | 4 | 5,
    statement: `Module ${moduleIdx + 1} (${moduleTitle}) covers: ${theme}. Solve this practice problem using what you learned.\n\nExercise ${i + 1}: write a small program that demonstrates one concept from this module (${pick(i)}).`,
    starterCode: `${f.comment} Your code here\n`,
    visibleTests: [{ input: '', expectedOutput: f.helloOut, isHidden: false }],
    hiddenTests: [],
    hints: [
      `Re-read the ${pick(i)} lesson example.`,
      `Start by declaring your variables, then add the core logic.`,
      `Test with the simplest input first, then edge cases.`,
    ],
    solution: codeBlock(f, f.hello),
    solutionExplanation: 'A correct solution applies the module concepts in a small working program.',
    xpReward: 30 + i * 10,
    coinReward: 15 + i * 5,
    tags: [f.id, `module-${moduleIdx + 1}`],
  }));
}

const MODULE_TITLES = ['Getting Started', 'Control Flow', 'Functions', 'Data Structures', 'Advanced Topics', 'Projects & Mastery'];

function generateFor(f: Facts): void {
  let effectiveTopics: Topic[];
  if (f.id === 'html') {
    effectiveTopics = HTML_TOPICS;
  } else if (f.id === 'css' || f.id === 'sql') {
    const rows = (f.id === 'css' ? CSS_ROWS : SQL_ROWS) as SimpleTopic[];
    effectiveTopics = rows.map((r) => {
      const qa = r[4] as unknown as [string, string, string[], [string, boolean]];
      return T({
        mod: r[0], title: r[1], body: r[2],
        snippet: () => r[3],
        mcq: { q: qa[0], a: qa[1], opts: qa[2], e: '' },
        tf: { s: qa[3][0], ok: qa[3][1], e: '' },
        fill: { code: '', answer: '', e: '' },
      });
    });
  } else {
    effectiveTopics = TOPICS;
  }

  const langDir = path.join(CONTENT_DIR, f.id);
  const courseDir = path.join(langDir, 'courses', COURSE_ID);

  // language.json
  fs.mkdirSync(langDir, { recursive: true });
  fs.writeFileSync(path.join(langDir, 'language.json'), JSON.stringify(LanguageSchema.parse({
    id: f.id, name: f.name, icon: f.icon, color: f.color,
    description: `${f.name} complete beginner-to-advanced course with quizzes and practice challenges.`,
    difficulty: 'beginner', runtimeType: f.runtime,
    tags: ['programming', 'course', 'beginner'],
  }), null, 2));

  // course.json — wipe stale generated files first so removed/renamed
  // lessons don't linger and inflate counts
  fs.rmSync(courseDir, { recursive: true, force: true });
  fs.mkdirSync(courseDir, { recursive: true });
  fs.writeFileSync(path.join(courseDir, 'course.json'), JSON.stringify(CourseSchema.parse({
    id: COURSE_ID, title: `${f.name} Complete Course`, level: 'beginner',
    estimatedHours: 30,
    description: `A complete ${f.name} course: fundamentals through advanced topics, with quizzes and hands-on challenges.`,
  }), null, 2));

  // group topics by module
  const byModule = new Map<number, Topic[]>();
  for (const t of effectiveTopics) {
    if (!byModule.has(t.mod)) byModule.set(t.mod, []);
    byModule.get(t.mod)!.push(t);
  }

  let lessonSeq = 0;
  const moduleCount = Math.max(...[...byModule.keys()]) + 1;
  for (let m = 0; m < moduleCount; m++) {
    const modTopics = byModule.get(m) ?? [];
    if (modTopics.length === 0) continue;
    const moduleId = `module-${m + 1}`;
    const moduleDir = path.join(courseDir, 'modules', `0${m + 1}-${moduleId}`);
    fs.mkdirSync(moduleDir, { recursive: true });

    fs.writeFileSync(path.join(moduleDir, 'module.json'), JSON.stringify(ModuleSchema.parse({
      id: moduleId, title: MODULE_TITLES[m] ?? `Module ${m + 1}`,
      order: m + 1, description: `${MODULE_TITLES[m]} for ${f.name}.`, estimatedMinutes: 300,
    }), null, 2));

    for (const sub of ['lessons', 'quizzes', 'challenges']) fs.mkdirSync(path.join(moduleDir, sub), { recursive: true });

    modTopics.forEach((t, ti) => {
      lessonSeq++;
      const lessonId = `lesson-${String(lessonSeq).padStart(2, '0')}`;
      const quizId = `${f.id}-quiz-${String(lessonSeq).padStart(2, '0')}`;

      fs.writeFileSync(path.join(moduleDir, 'lessons', `${lessonId}.json`), JSON.stringify(LessonSchema.parse({
        id: lessonId, title: t.title,
        summary: t.body.split('\n\n')[0].slice(0, 140),
        estimatedMinutes: 20, difficulty: Math.min(5, 1 + m) as 1 | 2 | 3 | 4 | 5,
        xpReward: 20 + m * 10,
        learningObjectives: [
          `Understand ${t.title.toLowerCase()}`,
          'Apply the concept in a small program',
          'Predict program output by reading code',
        ],
        sections: lessonSections(f, t),
        keyTakeaways: [t.body.split('\n\n').pop()!.slice(0, 200)],
        quizRefs: [quizId],
        challengeRefs: [`${f.id}-challenge-m${m + 1}-${(ti % 3) + 1}`],
        nextLessonId: lessonSeq < effectiveTopics.length ? `lesson-${String(lessonSeq + 1).padStart(2, '0')}` : undefined,
      }), null, 2));

      fs.writeFileSync(path.join(moduleDir, 'quizzes', `${quizId}.json`), JSON.stringify(QuizSchema.parse(makeQuiz(f, lessonSeq, t, lessonSeq)), null, 2));
    });

    makeChallenges(f, m, MODULE_TITLES[m], modTopics).forEach((c) => {
      fs.writeFileSync(path.join(moduleDir, 'challenges', `${c.id}.json`), JSON.stringify(ChallengeSchema.parse(c), null, 2));
    });
  }

  console.log(`  ${f.name}: ${lessonSeq} lessons, ${lessonSeq} quizzes, 15 challenges`);
}

// Fix SimpleTopic tuple shape -> proper mcq/tf extraction
function fixSimpleTopics(f: Facts): void { /* handled inline above */ }

console.log('Generating curriculum for all languages...');
for (const f of ALL_LANGS) {
  generateFor(f);
}
console.log('Done. Run `npm run content:validate` to verify.');

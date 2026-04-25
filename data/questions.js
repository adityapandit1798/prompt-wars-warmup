export const localQuestions = [
    {
        id: `q1`,
        topic: `JavaScript`,
        difficulty: `beginner`,
        question: `Which keyword is used to declare a block-scoped variable that can be reassigned?`,
        options: [`A. var`, `B. let`, `C. const`, `D. function`],
        correctAnswer: `B`,
        explanation: `The let keyword creates a block-scoped local variable that can be reassigned.`
    },
    {
        id: `q2`,
        topic: `JavaScript`,
        difficulty: `beginner`,
        question: `What is the output of typeof null?`,
        options: [`A. "null"`, `B. "undefined"`, `C. "object"`, `D. "string"`],
        correctAnswer: `C`,
        explanation: `In JavaScript, typeof null returns "object" due to a legacy bug in the language.`
    },
    {
        id: `q3`,
        topic: `JavaScript`,
        difficulty: `intermediate`,
        question: `Which method creates a new array with all elements that pass the test implemented by the provided function?`,
        options: [`A. map()`, `B. filter()`, `C. reduce()`, `D. forEach()`],
        correctAnswer: `B`,
        explanation: `The filter() method creates a shallow copy of a portion of a given array, filtered down to just the elements that pass the test.`
    },
    {
        id: `q4`,
        topic: `JavaScript`,
        difficulty: `advanced`,
        question: `What is a closure?`,
        options: [`A. A function bundled together with its lexical environment`, `B. A block of code that executes immediately`, `C. An object oriented pattern`, `D. A way to clear memory`],
        correctAnswer: `A`,
        explanation: `A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).`
    },
    {
        id: `q5`,
        topic: `Python`,
        difficulty: `beginner`,
        question: `How do you create a list in Python?`,
        options: [`A. []`, `B. {}`, `C. ()`, `D. <>`],
        correctAnswer: `A`,
        explanation: `Lists are created using square brackets [] in Python.`
    },
    {
        id: `q6`,
        topic: `Python`,
        difficulty: `intermediate`,
        question: `What does the "self" parameter represent in a Python class method?`,
        options: [`A. The class itself`, `B. The parent class`, `C. The instance of the class`, `D. A global variable`],
        correctAnswer: `C`,
        explanation: `The self parameter is a reference to the current instance of the class, and is used to access variables that belongs to the class.`
    },
    {
        id: `q7`,
        topic: `Python`,
        difficulty: `advanced`,
        question: `Which of the following is an example of a Python decorator?`,
        options: [`A. @staticmethod`, `B. def _init_()`, `C. class Method:`, `D. import sys`],
        correctAnswer: `A`,
        explanation: `A decorator is a design pattern in Python that allows a user to add new functionality to an existing object without modifying its structure, usually denoted with an @ symbol.`
    },
    {
        id: `q8`,
        topic: `HTML`,
        difficulty: `beginner`,
        question: `What does HTML stand for?`,
        options: [`A. Hyper Text Markup Language`, `B. Home Tool Markup Language`, `C. Hyperlinks and Text Markup Language`, `D. Hyper Tool Multi Language`],
        correctAnswer: `A`,
        explanation: `HTML stands for Hyper Text Markup Language.`
    },
    {
        id: `q9`,
        topic: `CSS`,
        difficulty: `beginner`,
        question: `What property is used to change the background color in CSS?`,
        options: [`A. color`, `B. bgcolor`, `C. background-color`, `D. background`],
        correctAnswer: `C`,
        explanation: `The background-color property sets the background color of an element.`
    },
    {
        id: `q10`,
        topic: `CSS`,
        difficulty: `intermediate`,
        question: `In CSS flexbox, which property aligns items vertically along the cross axis?`,
        options: [`A. justify-content`, `B. align-items`, `C. flex-direction`, `D. align-content`],
        correctAnswer: `B`,
        explanation: `The align-items property sets the align-self value on all direct children as a group, aligning them along the cross axis.`
    },
    {
        id: `q11`,
        topic: `Git`,
        difficulty: `beginner`,
        question: `Which command is used to save your changes to the local repository?`,
        options: [`A. git push`, `B. git save`, `C. git commit`, `D. git add`],
        correctAnswer: `C`,
        explanation: `The git commit command captures a snapshot of the projects currently staged changes.`
    },
    {
        id: `q12`,
        topic: `Git`,
        difficulty: `intermediate`,
        question: `What is the difference between git fetch and git pull?`,
        options: [`A. They are exactly the same`, `B. Fetch only downloads new data, pull downloads and merges`, `C. Pull only downloads new data, fetch downloads and merges`, `D. Fetch pushes data to remote, pull gets data`],
        correctAnswer: `B`,
        explanation: `git pull is a combination of git fetch followed by git merge.`
    },
    {
        id: `q13`,
        topic: `React`,
        difficulty: `beginner`,
        question: `What is JSX?`,
        options: [`A. A syntax extension for JavaScript`, `B. A new framework`, `C. A database query language`, `D. A CSS preprocessor`],
        correctAnswer: `A`,
        explanation: `JSX is a syntax extension for JavaScript recommended for use with React to describe what the UI should look like.`
    },
    {
        id: `q14`,
        topic: `React`,
        difficulty: `intermediate`,
        question: `What hook is used to perform side effects in a functional component?`,
        options: [`A. useState`, `B. useContext`, `C. useEffect`, `D. useReducer`],
        correctAnswer: `C`,
        explanation: `The useEffect Hook allows you to perform side effects in your components, like data fetching or direct DOM updates.`
    },
    {
        id: `q15`,
        topic: `Node.js`,
        difficulty: `beginner`,
        question: `What is Node.js built on?`,
        options: [`A. Python engine`, `B. V8 JavaScript engine`, `C. Java VM`, `D. SpiderMonkey`],
        correctAnswer: `B`,
        explanation: `Node.js is built on Google Chrome's V8 JavaScript engine.`
    },
    {
        id: `q16`,
        topic: `SQL`,
        difficulty: `beginner`,
        question: `Which statement is used to extract data from a database?`,
        options: [`A. GET`, `B. OPEN`, `C. EXTRACT`, `D. SELECT`],
        correctAnswer: `D`,
        explanation: `The SELECT statement is used to select data from a database.`
    },
    {
        id: `q17`,
        topic: `SQL`,
        difficulty: `intermediate`,
        question: `What does a LEFT JOIN do?`,
        options: [`A. Returns all records from the left table, and matched records from the right`, `B. Returns all records from the right table`, `C. Returns only matching records in both tables`, `D. Returns all records from both tables`],
        correctAnswer: `A`,
        explanation: `The LEFT JOIN keyword returns all records from the left table (table1), and the matched records from the right table (table2).`
    },
    {
        id: `q18`,
        topic: `TypeScript`,
        difficulty: `beginner`,
        question: `What is TypeScript?`,
        options: [`A. A superset of JavaScript that adds static typing`, `B. A new version of HTML`, `C. A CSS framework`, `D. A database management system`],
        correctAnswer: `A`,
        explanation: `TypeScript is a strongly typed programming language that builds on JavaScript.`
    },
    {
        id: `q19`,
        topic: `Algorithms`,
        difficulty: `intermediate`,
        question: `What is the time complexity of a binary search on a sorted array?`,
        options: [`A. O(1)`, `B. O(N)`, `C. O(log N)`, `D. O(N^2)`],
        correctAnswer: `C`,
        explanation: `Binary search halves the search space in each step, resulting in a logarithmic time complexity O(log N).`
    },
    {
        id: `q20`,
        topic: `Web Security`,
        difficulty: `advanced`,
        question: `What is XSS?`,
        options: [`A. Cross-Site Scripting, a vulnerability where attackers inject malicious scripts`, `B. A secure protocol for data transfer`, `C. A hashing algorithm`, `D. A database injection attack`],
        correctAnswer: `A`,
        explanation: `Cross-Site Scripting (XSS) is a type of security vulnerability typically found in web applications that enables attackers to inject client-side scripts into web pages.`
    }
];

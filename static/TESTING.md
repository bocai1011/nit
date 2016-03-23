# So you want to test your JavaScript code...

Great! This document outlines the framework and best practices we've chosen for
testing our front-end JavaScript code. Everything in this document is live and
up for debate. If there's a better way to do something, we should talk about it,
so don't be shy with your suggestions for improvement.

## Installing dependencies

Our `package.json` file specifies all of the modules we use for testing our
JavaScript. You can easily pick up all dependencies by running

```
> update --npm
```

## Running the test suite

We supply a batch file that simplifies running the actual tests. The file is
named `test-js.bat` and it lives in `NEATO/`. Here's its usage documentation:

```
Run JS unit tests
Options:
  -h  Print this message
  -c  Enable code coverage
  -l  Run just the last modified test script
  -w  Run in watch mode (i.e. not single-shot)
```

To run the full test suite, simply run

```
> test-js.bat
```

Adding a `-l` flag allows you to run only the most recently modified test
script. This is useful if you're working on testing a single module and don't
want to run the entire test suite every time you make a change.

Adding a `-w` flag will make the test engine run in "watch mode". Essentially,
this will keep the test engine open, and every time you save a test script, the
suite will run again (or just that script, if the `-l` flag is on.)

Adding a `-c` flag instructs the test engine to generate a code coverage report
for the test scripts it runs. If you execute `test-js.bat` in code coverage
mode, the engine will write a directory full of coverage statistics into
`NEATO/neat/static/.jsunit-coverage`. Navigate in that directory until you find
the `index.html` file and open it in your web browser. You will find a report
for all the tested modules with information about statements covered, branches
taken, functions entered, and lines reached. See below for a brief note about
code coverage for our JavaScript code.

## Developing / adding tests

All of our JavaScript test modules lie in a
`NEATO/neat/static/src/modules/{app,common,reports,staging}/tests` directory,
and should be named `lower-case-with-dashes-component-name.spec.js`. It's
important that the module ends with `.spec.js`; if it doesn't, it won't be
included when you run the tests. We have a [test template][test-template] as a
starting point for adding a new test.

### Our testing stack

Roughly, our stack is comprised the following libraries (organized high-level
to low level):

* [NEAT TestUtils][ntUtils]
* [React TestUtils][TestUtils]
* [Sinon.JS][sinon]
* [Chai][chai]
* [Mocha][mocha]
* [Karma][karma]

The **NEAT TestUtils** are a utility belt of custom helpers that we've developed to
make testing our specific code easier. It provides helpers for things like
stubbing a NEAT case or rendering a React component with a React Router context.

The **React TestUtils** ship as an addon to React. If you're testing React
components---and you *will* be testing React components---these provide helpers
for making assertions about component types or finding DOM components or
simulating DOM events.

**Sinon.JS** is a testing library that provides tools for creating stubs, mocks,
and spies for testing. If you don't know what those are, you can educate
yourself in the [Sinon.JS documentation][sinon-docs]. Sinon makes it easy to
inspect function calls or force calls to have a certain behavior.

**Chai** lets you make assertions using BDD syntax, like `expect` or `should`.
We mostly use `expect`, but that's not a hard-and-fast rule. If you find that a
different assertion style makes more sense for a test case, feel free.

**Mocha** provides infrastructure for laying and running our tests. It uses the
`describe...it` syntax for creating test modules. Take a look at the
[test template][test-template] for an example of how to structure a test module.

And down at the bottom of the stack is **Karma**, which is the engine that actually
runs our tests. In a somewhat vague and probably incorrect analogy, Karma is
like a virtual machine. It creates a browser environment and then runs all the
test modules sequentially in that environment.

### Writing a test

When writing a test for a JavaScript module, strive to test all the relevant and
import functionality of that module. Try to test one piece of functionality per
test case (i.e., per `it(...)` block.) There should really only be one assertion
per test case, though in some cases it makes sense to have two. Keep in mind
that the more tests you write, the more code we will have to maintain. That's
not to say that you should skimp on your tests; rather, find the proper balance
of useful to trivial tests. You'll find a more in-depth instruction on how to
write a JavaScript test module in the [test template][test-template].

#### A quick note on code coverage

While the ideal of 100% code coverage sounds really nice, you will reach a point
of diminishing returns if you try to write tests for every single line of your
code. The coverage report turns green at 80%, and green is good enough. But even
if you've tested all the important functionality in your code and coverage is
still below 80%, don't write more tests just to boost your percentage. Consider
the following:

```js
function handleKeyDown(e) {
  if (e.which === 18 || e.keyCode === 18) {
    /* ... */
  }
}
```

If you test this function by passing `e` as `{ which: 18 }`, the coverage report
will show that you haven't tested a branch in the code (the `e.keyCode` branch.)
Adding a whole other test just to hit that branch is the definition of insanity.

[ntUtils]: http://rg-sec-saws05.ad.sec.gov/neat-development/NEATO/blob/master/neat/static/test-utils.js
[TestUtils]: http://facebook.github.io/react/docs/test-utils.html
[sinon]: http://sinonjs.org/
[chai]: http://chaijs.com/
[mocha]: http://mochajs.org/
[karma]: http://karma-runner.github.io/
[sinon-docs]: http://sinonjs.org/docs/
[test-template]: http://rg-sec-saws05.ad.sec.gov/neat-development/NEATO/blob/master/neat/static/test-template.spec.js

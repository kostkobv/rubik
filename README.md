Rubik
=================================

Getting Started
---------------

Clone the repository and install dependencies with `npm`.
```bash
$ git clone https://github.com/kostkobv/rubik.git
$ cd rubik
$ npm install
```

Building
--------
The `build` script defined in the `package.json` file uses webpack to transpile
sources in the `src` and `test` directories. The successfully transpiled sources
are placed in the `build` folder. This folder is preserved by npm, but ignored
by git.

```bash
$ npm run-script build
```

The `pretest`, `prestart`, and `prepublish` scripts defined in the
`package.json` file all reference the `build` script, so there's no need to run
the build script manually in those situations.

Running
-------

Run the project with `npm start`.

```bash
$ npm start
```

As said before, this will automatically run the build script first.

Testing
-------

Test the project with `npm test`.

```bash
$ npm test
```

Again, this will automatically run the build script first.

Publishing
----------

Publish the project on the local machine (for testing) with `npm install`.

```bash
$ npm install -g ./
$ rubik
```

In both cases, again, this will automatically run the build script first.

[webpack]:https://webpack.github.io/
[es2015]:http://www.ecma-international.org/ecma-262/6.0/
[stage-0]:https://github.com/tc39/ecma262/blob/master/stage0.md
[es2016]:https://tc39.github.io/ecma262/
[babel]:https://babeljs.io/
[babel-preset-es2015]:https://babeljs.io/docs/plugins/preset-es2015/
[babel-preset-stage-0]:https://babeljs.io/docs/plugins/preset-stage-0/
[mocha]:https://mochajs.org/

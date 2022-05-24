# compg
CLI tool that makes react boilerplate component. Supports es6 or typescript, css or @emotion/styled, emmet-like syntax.

![compg example](./example.gif)

## Installation
```bash
npm i compg -g
```

## Usage
```bash
compg
```
Simple run.
```bash
compg ComponentName
```
Run with preinstalled component.
```bash
compg "ComponentName>AnotherComponentName"
```
Create two components with parent-child connection.
```bash
compg --syntax=typescript --style=emotion "ComponentName>AnotherComponentName"
```
Run with options.
```bash
compg -tm "Parent>Child>Toy+AnotherToy^(AnotherChild>Candy)+YetAnotherChild"
```
Run with short options and more complex connection.

## ComponentName
The syntax is inherited from emmet. There are several operators available `>`, `+`, `^`, `()`.

## Available Options
 - `-h`, `--help`: Show this help message and exit.
 - `--syntax`: Syntax, valid values: `typescript`, `es6`.
 - `--style`: Style, valid values: `emotion`, `css`.
 - `-t`: Use typescript. Alias for `--syntax=typescript`.
 - `-e`: Use es6. Alias for `--syntax=es6`.
 - `-m`: Use @emotion/styled. Alias for `--style=emotion`.
 - `-c`: Use css. Alias for `--style=css`.

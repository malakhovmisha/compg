#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import enquirer from 'enquirer';
import minimist from 'minimist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '../');

const toPascalCase = (string) => {
    return `${string}`
        .replace(new RegExp(/[-_]+/, 'g'), ' ')
        .replace(new RegExp(/[^\w\s]/, 'g'), '')
        .replace(
            new RegExp(/\s+(.)(\w+)/, 'g'),
            (_, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
        )
        .replace(new RegExp(/\s/, 'g'), '')
        .replace(new RegExp(/\w/), s => s.toUpperCase());
};

const traverse = (data, callback, type = 'bfs') => {
    const stack = [
        {
            data,
            depth: 0,
        },
    ];

    const push =
        (depth) =>
            (...nextDataArr) => {
                if (!nextDataArr.length) {
                    return;
                }

                const nextArr = nextDataArr.map((nextData) => ({
                    data: nextData,
                    depth: depth + 1,
                }));

                if (type === 'dfs') {
                    stack.unshift(...nextArr);
                } else {
                    stack.push(...nextArr);
                }
            };

    let index = 0;

    while (stack.length) {
        const node = stack.shift();

        callback(node.data, {
            index,
            depth: node.depth,
            push: push(node.depth),
        });

        index += 1;
    }
};

const getComponentsEmmetTree = (emmetStr) => {
    const componentsTree = {};
    const parentStack = [];
    let currentNode = componentsTree;
    let currentComponentName = '';

    [...emmetStr, '>'].forEach((char) => {
        if (/^[a-zA-Z0-9]$/.test(char)) {
            currentComponentName += char;
        } else if (/^[\>\+\(\)\^]$/.test(char)) {
            if (!currentComponentName) {
                if (char === '(') {
                    parentStack.push(currentNode);
                }

                if (char === '^' && currentNode.parent) {
                    currentNode = currentNode.parent;
                }

                return;
            }

            const node = {
                name: toPascalCase(currentComponentName),
                parent: currentNode,
            };

            if (!currentNode.children) {
                currentNode.children = [];
            }

            currentNode.children.push(node);

            if (char === '>') {
                currentNode = node;
            } else if (char === '^' && currentNode.parent) {
                currentNode = currentNode.parent;
            } else if (char === '(') {
                parentStack.push(currentNode);
            } else if (char === ')') {
                const parent = parentStack.pop();

                if (parent) {
                    currentNode = parent;
                }
            }

            currentComponentName = '';
        }
    });

    return componentsTree.children;
};

const getComponentDepsFromTree = (tree) => {
    const componentsDepsMap = {};

    traverse({ children: tree }, ({ name, children }, { push }) => {
        if (name) {
            componentsDepsMap[name] = componentsDepsMap[name] || {};

            if (children) {
                componentsDepsMap[name].children = [
                    ...new Set([
                        ...(componentsDepsMap[name].children || []),
                        ...children.map(({ name }) => name),
                    ]),
                ];
            }
        }

        if (children) {
            push(...children);
        }
    });

    return Object.entries(componentsDepsMap).map(([name, options]) => ({
        name,
        ...options
    }));
}

const main = async () => {
    const argv = minimist(process.argv.slice(2), {
        strings: ['syntax', 'style'],
        boolean: ['t', 'e', 'm', 'c', 'h', 'help'],
        stopEarly: true
    });

    let emmetName = Array.isArray(argv['_']) ? argv['_'][0] : typeof argv['_'] === 'string' ? argv['_'] : undefined;
    let syntax = ['typescript', 'es6'].includes(argv.syntax) ? argv.syntax : argv.t ? 'typescript' : argv.e ? 'es6' : undefined;
    let styleSystem = ['emotion', 'css'].includes(argv.style) ? argv.style : argv.m ? 'emotion' : argv.c ? 'css' : undefined;

    const isSeveralSyntax = [['typescript', 'es6'].includes(argv.syntax), argv.t, argv.e].reduce((acc, flag) => acc += (flag ? 1 : 0), 0) > 1;
    const isSeveralStyles = [['emotion', 'css'].includes(argv.style), argv.m, argv.c].reduce((acc, flag) => acc += (flag ? 1 : 0), 0) > 1;

    if (isSeveralSyntax) {
        syntax = undefined;
    }

    if (isSeveralStyles) {
        styleSystem = undefined;
    }

    const questions = [];

    if (argv.help || argv.h) {
        console.log(`Available options
-h, --help: Show this help message and exit.
--syntax: Syntax, valid values: typescript, es6.
--style: Style, valid values: emotion, css.
-t: Use typescript. Alias for --syntax=typescript.
-e: Use es6. Alias for --syntax=es6.
-m: Use @emotion/styled. Alias for --style=emotion.
-c: Use css. Alias for --style=css.`);

        return;
    }

    if (!syntax) {
        questions.push({
            type: 'select',
            name: 'syntax',
            message: 'What syntax to use?',
            choices: ['typescript', 'es6']
        });
    };

    if (!styleSystem) {
        questions.push({
            type: 'select',
            name: 'styleSystem',
            message: 'What style system to use?',
            choices: [{
                value: 'emotion',
                message: '@emotion/styles'
            }, {
                value: 'css',
                message: 'css'
            }, ]
        });
    };

    if (!emmetName) {
        questions.push({
            type: 'input',
            name: 'emmetName',
            message: 'What is component name?',
            validate(value) {
                if (
                    !/^[a-zA-Z\()][a-zA-Z0-9\+\>\(\)\^]*$/.test(value)
                    || /([\>\+\^][\>\+]|[\>\+][\^])/.test(value)
                ) {
                    return 'Component name should be a valid component name!';
                }
    
                return true;
            }
        });
    };

    if (questions.length) {
        const answers = await enquirer.prompt(questions);

        syntax = syntax || answers.syntax;
        styleSystem = styleSystem || answers.styleSystem;
        emmetName = emmetName || answers.emmetName;
    }

    const emmetTree = getComponentsEmmetTree(emmetName);
    const componentsDeps = getComponentDepsFromTree(emmetTree)

    componentsDeps.forEach(({ name, children }) => {
        spawnSync(`HYGEN_TMPLS=${root}/templates ${root}/node_modules/.bin/hygen`, [
            syntax,
            styleSystem,
            `--name "${name}"`,
            `--childrenArr "${(children || []).join(',')}"`
        ], {
            stdio: 'inherit',
            shell: true,
            cwd: process.cwd()
        });
    })

};

main();

const fs = require('fs');
const ohm = require('ohm-js');
const contents = fs.readFileSync('projectppGrammar.ohm', 'utf-8');
const myGrammar = ohm.grammar(contents);

const sourceCode = fs.readFileSync('my-test-project.ppp', 'utf-8');
const m = myGrammar.match(sourceCode);
if (m.succeeded()) {
    console.log('¡Nice!😁. Project plus plus was compile successfully.');

    const semantics = myGrammar.createSemantics();

    semantics.addOperation('run', {
        ProjectStatement(_, _1, keyAndValues, _2) {
            return Object.assign({}, ...keyAndValues.children.map(c => c.run()));
        },
        KeyAndValue(key, _1, value, _2) {
            return { [key.run()]: value.run() }
        },
        Key(a) {
            return this.sourceString
        },
        Value(_1) {
            return this.sourceString
        },
    })

    const adapter = semantics(m);
    const ast = adapter.run();

    console.log("Result \n", ast);
} else {
    console.log("wrong syntax ☹️! \n");
    console.log(m.message)
}
const fs = require('fs');
const ohm = require('ohm-js');
const contents = fs.readFileSync('projectppGrammar.ohm', 'utf-8');
const myGrammar = ohm.grammar(contents);

const sourceCode = fs.readFileSync('finalProject.ppp', 'utf-8');
const m = myGrammar.match(sourceCode);
if (m.succeeded()) {
    const semantics = myGrammar.createSemantics();

    semantics.addOperation('run', {
        _iter(...item) {
            return item
        },
        DocProject(proyect, activities, people, resources) {
            console.log("activities",activities)
            return {
                proyecto: proyect.run(),
                actividades: activities.children.map(e => e.run()),
                personas: people.children.map(e => e.run()),
                recursos: resources.children.map(e => e.run())
            }
        },
        ProjectStatement(_, _1, keyAndValues, _2) {
            return Object.assign({}, ...keyAndValues.children.map(c => c.run()));
        },
        ActivityStatement(_, _1, keyAndValues, _2) {
            return Object.assign({}, ...keyAndValues.children.map(c => c.run()));
        },
        PersonStatement(_, _1, keyAndValues, _2) {
            return Object.assign({}, ...keyAndValues.children.map(c => c.run()));
        },
        ResourceStatement(_, _1, keyAndValues, _2) {
            return Object.assign({}, ...keyAndValues.children.map(c => c.run()));
        },
        KeyAndValue(key, _1, value, _2) {
            return { [key.run()]: value.run() }
        },
        Key(a) {
            return this.sourceString
        },
        Value(_1) {
            return `${_1.ctorName}` === 'ArrayLiteral'
                ? _1.run()
                : _1.sourceString
        },
        ArrayLiteral(_1, list, _2) {
            console.log("ArrayLiteral", list.sourceString)
            return list.asIteration().children.map(c => c.sourceString)
        }
    })

    const adapter = semantics(m);
    const result = adapter.run();

    console.log('¡Nice!😁. Project plus plus was compile successfully.');
    console.log("Result \n", result);
} else {
    console.log("wrong syntax ☹️! \n");
    console.log(m.message)
}
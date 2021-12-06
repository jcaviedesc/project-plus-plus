const fs = require('fs');
const ohm = require('ohm-js');
const contents = fs.readFileSync('projectppGrammar.ohm', 'utf-8');
const myGrammar = ohm.grammar(contents);

const sourceCode = fs.readFileSync('my-test-project.ppp', 'utf-8');
const m = myGrammar.match(sourceCode);
if (m.succeeded()) {
  console.log('¡Nice!😁. Compile Project plus plus compiled successfully.');
} else {
  console.log("wrong syntax ☹️! \n");
  console.log(m.message)
}
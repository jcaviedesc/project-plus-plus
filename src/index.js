const fs = require('fs');
const ohm = require('ohm-js');
const { exec } = require("child_process");
const Handlebars = require("handlebars");
const tmplhtml = fs.readFileSync(require.resolve('./template.html'), 'utf8')
const contents = fs.readFileSync('src/projectppGrammar.ohm', 'utf-8');
const myGrammar = ohm.grammar(contents);

const myArgsfile = process.argv[2]
if (!myArgsfile) {
  throw new Error('Not file program provide')
}
const sourceCode = fs.readFileSync(myArgsfile, 'utf-8');
const m = myGrammar.match(sourceCode);

if (m.succeeded()) {
  const semantics = myGrammar.createSemantics();

  semantics.addOperation('run', {
    _iter(...item) {
      return item
    },
    DocProject(proyect, activities, people, resources) {
      const proyectoMap = proyect.run()
      const actividadesMap = activities.children.map(e => e.run())
      proyectoMap.children = actividadesMap
      return {
        proyecto: proyectoMap,
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
      return a.sourceString.toLowerCase()
    },
    Value(_1) {
      const evalCtorName = {
        ArrayLiteral() {
          return _1.run();
        },
        DateLiteral() {
          const date = _1.sourceString.split('/').reverse();
          if (date[2].length === 1) {
            date[2] = `0${date[2]}`
          }
          return date.join('-')
        }
      }
      if (evalCtorName.hasOwnProperty(_1.ctorName)) {
        return evalCtorName[_1.ctorName]()
      }
      return _1.sourceString
    },
    ArrayLiteral(_1, list, _2) {
      return list.asIteration().children.map(c => c.sourceString)
    }
  })

  const adapter = semantics(m);
  const parseProject = adapter.run();

  Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
  });

  const template = Handlebars.compile(tmplhtml);
  const content = template({ dataProject: parseProject.proyecto });
  const outputFile = 'build/index.html'
  fs.writeFile(outputFile, content, function (err, data) {
    if (err) {
      return console.log(err);
    }
  });

  console.log('¡Nice!😁. Project plus plus was compile successfully.\n');
  // open navegador con el gantt chart
  exec(`open ${outputFile}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
})

} else {
  console.log("wrong syntax ☹️! \n");
  console.log(m.message)
}
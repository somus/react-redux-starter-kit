var fs = require('fs');
module.exports = function (plop) {
  // Custom directory picker
  plop.addPrompt('directory', require('inquirer-directory'));

  // Helper which executes javascript code
  plop.addHelper('x', function (expression, options) {
    var fn = function () {};
    var result;

    try {
      fn = Function.apply(
        this,
        [
          'return ' + expression + ';'
        ]
      );
    } catch (e) {
      console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
    }

    try {
      result = fn.call(this);
    } catch (e) {
      console.warn('[warning] {{x ' + expression + '}} runtime error', e);
    }
    return result;
  });

  // Helper to handle eval in if loop expression
  plop.addHelper('xif', function (expression, options) {
    return plop.handlebars.helpers['x'].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
  });

  // View Component Generator
  plop.setGenerator('view', {
    description: 'Generate a View Component',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      validate: function (value) {
        if ((/.+/).test(value)) {
          return true;
        }
        return 'name is required';
      }
    }, {
      type: 'input',
      name: 'path',
      message: 'What should be the router path?',
      validate: function (value) {
        if ((/.+/).test(value)) {
          return true;
        }
        return 'path is required';
      }
    }, {
      type: 'input',
      name: 'description',
      message: 'Describe what the view component does?',
      validate: function (value) {
        if ((/.+/).test(value)) {
          return true;
        }
        return 'description is required';
      }
    }, {
      type: 'confirm',
      name: 'wantSCSS',
      message: 'Do you want to create corresponding SCSS file?'
    }, {
      type: 'confirm',
      name: 'connectRedux',
      message: 'Do you want to connect the component to a redux store?'
    }, {
      type: 'list',
      name: 'store',
      message: 'Select the store',
      choices: () => fs.readdirSync('src/redux/modules').map(file => file.slice(0, -3)),
      when: answers => answers.connectRedux
    }, {
      type: 'confirm',
      name: 'wantActions',
      message: 'Do you want to add actions to connect method?'
    }],
    actions: data => {
      var actions = [{
        type: 'add',
        path: data.wantSCSS ? 'src/views/{{properCase name}}View/{{properCase name}}View.js' : 'src/views/{{properCase name}}View.js',
        templateFile: 'plop_templates/view/view.js.hbs',
        abortOnFail: true
      }, {
        type: 'add',
        path: 'tests/views/{{properCase name}}View.spec.js',
        templateFile: 'plop_templates/view/view.spec.js.hbs',
        abortOnFail: true
      }, {
        type: 'modify',
        path: 'src/routes/index.js',
        pattern: /(\nexport default \()/gi,
        template: 'import {{ properCase name }}View from \'views/{{ properCase name }}View\';\n$1'
      }, {
        type: 'modify',
        path: 'src/routes/index.js',
        pattern: /(<\/Route>)/gi,
        template: '  <Route path=\'/{{path}}\' component={ {{ properCase name }}View } />\n$1'
      }];

      if (data.wantSCSS) {
        actions.push({
          type: 'add',
          path: 'src/views/{{properCase name}}View/{{properCase name}}View.scss',
          templateFile: 'plop_templates/view/view.scss.hbs',
          abortOnFail: true
        });
      }

      return actions;
    }
  });

  // General component generator
  plop.setGenerator('component', {
    description: 'Generate either a Component using ES6 class or Stateless Function',
    prompts: [{
      type: 'list',
      name: 'type',
      message: 'Select the type of component',
      choices: () => ['ES6', 'Stateless Function']
    }, {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      validate: function (value) {
        if ((/.+/).test(value)) {
          return true;
        }
        return 'name is required';
      }
    }, {
      type: 'input',
      name: 'description',
      message: 'Describe what the view component does?',
      validate: function (value) {
        if ((/.+/).test(value)) {
          return true;
        }
        return 'description is required';
      }
    }, {
      type: 'directory',
      name: 'path',
      message: 'where would you like to put this component?',
      basePath: plop.getPlopfilePath() + '/src'
    }, {
      type: 'confirm',
      name: 'wantSCSS',
      message: 'Do you want to create corresponding SCSS file?'
    }],
    actions: data => {
      var actions = [{
        type: 'add',
        path: data.wantSCSS ? 'src/{{ path }}/{{properCase name}}/{{properCase name}}.js' : 'src/{{ path }}/{{properCase name}}.js',
        templateFile: data.type === 'ES6' ? 'plop_templates/component/es6.js.hbs' : 'plop_templates/component/stateless.js.hbs',
        abortOnFail: true
      }, {
        type: 'add',
        path: 'tests/{{path}}/{{properCase name}}.spec.js',
        templateFile: 'plop_templates/component/component.spec.js.hbs',
        abortOnFail: true
      }];

      if (data.wantSCSS) {
        actions.push({
          type: 'add',
          path: 'src/{{path}}/{{properCase name}}/{{properCase name}}.scss',
          templateFile: 'plop_templates/component/component.scss.hbs',
          abortOnFail: true
        });
      }

      return actions;
    }
  });

  // Redux module generator
  plop.setGenerator('module', {
    description: 'Generate a Redux Module',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      validate: function (value) {
        if ((/.+/).test(value)) {
          return true;
        }
        return 'name is required';
      }
    }],
    actions: data => {
      var actions = [{
        type: 'add',
        path: 'src/redux/modules/{{camelCase name}}.js',
        templateFile: 'plop_templates/modules/modules.js.hbs',
        abortOnFail: true
      }, {
        type: 'add',
        path: 'tests/redux/modules/{{camelCase name}}.spec.js',
        templateFile: 'plop_templates/modules/modules.spec.js.hbs',
        abortOnFail: true
      }, {
        type: 'modify',
        path: 'src/redux/rootReducer.js',
        pattern: /(\nexport default)/gi,
        template: 'import {{ camelCase name }} from \'./modules/{{ camelCase name }}\';\n$1'
      }, {
        type: 'modify',
        path: 'src/redux/rootReducer.js',
        pattern: /(\n}\);)/gi,
        template: ',\n  {{ camelCase name }}$1'
      }];

      return actions;
    }
  });
};

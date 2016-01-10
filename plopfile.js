var fs = require('fs');
module.exports = function (plop) {
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

  plop.addHelper('xif', function (expression, options) {
    return plop.handlebars.helpers['x'].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
  });

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
        template: '  <Route path=\'/{{path}}\' component={ {{ properCase name }}View } />\n  $1'
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
};

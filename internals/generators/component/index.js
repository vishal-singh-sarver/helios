/**
 * Component Generator
 */

const componentExists = require('../utils/componentExists')

module.exports = {
  description: 'Add an unconnected component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      default: 'Button',
      validate: (value) => {
        if (/.+/.test(value)) {
          return componentExists(value)
            ? 'A component or container with this name already exists'
            : true
        }
        return 'The name is required'
      }
    },
    {
      type: 'confirm',
      name: 'memo',
      default: false,
      message: 'Do you want to wrap your component in React.memo?'
    },
    {
      type: 'confirm',
      name: 'wantMessages',
      default: true,
      message: 'Do you want a messages file (text strings)?'
    }
  ],
  actions: (data) => {
    const actions = [
      {
        type: 'add',
        path: '../../src/renderer/src/components/{{properCase name}}/index.tsx',
        templateFile: './component/index.jsx.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/renderer/src/components/{{properCase name}}/tests/index.test.tsx',
        templateFile: './component/test.jsx.hbs',
        abortOnFail: true
      }
    ]

    if (data.wantMessages) {
      actions.push({
        type: 'add',
        path: '../../src/renderer/src/components/{{properCase name}}/messages.ts',
        templateFile: './component/messages.js.hbs',
        abortOnFail: true
      })
    }

    actions.push({ type: 'prettify', path: '/components/' })

    return actions
  }
}

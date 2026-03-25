/**
 * Container Generator
 */

const componentExists = require('../utils/componentExists')

module.exports = {
  description: 'Add a container component (connected to Redux)',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      default: 'Form',
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
      name: 'wantActionsAndReducer',
      default: true,
      message: 'Do you want actions / constants / selectors / reducer for this container?'
    },
    {
      type: 'confirm',
      name: 'wantSaga',
      default: true,
      message: 'Do you want sagas for async flows (e.g. API calls)?'
    },
    {
      type: 'confirm',
      name: 'wantMessages',
      default: true,
      message: 'Do you want a messages file (text strings)?'
    },
    {
      type: 'confirm',
      name: 'wantLoadable',
      default: true,
      message: 'Do you want a Loadable.tsx for async code splitting?'
    }
  ],
  actions: (data) => {
    const actions = [
      {
        type: 'add',
        path: '../../src/renderer/src/containers/{{properCase name}}/index.tsx',
        templateFile: './container/index.jsx.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/renderer/src/containers/{{properCase name}}/tests/index.test.tsx',
        templateFile: './container/test.jsx.hbs',
        abortOnFail: true
      }
    ]

    if (data.wantMessages) {
      actions.push({
        type: 'add',
        path: '../../src/renderer/src/containers/{{properCase name}}/messages.ts',
        templateFile: './container/messages.js.hbs',
        abortOnFail: true
      })
    }

    if (data.wantActionsAndReducer) {
      actions.push(
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/types.ts',
          templateFile: './container/types.js.hbs',
          abortOnFail: true
        },
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/actions.ts',
          templateFile: './container/actions.js.hbs',
          abortOnFail: true
        },
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/tests/actions.test.ts',
          templateFile: './container/actions.test.js.hbs',
          abortOnFail: true
        },
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/constants.ts',
          templateFile: './container/constants.js.hbs',
          abortOnFail: true
        },
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/selectors.ts',
          templateFile: './container/selectors.js.hbs',
          abortOnFail: true
        },
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/tests/selectors.test.ts',
          templateFile: './container/selectors.test.js.hbs',
          abortOnFail: true
        },
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/reducer.ts',
          templateFile: './container/reducer.js.hbs',
          abortOnFail: true
        },
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/tests/reducer.test.ts',
          templateFile: './container/reducer.test.js.hbs',
          abortOnFail: true
        }
      )
    }

    if (data.wantSaga) {
      actions.push(
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/saga.ts',
          templateFile: './container/saga.js.hbs',
          abortOnFail: true
        },
        {
          type: 'add',
          path: '../../src/renderer/src/containers/{{properCase name}}/tests/saga.test.ts',
          templateFile: './container/saga.test.js.hbs',
          abortOnFail: true
        }
      )
    }

    if (data.wantLoadable) {
      actions.push({
        type: 'add',
        path: '../../src/renderer/src/containers/{{properCase name}}/Loadable.tsx',
        templateFile: './container/Loadable.jsx.hbs',
        abortOnFail: true
      })
    }

    actions.push({ type: 'prettify', path: '/containers/' })

    return actions
  }
}

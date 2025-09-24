
  module.exports = {
  '$call': {
    md5sum: '6d57eea5f90c0b6740a6f2e780066912',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/call.js',
    name: '$call',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/call.js',
    prefix: '$',
    events: {
      command: {
        _: 'call <fn>',
        args: {
          '--type': String,
          '--data': String,
          '--timeout': Number,
          '--error': Boolean,
          '--interval': Number
        },
        alias: {
          '--data': '-d',
          '--timeout': '-t',
          '--error': '-e',
          '--interval': '-i'
        },
        descriptions: {
          _: 'Call function',
          '<fn>': 'Function name to call',
          '--type': 'Set event type: such as http',
          '--data': 'Event data, support JSON and URL-QUERY-ENCODED',
          '--timeout': 'Execution timeout',
          '--error': 'Show full error',
          '--interval': 'Run function every seconds'
        }
      }
    },
    testFile: null
  },
  '$command': {
    md5sum: '2fb3e4817b7d310b515c57f6760186f4',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/command.js',
    name: '$command',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/command.js',
    prefix: '$',
    events: {},
    testFile: null
  },
  '$debug': {
    md5sum: '24c840f1defb2dccf691556dcce2abeb',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/debug.js',
    name: '$debug',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/debug.js',
    prefix: '$',
    events: {
      command: {
        _: 'debug <service>',
        args: { '--filter': String },
        alias: { '--filter': '-f' },
        descriptions: { _: 'Debug online server', '<service>': 'Service type' }
      }
    },
    testFile: null
  },
  '$help': {
    md5sum: '7ed881c5f2be76127ac4f4b4ad894421',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/help.js',
    name: '$help',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/help.js',
    prefix: '$',
    events: {
      command: { fallback: true, _: 'help', descriptions: { _: 'Show help' } }
    },
    testFile: null
  },
  '$list': {
    md5sum: '22bcda3ae7faa0a2d3c0a1ed4ecbd7d1',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/list.js',
    name: '$list',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/list.js',
    prefix: '$',
    events: {
      command: {
        _: 'list [filter]',
        args: { '--system': Boolean },
        alias: { '--system': '-s' },
        descriptions: { _: 'List functions', '--system': 'Show system functions' }
      }
    },
    testFile: null
  },
  '$log': {
    md5sum: 'cc93aa78b00ee9c0cc3194a048dfee78',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/log.js',
    name: '$log',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/log.js',
    prefix: '$',
    events: {
      command: { _: 'log [service]', descriptions: { _: 'Show service log' } }
    },
    testFile: null
  },
  '$new': {
    md5sum: 'd0fcd5161b3c362e305313edde3e8815',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/new.js',
    name: '$new',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/new.js',
    prefix: '$',
    events: {
      command: {
        _: 'new [dir]',
        args: {
          '--force': Boolean,
          '--source': String
        },
        alias: { '--source': '-s' },
        descriptions: {
          _: 'Create new fly project',
          '[dir]': 'Dir name',
          '--force': 'Force create when dir exists',
          '--source': 'Select source to create. support: http (default), project'
        }
      }
    },
    testFile: null
  },
  '$reload': {
    md5sum: '3dd6d6893b9751685f301e19af50d9e2',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/reload.js',
    name: '$reload',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/reload.js',
    prefix: '$',
    events: {
      command: { _: 'reload [service]', descriptions: { _: 'Reload service' } }
    },
    testFile: null
  },
  '$restart': {
    md5sum: '00d5d0a8404411f8c1875d4d47d87293',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/restart.js',
    name: '$restart',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/restart.js',
    prefix: '$',
    events: {
      command: {
        _: 'restart [service]',
        descriptions: { _: 'Restart service' }
      }
    },
    testFile: null
  },
  '$run': {
    md5sum: 'ad2eef1aeda5a3e96765d57e096d9aa4',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/run.js',
    name: '$run',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/run.js',
    prefix: '$',
    events: {
      command: {
        _: 'run [service]',
        args: {
          '--instance': Number,
          '--bind': String,
          '--port': Number
        },
        alias: { '--instance': '-i', '--bind': '-b', '--port': '-p' },
        descriptions: {
          _: 'Run service in foregroud',
          '--instance': 'The instance number',
          '--bind': 'Bind address',
          '--port': 'Bind port'
        }
      }
    },
    testFile: null
  },
  '$service': {
    md5sum: 'c4210adbf473886f55a93e371df7377e',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/service.js',
    name: '$service',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/service.js',
    prefix: '$',
    events: { command: { _: 'service', descriptions: { _: 'List services' } } },
    testFile: null
  },
  '$show': {
    md5sum: '097707208a3e81c86fc5f630e8185016',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/show.js',
    name: '$show',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/show.js',
    prefix: '$',
    events: {
      command: {
        _: 'show <fn>',
        descriptions: { _: 'Show full function info', '<fn>': 'Function name' }
      }
    },
    testFile: null
  },
  '$start': {
    md5sum: '76c9afdb7b0da53b7aa7a1f1c7ff7ff4',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/start.js',
    name: '$start',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/start.js',
    prefix: '$',
    events: {
      command: {
        _: 'start [service]',
        args: {
          '--instance': Number,
          '--bind': String,
          '--port': Number,
          '--cron-restart': String,
          '--max-memory': String
        },
        alias: { '--instance': '-i', '--bind': '-b', '--port': '-p' },
        descriptions: {
          _: 'Start service as daemon',
          '--instance': 'The instance number',
          '--bind': 'Bind address',
          '--port': 'Bind port',
          '--cron-restart': 'Schedule time to restart with cron pattern',
          '--max-memory': 'Max memory(MB) to reload'
        }
      }
    },
    testFile: null
  },
  '$status': {
    md5sum: '6214ff4568f2f354472efe31300e751b',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/status.js',
    name: '$status',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/status.js',
    prefix: '$',
    events: {
      command: {
        _: 'status [service]',
        descriptions: { _: 'Show service status' }
      }
    },
    testFile: null
  },
  '$stop': {
    md5sum: 'a3bd6c5d7dc4b6b6f49d7818ada73318',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/stop.js',
    name: '$stop',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/stop.js',
    prefix: '$',
    events: {
      command: { _: 'stop [service]', descriptions: { _: 'Stop service' } }
    },
    testFile: null
  },
  '$test': {
    md5sum: '924e9562da637772cc64710a4a0ed4f8',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/commands/test.js',
    name: '$test',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'commands/test.js',
    prefix: '$',
    events: {
      command: {
        _: 'test [fn]',
        args: { '--timeout': Number },
        descriptions: { _: 'Test functions', '<fn>': 'Function name' }
      }
    },
    testFile: null
  },
  '$api': {
    md5sum: '4940fd1922725b857246f40c4ffd3fac',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/services/api.js',
    name: '$api',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'services/api.js',
    prefix: '$',
    events: {
      service: {
        name: 'Fly API server',
        port: 4000,
        endpoint: '',
        keys: [],
        functions: [],
        useContext: false
      }
    },
    testFile: null
  },
  '$cron': {
    md5sum: 'cb1ffc2ad15548a11e48bd0de9d90ada',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/services/cron.js',
    name: '$cron',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'services/cron.js',
    prefix: '$',
    events: { service: { name: 'Cron deamon', singleton: true } },
    testFile: null
  },
  '$fileserver': {
    md5sum: 'b1c6dd042209e0b8c174344a0b5ee037',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/services/fileserver.js',
    name: '$fileserver',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'services/fileserver.js',
    prefix: '$',
    events: { service: { name: 'File server', port: 5050 } },
    testFile: null
  },
  '$http': {
    md5sum: '350c518ed59839eb7f81bd5fc4d59026',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/services/http.js',
    name: '$http',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'services/http.js',
    prefix: '$',
    events: {
      service: {
        singleton: false,
        name: 'Http Server',
        port: 3001,
        address: '127.0.0.1'
      }
    },
    testFile: null
  },
  '$fork': {
    md5sum: '51bdc588ba29b97601c433aae84d6125',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/services/utils/fork.js',
    name: '$fork',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'services/utils/fork.js',
    prefix: '$',
    events: {},
    testFile: null
  },
  '$getServiceConfig': {
    md5sum: '0ae9b894880ae7cd94d6325501ac942c',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/services/utils/getServiceConfig.js',
    name: '$getServiceConfig',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'services/utils/getServiceConfig.js',
    prefix: '$',
    events: {},
    testFile: null
  },
  '$matchHttp': {
    md5sum: '822c45cc559b999b03bde51d232152bb',
    file: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions/services/utils/matchHttp.js',
    name: '$matchHttp',
    root: '/Users/michalwachowicz/.npm/_npx/4d28dc18ce79a14d/node_modules/fly/functions',
    path: 'services/utils/matchHttp.js',
    prefix: '$',
    events: {},
    testFile: null
  }
};

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.
import getHost from '../utils/host';

const REACT_APP = /^REACT_APP_/i;
const NODE_ENV = JSON.stringify(process.env.NODE_ENV || 'development');
const LOCAL_SERVER = Boolean(JSON.stringify(process.env.LOCAL_SERVER));
const STAGING_STREAM = Boolean(JSON.stringify(process.env.STAGING_STREAM));

export default Object.keys(process.env)
  .filter(key => REACT_APP.test(key))
  .reduce(
    (env, key) => {
      env['process.env.' + key] = JSON.stringify(process.env[key]);
      return env;
    },
    {
      'process.env.NODE_ENV': NODE_ENV,
      'process.env.STAGING_STREAM': STAGING_STREAM,
      'process.env.CODESANDBOX_HOST': JSON.stringify(getHost()),
      'process.env.LOCAL_SERVER': Boolean(LOCAL_SERVER),
      'process.env.STAGING': 'STAGING_BRANCH' in process.env,
      'process.env.VSCODE': Boolean(JSON.stringify(process.env.VSCODE)),
    }
  );

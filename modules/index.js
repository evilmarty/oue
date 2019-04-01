import generatePath from './generatePath';
import matchPath from './matchPath';

const NULL_PATTERN_MATCH = { path: null };
const NULL_ROUTE = () => {};
const K = (a) => a;

function findPattern(patterns, path, { strict, exact, sensitive }) {
  for (let pattern of patterns) {
    const match = matchPath(path, { path: pattern, strict, exact, sensitive });
    if (match !== null) {
      return match;
    }
  }
}

function extractAliases(routes) {
  return [...routes].map(([ pattern, route ]) => {
    const type = typeof(route);
    let name;

    if (type === 'function') {
      name = route.name;
      if (name === pattern) {
        name = name.replace(/^\//, '').replace(/\//, '_');
      }
    }
    else if (Array.isArray(route)) {
      if (route.length !== 2) {
        throw new SyntaxError(`Incorrect alias defined for route ${pattern}`);
      }

      name = route.filter(item => typeof(item) === 'string')[0];
      route = route.filter(item => typeof(item) === 'function')[0];
    }
    else if (type === 'object') {
      name = route.name || route.alias || route.key;
      route = route.handler || route.callback || route.value;
    }
    else {
      name = undefined;
      route = undefined;
    }

    if (route === undefined) {
      throw new ReferenceError(`No function given for route ${pattern}`);
    }

    if (name === undefined) {
      throw new ReferenceError(`No name given for route ${pattern} to be used as an alias`);
    }

    return [ name, pattern, route ];
  });
}

export default function createRouter(routes, callback = K) {
  const type = typeof(routes);

  if (type !== 'object' || routes === null) {
    throw new TypeError('routes is not an Object');
  }

  if (!(routes instanceof Map)) {
    routes = new Map(Object.entries(routes));
  }

  if (routes.size === 0) {
    throw new RangeError('Route must contain at least one entry');
  }

  const aliasEntries = extractAliases(routes);
  const patternsByAlias = aliasEntries.map(([ name, pattern ]) => [ name, pattern ]);
  const patterns = aliasEntries.map(([ _, pattern, route ]) => pattern);
  const helperEntries = patternsByAlias.map(([ name, pattern ]) => [ name, (...args) => callback(generatePath(pattern, ...args)) ]);
  const helpers = Object.fromEntries(helperEntries);

  const invoke = (path, ...args) => {
    if (typeof(path) !== 'object') {
      path = { path };
    }

    const { strict = false, exact = true, sensitive = false } = path;
    const pathname = path.pathname || path.path;
    const options = { strict, exact, sensitive };
    const match = findPattern(patterns, pathname, options) || NULL_PATTERN_MATCH;
    const route = routes.get(match.path) || NULL_ROUTE;

    return route(match, ...args);
  };

  const wrapper = (...args) => invoke(...args);

  Object.assign(wrapper, helpers, { invoke });

  wrapper[Symbol.iterator] = function*() {
    yield invoke;
    yield helpers;
  };

  return wrapper;
}

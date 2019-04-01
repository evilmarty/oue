import expect from 'expect';
import createRouter from '../index';

describe('createRouter()', () => {

  describe('calling with invalid arguments', () => {
    it('raises error when given a number', () => {
      expect(() => {
        createRouter(1)
      }).toThrow(new TypeError('routes is not an Object'));
    });

    it('raises error when given a boolean', () => {
      expect(() => {
        createRouter(true)
      }).toThrow(new TypeError('routes is not an Object'));
    });

    it('raises error when given null', () => {
      expect(() => {
        createRouter(null)
      }).toThrow(new TypeError('routes is not an Object'));
    });
  });

  describe('calling with an object', () => {
    it('raises error when object is empty', () => {
      expect(() => {
        createRouter({})
      }).toThrow(new RangeError('Route must contain at least one entry'));
    });

    it('raises an error when property value is not a function', () => {
      expect(() => {
        createRouter({
          '/': 'root',
        })
      }).toThrow(new ReferenceError('No function given for route /'));
    });

    it('raises an error when property value is an array and its length is not 2', () => {
      expect(() => {
        createRouter({
          '/': [],
        })
      }).toThrow(new ReferenceError('Incorrect alias defined for route /'));

      expect(() => {
        createRouter({
          '/': [1],
        })
      }).toThrow(new ReferenceError('Incorrect alias defined for route /'));

      expect(() => {
        createRouter({
          '/': [1, 2, 3],
        })
      }).toThrow(new ReferenceError('Incorrect alias defined for route /'));
    });

    it('raises an error when property value array does not contain a function', () => {
      expect(() => {
        createRouter({
          '/': [1, 2],
        })
      }).toThrow(new ReferenceError('No function given for route /'));
    });

    it('raises an error when property value array does not contain a string', () => {
      expect(() => {
        createRouter({
          '/': [() => {}, () => {}],
        })
      }).toThrow(new ReferenceError('No name given for route / to be used as an alias'));
    });

    it('returns a function', () => {
      const routes = {
        '/': function root() {},
        '/foo': () => {},
        'bar': [() => {}, 'bar'],
      };
      const router = createRouter(routes);

      expect(router).toBeInstanceOf(Function);
      expect(router.invoke).toBeInstanceOf(Function);
      expect(router).toHaveProperty('root');
      expect(router).toHaveProperty('foo');
      expect(router).toHaveProperty('bar');
    });

    it('returns a destructured function and object containing properties of functions', () => {
      const routes = {
        '/': function root() {},
        '/foo': () => {},
        'bar': [() => {}, 'bar'],
      };
      const [ router, helpers ] = createRouter(routes);

      expect(router).toBeInstanceOf(Function);
      expect(helpers).toBeInstanceOf(Object);
      expect(helpers).toHaveProperty('root');
      expect(helpers).toHaveProperty('foo');
      expect(helpers).toHaveProperty('bar');
    });
  });

  describe('calling the function returned', () => {
    it('calls the function with a string that matches the property', () => {
      const routes = {
        '/foobar': (params) => params,
      };
      const router = createRouter(routes);

      expect(router('/foobar')).toEqual({
        isExact: true,
        params: {},
        path: '/foobar',
        url: '/foobar',
      });
    });

    it('calls the function with a string that matches the property with params', () => {
      const routes = {
        '/post/:post_id': (params) => params,
      };
      const router = createRouter(routes);

      expect(router('/post/123')).toEqual({
        isExact: true,
        params: {
          post_id: '123',
        },
        path: '/post/:post_id',
        url: '/post/123',
      });
    });

    it('returns undefined when it cannot match a property', () => {
      const routes = {
        '/foobar': (params) => params,
      };
      const router = createRouter(routes);

      expect(router('/foobaz')).toBeUndefined();
    });
  });

  describe('calling a helper method', () => {
    it('returns the url path', () => {
      const routes = {
        '/foobar': (params) => params,
      };
      const [ router, helpers ] = createRouter(routes);

      expect(helpers.foobar()).toEqual('/foobar');
    });

    it('returns the url path with parameters', () => {
      const routes = {
        '/post/:post_id': [ 'post', () => {} ],
      };
      const [ router, helpers ] = createRouter(routes);

      expect(helpers.post({ post_id: 123 })).toEqual('/post/123');
    });

    it('calls the callback function given when creating the router', () => {
      const routes = {
        '/foobar': (params) => params,
      };
      const [ router, helpers ] = createRouter(routes, (path) => `>>>${path}<<<`);

      expect(helpers.foobar()).toEqual('>>>/foobar<<<');
    });
  });
});

# rOUtEr

A simple router with the R and T. It's no frills and offers enough functionality to be useful without getting in the way.

## Getting started

Install oue using `npm`:

```shell
npm install -s oue

```

Or via `yarn`:

```shell
yarn add oue

```

### How to use

Define your routes.

```javascript
import createRouter from 'oue';

const router = createRouter({
  '/posts/:post_id': function getPost({ params: { post_id } }) {
    return fetchPost(post_id);
  },

  '/posts': function getAllPosts() {
    return fetchPosts();
  },

  '/': function root() {
    return null;
  },
});
```

Now you have a handy function that will call the function that matches the given path.

```javascript
router('/post/123') // will call fetchPost(123) and return its result

router('/posts') // will call and return fetchPosts()

router('/') // will call and return null
```

But what if we want the inverse, ie. get the path from params etc?

oue includes helper methods for each route to do just that. You'll notice that every function is named. The function name is used to create this helper.

```javascript
router.getPost({ post_id: 123 }) // "/posts/123"

router.getPosts() // "/posts"

router.root() // "/"
```

## API

### `createRouter(routes, callback)`

Returns a function that invokes the function that matches the pattern. The function also contains aliases to generate route paths. Can be destructured into a function and an object containing the alias methods. ie. `const [ router, helpers ] = createRoutes(...)`.

#### Parameters
- routes - A routes object. Keys are patterns and values are either the action name or an action object.
- callback - Function that is called with the generated path on an alias function.

## Examples

On its own oue might not be that useful, but coupled with a mechanism to interact with it can be very powerful. If used with [history](https://github.com/ReactTraining/history#usage):

```javascript
import { createBrowserHistory } from 'history';
import createRouter from 'oue';

const routes = {
  '/posts/:post_id': function getPost({ params: { post_id } }) {
    return fetchPost(post_id);
  }
}

const history = createBrowserHistory();
const router = createRouter(routes, history.push);

history.listen(router); // calls router on push state changes

router.getPost(123); // will update the URL with /posts/123
```

## Motivation

When I created [dhistory](https://github.com/evilmarty/dhistory) I solved a particular use-case that I had, but as I moved from project to project found that I wanted 80% of that functionality. Unfortunately that library didn't make it easy to remove the 20% of code I didn't want, so I created this project to be that 80%. At some point might update that project to use this functionality and avoid duplication, like a good developer :)

## Attribution

Much of this work wouldn't be made possible without the efforts put to [react-router](https://github.com/ReactTraining/react-router).

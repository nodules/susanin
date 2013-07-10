# Susanin [![Build Status](https://travis-ci.org/ruslankerimov/susanin.png?branch=master)](https://travis-ci.org/ruslankerimov/susanin)

Susanin is a routing library which can be used in any JavaScript environments.
[Demo](http://nodules.github.io/susanin)

## Getting Started

* `susanin.js` - uncompressed source code with comments
* `susanin.min.js` - compressed code

In the browsers just include the file in your document:
```html
<script src="/path/to/susanin.min.js"></script>
```

You can install Susanin on Node.js using [NPM](http://npmjs.org):
```
npm install susanin
```

## Examples

* The simplest:

```javascript
var route = Susanin.Route('/products');

console.log(route.match('/produc'));                  // => null 
console.log(route.match('/products'));                // => {} 
```

* More complex, with a param in pattern:

```javascript
var route = Susanin.Route('/products/<id>');

console.log(route.match('/products'));               // => null
console.log(route.match('/products/321'));           // => { id : '321' }
console.log(route.match('/products/321?id=123'));    // => { id : '321' }
```

* With query params in path:

```javascript
var route = Susanin.Route('/products');
 
console.log(route.match('/products?id=321&category=shoes&category=new'));   
// => { id : '321', category : [ 'shoes', 'new' ] } 
```

* With an optional group:

```javascript
var route = Susanin.Route('/products(/<id>)'));

console.log(route.match('/products'));           // => {}
console.log(route.match('/products/321'));       // => { id : '321' }
```

* With a default value of param:

```javascript
var route = Susanin.Route({ 
    pattern : '/products(/<id>)',
    defaults : {
        id : '123'
    }
});

console.log(route.match('/products'));           // => { id : '123' }
console.log(route.match('/products/321'));       // => { id : '321' }
```

* If you want to specify a regexp for param:

```javascript
var route = Susanin.Route({ 
    pattern : '/products(/<id>)',
    defaults : {
        id : '123'
    },
    conditions : {
        id : '\\d{3,4}'
    }
});

console.log(route.match('/products'));           // => { id : '123' }
console.log(route.match('/products/321'));       // => { id : '321' }
console.log(route.match('/products/a321'));      // => null
console.log(route.match('/products/32'));        // => null
```

* The most complex:

```javascript
var route = Susanin.Route({ 
    pattern : '/products(/<category>(/<id>))(/)',
    defaults : {
        category : 'shoes',
        id : '123'
    },
    conditions : {
        category : [ 'shoes', 'jeans', 'shirt' ]
        id : '\\d{3,4}'
    }
});

console.log(route.match('/prod'));               // => null
console.log(route.match('/products'));           // => { category : 'shoes', id : '123' }
console.log(route.match('/products/'));          // => { category : 'shoes', id : '123' }
console.log(route.match('/products/jeans'));     // => { category : 'jeans', id : '123' }
console.log(route.match('/products/skirt'));     // => null
console.log(route.match('/products/shirt/321')); // => { category : 'shirt', id : '321' }
console.log(route.match('/products/shirt/32'));  // => null
console.log(route.match('/products/shoes/'));    // => { category : 'shoes', id : '123' }
```

* You can bind any data with a route and match on these:

```javascript
var route = Susanin.Route({ 
    pattern : '/products/<category>',
    data : {
        method : 'GET',
        controller : 'products'
    }
});

console.log(route.getData());                     // => { method : 'GET', controller : 'products' }
console.log(route.match({ method : 'POST' });     // => null
console.log(route.match({ method : 'GET' });      // => {}
console.log(route.match({ 
    path : '/products/shoes', 
    method : 'GET' 
});                                               // => { category : 'shoes' }
```

* Set of routes:

```javascript
var susanin = Susanin();

susanin.addRoute('/contacts');
susanin.addRoute('/products/<category>');
susanin.addRoute({
    pattern : '/(<controller>(/<action>(/<id>)))',
    defaults : {
        controller : 'index',
        action : 'build'
    }
});

console.log(susanin.findFirst('/'));                  // => [ #route, { controller : 'index', action : 'build' } ]
console.log(susanin.findFirst('/products'));          // => [ #route, { controller : 'products', action : 'build' } ]
console.log(susanin.findFirst('/products/shoes'));    // => [ #route, { category : 'shoes' } ]
```

* Susanin can build a path:

```javascript
var route = Susanin.Route({ 
    pattern : '/products(/cat_<category>)(/)',
    defaults : { category : 'shoes' }
});

console.log(route.build());                           // => '/products'
console.log(route.build({ category : 'jeans' }));     // => '/products/cat_jeans'
console.log(route.build({ category : 'shoes' }));     // => '/products'

```


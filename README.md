# Susanin [![Build Status](https://travis-ci.org/ruslankerimov/susanin.png?branch=master)](https://travis-ci.org/ruslankerimov/susanin)

Susanin is a routing library which can be used in any JavaScript environments.

## Usages

* `susanin.js` - source code with comments
* `susanin.min.js` - compressed code

In browser just include a script file in your document:
```html
<script src="/path/to/susanin.min.js"></script>
```

You can install Susanin on Node.js using [NPM](http://npmjs.org):
```
npm install susanin
```

## Examples

* The most simple:

```javascript
var route = Susanin.Route('/products');

route.match('/produc');             // => null 
route.match('/products');           // => {} 
```

* More complex, with a param in pattern:

```javascript
var route = Susanin.Route('/products/<id>');

route.match('/products');               // => null
route.match('/products/321');           // => { id : '321' }
route.match('/products/321?id=123');    // => { id : '321' }
```

* With query params in path:

```javascript
var route = Susanin.Route('/products');
 
route.match('/products?id=321&category=shoes&category=new');   
// => { id : '321', category : [ 'shoes', 'new' ] } 
```

* With an optional group:

```javascript
var route = Susanin.Route('/products(/<id>)');

route.match('/products');           // => {}
route.match('/products/321');       // => { id : '321' }
```

* With a default value of param:

```javascript
var route = Susanin.Route({ 
    pattern : '/products(/<id>)',
    defaults : {
        id : '123'
    });

route.match('/products');           // => { id : '123' }
route.match('/products/321');       // => { id : '321' }
```

* If you want to specify regexp for param:

```javascript
var route = Susanin.Route({ 
    pattern : '/products(/<id>)',
    defaults : {
        id : '123'
    },
    conditions : {
        id : '\\d{3,4}'
    });

route.match('/products');           // => { id : '123' }
route.match('/products/321');       // => { id : '321' }
route.match('/products/a321');      // => null
route.match('/products/32');        // => null
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
    });

route.match('/prod');               // => null
route.match('/products');           // => { category : 'shoes', id : '123' }
route.match('/products/');          // => { category : 'shoes', id : '123' }
route.match('/products/jeans');     // => { category : 'jeans', id : '123' }
route.match('/products/skirt');     // => null
route.match('/products/shirt/321'); // => { category : 'shirt', id : '321' }
route.match('/products/shirt/32');  // => null
route.match('/products/shoes/');    // => { category : 'shoes', id : '123' }
```

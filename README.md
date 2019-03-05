# obj-each-break

[![experimental](https://badges.github.io/stability-badges/dist/experimental.svg)](https://github.com/badges/stability-badges)

Small utility library implementing `each`, `map`, `filter`, and their reverse versions for
Arrays and Objects on all own properties not just integer indexed ones. Uses `for-each-break` to
create break and return emulation as if it was a regular `for` or `while` loop.

To simulate break return `BREAK` or `RETURN`, to simulate `return` return `BREAK(value)` or
`RETURN(value)` both are equivalent but the one communicating the right intent should be used.

The functions assume `this` is an array or object so they should be invoked with
`.call(arrayLike, callback)`

defines:

<!-- @formatter:off -->

* `eachProp` - invoke callback for each own property, order looping over the properties is not defined
* `hasOwnProperties` - true if has any own non-undefined properties
* `arrayObjectKeys` - collect array like indexed values and keys from both objects and arrays returns `{ arrayValues: [], objectKeys: [], }` where `arrayValues` is an array of property values for integer>=0 props and objectKeys other own property keys
* `eachDir` - property looping where direction is provided as an argument
* `each` - invoke callback for each own property, first array index like properties in increasing index order then own properties in natural sort order
* `eachRight` - invoke callback for each own property, first own properties in reverse natural sort order then array index like properties in decreasing index order
* `cloneArrayObject` - clone array or object with all own properties
* `deleteItems` - delete items in an array, arguments are deep flattened
* `arrayLength` - return array like length for an object or array
* `deepClone` - deep clone array or object
* `mergeDefaults` - merge defaults into object properties
* `copyFiltered` - copy properties chosen by filter
* `copyFilteredNot` - copy properties not chosen by filter
* `objFiltered` - filter for object/array own properties, not only integer indexed properties, result is object/array depending on this for call
* `objFilter` - filter for object/array own properties, not only integer indexed properties, result is an array
* `objMapped` - object map for object/array own properties, not only integer indexed properties, result is object/array depending on this for call
* `objMap` - map for object/array own properties, not only integer indexed properties, result is array
* `objSome` - some for object/array own properties
* `objEvery` -  some for object/array own properties
* `objReduceIterated` - reduce taking iteration functions and callback
* `objReduce` - reduce for object/array own properties, order of looping over properties not defined
* `objReduceLeft` - reduce for object/array own properties, order of looping over properties is same as `each`
* `objReduceRight` - reduce for object/array own properties, order of looping over properties same as `eachRight`

For convenience `for-each-break` module's exports are re-exported:

* `BREAK` - used to break or return from loop, using `BREAK` to break out of loop is preferred since it communicates clear intention
* `RETURN` - used to break or return from loop, using `RETURN` to break out of loop and return a value is preferred since it communicates clear intention
* `filter` - use to filter array like object, with early break or return: `filter.call(arrayLike, callback, thisArg)`
* `forEach` - use to loop over array like object: `forEach.call(arrayLike, callback, thisArg, defaultReturn)`
* `map` - use to map array like object, with early break or return: `map.call(arrayLike, callback, thisArg)`
* `filterRight` - use to filter array like object in reverse, with early break or return: `filter.call(arrayLike, callback, thisArg)`
* `forEachRight` - use to loop over array like object in reverse: `forEach.call(arrayLike, callback, thisArg, defaultReturn)`
* `mapRight` - use to map array like object in reverse, with early break or return: `map.call(arrayLike, callback, thisArg)`

<!-- @formatter:on -->

## Install

Use [npm](https://npmjs.com/) to install.

```
npm install obj-each-break --save
```

## Usage

[![NPM](https://nodei.co/npm/obj-each-break.png)](https://www.npmjs.com/package/obj-each-break)

## License

MIT, see [LICENSE.md](https://github.com/vsch/obj-each-break/blob/master/LICENSE.md) for details.


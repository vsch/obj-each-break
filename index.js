'use strict';

const isFunction = require('lodash.isfunction');
const utilTypes = require('util-type-funcs');
const forEachBreak = require('for-each-break');

const UNDEFINED = void 0;

const isValid = utilTypes.isValid;
const isNumber = utilTypes.isNumber;
const extend = utilTypes.extend;
const hasOwnProperty = utilTypes.hasOwnProperty;
const isObjectLike = utilTypes.isObjectLike;
const isArray = utilTypes.isArray;
const isNumeric = utilTypes.isNumeric;
const isNumericInteger = utilTypes.isNumericInteger;
const toNumberOrDefault = utilTypes.toNumberOrDefault;
const toNumber = utilTypes.toNumber;
const toIntegerOrDefault = utilTypes.toIntegerOrDefault;
const toInteger = utilTypes.toInteger;
const toArrayIndexOrDefault = utilTypes.toArrayIndexOrDefault;
const isArrayIndex = utilTypes.isArrayIndex;
const toArrayIndex = utilTypes.toArrayIndex;
const isUndefined = utilTypes.isUndefined;
const isNull = utilTypes.isNull;
const isNullOrUndefined = utilTypes.isNullOrUndefined;
const firstDefined = utilTypes.firstDefined;
const firstValid = utilTypes.firstValid;

const BREAK = forEachBreak.BREAK;
const RETURN = forEachBreak.BREAK;
const forEach = forEachBreak.forEach;
const map = forEachBreak.map;
const filter = forEachBreak.filter;
const forEachRight = forEachBreak.forEachRight;
const mapRight = forEachBreak.mapRight;
const filterRight = forEachBreak.filterRight;

/**
 * invoke callback for each own property of arg (object/array)
 * order of keys used for callback invocation is not specified
 *
 * @this       {*}
 * @param callback {function}  function(value, key, arg), key is number if arrayIndex, else
 *     string callback can return BREAK to break out of loop and have undefined returned, or
 *     return BREAK(arg) to break out of loop and have eachProp return arg as result
 * @param thisArg  what to use as this for the function call, or undefined
 * @param defaultResult {*} default result value if none is returned from callback using BREAK
 * @return {*}
 */
function eachProp(callback, thisArg = UNDEFINED, defaultResult = UNDEFINED) {
    const arg = this;
    let result = defaultResult;

    if (isObjectLike(arg) && (arg.constructor === Object || arg.constructor === Array)) {
        const keys = Object.keys(arg);
        let i = keys.length;
        const savedReturned = BREAK.clearDefault(defaultResult);
        while (i--) {
            const key = keys[i];
            if (callback.call(thisArg, arg[key], toArrayIndex(key), arg) === BREAK) {
                result = BREAK.returned;
                break;
            }
        }
        BREAK.restoreDefault(savedReturned);
    }
    return result;
}

function alwaysTrue(value, key) {
    return true;
}

function alwaysFalse(value, key) {
    return false;
}

function isEqualTo(value, key) {
    // noinspection EqualityComparisonWithCoercionJS
    return this == value;
}

function isNotEqualTo(value, key) {
    // noinspection EqualityComparisonWithCoercionJS
    return this != value;
}

function arrayContainsKey(value, key) {
    if (this.indexOf(key) !== -1) return true;
    return typeof key === "number" && key >= 0 && Number.isInteger(key) && this.indexOf(Number.prototype.toString.call(key)) !== -1;
}

function arrayContainsNotKey(value, key) {
    return !arrayContainsKey.call(this, value, key);
}

function objectHasOwnPropertyKey(value, key) {
    return this.hasOwnProperty(key);
}

function objectHasNotOwnPropertyKey(value, key) {
    return !this.hasOwnProperty(key);
}

function arrayContainsNotKeyBreakTrue(value, key) {
    if (!arrayContainsKey.call(this, value, key)) return BREAK(true);
}

function objectHasNotOwnPropertyBreakTrue(value, key, excluded) {
    if (!this.hasOwnProperty(key)) return BREAK(true);
}

function testFuncBreakTrue(testFunc) {
    return function (value, key, src) {
        if (testFunc.call(this, value, key, src)) {
            return BREAK(true);
        }
    };
}

function testFuncNotBreakTrue(testFunc) {
    return function (value, key, src) {
        if (!testFunc.call(this, value, key, src)) {
            return BREAK(true);
        }
    };
}

function alwaysBreakTrue(value, key, excluded) {
    return BREAK(true);
}

function keyEqualsBreakTrue(value, key, excluded) {
    // noinspection EqualityComparisonWithCoercionJS
    if (key == this) return BREAK(true);
}

function keyNotEqualsBreakTrue(value, key, excluded) {
    // noinspection EqualityComparisonWithCoercionJS
    if (key != this) return BREAK(true);
}

function resolveTestFunc(arg, isObjectTest, isArrayTest, functionWrapper, isUndefinedTest, isOtherTest) {
    return isFunction(arg) ? isFunction(functionWrapper) ? functionWrapper(arg) : arg :
        isArray(arg) ? isArrayTest :
            isObjectLike(arg) ? isObjectTest :
                isUndefined(arg) ? isUndefinedTest :
                    isOtherTest;
}

/**
 * test if this has own properties ie. not empty object, optionally apply exclusion filter to
 * ignore some properties
 * @this {*}            value to test
 * @param exclude {*}   function, array, object or value containing keys to be excluded
 * @return {boolean}
 */
function hasOwnProperties(exclude) {
    const arg = this;
    if (!isObjectLike(arg)) return false;

    if (!isValid(exclude)) {
        const keys = Object.keys(arg);
        return keys.length > 0;
    }
    return !!eachProp.call(arg, resolveTestFunc(exclude, objectHasNotOwnPropertyBreakTrue, arrayContainsNotKeyBreakTrue, testFuncNotBreakTrue, alwaysBreakTrue, keyNotEqualsBreakTrue), exclude);
}

function collectArrayObjectKeys(value, key) {
    if (isArrayIndex(key)) {
        this.arrayValues[key] = value;
    } else {
        this.objectKeys.push(key);
    }
}

function collectObjectKeys(value, key) {
    if (!isArrayIndex(key)) {
        this.objectKeys.push(key);
    }
}

function arrayObjectKeys(arg) {
    const notArrayArg = !isArray(arg);
    const result = {
        arrayValues: notArrayArg ? [] : arg,
        objectKeys: [],
    };

    eachProp.call(arg, notArrayArg ? collectArrayObjectKeys : collectObjectKeys, result);
    return result;
}

function eachDir(reverse, callback, thisArg = undefined) {
    const arg = this;

    const { arrayValues, objectKeys } = arrayObjectKeys(arg);

    let result = UNDEFINED;
    let doMore = true;

    function forwardProc(array, isArrayIndex) {
        const iMax = array.length;
        for (let i = 0; i < iMax; i++) {
            const key = isArrayIndex ? i : array[i];
            const value = isArrayIndex ? array[i] : arg[key];
            if (callback.call(thisArg, value, key, arg) === BREAK) {
                result = BREAK.returned;
                doMore = false;
                break;
            }
        }
    }

    function reverseProc(array, isArrayIndex) {
        let i = array.length;
        while (i--) {
            const key = isArrayIndex ? i : array[i];
            const value = isArrayIndex ? array[i] : arg[key];
            if (callback.call(thisArg, value, key, arg) === BREAK) {
                result = BREAK.returned;
                doMore = false;
                break;
            }
        }
    }

    const savedReturned = BREAK.clearDefault();
    if (reverse) {
        objectKeys.sort();
        reverseProc(objectKeys, false);
        if (doMore) reverseProc(arrayValues, true);
    } else {
        forwardProc(arrayValues, true);
        if (doMore) {
            objectKeys.sort();
            forwardProc(objectKeys, false);
        }
    }
    BREAK.restoreDefault(savedReturned);
    return result;
}

/**
 * invoke callback for each own property of arg (object/array)
 * order of keys used for callback invocation:
 *     - all defined array index values,
 *     - all non-array index values sorted by sort()
 *
 * @this  {*}
 * @param callback {function}  function(value, key, arg), key an arrayIndex then a number, else
 *     is a string callback can return BREAK to break out of loop and have undefined returned,
 *     or return BREAK(arg) to break out of loop and have each() return arg as result
 * @param thisArg  what to use as this for the function call, or undefined
 */
function each(callback, thisArg = undefined) {
    return eachDir.call(this, false, callback, thisArg);
}

/**
 * invoke callback for each own property of arg (object/array)
 * order of keys used for callback invocation:
 *     - all non-array index values sorted by sort() in reverse order
 *     - all defined array index values in reverse order,
 *
 * @this  {*}
 * @param callback {function}  function(value, key, arg), if key is always a string
 *        callback can return BREAK to break out of loop and have
 *        undefined returned, or return BREAK(arg) to break out of loop and have eachRight return
 *        arg as result
 * @param thisArg  what to use as this for the function call, or undefined
 */
function eachRight(callback, thisArg = undefined) {
    return eachDir.call(this, true, callback, thisArg);
}

function cloneArrayObject() {
    const src = this;
    if (isObjectLike(src)) {
        let newValue = Object.assign(src.constructor(), src);
        if (isArray(src)) {
            // need to copy the non numeric fields, object assign does not copy them
            eachProp.call(src, (value, key) => {
                if (!isArrayIndex(key)) {
                    newValue[key] = value;
                }
            });
        }
        return newValue;
    } else {
        throw new TypeError("Invalid this for cloneArrayObject, got " + JSON.stringify(src));
    }
}

/**
 * @this            array
 * @arguments       values to delete, each value can be:
 *                  - array process it as arguments
 *                  - object process its keys as arguments
 *                  - else remove it from the array by splicing
 * @return {*}
 */
function deleteItems() {
    const arr = this;

    if (arguments.length > 0 && isArray(arr)) {
        let i = arguments.length;
        while (i--) {
            const arg = arguments[i];
            if (isArray(arg)) {
                deleteItems.apply(arr, arg);
            } else if (isObjectLike(arg)) {
                deleteItems.apply(arr, Object.keys(arg));
            } else {
                let index = arr.indexOf(arg);
                if (index >= 0) arr.splice(index, 1);
            }
        }
    }

    return arr;
}

/**
 * @this  {*}       anything
 * @return {number} array length equivalent for object, length for array, 0 otherwise
 */
function arrayLength() {
    const arg = this;
    if (isObjectLike(arg)) {
        if (!isArray(arg)) {
            // lets not bicker and look for last integer field in object
            let keys = Object.keys(arg);
            let propKey = 0;
            let i = keys.length;
            while (i--) {
                let key = toArrayIndexOrDefault(keys[i]);
                if (key !== UNDEFINED) {
                    let index = key + 1;
                    if (propKey < index) propKey = index;
                }
            }
            return propKey;
        } else {
            return arg.length;
        }
    } else {
        return 0;
    }
}

function deepClone(src) {
    if (isObjectLike(src)) {
        let result = isArray(src) ? [] : {};

        const keys = Object.keys(src);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            const value = src[key];
            result[key] = isObjectLike(value) ? deepClone(value) : value;
        }
        return result;
    }
    return src;
}

/**
 * defaultMerge properties
 * @this                destination object to merge defaults into
 * @param src           source of defaults
 * @param levels        number of levels deep to merge defaults, all levels if not specified.
 * @param isImmutable   if true then make a copy if changing
 * @param deepCloneSrc  make a deep copy of src values if copying to dst
 * @return {*}          defaults merged (copy if not mutable or original if mutable)
 */
function mergeDefaults(src, levels = undefined, isImmutable = false, deepCloneSrc = false) {
    let dst = this;
    levels = levels || Number.MAX_SAFE_INTEGER;
    let isCopy = !isImmutable;
    let dstValue;
    let newValue;

    if (isObjectLike(dst) && isObjectLike(src)) {
        const keys = Object.keys(src);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            const value = src[key];

            if (value !== UNDEFINED) {
                newValue = dstValue = isObjectLike(dst) && dst.hasOwnProperty(key) ? dst[key] : UNDEFINED;

                if (!isValid(dstValue)) {
                    newValue = value;
                } else if (levels > 1 && isObjectLike(dstValue) && !isArray(dstValue)) {
                    // cannot deep merge arrays, would just mess up the values
                    newValue = mergeDefaults.call(dstValue, value, levels - 1, isImmutable, deepCloneSrc);
                }

                if (newValue !== dstValue) {
                    if (!isCopy) {
                        dst = cloneArrayObject.call(dst);
                        isCopy = true;
                    }

                    if (deepCloneSrc && isObjectLike(newValue)) {
                        newValue = deepClone(newValue);
                    }
                    dst[key] = newValue;
                }
            }
        }
    }
    return dst;
}

/**
 * copy properties from source, optionally filter
 * NOTE: properties whose value is undefined are never copied
 *
 * @this            destination object/array for copied properties, if tests false, then new
 *                  object will be used
 * @param src       source object/array whose properties to filter
 * @param includeFilter {*}
 *                  - function (value, key, src) returning testing true to include, returning
 *     BREAK will exit loop, returned BREAK value ignored
 *                  - object with properties to be copied
 *                  - array containing properties to copy,
 *                  - anything else will copy if value of property compares with == as true
 * @param thisArg   what to use as this for the function call, or undefined, ignored if
 *     includeFilter is not a function
 * @return {*}      null if no properties were copied, otherwise destination object (this or
 *     new if this was undefined)
 */
function copyFiltered(src, includeFilter, thisArg = undefined) {
    let result = null;

    if (includeFilter !== UNDEFINED && (isObjectLike(src) && (src.constructor === Object || src.constructor === Array))) {
        const dst = this;
        const testFunc = resolveTestFunc(includeFilter, objectHasOwnPropertyKey, arrayContainsKey, null, alwaysTrue, isEqualTo);

        if (!isFunction(includeFilter)) thisArg = includeFilter;

        eachProp.call(src, (value, key, arg) => {
            if (value !== UNDEFINED) {
                const testResult = testFunc.call(thisArg, value, key, arg);
                if (testResult === BREAK) return BREAK;
                if (testResult) {
                    if (!result) result = dst || {};
                    result[key] = value;
                }
            }
        }, thisArg);
    }
    return result;
}

/**
 * copy properties from source, optionally filter by inverse condition
 * NOTE: properties whose value is undefined are never copied
 *
 * @this            destination object/array for copied properties, if tests false, then new
 *     object will be used
 * @param src       source object/array whose properties to filter
 * @param excludeFilter {*}
 *                  - function (value, key, src) returning testing true to not copy property,
 *     returning BREAK will exit loop, returned BREAK value ignored
 *                  - object with properties to be not copied
 *                  - array containing properties to not copy,
 *                  - anything else will copy if value of property compares with != as true
 * @param thisArg  what to use as this for the function call, or undefined, ignored if
 *     excludeFilter is not a function
 * @return {*}      null if no properties were copied, otherwise destination object (this or
 *     new if this was undefined)
 */
function copyFilteredNot(src, excludeFilter, thisArg = undefined) {
    let result = null;

    if (isObjectLike(src) && (src.constructor === Object || src.constructor === Array)) {
        const dst = this;
        const testFunc = resolveTestFunc(excludeFilter, objectHasOwnPropertyKey, arrayContainsKey, null, alwaysTrue, isEqualTo);
        if (!isFunction(excludeFilter)) thisArg = excludeFilter;

        eachProp.call(src, (value, key, arg) => {
            if (value !== UNDEFINED) {
                const testResult = testFunc.call(thisArg, value, key, arg);
                if (testResult === BREAK) return BREAK;
                if (!testResult) {
                    if (!result) result = dst || {};
                    result[key] = value;
                }
            }
        }, thisArg);
    }
    return result;
}

/**
 * filter function applied to objects and array's own properties not just indexed contents
 * results in object or array
 *
 * @this        array or object
 * @param filter  see copyFiltered
 * @param thisArg if filter is function then what to use for this
 * @return {object|array} depending on this passed on call
 */
function objFiltered(filter, thisArg) {
    const dst = isArray(this) ? [] : {};
    copyFiltered.call(dst, this, filter, thisArg);
    return dst;
}

/**
 * filter function applied to objects and array's own properties not just indexed contents
 * results in array of property values for which function returned true
 * property order: index properties first, non-indexed properties in ascii sorted order
 *
 * @this        array or object
 * @param callback  function(value,key,collection) returning value testing true to accumulate
 *     value in result if BREAK returned then breaks out of loop, returned BREAK value ignored
 * @param thisArg if filter is function then what to use for this
 * @return {array} of values for which callback returned true
 */
function objFilter(callback, thisArg) {
    const dst = [];
    each.call(this, (value, key, src) => {
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (result) {
            dst.push(value);
        }
    });
    return dst;
}

/**
 * map function applied to objects and array's own properties not just indexed contents
 * results in object or array
 *
 * @this        array or object
 * @param callback  function(value,key,collection)
 *                  if BREAK returned then breaks out of loop, returned BREAK value ignored
 * @param thisArg what to use for this for callback
 * @return {object|array} depending on this passed on call
 */
function objMapped(callback, thisArg = UNDEFINED) {
    const dst = isArray(this) ? [] : {};
    eachProp.call(this, (value, key, src) => {
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (result !== UNDEFINED) {
            dst[key] = result;
        }
    });
    return dst;
}

/**
 * map function applied to objects and array's own properties not just indexed contents
 * results accumulated in an array
 *
 * @this        array or object
 * @param callback function taking (value, key, collection) and returning value to accumulate,
 *     undefined is skipped, BREAK will break out of loop, returned BREAK value ignored
 * @param thisArg what to use for this for callback
 * @return {array} depending on this passed on call
 *
 */
function objMap(callback, thisArg = UNDEFINED) {
    const dst = [];
    each.call(this, (value, key, src) => {
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (result !== UNDEFINED) {
            dst.push(result);
        }
    });
    return dst;
}

/**
 * some function applied to objects and array's own properties not just indexed contents
 * results accumulated in an array
 *
 * @this        array or object
 * @param callback function taking (value, key, collection) and returning value to test for
 *     truth if BREAK returned then result of function will be true, if BREAK(arg) then result
 *     is !!arg
 * @param thisArg what to use for this for callback
 * @return {boolean} whether callback returned true for some values
 *
 */
function objSome(callback, thisArg = UNDEFINED) {
    return !!each.call(this, (value, key, src) => {
        BREAK.setDefault(true);
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (result) return BREAK(true);
    });
}

/**
 * every function applied to object's and array's own properties not just indexed contents
 *
 * @this        array or object
 * @param callback function taking (value, key, collection) and returning value to test for
 *     truth if BREAK returned then result of function will be true, if BREAK(arg) then result
 *     is !arg
 * @param thisArg what to use for this for callback
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objEvery(callback, thisArg = UNDEFINED) {
    return !each.call(this, (value, key, src) => {
        BREAK.setDefault(false);
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (!result) return BREAK(true);
    });
}

/**
 * reduce function applied to object's and array's own properties not just indexed contents
 * where order of reduction is not important
 *
 * @this        array or object
 * @param iterationFunc function to use for iteration, will be called on this arg
 * @param callback function taking (prevValue, value, key, collection) and returning reduced
 *     value if BREAK returned then the result will be the accumulated value up to this point,
 *     or if BREAK(arg) is returned then the result will be arg
 * //@param initialValue what to use for initial reduced value instead of array element
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objReduceIterated(iterationFunc, callback) {
    let reduced = arguments[2];
    let first = arguments.length <= 2;
    iterationFunc.call(this, (value, key, src) => {
        if (first) {
            reduced = value;
            first = false;
        } else {
            BREAK.setDefault(reduced);
            const result = callback.call(UNDEFINED, reduced, value, key, src);
            if (result === BREAK) {
                reduced = BREAK.returned;
                return BREAK;
            }
            reduced = result;
        }
    });

    if (first) {
        throw new TypeError("Reduce of empty array with no initial value");
    }
    return reduced;
}

/**
 * reduce function applied to object's and array's own properties not just indexed contents
 * where order of reduction is not important
 *
 * @this        array or object
 * @param callback function taking (prevValue, value, key, collection) and returning reduced
 *     value if BREAK returned then the result will be the accumulated value up to this point,
 *     or if BREAK(arg) is returned then the result will be arg
 * //@param initialValue what to use for initial reduced value instead of array element
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objReduce(callback/*, initialValue = UNDEFINED*/) {
    const args = Array.prototype.slice.call(arguments, 0);
    args.unshift(eachProp);
    return objReduceIterated.apply(this, args);
}

/**
 * reduce function applied to object's and array's own properties not just indexed contents
 * where order of reduction is left to right, first indexed properties, then ascii sorted
 * non-indexed properties
 *
 * @this        array or object
 * @param callback function taking (prevValue, value, key, collection) and returning reduced
 *     value if BREAK returned then the result will be the accumulated value up to this point,
 *     or if BREAK(arg) is returned then the result will be arg
 * //@param initialValue what to use for initial reduced value instead of array element
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objReduceLeft(callback/*, initialValue = UNDEFINED*/) {
    const args = Array.prototype.slice.call(arguments, 0);
    args.unshift(each);
    return objReduceIterated.apply(this, args);
}

/**
 * reduceRight function applied to object's and array's own properties not just indexed
 * contents
 * where order of reduction is right to left, ascii sorted non-indexed properties in reverse
 * order, then indexed properties in reverse order
 *
 * @this        array or object
 * @param callback function taking (prevValue, value, key, collection) and returning reduced
 *     value if BREAK returned then the result will be the accumulated value up to this point,
 *     or if BREAK(arg) is returned then the result will be arg
 * //@param initialValue what to use for initial reduced value instead of array element
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objReduceRight(callback/*, initialValue = UNDEFINED*/) {
    const args = Array.prototype.slice.call(arguments, 0);
    args.unshift(eachRight);
    return objReduceIterated.apply(this, args);
}

module.exports.eachProp = eachProp;
module.exports.hasOwnProperties = hasOwnProperties;
module.exports.arrayObjectKeys = arrayObjectKeys;
module.exports.eachDir = eachDir;
module.exports.each = each;
module.exports.eachRight = eachRight;
module.exports.cloneArrayObject = cloneArrayObject;
module.exports.deleteItems = deleteItems;
module.exports.arrayLength = arrayLength;
module.exports.deepClone = deepClone;
module.exports.mergeDefaults = mergeDefaults;
module.exports.copyFiltered = copyFiltered;
module.exports.copyFilteredNot = copyFilteredNot;
module.exports.objFiltered = objFiltered;
module.exports.objFilter = objFilter;
module.exports.objMapped = objMapped;
module.exports.objMap = objMap;
module.exports.objSome = objSome;
module.exports.objEvery = objEvery;
module.exports.objReduceIterated = objReduceIterated;
module.exports.objReduce = objReduce;
module.exports.objReduceLeft = objReduceLeft;
module.exports.objReduceRight = objReduceRight;

// re-exported for convenience
module.exports.BREAK = forEachBreak.BREAK;
module.exports.RETURN = forEachBreak.BREAK;
module.exports.forEach = forEachBreak.forEach;
module.exports.map = forEachBreak.map;
module.exports.filter = forEachBreak.filter;
module.exports.forEachRight = forEachBreak.forEachRight;
module.exports.mapRight = forEachBreak.mapRight;
module.exports.filterRight = forEachBreak.filterRight;

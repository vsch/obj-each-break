"use strict";
const jestEach = require('jest-each').default;
const testUtil = require('./testUtil');
const utilTypeFuncs = require('util-type-funcs');
const objEachBreak = require('obj-each-break');

const eachProp = objEachBreak.eachProp;
const hasOwnProperties = objEachBreak.hasOwnProperties;
const arrayObjectKeys = objEachBreak.arrayObjectKeys;
const eachDir = objEachBreak.eachDir;
const each = objEachBreak.each;
const eachRight = objEachBreak.eachRight;
const cloneArrayObject = objEachBreak.cloneArrayObject;
const deleteItems = objEachBreak.deleteItems;
const arrayLength = objEachBreak.arrayLength;
const deepClone = objEachBreak.deepClone;
const mergeDefaults = objEachBreak.mergeDefaults;
const copyFiltered = objEachBreak.copyFiltered;
const copyFilteredNot = objEachBreak.copyFilteredNot;
const objFiltered = objEachBreak.objFiltered;
const objFilter = objEachBreak.objFilter;
const objMapped = objEachBreak.objMapped;
const objMap = objEachBreak.objMap;
const objSome = objEachBreak.objSome;
const objEvery = objEachBreak.objEvery;
const objReduceIterated = objEachBreak.objReduceIterated;
const objReduce = objEachBreak.objReduce;
const objReduceLeft = objEachBreak.objReduceLeft;
const objReduceRight = objEachBreak.objReduceRight;

const toArrayIndex = utilTypeFuncs.toArrayIndex;
const toNumber = utilTypeFuncs.toNumber;
const isArrayIndex = utilTypeFuncs.isArrayIndex;
const isArray = utilTypeFuncs.isArray;

// re-exported for convenience
const BREAK = objEachBreak.BREAK;
const RETURN = objEachBreak.BREAK;
const forEach = objEachBreak.forEach;
const map = objEachBreak.map;
const filter = objEachBreak.filter;
const forEachRight = objEachBreak.forEachRight;
const mapRight = objEachBreak.mapRight;
const filterRight = objEachBreak.filterRight;

const array = testUtil.array;
const object = testUtil.object;

function simulatedReduceLeft(testValue, callback) {
    const initialValue = arguments[2];
    const hadInitialValue = arguments.length > 2;

    const indexKeys = [];
    const objectKeys = [];
    for (let key in testValue) {
        if (testValue.hasOwnProperty(key)) {
            if (isArrayIndex(key)) {
                indexKeys.push(toNumber(key));
            } else {
                objectKeys.push(key);
            }
        }
    }

    indexKeys.sort((a, b) => a - b);
    objectKeys.sort();

    let iMax = indexKeys.length;
    let reduced;
    let first = !hadInitialValue;
    for (let i = 0; i < iMax; i++) {
        const value = testValue[indexKeys[i]];
        if (first) {
            first = false;
            reduced = value;
        } else {
            reduced = callback(reduced, value, indexKeys[i], testValue);
        }
    }

    iMax = objectKeys.length;
    for (let i = 0; i < iMax; i++) {
        const value = testValue[objectKeys[i]];
        if (first) {
            first = false;
            reduced = value;
        } else {
            reduced = callback(reduced, value, indexKeys[i], testValue);
        }
    }
    return reduced;
}

function simulatedReduceRight(testValue, callback) {
    const initialValue = arguments[2];
    const hadInitialValue = arguments.length > 2;

    const indexKeys = [];
    const objectKeys = [];
    for (let key in testValue) {
        if (testValue.hasOwnProperty(key)) {
            if (isArrayIndex(key)) {
                indexKeys.push(toNumber(key));
            } else {
                objectKeys.push(key);
            }
        }
    }

    indexKeys.sort((a, b) => a - b);
    objectKeys.sort();

    let iMax = indexKeys.length;
    let reduced;
    let first = !hadInitialValue;
    for (let i = iMax; i--;) {
        const value = testValue[indexKeys[i]];
        if (first) {
            first = false;
            reduced = value;
        } else {
            reduced = callback(reduced, value, indexKeys[i], testValue);
        }
    }

    iMax = objectKeys.length;
    for (let i = iMax; i--;) {
        const value = testValue[objectKeys[i]];
        if (first) {
            first = false;
            reduced = value;
        } else {
            reduced = callback(reduced, value, indexKeys[i], testValue);
        }
    }
    return reduced;
}

jestEach([
    // array([]),
    array([], { prop: 'field', "-1": -1 }),
    // array([undefined]),
    // array([undefined], { prop: 'field', "-1": -1 }),
    // array([1]),
    // array([1], { prop: 'field', "-1": -1 }),
    // array([1, 2]),
    // array([1, 2], { prop: 'field', "-1": -1 }),
    // array([1, 2, undefined]),
    // array([1, 2, undefined], { prop: 'field', "-1": -1 }),
    // array([1, 2, undefined, 4]),
    // array([1, 2, undefined, 4], { prop: 'field', "-1": -1 }),
])
    .describe('boxedOut(%s)', (valueText, testValue) => {
        test(`.eachProp(${valueText}) all key values called`, () => {
            const expected = {};

            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    expected[key] = {
                        value: testValue[key],
                        key: toArrayIndex(key),
                        collection: testValue,
                    };
                }
            }

            const accum = {};

            eachProp.call(testValue, (value, key, collection) => {
                accum[key] = { value: value, key: key, collection: collection };
            });

            expect(accum).toEqual(expected);
        });

        test(`.eachProp(${valueText}) break`, () => {
            const expected = [];

            const accum = [];

            const result = eachProp.call(testValue, (value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
                return BREAK(key);
            });
            accum.push(result);

            expected.push(accum[0]);
            if (accum[0]) expected.push(accum[0].key);

            expect(accum).toEqual(expected);
        });

        test(`.each(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    if (isArrayIndex(key)) {
                        indexKeys.push(toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => a - b);
            objectKeys.sort();

            let iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: testValue[indexKeys[i]],
                    key: toArrayIndex(indexKeys[i]),
                    collection: testValue,
                });
            }

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: testValue[objectKeys[i]],
                    key: toArrayIndex(objectKeys[i]),
                    collection: testValue,
                });
            }

            const accum = [];

            each.call(testValue, (value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
            });

            expect(accum).toEqual(expected);
        });

        test(`.objReduceLeft(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    if (isArrayIndex(key)) {
                        indexKeys.push(toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => a - b);
            objectKeys.sort();

            let iMax = indexKeys.length;
            let reduced;
            let first = true;
            for (let i = 0; i < iMax; i++) {
                const value = testValue[indexKeys[i]];
                if (first) {
                    first = false;
                    reduced = value;
                } else {
                    expected.push({
                        value: value,
                        key: toArrayIndex(indexKeys[i]),
                        collection: testValue,
                        reduced: reduced,
                    });
                    reduced = reduced !== undefined ? reduced + "," + value : value;
                }
            }

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                const value = testValue[objectKeys[i]];
                if (first) {
                    first = false;
                    reduced = value;
                } else {
                    expected.push({
                        value: value,
                        key: toArrayIndex(objectKeys[i]),
                        collection: testValue,
                        reduced: reduced,
                    });
                    reduced = reduced !== undefined ? reduced + "," + value : value;
                }
            }

            const accum = [];

            if (!hasOwnProperties.call(testValue)) {
                expect(() => {
                    objReduceLeft.call(testValue, (reduced, value, key, collection) => {
                        accum.push({
                            value: value,
                            key: key,
                            collection: collection,
                            reduced: reduced,
                        });
                        return reduced !== undefined ? reduced + "," + value : value;
                    });
                }).toThrowError(TypeError);
            } else {
                objReduceLeft.call(testValue, (reduced, value, key, collection) => {
                    accum.push({
                        value: value,
                        key: key,
                        collection: collection,
                        reduced: reduced,
                    });
                    return reduced !== undefined ? reduced + "," + value : value;
                });

                expect(accum).toEqual(expected);
            }

        });

        test(`.eachRight(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    if (isArrayIndex(key)) {
                        indexKeys.push(toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => b - a);
            objectKeys.sort().reverse();
            let iMax;

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: testValue[objectKeys[i]],
                    key: toArrayIndex(objectKeys[i]),
                    collection: testValue,
                });
            }

            iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: testValue[indexKeys[i]],
                    key: toArrayIndex(indexKeys[i]),
                    collection: testValue,
                });
            }

            const accum = [];

            eachRight.call(testValue, (value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
            });

            expect(accum).toEqual(expected);
        });

        test(`.objReduceRight(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    if (isArrayIndex(key)) {
                        indexKeys.push(toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => b - a);
            objectKeys.sort().reverse();
            let iMax;

            iMax = objectKeys.length;
            let reduced;
            let first = true;
            for (let i = 0; i < iMax; i++) {
                const value = testValue[objectKeys[i]];
                if (first) {
                    first = false;
                    reduced = value;
                } else {
                    expected.push({
                        value: value,
                        key: toArrayIndex(objectKeys[i]),
                        collection: testValue,
                        reduced: reduced,
                    });

                    reduced = reduced !== undefined ? reduced + "," + value : value;
                }
            }

            iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                const value = testValue[indexKeys[i]];
                if (first) {
                    first = false;
                    reduced = value;
                } else {
                    expected.push({
                        value: value,
                        key: toArrayIndex(indexKeys[i]),
                        collection: testValue,
                        reduced: reduced,
                    });

                    reduced = reduced !== undefined ? reduced + "," + value : value;
                }
            }

            const accum = [];

            if (!hasOwnProperties.call(testValue)) {
                expect(() => {
                    objReduceRight.call(testValue, (reduced, value, key, collection) => {
                        accum.push({
                            value: value,
                            key: key,
                            collection: collection,
                            reduced: reduced,
                        });
                        return reduced !== undefined ? reduced + "," + value : value;
                    });
                }).toThrowError(TypeError);
            } else {
                objReduceRight.call(testValue, (reduced, value, key, collection) => {
                    accum.push({
                        value: value,
                        key: key,
                        collection: collection,
                        reduced: reduced,
                    });
                    return reduced !== undefined ? reduced + "," + value : value;
                });

                expect(accum).toEqual(expected);
            }
        });
    });

jestEach([
    object([]),
    object([], { prop: 'field', "-1": -1 }),
    object([undefined]),
    object([undefined], { prop: 'field', "-1": -1 }),
    object([1]),
    object([1], { prop: 'field', "-1": -1 }),
    object([1, 2]),
    object([1, 2], { prop: 'field', "-1": -1 }),
    object([1, 2, undefined]),
    object([1, 2, undefined], { prop: 'field', "-1": -1 }),
    object([1, 2, undefined, 4]),
    object([1, 2, undefined, 4], { prop: 'field', "-1": -1 }),
])
    .describe('boxedOut(%s)', (valueText, testValue) => {
        test(`.eachProp(${valueText}) all key values called`, () => {
            const expected = {};

            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    expected[key] = {
                        value: testValue[key],
                        key: toArrayIndex(key),
                        collection: testValue,
                    };
                }
            }

            const accum = {};

            eachProp.call(testValue, (value, key, collection) => {
                accum[key] = { value: value, key: key, collection: collection };
            });

            expect(accum).toEqual(expected);
        });

        test(`.eachProp(${valueText}) break`, () => {
            const expected = [];

            const accum = [];

            const result = eachProp.call(testValue, (value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
                return BREAK(key);
            });
            accum.push(result);

            expected.push(accum[0]);
            if (accum[0]) expected.push(accum[0].key);

            expect(accum).toEqual(expected);
        });

        test(`.each(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    if (isArrayIndex(key)) {
                        indexKeys.push(toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => a - b);
            objectKeys.sort();

            let iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: testValue[indexKeys[i]],
                    key: toArrayIndex(indexKeys[i]),
                    collection: testValue,
                });
            }

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: testValue[objectKeys[i]],
                    key: toArrayIndex(objectKeys[i]),
                    collection: testValue,
                });
            }

            const accum = [];

            each.call(testValue, (value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
            });

            expect(accum).toEqual(expected);
        });

        test(`.objReduceLeft(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    if (isArrayIndex(key)) {
                        indexKeys.push(toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => a - b);
            objectKeys.sort();

            let iMax = indexKeys.length;
            let reduced;
            let first = true;
            for (let i = 0; i < iMax; i++) {
                const value = testValue[indexKeys[i]];
                if (first) {
                    first = false;
                    reduced = value;
                } else {
                    expected.push({
                        value: value,
                        key: toArrayIndex(indexKeys[i]),
                        collection: testValue,
                        reduced: reduced,
                    });

                    reduced = reduced !== undefined ? reduced + "," + value : value;
                }
            }

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                const value = testValue[objectKeys[i]];
                if (first) {
                    first = false;
                    reduced = value;
                } else {
                    expected.push({
                        value: value,
                        key: toArrayIndex(objectKeys[i]),
                        collection: testValue,
                        reduced: reduced,
                    });

                    reduced = reduced !== undefined ? reduced + "," + value : value;
                }
            }

            const accum = [];

            if (!hasOwnProperties.call(testValue)) {
                expect(() => {
                    objReduceLeft.call(testValue, (reduced, value, key, collection) => {
                        accum.push({
                            value: value,
                            key: key,
                            collection: collection,
                            reduced: reduced,
                        });
                        return reduced !== undefined ? reduced + "," + value : value;
                    });
                }).toThrowError(TypeError);
            } else {
                objReduceLeft.call(testValue, (reduced, value, key, collection) => {
                    accum.push({
                        value: value,
                        key: key,
                        collection: collection,
                        reduced: reduced,
                    });
                    return reduced !== undefined ? reduced + "," + value : value;
                });

                expect(accum).toEqual(expected);
            }
        });

        test(`.eachRight(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    if (isArrayIndex(key)) {
                        indexKeys.push(toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => b - a);
            objectKeys.sort().reverse();
            let iMax;

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: testValue[objectKeys[i]],
                    key: toArrayIndex(objectKeys[i]),
                    collection: testValue,
                });
            }

            iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: testValue[indexKeys[i]],
                    key: toArrayIndex(indexKeys[i]),
                    collection: testValue,
                });
            }

            const accum = [];

            eachRight.call(testValue, (value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
            });

            expect(accum).toEqual(expected);
        });

        test(`.objReduceRight(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in testValue) {
                if (testValue.hasOwnProperty(key)) {
                    if (isArrayIndex(key)) {
                        indexKeys.push(toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => b - a);
            objectKeys.sort().reverse();
            let iMax;

            iMax = objectKeys.length;
            let reduced;
            let first = true;
            for (let i = 0; i < iMax; i++) {
                const value = testValue[objectKeys[i]];
                if (first) {
                    first = false;
                    reduced = value;
                } else {
                    expected.push({
                        value: value,
                        key: toArrayIndex(objectKeys[i]),
                        collection: testValue,
                        reduced: reduced,
                    });

                    reduced = reduced !== undefined ? reduced + "," + value : value;
                }
            }

            iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                const value = testValue[indexKeys[i]];
                if (first) {
                    first = false;
                    reduced = value;
                } else {
                    expected.push({
                        value: value,
                        key: toArrayIndex(indexKeys[i]),
                        collection: testValue,
                        reduced: reduced,
                    });

                    reduced = reduced !== undefined ? reduced + "," + value : value;
                }
            }

            const accum = [];

            if (!hasOwnProperties.call(testValue)) {
                expect(() => {
                    objReduceRight.call(testValue, (reduced, value, key, collection) => {
                        accum.push({
                            value: value,
                            key: key,
                            collection: collection,
                            reduced: reduced,
                        });
                        return reduced !== undefined ? reduced + "," + value : value;
                    });
                }).toThrowError(TypeError);
            } else {
                objReduceRight.call(testValue, (reduced, value, key, collection) => {
                    accum.push({
                        value: value,
                        key: key,
                        collection: collection,
                        reduced: reduced,
                    });
                    return reduced !== undefined ? reduced + "," + value : value;
                });

                expect(accum).toEqual(expected);
            }
        });
    });

const sum = (reduced, value, key, collection) => {
    if (isArray(reduced)) {
        // first element
        reduced = objReduce.call(reduced, sum);
    }

    if (isArray(value)) {
        const summed = objReduce.call(value, sum);
        return (reduced || 0) + summed;
    } else {
        return (reduced || 0) + value;
    }
};

const sumKeys = (reduced, value, key, collection) => {
    if (isArray(reduced)) {
        // first element
        reduced = objReduce.call(reduced, sumKeys);
    }

    if (isArray(value)) {
        const summed = objReduce.call(value, sumKeys);
        return (reduced || 0) + summed;
    } else {
        return (reduced || 0) + value;
    }
};

const sumLeft = (reduced, value, key, collection) => {
    if (isArray(reduced)) {
        // first element
        reduced = objReduce.call(reduced, sumLeft);
    }

    if (isArray(value)) {
        const summed = objReduce.call(value, sumLeft);
        return (reduced || 0) + summed;
    } else {
        return (reduced || 0) + value;
    }
};

const sumRight = (reduced, value, key, collection) => {
    if (isArray(reduced)) {
        // first element
        reduced = objReduce.call(reduced, sumRight);
    }

    if (isArray(value)) {
        const summed = objReduce.call(value, sumRight);
        return (reduced || 0) + summed;
    } else {
        return (reduced || 0) + value;
    }
};

test(`objReduceLeft first reduced is first element, value second`, () => {
    let first = true;
    const accum = objReduceLeft.call([[1, 2, 3], [10, 20, 30], [100, 200, 300]], (reduced, value, key, collection) => {
        if (first) {
            expect(reduced).toEqual([1, 2, 3]);
            expect(value).toEqual([10, 20, 30]);
            first = false;
            // return BREAK;
        } else {
            // expect('').toBe('should not be here');
        }
    });
});

/*
 // order not guaranteed
 test(`reduceProps first reduced is first element, value second`, () => {
 let first = true;
 const accum = reduceProps.call([[1, 2, 3], [10, 20, 30], [100, 200, 300]], (reduced, value, key, collection) => {
 if (first) {
 expect(reduced).toEqual([1, 2, 3]);
 expect(value).toEqual([10, 20, 30]);
 first = false;
 return BREAK;
 } else {
 expect('').toBe('should not be here');
 }
 });
 });
 */

test(`objReduceLeft first reduced is first element, value second`, () => {
    let first = true;
    const accum = objReduceLeft.call([[1, 2, 3], [10, 20, 30], [100, 200, 300]], (reduced, value, key, collection) => {
        if (first) {
            expect(reduced).toEqual([1, 2, 3]);
            expect(value).toEqual([10, 20, 30]);
            first = false;
            return BREAK;
        } else {
            expect('').toBe('should not be here');
        }
    });
});

test(`objReduceRight first reduced is last element, value second to last`, () => {
    let first = true;
    const accum = objReduceRight.call([[1, 2, 3], [10, 20, 30], [100, 200, 300], [1000, 2000, 3000]], (reduced, value, key, collection) => {
        if (first) {
            expect(reduced).toEqual([1000, 2000, 3000]);
            expect(value).toEqual([100, 200, 300]);
            first = false;
            return BREAK;
        } else {
            expect('').toBe('should not be here');
        }
    });
});

describe('Nested loops', () => {
    test(`Nested objReduceLeft returns value`, () => {
        const accum = objReduceLeft.call([undefined, undefined, [1, 2, 3], [10, 20, 30], [100, 200, 300]], sum);
        const expected = 666;

        expect(accum).toEqual(expected);
    });

    test(`Nested objReduce returns value`, () => {
        const accum = objReduce.call([[1, 2, 3], [10, 20, 30], [100, 200, 300]], sum);
        const expected = 666;

        expect(accum).toEqual(expected);
    });

    test(`Nested objReduce returns value`, () => {
        const accum = objReduce.call([[1, 2, 3], [10, 20, 30], [100, 200, 300]], sumKeys);
        const expected = 666;

        expect(accum).toEqual(expected);
    });

    test(`Nested objReduceLeft returns value`, () => {
        const accum = objReduceLeft.call([[1, 2, 3], [10, 20, 30], [100, 200, 300]], sumLeft);
        const expected = 666;

        expect(accum).toEqual(expected);
    });

    test(`Nested objReduceRight returns value`, () => {
        const accum = objReduceRight.call([[1, 2, 3], [10, 20, 30], [100, 200, 300]], sumRight);
        const expected = 666;

        expect(accum).toEqual(expected);
    });

});
describe('Nested loop break returns default', () => {
    test(`Nested objReduceLeft returns value`, () => {
        const accum = objReduceLeft.call([undefined, undefined, [1, 2, 3], [10, 20, 30], [100, 200, 300]], (reduced, value, key, collection) => {
            if (value !== undefined) {
                BREAK.setDefault(0);
                if (isArray(value)) {
                    let inner = objReduceLeft.call(value, (reduced, value, key, collection) => {
                        BREAK.setDefault(100);
                        return BREAK;
                    });

                    expect(inner).toBe(100);
                }
                return BREAK;
            }
        });
        const expected = 666;

        expect(accum).toEqual(0);
    });
});

jestEach([
    array([]),
    array([1]),
    array([1, 2, 3]),
    array([1, 2, 3]),
    array([0]),
    array([0, 1]),
    array([0, 1, 2, 3]),
    array([0, 1, 2, 3]),
])
    .describe('some/every', (valueText, testValue) => {
        let testObject;
        let objectText;

        beforeEach(()=>{
            const t = object(testValue);
            testObject = t[1];
            objectText = t[0];
        });

        test(`$_(${valueText}).some((value,key)=>value > 0) === ${testValue.some((value, key) => value > 0)}`, () => {
            expect(objSome.call(testValue, (value, key) => value > 0)).toBe(testValue.some((value, key) => value > 0));
        });
        test(`$_(${valueText}).every((value,key)=>value > 0) === ${testValue.every((value, key) => value > 0)}`, () => {
            expect(objEvery.call(testValue, (value, key) => value > 0)).toBe(testValue.every((value, key) => value > 0));
        });
        test(`$_(${valueText}).some((value,key) => !(value > 0)) === ${testValue.some((value, key) => !(value > 0))}`, () => {
            expect(objSome.call(testValue, (value, key) => !(value > 0))).toBe(testValue.some((value, key) => !(value > 0)));
        });
        test(`$_(${valueText}).every((value,key) => !(value > 0)) === ${testValue.every((value, key) => value > 0)}`, () => {
            expect(objEvery.call(testValue, (value, key) => !(value > 0))).toBe(testValue.every((value, key) => !(value > 0)));
        });

        // same for object
        test(`$_(${objectText}).some((value,key)=>value > 0) === ${testValue.some((value, key) => value > 0)}`, () => {
            expect(objSome.call(testObject, (value, key) => value > 0)).toBe(testValue.some((value, key) => value > 0));
        });
        test(`$_(${objectText}).every((value,key)=>value > 0) === ${testValue.every((value, key) => value > 0)}`, () => {
            expect(objEvery.call(testObject, (value, key) => value > 0)).toBe(testValue.every((value, key) => value > 0));
        });
        test(`$_(${objectText}).some((value,key) => !(value > 0)) === ${testValue.some((value, key) => !(value > 0))}`, () => {
            expect(objSome.call(testObject, (value, key) => !(value > 0))).toBe(testValue.some((value, key) => !(value > 0)));
        });
        test(`$_(${objectText}).every((value,key) => !(value > 0)) === ${testValue.every((value, key) => value > 0)}`, () => {
            expect(objEvery.call(testObject, (value, key) => !(value > 0))).toBe(testValue.every((value, key) => !(value > 0)));
        });
    });

test(`mergeDefaults({ obj:{ a: 'a', } }, { obj:{a:'a', b:{}}});`, () => {
    const result = mergeDefaults.call({ obj: { a: 'a' } }, { obj: { a: 'a', b: {} } });
    expect(result).toEqual({ "obj": { "a": "a", "b": {} } });
});


jestEach([
    [undefined, 'undefined', undefined],
    [null, 'null', null],
    [NaN, 'NaN', NaN],
    ["test", '"test"', "test"],
    [true, 'true', true],
    [false, 'false', false],
    [0, '0', 0],
    [5, '5', 5],
    [-5, '-5', -5],
    [-5.3, '-5', -5.3],
    ['0', '"0"', 0],
    ['5', '"5"', 5],
    ['5.3', '"5"', 5.3],
    ['-1', '"-1"', -1],
    ['-5', '"-5"', -5],
    ['-5.3', '"-5.3"', -5.3],
])
    .describe('hasOwnProperties', (value, valueText, expectedVal) => {
        test(`hasOwnProperties.call(${valueText}) === false`, () => {
            expect(hasOwnProperties.call(value)).toBe(false);
        });
    });

jestEach([
    array([]),
    object({}),
])
    .describe('hasOwnProperties', (valueText, testValue) => {
        test(`hasOwnProperties.call(${valueText}) === false`, () => {
            expect(hasOwnProperties.call(testValue)).toBe(false);
        });
    });

jestEach([
    array([1]),
    object([1]),
])
    .describe('hasOwnProperties', (valueText, testValue) => {
        test(`hasOwnProperties.call(${valueText}) === true`, () => {
            expect(hasOwnProperties.call(testValue)).toBe(true);
        });
        test(`hasOwnProperties.call(${valueText}, '0') === false`, () => {
            expect(hasOwnProperties.call(testValue, '0')).toBe(false);
        });
        test(`hasOwnProperties.call(${valueText}, ['0']) === false`, () => {
            expect(hasOwnProperties.call(testValue, ['0'])).toBe(false);
        });
        test(`hasOwnProperties.call(${valueText}, {'0': ''}) === false`, () => {
            expect(hasOwnProperties.call(testValue, { '0': '' })).toBe(false);
        });
        test(`hasOwnProperties.call(${valueText}, (value,key)=>key === 0) === false`, () => {
            expect(hasOwnProperties.call(testValue, (value, key) => key === 0)).toBe(false);
        });

        // wrong prop not excluded
        test(`hasOwnProperties.call(${valueText}, '1') === true`, () => {
            expect(hasOwnProperties.call(testValue, '1')).toBe(true);
        });
        test(`hasOwnProperties.call(${valueText}, ['1']) === true`, () => {
            expect(hasOwnProperties.call(testValue, ['1'])).toBe(true);
        });
        test(`hasOwnProperties.call(${valueText}, {'1': ''}) === true`, () => {
            expect(hasOwnProperties.call(testValue, { '1': '' })).toBe(true);
        });
        test(`hasOwnProperties.call(${valueText}, (value,key)=>key === 1) === true`, () => {
            expect(hasOwnProperties.call(testValue, (value, key) => key === 1)).toBe(true);
        });
    });



const util = require('util-type-funcs');

function generateTestParams(template, customize) {
    const innerParams = [];
    for (let type in template) {
        if (template.hasOwnProperty(type)) {
            const values = template[type];
            let iMax = values.length;
            for (let i = 0; i < iMax; i++) {
                let value = values[i];
                let ofTotal = values.length;
                const valueText = toTypeString(value);
                const testThis = {
                    type: type,
                    value: value,
                    valueText: valueText,
                    valueIndex: i,
                    ofTotal: ofTotal,
                };

                let testDescription;
                if (customize) testDescription = customize(testThis);

                if (!(testThis.hasOwnProperty('testDescription') && testThis.testDescription)) {
                    // returned description
                    testThis.testDescription = testDescription ? testDescription : type + ': [' + valueText + ']';
                }
                innerParams.push([testDescription, testThis]);
            }
        }
    }
    return innerParams;
}

function paramStringException(arg, param) {
    // const valueIsString = util.isString(arg);
    // const paramIsNumeric = util.isNumericInteger(param);
    // return valueIsString && paramIsNumeric ? arg[param] : undefined;
    // if (valueIsString) undefined;
    return util.isObjectLike(arg) ? arg[param] : undefined;
}

function toTypeString(value) {
    return value === undefined ? 'undefined' : Number.isNaN(value) ? 'NaN' : stringify(value);
}

function arrayToObject(arr, except) {
    let dst = {};
    let keys = Object.keys(arr);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        if (!except || except.indexOf(key) === -1) {
            dst[key] = arr[key];
        }
    }
    return dst;
}

function stringify(arg) {
    if (util.isArray(arg)) {
        // if it has own props other than indices then we need to stringify them separately
        const keys = Object.keys(arg);
        const iMax = keys.length;
        let text = "[";
        let sep = "";
        for (let i = 0; i < iMax; i++) {
            text += sep;
            sep = ", ";
            if (util.isArrayIndex(keys[i])) {
                text += stringify(arg[keys[i]]);
            } else {
                text += stringify(keys[i]);
                text += ": ";
                text += stringify(arg[keys[i]]);
            }
        }
        text += "]";
        return text;
    } else if (util.isObjectLike(arg)) {
        // if it has own props other than indices then we need to stringify them separately
        const keys = Object.keys(arg);
        const iMax = keys.length;
        let text = "{";
        let sep = "";
        for (let i = 0; i < iMax; i++) {
            text += sep;
            sep = ", ";
            text += stringify(keys[i]);
            text += ": ";
            text += stringify(arg[keys[i]]);
        }
        text += "}";
        return text;
    } else {
        return arg === undefined ? 'undefined' : Number.isNaN(arg) ? 'NaN' : JSON.stringify(arg);
    }
}

function array(arr, props) {
    const obj = Object.assign([], arr);
    if (props) {
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                obj[key] = props[key];
            }
        }
    }

    return [stringify(obj), obj];
}

function object(arr, props) {
    const obj = !util.isArray(arr) ? Object.assign({}, arr) : {};

    if (util.isArray(arr)) {
        let iMax = arr.length;
        for (let i = 0; i < iMax; i++) {
            obj[i] = arr[i];
        }
    }

    if (props) {
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                obj[key] = props[key];
            }
        }
    }

    return [stringify(obj), obj];
}

module.exports.toTypeString = toTypeString;
module.exports.stringify = stringify;
module.exports.generateTestParams = generateTestParams;
module.exports.paramStringException = paramStringException;
module.exports.array = array;
module.exports.object = object;
module.exports.arrayToObject = arrayToObject;

var readline = require('readline');
var parser = require('./parser');

// for testing
var data = require('./data.json');

// var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

function getCounts(object) {
    var types = [
        {
            name: '문자열',
            type: 'string',
            count: 0
        },
        {
            name: '숫자',
            type: 'number',
            count: 0
        },
        {
            name: '부울',
            type: 'boolean',
            count: 0
        },
        {
            name: '널',
            type: 'null',
            count: 0
        },
        {
            name: '객체',
            type: 'object',
            count: 0
        },
        {
            name: '배열',
            type: 'array',
            count: 0
        }
    ];

    types.getType = function (type) {
        var index = this.findIndex(function (item) {
            return item.type === type;
        });

        return this[index];
    };

    var keys = null;
    var values = null;
    var objectName = null;

    if (object instanceof Array) {
        values = object;
        objectName = '배열';
    } else {
        keys = Object.keys(object);
        values = keys.map(function(key) {
            return object[key];
        });
        objectName = '객체';
    }

    values.forEach(function(item) {
        var type = typeof item;

        switch (type) {
            case 'number':
            case 'string':
            case 'boolean':
                types.getType(type).count++;
            break;

            case 'object':
                if (item === null) {
                    types.getType('null').count++;
                } else if (item instanceof Array) {
                    types.getType('array').count++;
                } else {
                    types.getType('object').count++;
                }
            break;
        }
    });

    if (values.length === 0) {
        return '빈 ' + objectName + '입니다.';
    }

    var message = '총 ' + values.length + '개의 ' + objectName + ' 데이터 중에 ';

    types.forEach(function(item, index) {
        if (item.count > 0) {
            message += item.name + ' ' + item.count + '개, ';
        }
    });

    message = message.substr(0, message.length - 2);
    message += '가 포함되어 있습니다.';

    return message;
}

function toJsonString(options) {
    var object = options.object;
    var tabSize = options.tabSize || 4;
    var limitPerLine = options.limitPerLine || 4;
    var depth = options.depth || 1;

    var jsonStr = '';
    var keys = null;
    var values = null;
    var hasObject = false;

    var startChar;
    var endChar;

    if (object instanceof Array) {
        startChar = '[';
        endChar = ']';
        values = object;
    } else {
        startChar = '{';
        endChar = '}';
        keys = Object.keys(object);
        values = keys.map(function(key) {
            return object[key];
        });
    }

    jsonStr += startChar;

    hasObject = values.some(function (item) {
        return typeof item === 'object';
    });

    if (hasObject || values.length > limitPerLine) {
        jsonStr += '\n';
    }

    values.forEach(function(item, index) {
        if (hasObject || values.length > limitPerLine) {
            for (var i = 0; i < depth * tabSize; i++) {
                jsonStr += ' ';
            }
        }

        if (object instanceof Array === false) {
            jsonStr += '\"' + keys[index] + '\" : ';
        }

        switch (typeof item) {
            case 'string':
                jsonStr += '\"' + item + '\"';
            break;

            case 'number':
            case 'boolean':
                jsonStr += item;
            break;

            case 'object':
                if (item === null) {
                    jsonStr += 'null';
                } else {
                    jsonStr += toJsonString({
                        object: item,
                        tabSize: tabSize,
                        limitPerLine: limitPerLine,
                        depth: depth + 1
                    });
                }
            break;
        }

        if (index !== values.length - 1) {
            jsonStr += ', ';
        }

        if (hasObject || values.length > limitPerLine) {
            jsonStr += '\n';
        }
    });

    if (hasObject || values.length > limitPerLine) {
        for (var i = 0; i < (depth - 1) * tabSize; i++) {
            jsonStr += ' ';
        }
    }

    jsonStr += endChar;

    return jsonStr;
}

// for testing
(function() {
    // make input data
    var inputCount = 1000;
    var testCount = 100;
    var inputArray = [];
    var inputString = '';

    for (var i = 0; i < inputCount; i++) {
        inputArray.push(data);
    }

    inputString = JSON.stringify(inputArray);

    try {
        for (var i = 0; i < testCount; i++) {
            console.log('*test' + (i + 1) + '*');

            console.time('thisParser');
            var parsedObject = parser.parse(inputString);
            console.timeEnd('thisParser');

            console.time('builtInParser');
            var parsedObject = JSON.parse(inputString);
            console.timeEnd('builtInParser');
        }

     } catch(exception) {
         console.log(exception.message);
     }
})();

// rl.on('line', function(input) {
//     try {
//         var parsedObject = parser.parse(input);
//         var countMessage = getCounts(parsedObject);

//         var jsonStr = toJsonString({
//             object: parsedObject,
//             tabSize: 4
//         });

//         console.log(countMessage);
//         console.log(jsonStr);
//     } catch(exception) {
//         console.log(exception);
//         console.log(exception.message);
//     }

//     rl.close();
// });

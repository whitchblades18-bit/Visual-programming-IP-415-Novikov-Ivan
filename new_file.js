"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimAndFormat = exports.capitalize = void 0;
exports.createUser = createUser;
exports.createBook = createBook;
exports.calculateArea = calculateArea;
exports.getStatusColor = getStatusColor;
exports.getFirstElement = getFirstElement;
exports.findById = findById;
function createUser(id, name, email, isActive) {
    return {
        id: id,
        name: name,
        email: email,
        isActive: isActive
    };
}
function createBook(title, author, genre, year) {
    return __assign({ title: title, author: author, genre: genre }, (year && { year: year }));
}
var myBook = createBook("Blood Meridian", "Cormac McCarthy", "Western");
console.log(myBook);
function calculateArea(shape, param) {
    if (shape === 'circle') {
        return Math.PI * param * param;
    }
    else {
        return param * param;
    }
}
console.log(calculateArea('circle', 5));
console.log(calculateArea('square', 5));
function getStatusColor(status) {
    switch (status) {
        case 'active':
            return 'green';
        case 'inactive':
            return 'red';
        case 'new':
            return 'blue';
        default:
            return '';
    }
}
var capitalize = function (str, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    if (str.length === 0)
        return str;
    var result = str.charAt(0).toUpperCase() + str.slice(1);
    return uppercase ? result.toUpperCase() : result;
};
exports.capitalize = capitalize;
var trimAndFormat = function (str, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    var trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};
exports.trimAndFormat = trimAndFormat;
console.log((0, exports.capitalize)("hello world"));
console.log((0, exports.capitalize)("hello world", true));
console.log((0, exports.trimAndFormat)("   text   "));
console.log((0, exports.trimAndFormat)("   text   ", true));
function getFirstElement(arr) {
    return arr[0];
}
var numbers = [10, 20, 30];
var firstNum = getFirstElement(numbers);
console.log("\u041F\u0435\u0440\u0432\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: ".concat(firstNum));
var strings = ["TypeScript", "JavaScript", "Python"];
var firstStr = getFirstElement(strings);
console.log("\u041F\u0435\u0440\u0432\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: ".concat(firstStr));
console.log("\u041F\u0443\u0441\u0442\u043E\u0439 \u043C\u0430\u0441\u0441\u0438\u0432: ".concat(getFirstElement([])));
function findById(items, id) {
    return items.find(function (item) { return item.id === id; });
}
var users = [
    { id: 1, name: "A", isActive: true },
    { id: 2, name: "B", isActive: false }
];
var user = findById(users, 2);
console.log(user === null || user === void 0 ? void 0 : user.name);

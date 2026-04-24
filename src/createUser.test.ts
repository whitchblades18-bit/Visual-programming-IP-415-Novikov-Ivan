import { describe, it, expect } from 'vitest';
import { 
    createUser, 
    createBook, 
    calculateArea,
    getStatusColor,
    capitalize,
    trimAndFormat,
    getFirstElement,
    findById 
} from '../new_file';

describe('createUser', () => {
    it('Нормальное создание пользователя', () => {
        const user = createUser(0, 'Warg V', "bzumfan@rambler.ru", true);
        expect(user).toEqual({
            id: 0,
            name: 'Warg V',
            email: 'bzumfan@rambler.ru',
            isActive: true
        });
    });
});

describe('createBook', () => {
    it('Нормальное создание книги', () => {
        const myBook = createBook(
            "Blood Meridian",
            "Cormac McCarthy",
            "Western"
        );
        expect(myBook).toEqual({
            title:"Blood Meridian",
            author:"Cormac McCarthy",
            genre:"Western"
        });
    });
});

describe('calculateArea', () => {
    it('Подсчёт площади фигур', () => {
        const circleArea = calculateArea('circle', 5);
        const squareArea = calculateArea('square', 5);
        
        expect(circleArea).toBeCloseTo(Math.PI * 25, 5);
        expect(squareArea).toBe(25);
    });
});

describe('getStatusColor', () => {
    it('Возвращает цвет для статуса', () => {
        expect(getStatusColor('active')).toBe('green');
        expect(getStatusColor('inactive')).toBe('red');
        expect(getStatusColor('new')).toBe('blue');
    });
});

describe('capitalize', () => {
    it('Форматирование строки с заглавной буквы', () => {
        expect(capitalize("hello world")).toBe("Hello world");
        expect(capitalize("hello world", true)).toBe("HELLO WORLD");
    });
});

describe('trimAndFormat', () => {
    it('Удаление пробелов и форматирование', () => {
        expect(trimAndFormat("   text   ")).toBe("text");
        expect(trimAndFormat("   text   ", true)).toBe("TEXT");
    });
});

describe('getFirstElement', () => {
    it('Получение первого элемента массива', () => {
        const numbers = [10, 20, 30];
        const strings = ["TypeScript", "JavaScript", "Python"];
        
        expect(getFirstElement(numbers)).toBe(10);
        expect(getFirstElement(strings)).toBe("TypeScript");
        expect(getFirstElement([])).toBeUndefined();
    });
});

describe('findById', () => {
    it('Поиск элемента по id', () => {
        const users = [
            { id: 1, name: "A", isActive: true },
            { id: 2, name: "B", isActive: false }
        ];
        
        const user = findById(users, 2);
        expect(user?.name).toBe("B");
    });
});
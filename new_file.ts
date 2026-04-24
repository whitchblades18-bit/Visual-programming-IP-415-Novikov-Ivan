interface User {
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

export function createUser (id:number, name:string, email:string, isActive:boolean): User {
    return {
        id: id,
        name: name,
        email: email,
        isActive: isActive
    };
}

interface Book {
    title: string;
    author: string;
    genre: string | number;
    year?: number;
}

export function createBook (title: string, author: string, genre: string | number, year?: number): Book {
    return {
        title,
        author,        
        genre,
        ...(year && { year })
    };
}

const myBook = createBook(
    "Blood Meridian",
    "Cormac McCarthy",
    "Western",
);

console.log(myBook);

export function calculateArea(shape: 'circle', radius: number): number;
export function calculateArea(shape: 'square', side: number): number;
export function calculateArea(shape: 'circle' | 'square', param: number): number{
    if (shape === 'circle') {
        return Math.PI * param * param;
    } else {
        return param * param;
    }
}

console.log(calculateArea('circle', 5));
console.log(calculateArea('square', 5));

type Status = 'active' | 'inactive' | 'new';
export function  getStatusColor(status: Status): string{
    switch (status){
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

export type StringFormatter = (str: string, uppercase?: boolean) => string;

export const capitalize: StringFormatter = (str, uppercase = false) => {
    if (str.length === 0) return str;
    const result = str.charAt(0).toUpperCase() + str.slice(1);
    return uppercase ? result.toUpperCase() : result;
};

export const trimAndFormat: StringFormatter = (str, uppercase = false) => {
    const trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};

console.log(capitalize("hello world"));
console.log(capitalize("hello world", true));

console.log(trimAndFormat("   text   "));
console.log(trimAndFormat("   text   ", true));

export function getFirstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

const numbers = [10, 20, 30];
const firstNum = getFirstElement(numbers);
console.log(`Первое число: ${firstNum}`);

const strings = ["TypeScript", "JavaScript", "Python"];
const firstStr = getFirstElement(strings);
console.log(`Первая строка: ${firstStr}`);

console.log(`Пустой массив: ${getFirstElement([])}`);

interface HasId {
    id: number;
}

export function findById<T extends HasId>(items: T[], id: number): T | undefined {
    return items.find(item => item.id === id);
}

interface User extends HasId {
    name: string;
}

const users: User[] = [
    { id: 1, name: "A", isActive: true },
    { id: 2, name: "B", isActive: false }
];

const user = findById(users, 2); 
console.log(user?.name);
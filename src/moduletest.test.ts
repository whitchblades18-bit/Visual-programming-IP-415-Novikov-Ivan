import { describe, it, expect } from 'vitest';
import { 
    Transform, 
    Where, 
    Sort, 
    Group, 
    GroupBy, 
    GroupTransform, 
    Having, 
    query,
    Book 
} from '../task4';

describe('Типобезопасный конвейер', () => {
    const books: Book[] = [
        { id: 1, name: "Book A", author: "Author X", date: 2000, publisher: "Pub1" },
        { id: 2, name: "Book B", author: "Author Y", date: 2005, publisher: "Pub2" },
        { id: 3, name: "Book C", author: "Author X", date: 2010, publisher: "Pub1" },
        { id: 4, name: "Book D", author: "Author Z", date: 2015, publisher: "Pub3" },
        { id: 5, name: "Book E", author: "Author X", date: 2020, publisher: "Pub1" }
    ];

    it('Сортировка кинг по автору', () => {
        const where: Where<Book> = (key, value) => (data) => 
            data.filter(item => item[key] === value);
        
        const filterByAuthor = where("author", "Author X");
        const result = filterByAuthor(books);
        
        expect(result).toHaveLength(3);
        expect(result.every(book => book.author === "Author X")).toBe(true);
    });

    it('Фильтровать по автору и сортировать по книге', () => {
        const where: Where<Book> = (key, value) => (data) => 
            data.filter(item => item[key] === value);
        
        const sort: Sort<Book> = (key) => (data) => 
            [...data].sort((a, b) => {
                if (a[key] < b[key]) return -1;
                if (a[key] > b[key]) return 1;
                return 0;
            });
        
        const pipeline = query<Book, keyof Book>(
            where("publisher", "Pub1"),
            sort("date")
        );
        
        const result = pipeline(books);
        
        expect(result).toHaveLength(3);
        expect(result.every(book => book.publisher === "Pub1")).toBe(true);
        expect(result[0].date).toBe(2000);
        expect(result[1].date).toBe(2010);
        expect(result[2].date).toBe(2020);
    });
});
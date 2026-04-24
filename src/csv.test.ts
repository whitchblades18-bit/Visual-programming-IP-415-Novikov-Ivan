import { describe, it, expect } from 'vitest';
import { csvToJSON, formatCSVFileToJSONFile } from '../csvToJSON';

describe('csvToJSON', () => {
    it('Тест csvToJSON функции', () => {
        const csvData = [
            "name,age,place","Ted,50,Woods","Estein,20,Ground"
        ];
        const result = csvToJSON(csvData, ",");
        expect(result).toEqual([
            { "name": "Ted", "age": "50", "place": "Woods" },
            { "name": "Estein", "age": "20", "place": "Ground" }
        ]);
    });

    it('Тест неправильной работы csvToJSON функции', () => {
        const csvData = [
            "name,age,place","Ted,50","800,AaAa,67"
        ];
        const result = csvToJSON(csvData, ",");
        expect(result).toEqual([
            { "name": "Ted", "age": "50", "place": "" },
            { "name": "800", "age": "AaAa", "place": "67" }
        ]);
    });
});

describe('formatCSVFileToJSONFile (manual stubs)', () => {
    it('Взаимодействие с передаными функциями', async () => {
        const mockCsv = "id,val\n1,test";
        let capturedData = "";
        let capturedPath = "";

        const stubReadFile = async (path: string) => {
            return mockCsv;
        };

        const stubWriteFile = async (path: string, data: string) => {
            capturedPath = path;
            capturedData = data;
        };

        await formatCSVFileToJSONFile('in.csv', 'out.json', ',', stubReadFile, stubWriteFile);

        expect(capturedPath).toBe('out.json');
        
        const expectedJson = JSON.stringify([{ id: '1', val: 'test' }], null, 2);
        expect(capturedData).toBe(expectedJson);
    });
});
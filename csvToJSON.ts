import { readFile as fsReadFile, writeFile as fsWriteFile } from 'node:fs/promises';

type ReadFileFn = (path: string, encoding: 'utf-8') => Promise<string>;
type WriteFileFn = (path: string, data: string, encoding: 'utf-8') => Promise<void>;

interface Thing {
    [key: string]: string
}

export function csvToJSON (input: string[], delimiter: string) : Thing[] {
    if (input.length < 2) {
        return [];
    }

    const fields = input [0].split(delimiter);

    return input.slice(1).map((line) => {
        const values = line.split(delimiter);
        const O: Thing = {};

        fields.forEach((header,index) => {
            O[header] = values[index] ?? "";
        });

        return O;
    });
}

export async function formatCSVFileToJSONFile(input: string, output: string, delimiter: string, readFile: ReadFileFn = fsReadFile, writeFile: WriteFileFn = fsWriteFile): Promise<void> {
    const fileContent = await readFile(input, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== "");
    const jsonData = csvToJSON(lines, delimiter);

    await writeFile(output, JSON.stringify(jsonData, null, 2), 'utf-8');
}
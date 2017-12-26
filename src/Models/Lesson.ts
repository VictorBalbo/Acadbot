import { Note } from "./Note";

export class Lesson {
    Name: string;
    Notes: Note[];

    constructor(name: string) {
        this.Name = name;
        this.Notes = [];
    }
    
    public toString = (): string => {
        let lessonString = `${this.Name} \n`;
        if (this.Notes.length == 0) return lessonString + "Sem notas";
        this.Notes.forEach(note => {
            lessonString += note.toString();
        });
        return lessonString;
    }
} 
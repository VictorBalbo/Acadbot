export class Note {
    Name?: string;
    Value: string;
    Max?: string;

    constructor(value: string, name?: string, max?: string) {
        this.Value = value;
        this.Name = name;
        this.Max = max;
    }
    
    public toString = (): string => {
        if(!this.Value) return '';

        if (!this.Max)
            return `${this.Name}: ${this.Value} \n`;
        else
            return `${this.Name}: ${this.Value}/${this.Max} \n`;
    }
}
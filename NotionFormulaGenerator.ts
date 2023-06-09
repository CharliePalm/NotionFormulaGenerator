import { Tree, Node } from "./helpers/tree";
import { NodeType, NotionDate } from "./model";

export abstract class NotionFormulaGenerator {
    tree!: Tree;

    /**
     * implement your formula with this method
     */
    abstract formula(): any;

    public buildFunctionMap(): Map<string, string> {
        return new Map<string, string>();
    }

    /**
     * returns the object associated with the property
     * @param property 
     * @returns 
     */
    public getProperty(property: string): any {
        return (this as {[key: string]: any})[property]
    }

    public compile(): string {
        const functionMap = this.buildFunctionMap();
        // update function map to check if other functions reference each other
        this.updateFunctionMap(functionMap);
        functionMap.keys()
        const constMap = new Map<string, string>();
        // begin replacements
        const formulaBody = this.formula.toString()
            .replace(new RegExp(`this\\.(${[...functionMap.keys()].join('|')})\\(\\)`, 'g'), (match, functionName) => functionMap.get(functionName)!) // replace function calls
            .replace(/\/\/.*$/gm, '') // Remove all comments
            // remove constant definitions
            .replace(/const\s+(\w+)\s*=\s*([^;]+);?/g, (_: string, var1: string, var2: string) => {
                constMap.set(var1, var2);
                return '';
            })
            // replace all constants with their values
            .replace(
                new RegExp(`(?<=[\\s{(*+-/])(${[...constMap.keys()].join('|')})(?=[\\s})+\\-/*;]|$)`, 'g'), 
                (match, constName) => 
                    constMap.get(constName) ?? match
                )
            .replace(/if\s*\([^{}]*\)\s*{\s*}\s*(else\s+if\s*\([^{}]*\)\s*{\s*}\s*)*/g, '') // remove empty ifs
            .replace(/'[^']*'|(\s+)/g, (match, group1) => group1 ? '' : match) // Remove all whitespace not in single quotes
            .replace(/return/g, '') // Remove the return keyword
            .replace(/;/g, '') // Remove semicolons
            .slice(10, -1); // Remove formula() {} brackets
        // create tree
        this.tree = new Tree(formulaBody);
        // replace references to database properties
        this.replaceProperties(this.tree.root);
        this.replaceFunctionsAndOperators(this.tree.root);
        const endResult = this.build(this.tree.root, '');
        return endResult;
    }

    /**
     * replaces all refrences to db properties
     * @param node 
     */
    public replaceProperties(node: Node): void {
        if (!node) return;
        node.statement = node.statement.replace(/this\.(\w+)\.value/g, (_, property) => `prop("${this.getProperty(property)?.name}")`);
        this.replaceProperties(node.trueChild);
        this.replaceProperties(node.falseChild);
        node.wrappedChildren?.forEach((child) => {
            this.replaceProperties(child);
        });
    }

    /**
     * replaces all refrences to builtin notion functions and typescript operators
     * @param node 
     */
    public replaceFunctionsAndOperators(node: Node): void {
        if (!node) return;
        // replace all uses of this. with '', && with and, || with or, and ! with not when not followed by an equals sign
        node.statement = node.statement
            .replace(/this\./g, '')
            .replace(/&&/g, ' and ')
            .replace(/\|\|/g, ' or ')
            .replace(/!(?!=)/g, ' not ');
        this.replaceFunctionsAndOperators(node.trueChild);
        this.replaceFunctionsAndOperators(node.falseChild);
        node.wrappedChildren?.forEach((child) => {
            this.replaceFunctionsAndOperators(child);
        });
    }

    /**
     * recursive method to build the formula from the tree
     * @param node - the current node
     * @param currentFormula - the current formula
     * @returns the completed formula for the step
     */
    public build(node: Node, currentFormula: string): string {
        switch (node.type) {
            case NodeType.Logic:
                currentFormula += 'if(' + node.statement + ','
                currentFormula = this.build(node.trueChild, currentFormula) + ',';
                currentFormula = this.build(node.falseChild, currentFormula);
                currentFormula += ')';
                break;
            case NodeType.Return:
                currentFormula += node.statement;
                break;
            case NodeType.Wrapper:
                node.wrappedChildren.forEach((child) => {
                    const idx = node.statement.indexOf('()') + 1;
                    const statement = node.statement.substring(0, idx);
                    currentFormula += statement;
                    currentFormula = this.build(child, currentFormula);
                    currentFormula += ')';
                    node.statement = node.statement.substring(idx + 1, node.statement.length)
                });
                break;
        }
        return currentFormula;
    }

    public updateFunctionMap(input: Map<string, string>) {
        const r = new RegExp(`this\\.(${[...input.keys()].join('|')})\\(\\)`, 'g');
        // clean functions of functionName() and brackets
        const baseFunctions: string[] = [];
        let toUpdate: string[] = [];
        input.forEach((f, key) => {
            f = f?.slice(key.length + 4, -1).trim();
            input.set(key, f);
        });
        input.forEach((f, key) => {
            if (f.match(r)) {
                toUpdate.push(key);
            } else {
                baseFunctions.push(key);
            }
        });
        while (toUpdate.length) {
            const continueUpdating: string[] = [];
            toUpdate.forEach((key) => {
                let f = input.get(key)!;
                f = f.replace(new RegExp(`this\\.(${baseFunctions.join('|')})\\(\\)`, 'g'), (match, functionName) => input.get(functionName)!);
                input.set(key, f);
                if (!f.match(r)) {
                    baseFunctions.push(key);
                } else {
                    continueUpdating.push(key);
                }
            });
            if (continueUpdating.length === toUpdate.length) {
                throw Error('cycle found in function references');
            }
            toUpdate = continueUpdating;
        }
    }
    /**
     * these are all notion builtin functions and constants. The generator will convert these to the desired notion formula syntax when used correctly.
     * usage:
     *  this.function(functionParams)
     * the typescript compiler will check if you're using the functions correctly, and the generator will convert properly if typescript finds no compile time errors 
     */

    // contants
    e = 0;
    pi = 0;
    true = true;
    false = false;

    // math functions
    floor(value: number): number { return 0; } 
    ceil(value: number): number { return 0; }
    abs(value: number): number { return 0; }
    mod(value: number, divisor: number): number { return 0; }
    sqrt(value: number): number { return 0; }
    pow(base: number, exponent: number): number { return 0; }
    log10(value: number): number { return 0; }
    log2(value: number): number { return 0; }
    ln(value: number): number { return 0; }
    exp(value: number): number { return 0}
    unaryMinus(value: number): number { return 0; }
    unaryPlus(value: number): number { return 0; }
    max(...values: number[]): number { return 0; }
    min(...values: number[]): number { return 0; }
    round(value: number): number { return 0; }

    // string operations
    concat(...values: any): string { return ''; }
    join(...values: any): string { return ''; }
    slice(value: any, start: number, end?: number): string { return ''; }
    length(value: any): string { return ''; }
    format(value: any): string { return ''; }
    toNumber(value: any): string { return ''; }
    contains(value: any, toSearchFor: any): string { return ''; }
    replace(value: any, toFind: any, toReplace: any): string { return ''; }
    replaceAll(value: any, toFind: any, toReplace: any): string { return ''; }
    test(value: any, toMatch: any): boolean { return true; }
    empty(value: any): boolean { return true; }

    // date operations
    start(date: NotionDate): NotionDate { return {}; }
    end(date: NotionDate): NotionDate { return {}; }
    now(): NotionDate { return {}; }
    timestamp(date: NotionDate): NotionDate { return 0; }
    fromTimeStamp(timestamp: number): NotionDate { return {}; }
    dateAdd(date: NotionDate, amount: number, units: 'years' | 'quarters' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'): NotionDate { return {}; }
    dateSubtract(date: NotionDate, amount: number, units: 'years' | 'quarters' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'): NotionDate { return {}; }
    dateBetween(date1: NotionDate, date2: NotionDate, units: 'years' | 'quarters' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'): number { return 0; }
    formatDate(date: NotionDate, formatStr: string): string { return ''; }
    minute(date: NotionDate): NotionDate { return 0; }
    hour(date: NotionDate): NotionDate { return 0; }
    // for day of the week
    day(date: NotionDate): NotionDate { return 0; }
    // for calendar day
    date(date: NotionDate): NotionDate { return 0; }
    month(date: NotionDate): NotionDate { return 0; }
    year(date: NotionDate): NotionDate { return 0; }

    // misc
    id(): string { return ''; }
    and(val1: any, val2: any): boolean { return true; }
    or(val1: any, val2: any): boolean { return true; }
    not(val: any): boolean { return true; }
}

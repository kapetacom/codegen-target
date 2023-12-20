import {describe, test, expect} from '@jest/globals';
import {CodeFormatter, Target} from "../src";
import Path from "path";

describe('test Target', () => {
    describe('test _parseCode', () => {
        test('Correct mode for pom.xml', () => {
            let baseDir = Path.resolve(__dirname)
            let target = new Target({}, baseDir, new CodeFormatter());

            let generatedFiles = target.generate({
                kind: 'kapeta://kapeta/test:local'
            }, {});
            expect(generatedFiles.length).toBe(1);
            expect(generatedFiles[0].mode).toBe('merge');
        });
    });
});

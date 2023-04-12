/** @type {import('ts-jest').JestConfigWithTsJest} */
const Path = require('path');
export default {
    preset: 'ts-jest',
    transform: {
        "\\.ya?ml$": Path.join(__dirname, './yaml-transform')
    },
    "moduleFileExtensions": [
        'js',
        'ts',
        'yaml',
        'yml'
    ]
};
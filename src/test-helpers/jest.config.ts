/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    transform: {
        "\\.ya?ml$": require.resolve('./yaml-transform')
    },
    "moduleFileExtensions": [
        'js',
        'yaml',
        'yml'
    ]
};
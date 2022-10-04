/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    transform: {
        "\\.ya?ml$": require.resolve('./yaml-transform')
    },
    "moduleFileExtensions": [
        'js',
        'yaml',
        'yml'
    ]
};
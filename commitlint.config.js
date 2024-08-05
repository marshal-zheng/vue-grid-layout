module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Specify the types of commits allowed
    'type-enum': [
      2, 
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'chore', 'revert'
      ]
    ],
    // Restrict the case of the commit subject
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'] // Disallowed cases
    ]
  },
  ignores: [(commitMessage) => /^release /.test(commitMessage)]
};
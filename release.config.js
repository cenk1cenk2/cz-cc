// eslint-disable-next-line no-undef
module.exports = {
  branches: [
    'main',
    'master',
    'next',
    'next-major',
    {
      name: 'alpha',
      prerelease: true
    },
    {
      name: 'beta',
      prerelease: true
    },
    {
      name: 'rc',
      prerelease: true
    }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/npm', { npmPublish: false }],
    [
      '@semantic-release/exec',
      {
        publishCmd:
          // eslint-disable-next-line stylistic/max-len, stylistic/quotes
          "npm stage publish ${nextRelease.channel ? \"--tag \" + nextRelease.channel : \"\"} > /dev/null && node -p \"JSON.stringify({ name: 'npm package', url: 'https://www.npmjs.com/package/' + require('./package.json').name + '/v/${nextRelease.version}', channel: '${nextRelease.channel || \"latest\"}' })\""
      }
    ],
    '@semantic-release/changelog',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'README.md', 'yarn.lock', 'package.json']
      }
    ],
    '@semantic-release/gitlab'
  ]
}

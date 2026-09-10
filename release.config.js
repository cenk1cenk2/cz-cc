// eslint-disable-next-line no-undef
module.exports = {
  extends: '@cenk1cenk2/semantic-release-config',
  plugins: [
    ['@cenk1cenk2/semantic-release-config/presets/npm', { publish: 'staged', client: 'pnpm' }],
    '@semantic-release/gitlab'
  ]
}

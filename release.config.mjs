export default {
  extends: '@cenk1cenk2/semantic-release-config',
  plugins: [
    ['@cenk1cenk2/semantic-release-config/presets/npm', { publish: 'staged', client: 'pnpm' }],
    '@semantic-release/gitlab'
  ]
}

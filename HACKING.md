# Release

- `npm run test` and confirm if all good
- update the version inside 'package.json' and 'package-lock.json'
- update the changelog
- `npm publish --dry-run` and confirm if all good (i.e. _all_ the expected
  files are included in the bundle)
- `git commit ..` and `git push`
- `git tag v$TAG` and `git push origin v$TAG`
- `npm publish`

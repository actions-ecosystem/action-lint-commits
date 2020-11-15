jest.mock('@actions/github')

import { Commit, lintCommits, formatCommits } from '../src/commit'

const commits: Commit[] = [
  {
    sha: 'sha1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    message: 'invalid message 1',
    url:
      'https://github.com/owner/repo/commit/sha1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    sha: 'sha2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    message: 'valid message 1',
    url:
      'https://github.com/owner/repo/commit/sha2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    sha: 'sha3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    message: 'invalid message 2',
    url:
      'https://github.com/owner/repo/commit/sha3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  }
]

describe('commits', () => {
  test('lint commits', async () => {
    const re = new RegExp('^valid message \\d')

    const { matchedCommits, unmatchedCommits } = await lintCommits(commits, re)

    expect(matchedCommits).toStrictEqual([commits[1]])
    expect(unmatchedCommits).toStrictEqual([commits[0], commits[2]])
  })

  test('format commits with markdown', async () => {
    const output = await formatCommits(commits, 'markdown')

    expect(output).toEqual(`- [\`${commits[0].sha.slice(0, 7)}\`](${
      commits[0].url
    }): ${commits[0].message}
- [\`${commits[1].sha.slice(0, 7)}\`](${commits[1].url}): ${commits[1].message}
- [\`${commits[2].sha.slice(0, 7)}\`](${commits[2].url}): ${
      commits[2].message
    }`)
  })
})

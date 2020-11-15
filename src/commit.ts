import * as github from '@actions/github'
import { safeDump } from 'js-yaml'

export interface Commit {
  message: string
  sha: string
  url: string
}

export async function fetchCommits(
  token: string,
  owner: string,
  repo: string,
  number: number
): Promise<{ commits: Commit[] }> {
  const commits: Commit[] = []

  // TODO(micnncim): Add pagination if some users want.
  await github
    .getOctokit(token)
    .pulls.listCommits({
      owner: owner,
      repo: repo,
      pull_number: number,
      per_page: 100
    })
    .then(resp =>
      resp.data.forEach(commit => {
        commits.push({
          message: commit.commit.message,
          sha: commit.sha,
          url: commit.html_url
        })
      })
    )

  return { commits }
}

export async function lintCommits(
  commits: Commit[],
  regex: RegExp
): Promise<{
  matchedCommits: Commit[]
  unmatchedCommits: Commit[]
}> {
  const matchedCommits: Commit[] = []
  const unmatchedCommits: Commit[] = []

  commits.forEach(commit => {
    if (regex.test(commit.message)) {
      matchedCommits.push(commit)
      return
    }
    unmatchedCommits.push(commit)
  })

  return { matchedCommits, unmatchedCommits }
}

export async function formatCommits(
  commits: Commit[],
  format: string
): Promise<string> {
  switch (format) {
    case 'markdown': {
      const lines: string[] = []
      commits.forEach(commit =>
        lines.push(
          `- [\`${commit.sha.slice(0, 7)}\`](${commit.url}): ${commit.message}`
        )
      )
      return lines.join('\n')
    }

    case 'json': {
      return JSON.stringify(commits)
    }

    case 'yaml': {
      return safeDump(commits)
    }

    default: {
      return ''
    }
  }
}

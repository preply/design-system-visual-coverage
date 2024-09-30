export const preplyGitHubTeams = [
  'team-a',
  'team-b',
  'team-c',
] as const;

export type PreplyGitHubTeam = typeof preplyGitHubTeams[number];

export function isPreplyGitHubTeam(value: unknown): value is PreplyGitHubTeam {
  return (
      typeof value === 'string' &&
      // @ts-expect-error team is considered a generic string that does not match preplyGitHubTeams values
      preplyGitHubTeams.includes(value)
  );
}

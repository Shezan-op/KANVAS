/** Site-wide constants. Override REPO_URL with NEXT_PUBLIC_REPO_URL for forks. */
export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL || "https://gitlab.com/venukumar.ai/slyd";
export const ISSUES_URL = `${REPO_URL}/-/issues`;
export const LICENSE_URL = `${REPO_URL}/-/blob/main/LICENSE`;

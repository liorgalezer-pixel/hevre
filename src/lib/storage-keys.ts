export const STORAGE_KEYS = {
  ALERTS: "hevre_alerts",
  FILTERS: "hevre_filters",
  MY_JOBS: "hevre_my_jobs",
  ALL_JOBS: "hevre_all_jobs",
  POST_STEP_1: "hevre_post_step1",
  POST_STEP_2: "hevre_post_step2",
  POST_STEP_3: "hevre_post_step3",
  MY_APPLICATIONS: "hevre_my_applications",
} as const;

export function myJobsKey(userId: string) {
  return `hevre_my_jobs_${userId}`;
}

export function myApplicationsKey(userId: string) {
  return `hevre_my_applications_${userId}`;
}

export function savedJobsKey(userId: string) {
  return `hevre_saved_jobs_${userId}`;
}

import siteJson from "@/content/site.json";
import projectsJson from "@/content/projects.json";
import experienceJson from "@/content/experience.json";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  links: ProjectLink[];
  note: string;
  featured: boolean;
  status: "shipped" | "in-progress" | "stealth";
}

export interface UpcomingProject {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  meta: string;
  stack: string[];
}

export interface ExperienceEntry {
  org: string;
  role: string;
  period: string;
  current: boolean;
  summary: string;
  bullets: string[];
  stack: string[];
}

export const site = siteJson;
export const projects = projectsJson.shipped as Project[];
export const upcoming = projectsJson.upcoming as UpcomingProject[];
export const experience = experienceJson.entries as ExperienceEntry[];

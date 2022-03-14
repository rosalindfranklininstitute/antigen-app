export type Project = {
  title: string;
  short_title: string;
  description: string;
};

export type ProjectPost = Project;

export type ProjectRef = Project["short_title"];

export type ProjectItem = { project: string; number: number };

export const projectItemURI = (item: ProjectItem) =>
  `${item.project}:${item.number}`;

export const addProjectItemUri = (items: Array<ProjectItem>) =>
  items.map((item) => ({ ...item, uri: projectItemURI(item) }));

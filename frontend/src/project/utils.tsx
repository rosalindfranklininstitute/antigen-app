import { Table, TableBody, TableContainer } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TableRowPair } from "../utils/elements";
import { getProject, selectProject } from "./slice";

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

export function ProjectInfo(params: { projectRef: ProjectRef }) {
  const dispatch = useDispatch();
  const project = useSelector(selectProject(params.projectRef));

  useEffect(() => {
    dispatch(getProject(params.projectRef));
  }, [dispatch, params]);

  if (!project) return null;
  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRowPair name="Short Title" value={project.short_title} />
          <TableRowPair name="Title" value={project.title} />
          <TableRowPair name="Description" value={project.description} />
        </TableBody>
      </Table>
    </TableContainer>
  );
}

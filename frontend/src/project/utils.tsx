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

/**
 *
 * Serializes project item URIs from project item objects containing a project
 * reference and a number
 *
 * @param item A project item containing a project reference and a number
 * @returns The serialized project item URI string
 */
export function projectItemURI(item: ProjectItem): string {
  return `${item.project}:${item.number}`;
}

/**
 *
 * Adds a uri property, serialized from the project reference and number, to
 * each project item in an array
 *
 * @param items An array of project items
 * @returns An array of project items with added uri property
 */
export function addProjectItemUri<Type extends ProjectItem>(
  items: Array<Type>
): Array<Type & { uri: string }> {
  return items.map((item) => ({ ...item, uri: projectItemURI(item) }));
}

/**
 *
 * A table of project information, containing rows for the short title, full
 * title and description. Project information is retrieved from the redux store
 * with a dispatch executed to obtain it if unavailable
 *
 * @param params A project reference from which the project can be retrieved
 * @param params.projectRef The project reference
 * @returns A MUI table with rows containing the short title, full title and
 * description
 */
export function ProjectInfo(params: {
  projectRef: ProjectRef;
}): JSX.Element | null {
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

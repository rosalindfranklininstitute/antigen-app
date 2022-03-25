import {
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { AntigenInfo, AntigenRef } from "../antigen/utils";
import { NanobodyInfo, NanobodyRef } from "../nanobody/utils";
import { projectItemURI, ProjectRef } from "../project/utils";
import { getElisaWell, selectElisaWell } from "./slice";

export type ElisaWell = {
  project: ProjectRef;
  plate: number;
  location: number;
  antigen: AntigenRef;
  nanobody: NanobodyRef;
  optical_density: number;
  functional: boolean;
};

export type ElisaWellRef = Pick<ElisaWell, "project" | "plate" | "location">;

export type ElisaWellPost = ElisaWellRef &
  Pick<ElisaWell, "antigen" | "nanobody" | "optical_density">;

/**
 *
 * Deserializes elisa well reference URIs from their string representation,
 * producing an elisa well reference containing a project, plate and location
 *
 * @param elisaWellRef The serialized elisa well reference URI string
 * @returns An elisa well reference containing a project, plate and location
 */
export function deserializeElisaWellRef(elisaWellRef: string): ElisaWellRef {
  const [project, plate_str, location_str] = elisaWellRef.split(":") as [
    string,
    string,
    string
  ];
  return {
    project,
    plate: parseInt(plate_str),
    location: parseInt(location_str),
  };
}

/**
 *
 * Serializes elisa well reference URIs from elisa well reference objects
 * containing a project, plate and location
 *
 * @param elisaWellRef An elisa well reference containing a project, plate and
 * location
 * @returns The serialized elisa well reference URI string
 */
export function serializeElisaWellRef(elisaWellRef: ElisaWellRef): string {
  return `${elisaWellRef.project}
  :${elisaWellRef.plate}
  :${elisaWellRef.location}`;
}

/**
 *
 * Produces a tuple of row and column from the row-major location of an item in
 * a 2D grid
 *
 * @param location The row-major location of an item in a grid
 * @returns A tuple of row and column indices
 */
function locationToCoords(location: number): [number, number] {
  return [
    Math.floor((location.valueOf() - 1) / 12),
    (location.valueOf() - 1) % 12,
  ];
}

/**
 *
 * Produces a tuple of row and column from the row-major location of an item in
 * a 2D grid, where the row is represented as a character indexed from A
 *
 * @param location The row-major location of an item in a grid
 * @returns A tuple of row letter and column number
 */
export function locationToGrid(location: number): [string, number] {
  const [row, col] = locationToCoords(location);
  return [String.fromCharCode(65 + row), col + 1];
}

/**
 *
 * A table of elisa well information, containing rows for the plate, location,
 * antigen, nanobody, optical density and creation time. Elisa well information
 * is retrieved from the redux store with a dispatch executed to obtain it if
 * unavailable
 *
 * @param params A elisa well reference from which the elisa well can be
 * reteieved
 * @param params.elisaWellRef The elisa well reference
 * @returns A MUI table with rows containing the plate, location, antigen,
 * nanobody, optical density and creation time
 */
export function ElisaWellInfo(params: { elisaWellRef: ElisaWellRef }) {
  const dispatch = useDispatch();
  const elisaWell = useSelector(selectElisaWell(params.elisaWellRef));

  useEffect(() => {
    dispatch(getElisaWell({ elisaWellRef: params.elisaWellRef }));
  }, [dispatch, params]);

  if (!elisaWell) return null;
  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Plate:</TableCell>
            <TableCell>
              <Link
                component={RouterLink}
                to={`/elisa_plate/${projectItemURI({
                  project: elisaWell.project,
                  number: elisaWell.plate,
                })}`}
              >
                {projectItemURI({
                  project: elisaWell.project,
                  number: elisaWell.plate,
                })}
              </Link>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Location:</TableCell>
            <TableCell>{locationToGrid(elisaWell.location)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Antigen:</TableCell>
            <TableCell>
              <AntigenInfo antigen={elisaWell.antigen} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Nanobody:</TableCell>
            <TableCell>
              <NanobodyInfo nanobodyRef={elisaWell.nanobody} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Optical Density:</TableCell>
            <TableCell>{elisaWell.optical_density}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Functional:</TableCell>
            <TableCell>{elisaWell.functional ? "yes" : "no"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 *
 * A list of links to individual elisa well views from an array of elisa well
 * references
 *
 * @param elisaWellRefs An array of elisa well references
 * @returns A list of links to individual elisa well views
 */
export function ElisaWellRefStack(
  elisaWellRefs: Array<ElisaWellRef>
): JSX.Element {
  return (
    <Stack>
      {elisaWellRefs.map((elisaWellRef, idx) => (
        <Link
          component={RouterLink}
          to={`/elisa_well/${serializeElisaWellRef(elisaWellRef)}`}
          key={idx}
        >
          {serializeElisaWellRef(elisaWellRef)}
        </Link>
      ))}
    </Stack>
  );
}

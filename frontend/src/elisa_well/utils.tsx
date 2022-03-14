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

export function serializeElisaWellRef(elisaWellRef: ElisaWellRef): string {
  return `${elisaWellRef.project}:${elisaWellRef.plate}:${elisaWellRef.location}`;
}

function locationToCoords(location: number): [number, number] {
  return [
    Math.floor((location.valueOf() - 1) / 12),
    (location.valueOf() - 1) % 12,
  ];
}

export function locationToGrid(location: number) {
  const [row, col] = locationToCoords(location);
  return [String.fromCharCode(65 + row).concat((col + 1).toString())];
}

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

export const ElisaWellRefStack = (elisaWellRefs: Array<ElisaWellRef>) => (
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

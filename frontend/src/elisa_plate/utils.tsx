import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAntigen, selectAntigen } from "../antigen/slice";
import { getElisaWell, selectElisaWell } from "../elisa_well/slice";
import { ElisaWell, ElisaWellRef, locationToGrid } from "../elisa_well/utils";
import { getNanobody, selectNanobody } from "../nanobody/slice";
import { RootState } from "../store";
import { Link as RouterLink } from "react-router-dom";
import { zip } from "../utils/state_management";
import { getElisaPlate, selectElisaPlate } from "./slice";
import { ProjectRef } from "../project/utils";

export type ElisaPlate = {
  project: ProjectRef;
  number: number;
  threshold: number;
  elisawell_set: Array<ElisaWellRef>;
  creation_time: Date;
};

export type ElisaPlateRef = Pick<ElisaPlate, "project" | "number">;

export type ElisaPlatePost = Pick<ElisaPlate, "project" | "threshold">;

function ElisaPlateWellTable(params: { elisaWellRefs: ElisaWellRef[] }) {
  const dispatch = useDispatch();
  const elisaWells = useSelector((state: RootState) =>
    params.elisaWellRefs.map((wellKey) => selectElisaWell(wellKey)(state))
  ).filter((elisaWell): elisaWell is ElisaWell => !!elisaWell);
  const antigens = useSelector((state: RootState) =>
    elisaWells.map((elisaWell) => selectAntigen(elisaWell.antigen)(state))
  );

  const nanobodies = useSelector((state: RootState) =>
    elisaWells.map((elisaWell) => selectNanobody(elisaWell.nanobody)(state))
  );

  useEffect(() => {
    params.elisaWellRefs.forEach((elisaWellRef) =>
      dispatch(getElisaWell({ elisaWellRef: elisaWellRef }))
    );
  }, [dispatch, params]);

  useEffect(() => {
    elisaWells.forEach((elisaWell) => {
      dispatch(getAntigen(elisaWell.antigen));
      dispatch(getNanobody(elisaWell.nanobody));
    });
  });

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>UUID</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Antigen</TableCell>
            <TableCell>Nanobody</TableCell>
            <TableCell>Optical Density</TableCell>
            <TableCell>Functional</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {zip(elisaWells, antigens, nanobodies).map(
            ([elisaWell, antigen, nanobody], idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={`/elisa_well/${elisaWell.plate}:${elisaWell.location}/`}
                  >
                    {elisaWell.plate}:{elisaWell.location}
                  </Link>
                </TableCell>
                <TableCell>{locationToGrid(elisaWell.location)}</TableCell>
                <TableCell>{antigen ? antigen.name : null}</TableCell>
                <TableCell>{nanobody ? nanobody.name : null}</TableCell>
                <TableCell>{elisaWell.optical_density}</TableCell>
                <TableCell>{elisaWell.functional ? "yes" : "no"}</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ElisaPlateInfo(params: { elisaPlateRef: ElisaPlateRef }) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(
    params.elisaPlateRef
      ? selectElisaPlate(params.elisaPlateRef)
      : () => undefined
  );

  useEffect(() => {
    dispatch(getElisaPlate(params.elisaPlateRef));
  }, [dispatch, params]);

  if (!elisaPlate) return null;
  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Threshold:</TableCell>
            <TableCell>{elisaPlate.threshold}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Wells:</TableCell>
            <TableCell>
              <ElisaPlateWellTable elisaWellRefs={elisaPlate?.elisawell_set} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Creation Time:</TableCell>
            <TableCell>{elisaPlate.creation_time}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

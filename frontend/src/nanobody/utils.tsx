import { TableContainer, Table, TableBody } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ElisaWellRef, ElisaWellRefStack } from "../elisa_well/utils";
import { ProjectRef } from "../project/utils";
import { TableRowPair } from "../utils/elements";
import { getNanobody, selectNanobody } from "./slice";

export type Nanobody = {
  project: ProjectRef;
  number: number;
  name: string;
  elisawell_set: Array<ElisaWellRef>;
  sequences: Array<string>;
  creation_time: Date;
};

export type NanobodyPost = Pick<Nanobody, "project">;

export type NanobodyRef = Pick<Nanobody, "project" | "number">;

/**
 *
 * A table of nanobody information, containing rows for the project, number,
 * name, elisa appearances as a list of well references and the creation time.
 * Nanobody information is retrieved from the redux store with a dispatch
 * exected to obtain it if unavailable
 *
 * @param params A nanobody reference from which the nanobody can be retrieved
 * @param params.nanobodyRef The nanobody reference
 * @returns A MUI table with rows containing project, number, name, elisa
 * appearances and creation time
 */
export function NanobodyInfo(params: { nanobodyRef: NanobodyRef }) {
  const dispatch = useDispatch();
  const nanobody = useSelector(selectNanobody(params.nanobodyRef));

  useEffect(() => {
    dispatch(getNanobody(params.nanobodyRef));
  }, [dispatch, params]);

  if (!nanobody) return null;
  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRowPair name="Project" value={nanobody.name} />
          <TableRowPair name="Number" value={nanobody.number} />
          <TableRowPair name="Name" value={nanobody.name} />
          <TableRowPair
            name="Elisa Appearances"
            value={ElisaWellRefStack(nanobody.elisawell_set)}
          />
          <TableRowPair name="Creation Time" value={nanobody.creation_time} />
        </TableBody>
      </Table>
    </TableContainer>
  );
}

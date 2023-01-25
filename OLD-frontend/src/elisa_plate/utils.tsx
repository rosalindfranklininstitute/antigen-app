import { Table, TableBody, TableContainer } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ElisaWellRef, ElisaWellRefStack } from "../elisa_well/utils";
import { getElisaPlate, selectElisaPlate } from "./slice";
import { ProjectRef } from "../project/utils";
import { TableRowPair } from "../utils/elements";

export type ElisaPlate = {
  project: ProjectRef;
  number: number;
  threshold: number;
  elisawell_set: Array<ElisaWellRef>;
  creation_time: Date;
};

export type ElisaPlateRef = Pick<ElisaPlate, "project" | "number">;

export type ElisaPlatePost = Pick<ElisaPlate, "project" | "threshold">;

/**
 *
 * A table of elisa plate information, containing rows for the project, number,
 * elisa wells as a list of well references, threshold and the creation time.
 * Elisa plate information is retrieved from the redux store with a dispatch
 * executed to obtain it if unavailable
 *
 * @param params An elisa plate reference from which the elisa plate can be
 * retrieved
 * @param params.elisaPlateRef The elisa plate reference
 * @returns A MUI table with rows containing project, number, elisa wells,
 * threshold and creation time
 */
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
          <TableRowPair name="Project" value={elisaPlate.project} />
          <TableRowPair name="Number" value={elisaPlate.number} />
          <TableRowPair
            name="Elisa Wells"
            value={ElisaWellRefStack(elisaPlate.elisawell_set)}
          />
          <TableRowPair name="Threshold" value={elisaPlate.threshold} />
          <TableRowPair name="Creation Time" value={elisaPlate.creation_time} />
        </TableBody>
      </Table>
    </TableContainer>
  );
}

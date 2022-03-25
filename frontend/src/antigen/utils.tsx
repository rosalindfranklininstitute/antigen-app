import { TableContainer, Table, TableBody } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ElisaWellRef, ElisaWellRefStack } from "../elisa_well/utils";
import { ProjectRef } from "../project/utils";
import { DispatchType } from "../store";
import { TableRowPair } from "../utils/elements";
import { getAntigen, selectAntigen } from "./slice";

export type UniProtAntigen = {
  project: ProjectRef;
  number: number;
  name: string;
  sequence: string;
  molecular_mass: number;
  uniprot_accession_number: string;
  creation_time: Date;
};

export type UniProtAntigenPost = Pick<
  UniProtAntigen,
  "project" | "uniprot_accession_number"
>;
export type LocalAntigen = {
  project: ProjectRef;
  number: number;
  name: string;
  sequence: string;
  molecular_mass: number;
  creation_time: Date;
};

export type LocalAntigenPost = Pick<
  LocalAntigen,
  "project" | "sequence" | "molecular_mass"
>;

export type Antigen = (UniProtAntigen | LocalAntigen) & {
  elisawell_set: Array<ElisaWellRef>;
};

export type AntigenRef = Pick<Antigen, "project" | "number">;

/**
 *
 * A table of antigen information, containing rows for the project, number,
 * name, elisa appearances as a list of well references and the creation time.
 * Antigen information is retrieved from the redux store with a dispatch
 * exected to obtain it if unavailable
 *
 * @param params A antigen reference from which the antigen can be retrieved
 * @param params.antigen The antigen reference
 * @returns A MUI table with rows containing project, number, name, elisa
 * appearances and creation time
 */
export function AntigenInfo(params: { antigen: AntigenRef }) {
  const dispatch = useDispatch<DispatchType>();
  const antigen = useSelector(selectAntigen(params.antigen));

  useEffect(() => {
    dispatch(getAntigen(params.antigen));
  }, [dispatch, params]);

  if (!antigen) return null;
  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRowPair name="Project" value={antigen.project} />
          <TableRowPair name="Number" value={antigen.number} />
          <TableRowPair name="Name" value={antigen.name} />
          <TableRowPair name="Sequence" value={antigen.sequence} />
          <TableRowPair name="Molecular Mass" value={antigen.molecular_mass} />
          {"uniprot_accession_number" in antigen && (
            <TableRowPair
              name="Uniprot Accession Number"
              value={antigen.uniprot_accession_number}
            />
          )}
          <TableRowPair
            name="Elisa Appearances"
            value={ElisaWellRefStack(antigen.elisawell_set)}
          />
          <TableRowPair name="Creation Time" value={antigen.creation_time} />
        </TableBody>
      </Table>
    </TableContainer>
  );
}

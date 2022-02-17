import { TableCell, TableContainer, TableRow, Table, TableBody, Stack, Link } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { getAntigen, selectAntigen } from "./slice";

export type UniProtAntigen = {
    antigen: string
    uniprot_accession_number: string
    sequence: string
    molecular_mass: number
    name: string
}

export type LocalAntigen = {
    antigen: string
    sequence: string
    molecular_mass: number
    name: string
}

export type Antigen = {
    uuid: string
    sequence: string
    molecular_mass: number
    name: string
    uniprot_accession_number: string
    antigen_elisa_wells: Array<string>
    creation_time: Date
};

export function AntigenInfo(params: { uuid: string }) {
    const dispatch = useDispatch();
    const antigen = useSelector(selectAntigen(params.uuid));

    useEffect(() => {
        dispatch(getAntigen(params.uuid));
    }, [dispatch, params]);

    if (!antigen) return null;
    return (
        <TableContainer>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>UUID:</TableCell>
                        <TableCell>{antigen.uuid}</TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell>Sequence:</TableCell>
                        <TableCell>{antigen.sequence}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Molecular Mass:</TableCell>
                        <TableCell>{antigen.molecular_mass}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Uniprot Accession Number:</TableCell>
                        <TableCell>{antigen.uniprot_accession_number}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Elisa Appearances:</TableCell>
                        <TableCell>
                            <Stack>
                                {antigen.antigen_elisa_wells.map((well, idx) => (
                                    <Link component={RouterLink} to={`/elisa_well/${well}`}>{well}</Link>
                                ))}
                            </Stack>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Creation Time:</TableCell>
                        <TableCell>{antigen.creation_time}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
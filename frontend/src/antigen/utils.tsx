import { TableCell, TableContainer, TableRow, Table, TableBody } from "@mui/material";

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

export function AntigenInfo(params: { antigen: Antigen }) {
    return (
        <TableContainer>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>UUID:</TableCell>
                        <TableCell>{params.antigen.uuid}</TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell>Sequence:</TableCell>
                        <TableCell>{params.antigen.sequence}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Molecular Mass:</TableCell>
                        <TableCell>{params.antigen.molecular_mass}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Uniprot Accession Number:</TableCell>
                        <TableCell>{params.antigen.uniprot_accession_number}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Elisa Appearances:</TableCell>
                        <TableCell>{params.antigen.antigen_elisa_wells}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Creation Time:</TableCell>
                        <TableCell>{params.antigen.creation_time}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
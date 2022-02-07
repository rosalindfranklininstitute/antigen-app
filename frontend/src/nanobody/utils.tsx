import { TableCell, TableContainer, TableRow, Table, TableBody, Stack, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";


export type Nanobody = {
    uuid: string
    name: string
    nanobody_elisa_wells: string[]
    creation_time: Date
};

export function NanobodyInfo(params: { nanobody: Nanobody }) {
    const navigate = useNavigate()

    return (
        <TableContainer>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>UUID:</TableCell>
                        <TableCell>{params.nanobody.uuid}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Elisa Appearances:</TableCell>
                        <TableCell>
                            <Stack>
                                {params.nanobody.nanobody_elisa_wells.map((well, idx) => (
                                    <Link onClick={() => navigate(`/elisa_well/${well}`)}>{well}</Link>
                                ))}
                            </Stack>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Creation Time:</TableCell>
                        <TableCell>{params.nanobody.creation_time}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
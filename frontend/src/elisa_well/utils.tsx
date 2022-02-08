import { Link, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"

export type ElisaWell = {
    uuid: string
    plate: string
    location: number
    antigen: string
    nanobody: string
    optical_density: number
    functional: boolean
}

export function locationToCoords(location: number): [number, number] {
    return [Math.floor((location.valueOf() - 1) / 12), (location.valueOf() - 1) % 12]
}

export function locationToGrid(location: number) {
    const [row, col] = locationToCoords(location)
    return [String.fromCharCode(65 + row).concat((col + 1).toString())]
}

export function ElisaWellInfo(params: { elisaWell: ElisaWell }) {
    return (
        <TableContainer>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>UUID:</TableCell>
                        <TableCell>{params.elisaWell.uuid}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Plate:</TableCell>
                        <TableCell>
                            <Link
                                component={RouterLink}
                                to={`/elisa_plate/${params.elisaWell.plate}`}
                            >
                                {params.elisaWell.plate}
                            </Link>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Location:</TableCell>
                        <TableCell>{locationToGrid(params.elisaWell.location)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Antigen:</TableCell>
                        <TableCell>
                            <Link
                                component={RouterLink}
                                to={`/antigen/${params.elisaWell.antigen}`}
                            >
                                {params.elisaWell.antigen}
                            </Link>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Nanobody:</TableCell>
                        <TableCell>
                            <Link
                                component={RouterLink}
                                to={`/nanobody/${params.elisaWell.nanobody}`}
                            >
                                {params.elisaWell.nanobody}
                            </Link>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Optical Density:</TableCell>
                        <TableCell>{params.elisaWell.optical_density}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Functional:</TableCell>
                        <TableCell>{params.elisaWell.functional ? "yes" : "no"}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
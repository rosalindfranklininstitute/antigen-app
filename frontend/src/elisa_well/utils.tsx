import { Link, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { Antigen, AntigenInfo, fetchAntigen } from "../antigen/utils"
import { fetchNanobody, Nanobody, NanobodyInfo } from "../nanobody/utils"
import { getAPI } from "../utils/api"

export type ElisaWell = {
    uuid: string
    plate: string
    location: number
    antigen: string
    nanobody: string
    optical_density: number
    functional: boolean
}

export type DetailedElisaWell = {
    uuid: string
    plate: string
    location: number
    antigen: Antigen
    nanobody: Nanobody
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

export async function fetchElisaWell(uuid: string): Promise<ElisaWell> {
    return getAPI(`elisa_well/${uuid}`);
}

export async function fetchDetailedElisaWell(uuid: string): Promise<DetailedElisaWell> {
    return fetchElisaWell(uuid).then(
        async (elisaWell) => Promise.all(
            [
                fetchAntigen(elisaWell.antigen),
                fetchNanobody(elisaWell.nanobody)
            ]
        ).then(
            async ([antigen, nanobody]) => (
                {
                    uuid: elisaWell.uuid,
                    plate: elisaWell.plate,
                    location: elisaWell.location,
                    antigen: antigen,
                    nanobody: nanobody,
                    optical_density: elisaWell.optical_density,
                    functional: elisaWell.functional
                }
            )
        )
    );
};

export function ElisaWellInfo(params: { elisaWell: DetailedElisaWell }) {
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
                            <AntigenInfo antigen={params.elisaWell.antigen} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Nanobody:</TableCell>
                        <TableCell>
                            <NanobodyInfo nanobody={params.elisaWell.nanobody} />
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
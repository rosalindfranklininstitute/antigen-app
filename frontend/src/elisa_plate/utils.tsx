import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { DetailedElisaWell, fetchDetailedElisaWell, locationToGrid } from "../elisa_well/utils"
import { getAPI } from "../utils/api"
import { LinkUUID } from "../utils/elements"

export type ElisaPlate = {
    uuid: string
    threshold: number
    plate_elisa_wells: string[]
    creation_time: Date
}

export type DetailedElisaPlate = {
    uuid: string
    threshold: number
    plate_elisa_wells: DetailedElisaWell[]
    creation_time: Date
}

export async function fetchElisaPlate(uuid: string): Promise<ElisaPlate> {
    return getAPI(`elisa_plate/${uuid}`).then(
        async (response) => await response.json()
    )
}

export async function fetchDetailedElisaPlate(uuid: string): Promise<DetailedElisaPlate> {
    return fetchElisaPlate(uuid).then(
        async (elisaPlate) => Promise.all(
            elisaPlate.plate_elisa_wells.map(
                async (wellUUID, _) => fetchDetailedElisaWell(wellUUID)
            )
        ).then(
            (detailedElisaWells) => (
                {
                    uuid: elisaPlate.uuid,
                    threshold: elisaPlate.threshold,
                    plate_elisa_wells: detailedElisaWells,
                    creation_time: elisaPlate.creation_time
                }
            )
        )
    );
};

export function ElisaPlateInfo(params: { elisaPlate: DetailedElisaPlate }) {
    return (
        <TableContainer>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Threshold:</TableCell>
                        <TableCell>{params.elisaPlate.threshold}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Wells:</TableCell>
                        <TableCell>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>UUID</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>Antigen</TableCell>
                                            <TableCell>Nanobody</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            params.elisaPlate.plate_elisa_wells.map((well, idx) => (
                                                <TableRow>
                                                    <TableCell><LinkUUID rootURI="/elisa_well/" UUID={well.uuid} /></TableCell>
                                                    <TableCell>{locationToGrid(well.location)}</TableCell>
                                                    <TableCell>{well.antigen.name}</TableCell>
                                                    <TableCell>{well.nanobody.name}</TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Creation Time:</TableCell>
                        <TableCell>{params.elisaPlate.creation_time}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
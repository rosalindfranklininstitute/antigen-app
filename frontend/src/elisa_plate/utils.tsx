import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { DetailedElisaWell, locationToGrid } from "../elisa_well/utils"
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
                                                <TableRow key={idx}>
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
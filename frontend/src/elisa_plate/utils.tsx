import { Stack, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"
import { LinkUUID } from "../utils/elements"

export type ElisaPlate = {
    uuid: string
    threshold: number
    plate_elisa_wells: string[]
    creation_time: Date
}

export function ElisaPlateInfo(params: { elisaPlate: ElisaPlate }) {
    return (
        <TableContainer>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>UUID:</TableCell>
                        <TableCell>{params.elisaPlate.uuid}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Threshold:</TableCell>
                        <TableCell>{params.elisaPlate.threshold}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Wells:</TableCell>
                        <TableCell>
                            <Stack>
                                {
                                    params.elisaPlate.plate_elisa_wells.map((well, idx) => (
                                        <LinkUUID rootURI="/elisa_well/" UUID={well} />
                                    ))
                                }
                            </Stack>
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
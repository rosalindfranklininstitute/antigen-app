import { Link, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link as RouterLink } from "react-router-dom"
import { AntigenInfo } from "../antigen/utils"
import { NanobodyInfo } from "../nanobody/utils"
import { getElisaWell, selectElisaWell } from "./slice"

export type ElisaWell = {
    uuid: string
    plate: string
    location: number
    antigen: string
    nanobody: string
    optical_density: number
    functional: boolean
}

export type ElisaWellKey = Pick<ElisaWell, "plate" | "location">

export type ElisaWellPost = Pick<ElisaWell, "plate" | "location" | "antigen" | "nanobody" | "optical_density">

export function locationToCoords(location: number): [number, number] {
    return [Math.floor((location.valueOf() - 1) / 12), (location.valueOf() - 1) % 12]
}

export function locationToGrid(location: number) {
    const [row, col] = locationToCoords(location)
    return [String.fromCharCode(65 + row).concat((col + 1).toString())]
}

export function ElisaWellInfo(params: ElisaWellKey) {
    const dispatch = useDispatch();
    const elisaWell = useSelector(selectElisaWell(params));

    useEffect(() => {
        dispatch(getElisaWell(params));
    }, [dispatch, params]);

    if (!elisaWell) return null;
    return (
        <TableContainer>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>UUID:</TableCell>
                        <TableCell>{elisaWell.uuid}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Plate:</TableCell>
                        <TableCell>
                            <Link
                                component={RouterLink}
                                to={`/elisa_plate/${elisaWell.plate}`}
                            >
                                {elisaWell.plate}
                            </Link>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Location:</TableCell>
                        <TableCell>{locationToGrid(elisaWell.location)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Antigen:</TableCell>
                        <TableCell>
                            <AntigenInfo uuid={elisaWell.antigen} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Nanobody:</TableCell>
                        <TableCell>
                            <NanobodyInfo uuid={elisaWell.nanobody} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Optical Density:</TableCell>
                        <TableCell>{elisaWell.optical_density}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Functional:</TableCell>
                        <TableCell>{elisaWell.functional ? "yes" : "no"}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
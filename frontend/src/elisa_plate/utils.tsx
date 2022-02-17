import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAntigen, selectAntigen } from "../antigen/slice"
import { getElisaWell, selectElisaWell } from "../elisa_well/slice"
import { ElisaWell, locationToGrid } from "../elisa_well/utils"
import { getNanobody, selectNanobody } from "../nanobody/slice"
import { RootState } from "../store"
import { LinkUUID } from "../utils/elements"
import { zip } from "../utils/state_management"
import { getElisaPlate, selectElisaPlate } from "./slice"

export type ElisaPlate = {
    uuid: string
    threshold: number
    plate_elisa_wells: string[]
    creation_time: Date
}

export function ElisaPlateWellTable(params: { uuids: string[] }) {
    const dispatch = useDispatch();
    const elisaWells = useSelector(
        (state: RootState) => params.uuids.map(
            (uuid) => selectElisaWell(uuid)(state)
        )
    ).filter(
        (elisaWell): elisaWell is ElisaWell => !!elisaWell
    );
    const antigens = useSelector((state: RootState) => elisaWells.map(
        (elisaWell) => selectAntigen(elisaWell.antigen)(state)
    ));

    const nanobodies = useSelector((state: RootState) => elisaWells.map(
        (elisaWell) => selectNanobody(elisaWell.nanobody)(state)
    ));

    useEffect(() => {
        params.uuids.forEach(
            (uuid) => dispatch(getElisaWell(uuid))
        )
    }, [dispatch, params]);

    useEffect(() => {
        elisaWells.forEach(
            (elisaWell) => {
                dispatch(getAntigen(elisaWell.antigen));
                dispatch(getNanobody(elisaWell.nanobody));
            }
        )
    });

    return (
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
                        zip(elisaWells, antigens, nanobodies).map(([elisaWell, antigen, nanobody], idx) => (
                            <TableRow key={idx}>
                                <TableCell><LinkUUID rootURI="/elisa_well/" UUID={elisaWell.uuid} /></TableCell>
                                <TableCell>{locationToGrid(elisaWell.location)}</TableCell>
                                <TableCell>{antigen ? antigen.name : null}</TableCell>
                                <TableCell>{nanobody ? nanobody.name : null}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export function ElisaPlateInfo(params: { uuid: string }) {
    const dispatch = useDispatch();
    const elisaPlate = useSelector(
        params.uuid ? selectElisaPlate(params.uuid) : () => undefined
    );

    useEffect(() => {
        dispatch(getElisaPlate(params.uuid));
    }, [dispatch, params]);

    if (!elisaPlate) return null;
    return (
        <TableContainer>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Threshold:</TableCell>
                        <TableCell>{elisaPlate.threshold}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Wells:</TableCell>
                        <TableCell>
                            <ElisaPlateWellTable uuids={elisaPlate?.plate_elisa_wells} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Creation Time:</TableCell>
                        <TableCell>{elisaPlate.creation_time}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
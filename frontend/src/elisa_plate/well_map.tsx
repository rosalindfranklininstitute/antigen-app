import { Typography, Grid, Button, Paper, Popover, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAntigen, selectAntigen } from "../antigen/slice";
import { getElisaWell, selectElisaWell } from "../elisa_well/slice";
import { ElisaWell, locationToCoords } from "../elisa_well/utils";
import { getNanobody, selectNanobody } from "../nanobody/slice";
import { RootState } from "../store";

function uuidToColor(uuid: string) {
    const hue = Number("0x".concat(uuid.substring(0, 2)))
    return `hsl(${hue}, 50%, 50%)`;
}

function ElisaWellElement(params: { uuid: string | null }) {
    const dispatch = useDispatch();
    const elisaWell = useSelector(params.uuid ? selectElisaWell(params.uuid) : () => undefined);
    const antigen = useSelector(elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined);
    const nanobody = useSelector(elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined);

    useEffect(() => {
        if (params.uuid) dispatch(getElisaWell(params.uuid));
    }, [dispatch, params])

    useEffect(() => {
        if (elisaWell) {
            dispatch(getAntigen(elisaWell.antigen));
            dispatch(getNanobody(elisaWell.nanobody));
        }
    }, [dispatch, elisaWell])

    const antigenColor = antigen ? uuidToColor(antigen.uuid) : "white";
    const nanobodyColor = nanobody ? uuidToColor(nanobody.uuid) : "white";

    const [infoAnchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const InfoPopover = () => elisaWell ? (
        <Popover
            open={Boolean(infoAnchorEl)}
            anchorEl={infoAnchorEl}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "center",
            }}
            onClose={() => setAnchorEl(null)}
            sx={{ pointerEvents: "none" }}
        >
            <Stack alignItems="center">
                {antigen && <div>Antigen: {antigen.name}</div>}
                {nanobody && <div>Nanobody: {nanobody.name}</div>}
            </Stack>
        </Popover>
    ) : null

    return (
        <Paper
            sx={{
                background: `linear-gradient(90deg, ${antigenColor} 50%, ${nanobodyColor} 50%)`,
                borderRadius: "50%",
                overflow: "hidden",
            }}>
            <Button
                sx={{
                    width: "100%",
                    padding: "0 0 100% 0",
                }}
                onMouseEnter={(evt) => setAnchorEl(evt.currentTarget)}
                onMouseLeave={() => setAnchorEl(null)}
            />
            <InfoPopover />
        </Paper>
    )
};

export function ElisaWellMapElement(params: { uuids: string[] }) {
    const dispatch = useDispatch();
    const elisaWells = useSelector(
        (state: RootState) => params.uuids.map(
            (well) => selectElisaWell(well)(state)
        )
    ).filter((elisaWell): elisaWell is ElisaWell => !!elisaWell);

    useEffect(() => {
        params.uuids.forEach(
            (uuid) => dispatch(getElisaWell(uuid))
        )
    }, [dispatch, params])

    const elisaWellGrid: (ElisaWell | null)[][] = new Array(8).fill(undefined).map(
        (val, idx) => new Array(12).fill(null)
    );

    elisaWells.forEach((elisaWell) => {
        const [row, col] = locationToCoords(elisaWell.location);
        elisaWellGrid[row][col] = elisaWell;
    })

    return (
        <Grid container spacing={2} columns={13}>
            <Grid item xs={1} key={0} />
            {
                Array.from({ length: 12 }, (_, idx) => (
                    <Grid item xs={1} key={idx + 1}>
                        <Typography>{idx + 1}</Typography>
                    </Grid>
                ))
            }
            {
                elisaWellGrid.map((wellRow, row_idx) => {
                    return [
                        <Grid item xs={1} key={(row_idx + 1) * 13}>
                            <Typography>{String.fromCharCode(row_idx + 65)}</Typography>
                        </Grid>,
                        wellRow.map((elisaWell, col_idx) => (
                            <Grid item xs={1} key={(row_idx + 1) * 13 + col_idx}>
                                <ElisaWellElement uuid={elisaWell ? elisaWell.uuid : null} />
                            </Grid>
                        ))
                    ]
                })
            }
        </Grid>
    )
}
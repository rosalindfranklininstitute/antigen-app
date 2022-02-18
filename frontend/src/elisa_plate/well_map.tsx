import { Typography, Grid, Button, Paper, Popover, Stack, CardContent, Card, Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAntigen, getAntigens, selectAntigen, selectAntigens } from "../antigen/slice";
import { getElisaWell, selectElisaWell } from "../elisa_well/slice";
import { ElisaWell, locationToCoords } from "../elisa_well/utils";
import { getNanobodies, getNanobody, selectNanobodies, selectNanobody } from "../nanobody/slice";
import { RootState } from "../store";

function uuidToColor(uuid: string) {
    const hue = Number("0x".concat(uuid.substring(0, 2)))
    return `hsl(${hue}, 50%, 50%)`;
}

function ElisaWellEditPopover(params: { uuid: string, anchorEl: HTMLElement | null, setAnchorEl: (anchorEl: (HTMLElement | null)) => void }) {
    const dispatch = useDispatch();
    const elisaWell = useSelector(selectElisaWell(params.uuid));
    const antigens = useSelector(selectAntigens);
    const nanobodies = useSelector(selectNanobodies);

    useEffect(() => {
        dispatch(getElisaWell(params.uuid));
        dispatch(getAntigens());
        dispatch(getNanobodies());
    }, [dispatch, params])

    return (
        < Popover
            open={Boolean(params.anchorEl)}
            anchorEl={params.anchorEl}
            anchorOrigin={{
                vertical: "center",
                horizontal: "center",
            }}
            transformOrigin={{
                vertical: "center",
                horizontal: "center",
            }}
            onClose={() => params.setAnchorEl(null)}
        >
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Autocomplete
                            renderInput={(params) => <TextField {...params} label="Antigen" sx={{ width: "32ch" }} />}
                            options={antigens}
                            getOptionLabel={(antigen) => antigen.name}
                            defaultValue={antigens.find((antigen) => antigen.uuid === elisaWell?.antigen)}
                        />
                        <Autocomplete
                            renderInput={(params) => <TextField {...params} label="Nanobody" sx={{ width: "32ch" }} />}
                            options={nanobodies}
                            getOptionLabel={(nanobody) => nanobody.name}
                            defaultValue={nanobodies.find((nanobody) => nanobody.uuid === elisaWell?.nanobody)}
                        />
                    </Stack>
                </CardContent>
            </Card>
        </Popover >
    )
}

function ElisaWellInfoPopover(params: { uuid: string, anchorEl: HTMLElement | null, setAnchorEl: (anchorEl: (HTMLAnchorElement | null)) => void }) {
    const dispatch = useDispatch();
    const elisaWell = useSelector(selectElisaWell(params.uuid));
    const antigen = useSelector(elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined);
    const nanobody = useSelector(elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined);

    useEffect(() => {
        dispatch(getElisaWell(params.uuid));
    });

    useEffect(() => {
        if (elisaWell) {
            dispatch(getAntigen(elisaWell.antigen));
            dispatch(getNanobody(elisaWell.nanobody));
        }
    }, [dispatch, elisaWell]);

    return (
        <Popover
            open={Boolean(params.anchorEl)}
            anchorEl={params.anchorEl}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "center",
            }}
            onClose={() => params.setAnchorEl(null)}
            sx={{ pointerEvents: "none" }}
        >
            <Stack alignItems="center">
                {antigen && <div>Antigen: {antigen.name}</div>}
                {nanobody && <div>Nanobody: {nanobody.name}</div>}
            </Stack>
        </Popover>
    )
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

    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLElement | null>(null);
    const [editAnchorEl, setEditAnchorEl] = useState<HTMLElement | null>(null);

    const InfoPopover = () => params.uuid ? <ElisaWellInfoPopover uuid={params.uuid} anchorEl={infoAnchorEl} setAnchorEl={setInfoAnchorEl} /> : null
    const EditPopover = () => params.uuid ? <ElisaWellEditPopover uuid={params.uuid} anchorEl={editAnchorEl} setAnchorEl={setEditAnchorEl} /> : null;

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
                onMouseEnter={(evt) => setInfoAnchorEl(evt.currentTarget)}
                onMouseLeave={() => setInfoAnchorEl(null)}
                onClick={(evt) => {
                    setInfoAnchorEl(null);
                    setEditAnchorEl(evt.currentTarget);
                }}
            />
            <InfoPopover />
            <EditPopover />
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
        () => new Array(12).fill(null)
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
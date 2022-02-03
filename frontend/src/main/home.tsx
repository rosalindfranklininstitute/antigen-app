import { useNavigate } from 'react-router-dom';
import { Button, Card, CardActionArea, CardContent, Grid, SpeedDial, SpeedDialAction, Typography } from '@mui/material';
import AddLinkIcon from '@mui/icons-material/AddLink';
import CreateIcon from '@mui/icons-material/Create';

function AntigenCard() {
    const navigate = useNavigate();
    return (
        <Card>
            <CardActionArea onClick={() => navigate('antigens/')}>
                <CardContent>
                    <Typography variant="h5">Antigens</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

function NanobodyCard() {
    const navigate = useNavigate();
    return (
        <Card>
            <CardActionArea onClick={() => navigate('nanobodies/')}>
                <CardContent>
                    <Typography variant="h5">Nanobodies</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

function ElisaCard() {
    const navigate = useNavigate();
    return (
        <Card>
            <CardActionArea onClick={() => navigate('elisa_experiments/')}>
                <CardContent>
                    <Typography variant="h5">Elisa Experiments</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

function HomeView() {

    return (
        <Grid container spacing={2} alignItems="stretch">
            <Grid item><AntigenCard /></Grid>
            <Grid item><NanobodyCard /></Grid>
            <Grid item><ElisaCard /></Grid>
        </Grid>
    )
}

export { HomeView };

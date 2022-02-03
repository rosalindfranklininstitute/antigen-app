import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Grid, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddLinkIcon from '@mui/icons-material/AddLink';
import CreateIcon from '@mui/icons-material/Create';
import ListIcon from '@mui/icons-material/List';
import { useState, MouseEvent } from 'react';

function AntigenCard() {
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const add_open = Boolean(anchorEl);

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Antigens</Typography>
                <Button startIcon={<ListIcon />} onClick={() => navigate("/antigen/")}>View All</Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    aria-controls={add_open ? 'add-enu' : undefined}
                    aria-haspopup="true"
                    aria-aria-expanded={add_open ? 'true' : undefined}
                    onClick={(event: MouseEvent<HTMLButtonElement>) => { setAnchorEl(event.currentTarget) }}
                >
                    Add New
                </Button>
                <Menu
                    id="add-menu"
                    anchorEl={anchorEl}
                    open={add_open}
                    onClose={() => { setAnchorEl(null) }}
                    MenuListProps={{ 'aria-labelledby': 'add-button' }}
                >
                    <MenuItem onClick={() => navigate("/antigen/uniprot/add")}>
                        <ListItemIcon><AddLinkIcon /></ListItemIcon>
                        <ListItemText>From UniProt</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => navigate("/antigen/local/add")}>
                        <ListItemIcon><CreateIcon /></ListItemIcon>
                        <ListItemText>Manual Entry</ListItemText>
                    </MenuItem>
                </Menu>
            </CardContent>
        </Card >
    )
}

function NanobodyCard() {
    const navigate = useNavigate();
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Nanobodies</Typography>
                <Button startIcon={<ListIcon />} onClick={() => navigate("/nanobodies/")}>View All</Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/nanobodies/add/")}>Add New</Button>
            </CardContent>
        </Card>
    )
}

function ElisaCard() {
    const navigate = useNavigate();
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Elisa Experiments</Typography>
                <Button startIcon={<ListIcon />} onClick={() => navigate("/elisa_experiments/")}>View All</Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/elisa_experiments/add/")}>Add New</Button>
            </CardContent>
        </Card>
    )
}

function HomeView() {

    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid item><AntigenCard /></Grid>
            <Grid item><NanobodyCard /></Grid>
            <Grid item><ElisaCard /></Grid>
        </Grid>
    )
}

export { HomeView };
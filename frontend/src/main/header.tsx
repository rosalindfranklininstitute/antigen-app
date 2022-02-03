import { AppBar, Toolbar, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';

function Header(props: { logo: string, title: string }) {
    const navigate = useNavigate();
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} onClick={() => { navigate("/") }}>Antigen App</Typography>
            </Toolbar>
        </AppBar>
    );
};

export { Header };

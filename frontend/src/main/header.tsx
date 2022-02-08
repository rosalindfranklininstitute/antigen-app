import { AppBar, Link, Toolbar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function Header(props: { logo: string, title: string }) {
    return (
        <AppBar position="static">
            <Toolbar>
                <Link
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    color="textPrimary"
                    underline="none"
                >
                    Antigen App
                </Link>
            </Toolbar>
        </AppBar>
    );
};

export { Header };

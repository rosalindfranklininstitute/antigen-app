import { Link } from "react-router-dom";

function HomeView() {
    return (
        <div className="col-md-4">
            <Link to="/antigens/">Antigen List</Link>
        </div>
    )
}

export { HomeView };

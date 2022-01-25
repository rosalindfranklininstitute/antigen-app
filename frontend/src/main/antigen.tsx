import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Antigen = {
    uuid: string
    antigen_elisa_wells: Array<string>
};

function AntigenView() {
    let params = useParams();

    const [antigen, setAntigen] = useState<Antigen | null>(null);

    useEffect(() => {
        const fetchAntigen = async () => {
            const response = await fetch(`http://127.0.0.1:8000/api/antigen/${params.uuid}/?format=json`);
            if (response.ok) {
                const antigen: Antigen = await response.json();
                setAntigen(antigen);
            };
        };
        fetchAntigen();
    }, []);

    console.log(antigen);
    return (
        <table className="table">
            <tbody>
                <tr>
                    <td>UUID:</td>
                    <td>{antigen?.uuid}</td>
                </tr>
                <tr>
                    <td>Elisa Appearances:</td>
                    <td>{antigen?.antigen_elisa_wells}</td>
                </tr>
            </tbody>
        </table>
    )
};

function AntigensView() {
    const [antigens, setAntigens] = useState<Antigen[]>([]);

    useEffect(() => {
        const fetchAntigens = async () => {
            const response = await fetch("http://127.0.0.1:8000/api/antigen/?format=json");
            if (response.ok) {
                const antigens = await response.json();
                setAntigens(antigens);
            }
        };
        fetchAntigens();
    }, []);

    return (
        <table className="table">
            <thead>
                <tr>
                    <th scope="col">UUID</th>
                </tr>
            </thead>
            <tbody>
                {
                    antigens.map((e, i) => (
                        <tr key={i}>
                            <td><Link to={`/antigen/${e.uuid}`}>{e.uuid}</Link></td>
                        </tr>
                    )
                    )
                }
            </tbody>
        </table>
    )
};

export { AntigenView, AntigensView };

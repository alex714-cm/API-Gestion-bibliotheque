import TableHeader from "./TableHeader.jsx";
import TableRow from "./TableRow.jsx";

export default function DataTable({ columns, data }) {
    if (!data || data.length === 0) {
        return <div className="p-5 text-center text-muted">Aucune donnée trouvée.</div>;
    }

    return (
        <table className="table table-hover align-middle">
            <TableHeader columns={columns} />
            <tbody>
                {data.map((row, index) => (
                    <TableRow row={row} key={index} columns={columns} />
                ))}
            </tbody>
        </table>
    );
}
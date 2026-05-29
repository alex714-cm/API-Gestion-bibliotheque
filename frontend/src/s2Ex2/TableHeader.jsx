export default function TableHeader({ columns }) {
    return (
        <thead className="table-light">
            <tr>{columns.map((column, index) => (
                <th key={index} style={{ width: column.width }}>
                    {column.name}
                </th>
            ))}</tr>
        </thead>
    );
}
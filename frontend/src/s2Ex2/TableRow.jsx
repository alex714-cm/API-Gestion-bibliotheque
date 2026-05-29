import TableCell from "./TableCell.jsx";

export default function TableRow({ row, columns }) {
    return (
        <tr>
            {
                columns.map((column, index) => (
                    <TableCell key={index}>
                        {
                            // 1. Check "cell" (Icons, Buttons, Images)
                            column.cell 
                                ? column.cell(row) 
                                // 2. Check "selector" (row => row.titre)
                                : column.selector 
                                    ? column.selector(row)
                                    // 3. Check "render" (bach ybqa compatible m3a l'qdim)
                                    : column.render 
                                        ? column.render(row)
                                        // 4. Fallback l'column.name
                                        : row[column.name]
                        }
                    </TableCell>
                ))
            }
        </tr>
    );
}
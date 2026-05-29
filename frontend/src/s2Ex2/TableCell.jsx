export default function TableCell({ children }) {
    return (
        <td className="align-middle py-3"> {/* Zdt padding o vertical align */}
            {children}
        </td>
    )
}
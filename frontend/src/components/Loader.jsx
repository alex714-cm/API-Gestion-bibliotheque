

function Loader() {
    return <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="d-flex flex-column align-items-center gap-3">
            <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
            >
                <span className="visually-hidden">Loading...</span>
            </div>
            <span className="text-secondary" style={{ fontSize: 14 }}>
    Loading…
    </span>
        </div>
    </div>;
}
export default Loader;
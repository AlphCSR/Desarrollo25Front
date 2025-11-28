interface Seat {
    id: string;
    row: string;
    number: number;
    status: 'Available' | 'Locked' | 'Booked';
    sectionId?: string;
    price?: number;
    userId?: string; // ID del usuario que bloqueó el asiento
}

interface Props {
    seats: Seat[];
    onSeatClick: (seat: Seat) => void;
    selectedSeatIds: string[];
    currentUserId?: string;
}

export const SeatGrid = ({ seats, onSeatClick, selectedSeatIds, currentUserId }: Props) => {
    // Agrupar asientos por fila
    const rows = seats.reduce((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
    }, {} as Record<string, Seat[]>);

    // Ordenar filas y asientos
    const sortedRowKeys = Object.keys(rows).sort();

    return (
        <div className="flex flex-col gap-4 items-center overflow-x-auto p-4 bg-gray-50 rounded-xl border">
            <div className="w-full h-4 bg-gray-300 rounded-full mb-8 text-center text-xs text-gray-500">ESCENARIO</div>

            {sortedRowKeys.map(rowKey => (
                <div key={rowKey} className="flex gap-2 items-center">
                    <span className="w-6 text-center font-bold text-gray-400">{rowKey}</span>
                    {rows[rowKey].sort((a, b) => a.number - b.number).map(seat => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isAvailable = seat.status === 'Available';
                        // Permitir desbloquear si está Locked y es mi usuario
                        const isLockedByMe = seat.status === 'Locked' && seat.userId === currentUserId;

                        let colorClass = "bg-green-500 hover:bg-green-600 cursor-pointer"; // Libre
                        if (seat.status === 'Locked') {
                            colorClass = isLockedByMe
                                ? "bg-yellow-400 ring-2 ring-yellow-600 cursor-pointer" // Locked por mí (clickable)
                                : "bg-yellow-200 cursor-not-allowed"; // Locked por otro
                        }
                        if (seat.status === 'Booked') colorClass = "bg-gray-400 cursor-not-allowed"; // Vendido
                        if (isSelected) colorClass = "bg-blue-600 ring-2 ring-blue-300"; // Mi selección actual

                        const canClick = isAvailable || isSelected || isLockedByMe;

                        return (
                            <button
                                key={seat.id}
                                disabled={!canClick}
                                onClick={() => onSeatClick(seat)}
                                className={`w-8 h-8 rounded-t-lg text-xs text-white font-medium transition-all ${colorClass}`}
                                title={`Fila ${seat.row} - Asiento ${seat.number} (${seat.status})`}
                            >
                                {seat.number}
                            </button>
                        );
                    })}
                </div>
            ))}

            <div className="flex gap-4 mt-6 text-sm text-gray-600 flex-wrap justify-center">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded" /> Libre</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-200 rounded" /> Ocupado</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 ring-2 ring-yellow-600 rounded" /> Tu Bloqueo</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-400 rounded" /> Vendido</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded" /> Selección Actual</div>
            </div>
        </div>
    );
};
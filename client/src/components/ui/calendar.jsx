// client/src/components/ui/calendar.jsx
export const Calendar = ({ selected, onSelect }) => (
    <input
      type="date"
      value={selected.toISOString().split('T')[0]}
      onChange={e => onSelect(new Date(e.target.value))}
      className="border px-2 py-1 rounded"
    />
  );
  
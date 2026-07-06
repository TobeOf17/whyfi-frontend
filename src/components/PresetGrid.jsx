export default function PresetGrid({ presets, activePresetId, onSelect }) {
  if (!presets.length) {
    return <p className="empty-note">Loading presets…</p>;
  }

  return (
    <div className="preset-list">
      {presets.map((preset) => (
        <button
          key={preset.id}
          className={
            preset.id === activePresetId ? 'preset-card preset-card--active' : 'preset-card'
          }
          onClick={() => onSelect(preset)}
        >
          <p className="preset-card__title">{preset.title}</p>
          <p className="preset-card__hook">{preset.hook}</p>
        </button>
      ))}
    </div>
  );
}

const TABS = [
    { id: 'explore', label: 'Explore' },
    { id: 'learn', label: 'Learn' },
    { id: 'myplan', label: 'My Plan' }
];

export default function Nav({ activeTab, onChange }) {
    return (
        <nav className="nav">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    className={activeTab === tab.id ? 'nav__item nav__item--active' : 'nav__item'}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}
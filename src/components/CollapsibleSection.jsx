import { useState } from 'react';

export default function Collapsiblesection({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="collapsible">
            <button className="collapsible__trigger" onClick={() => setOpen(!open)}>
        <span className={open ? 'collapsible__chevron collapsible__chevron--open' : 'collapsible__chevron'}>
          &#9656;
        </span>
                {title}
            </button>
            <div className={open ? 'collapsible__body collapsible__body--open' : 'collapsible__body'}>
                <div className="collapsible__inner">{children}</div>
            </div>
        </div>
    );
}
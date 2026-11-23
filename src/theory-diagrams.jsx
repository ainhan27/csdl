import React from 'react';

export function TheoryDiagram({ diagram }) {
  const { title, steps, note, flow = true } = diagram;
  const List = flow ? 'ol' : 'ul';
  return <figure className="theory-diagram">
    <figcaption>{title}</figcaption>
    <List className={'diagram-steps' + (flow ? ' flow' : '')} role="list">
      {steps.map(([label, detail], index) => <li key={label}>
        {flow && <span className="diagram-step-marker" aria-hidden="true">{index + 1}</span>}
        <div><strong>{label}</strong><span>{detail}</span></div>
      </li>)}
    </List>
    <p>{note}</p>
  </figure>;
}

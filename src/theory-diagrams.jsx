import React from 'react';

export function TheoryDiagram({ diagram }) {
  const { title, steps, note, flow = true } = diagram;
  const List = flow ? 'ol' : 'ul';
  return <figure className="theory-diagram">
    <figcaption>{title}</figcaption>
    <List className={'diagram-steps' + (flow ? ' flow' : '')} role="list">
      {steps.map(([label, detail]) => <li key={label}><strong>{label}</strong><span>{detail}</span></li>)}
    </List>
    <p>{note}</p>
  </figure>;
}

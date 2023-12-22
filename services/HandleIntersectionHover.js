export function handleIntersectionHover(event, ghostPiece) {
    const x = event.target.cx.baseVal.value;
    const y = event.target.cy.baseVal.value;

    ghostPiece.setAttribute('cx', x);
    ghostPiece.setAttribute('cy', y);
    ghostPiece.setAttribute('visibility', 'visible');
}

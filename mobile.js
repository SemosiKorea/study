// The original table stays intact; the narrow layout repeats its column labels.
document.addEventListener('DOMContentLoaded', () => {
  for (const table of document.querySelectorAll('table')) {
    const rows = [...table.rows];
    const heading = table.tHead?.rows[0] || rows[0];
    if (!heading || heading.cells.length < 2 || ![...heading.cells].every(cell => cell.tagName === 'TH')) continue;
    if (rows.some(row => [...row.cells].some(cell => cell.colSpan > 1 || cell.rowSpan > 1))) continue;
    const labels = [...heading.cells].map(cell => cell.textContent.trim());
    table.classList.add('mobile-table');
    table.setAttribute('role', 'table');
    heading.classList.add('mobile-table-heading');
    for (const group of table.querySelectorAll('thead, tbody, tfoot')) group.setAttribute('role', 'rowgroup');
    for (const row of rows) {
      row.setAttribute('role', 'row');
      [...row.cells].forEach((cell, index) => {
        if (row === heading) {
          cell.scope = 'col';
          cell.setAttribute('role', 'columnheader');
        } else {
          cell.dataset.columnLabel = labels[index] || '';
          if (cell.textContent.trim().length > 36) cell.classList.add('mobile-table-prose');
          cell.setAttribute('role', cell.tagName === 'TH' ? 'rowheader' : 'cell');
          if (cell.tagName === 'TH') cell.scope = 'row';
        }
      });
    }
  }
});

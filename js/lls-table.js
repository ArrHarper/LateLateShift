// Unified LLS table behavior: column sorting + mobile row expansion.
// Applies to tables rendered by the llsTable macro (lls-table.css for styles).

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.lls-table--sortable').forEach(initSort);
  document.querySelectorAll('.lls-table--collapsible').forEach(initCollapse);

  // Returns [{row, detail}] pairs so detail rows travel with their parent on sort
  function rowPairs(tbody) {
    return Array.from(tbody.querySelectorAll('tr.lls-row')).map(function (row) {
      var next = row.nextElementSibling;
      return { row: row, detail: next && next.classList.contains('lls-detail') ? next : null };
    });
  }

  function cellValue(row, col, type) {
    var text = row.children[col].textContent.trim();
    if (type === 'num') {
      var n = parseFloat(text.replace(/[^\d.-]/g, ''));
      return isNaN(n) ? null : n; // null (e.g. "n/a") always sorts to bottom
    }
    return text.toLowerCase();
  }

  function initSort(table) {
    var tbody = table.querySelector('tbody');
    table.querySelectorAll('th[data-sort-type]').forEach(function (th, index) {
      th.addEventListener('click', function () {
        var type = th.dataset.sortType;
        var asc = !th.classList.contains('lls-sort-asc');
        var pairs = rowPairs(tbody);

        pairs.sort(function (a, b) {
          var av = cellValue(a.row, index, type);
          var bv = cellValue(b.row, index, type);
          if (av === null && bv === null) return 0;
          if (av === null) return 1;
          if (bv === null) return -1;
          var cmp = type === 'num' ? av - bv : av.localeCompare(bv);
          return asc ? cmp : -cmp;
        });

        pairs.forEach(function (pair, i) {
          pair.row.classList.toggle('lls-row--alt', i % 2 === 1);
          tbody.appendChild(pair.row);
          if (pair.detail) tbody.appendChild(pair.detail);
        });

        table.querySelectorAll('th[data-sort-type]').forEach(function (h) {
          h.classList.remove('lls-sorted', 'lls-sort-asc', 'lls-sort-desc');
          h.removeAttribute('aria-sort');
          var arrow = h.querySelector('.lls-arrow');
          if (arrow) arrow.textContent = '';
        });
        th.classList.add('lls-sorted', asc ? 'lls-sort-asc' : 'lls-sort-desc');
        th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
        var arrow = th.querySelector('.lls-arrow');
        if (arrow) arrow.textContent = asc ? '▲' : '▼';
      });
    });
  }

  function initCollapse(table) {
    table.querySelectorAll('tr.lls-row').forEach(function (row) {
      row.addEventListener('click', function () {
        var next = row.nextElementSibling;
        if (!next || !next.classList.contains('lls-detail')) return;
        row.classList.toggle('lls-open');
        next.classList.toggle('lls-open');
      });
    });
  }
});

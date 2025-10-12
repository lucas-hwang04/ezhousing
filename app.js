// Simple Expense Tracker - No frameworks, localStorage persistence
(function(){
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));

  const categories = {
    income: ["Salary","Business","Investments","Gifts","Other"],
    expense: ["Bills","Food","Shopping","Travel","Entertainment","Healthcare","Other"],
  };

  const STORAGE_KEY = 'tx.v1';
  let transactions = load();

  function load(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch{ return []; }
  }
  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  function today(){
    const d = new Date();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function formatMoney(n){
    return new Intl.NumberFormat(undefined, { style:'currency', currency:'USD'}).format(n || 0);
  }

  function renderCategories(){
    const type = $('#type').value;
    const catEl = $('#category');
    catEl.innerHTML = '';
    for(const c of categories[type]){
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c; catEl.appendChild(opt);
    }
  }

  function compute(){
    const income = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount||0),0);
    const expense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount||0),0);
    return { income, expense, balance: income - expense };
  }

  function renderSummary(){
    const {income, expense, balance} = compute();
    $('#sum-income').textContent = formatMoney(income);
    $('#sum-expense').textContent = formatMoney(expense);
    $('#sum-balance').textContent = formatMoney(balance);
  }

  function matchesQuery(t, q){
    if(!q) return true;
    q = q.toLowerCase();
    return (
      (t.note && t.note.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  }

  function renderList(){
    const list = $('#tx-list');
    const q = $('#search').value.trim();
    list.innerHTML = '';
    const items = transactions
      .slice().sort((a,b)=>new Date(b.date)-new Date(a.date))
      .filter(t=>matchesQuery(t, q));

    $('#empty').style.display = items.length ? 'none' : 'block';

    for(const t of items){
      const li = document.createElement('li');
      li.className = 'tx-item';

      const left = document.createElement('div');
      left.className = 'tx-meta';
      const title = document.createElement('div');
      title.className = 'tx-title';
      title.textContent = t.note || t.category;
      const sub = document.createElement('div');
      sub.className = 'tx-sub';
      sub.textContent = `${t.category} • ${t.date}`;
      left.appendChild(title); left.appendChild(sub);

      const right = document.createElement('div');
      right.className = 'actions';
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = t.type;
      const amt = document.createElement('div');
      amt.className = 'tx-amt';
      amt.style.color = t.type==='income' ? 'var(--accent)' : 'var(--danger)';
      const sign = t.type==='income' ? '+' : '-';
      amt.textContent = `${sign}${formatMoney(Math.abs(Number(t.amount)||0)).replace('$','')}`;
      const del = document.createElement('button');
      del.className = 'btn danger';
      del.textContent = 'Delete';
      del.addEventListener('click', () => removeTx(t.id));

      // Edit button
      const edit = document.createElement('button');
      edit.className = 'btn';
      edit.textContent = 'Edit';
      edit.addEventListener('click', () => editTx(t.id));

      right.appendChild(badge); right.appendChild(amt); right.appendChild(edit); right.appendChild(del);

      li.appendChild(left); li.appendChild(right);
      list.appendChild(li);
    }
  }
  // Export CSV
  function exportCSV(){
    const header = ['Type','Category','Amount','Date','Note'];
    const rows = transactions.map(t=>[
      t.type,t.category,t.amount,t.date,t.note||''
    ]);
    let csv = [header].concat(rows).map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  }

  $('#export-csv').addEventListener('click', exportCSV);

  // Edit transaction
  let editingId = null;
  function editTx(id){
    const tx = transactions.find(t=>t.id===id);
    if(!tx) return;
    editingId = id;
    $('#type').value = tx.type;
    renderCategories();
    $('#category').value = tx.category;
    $('#amount').value = tx.amount;
    $('#date').value = tx.date;
    $('#note').value = tx.note||'';
    $('#tx-form button[type="submit"]').textContent = 'Update';
  }

  function addTx(e){
    e.preventDefault();
    const type = $('#type').value;
    const category = $('#category').value;
    const amount = parseFloat($('#amount').value);
    const date = $('#date').value || today();
    const note = $('#note').value.trim();

    if(!type || !category || !isFinite(amount) || amount <= 0){
      alert('Please provide a valid type, category and amount > 0.');
      return;
    }

    if(editingId){
      // Update existing
      const idx = transactions.findIndex(t=>t.id===editingId);
      if(idx>-1){
        transactions[idx] = { ...transactions[idx], type, category, amount, date, note };
        save();
        editingId = null;
        $('#tx-form button[type="submit"]').textContent = 'Add';
        $('#amount').value = '';
        $('#note').value = '';
        renderSummary();
        renderList();
        renderInsights();
        return;
      }
    }

    // Add new
    const tx = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      type, category, amount, date, note
    };
    transactions.push(tx);
    save();

    // reset inputs
    $('#amount').value = '';
    $('#note').value = '';

    renderSummary();
    renderList();
    renderInsights();
  }

  function removeTx(id){
    transactions = transactions.filter(t=>t.id!==id);
    save();
    renderSummary();
    renderList();
    renderInsights();
  }


  function init(){
    // seed UI
    $('#date').value = today();
    renderCategories();
    renderSummary();
    renderList();
    renderInsights();

    // events
    $('#type').addEventListener('change', renderCategories);
    $('#tx-form').addEventListener('submit', addTx);
    $('#search').addEventListener('input', ()=>{ renderList(); renderInsights(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

// Insights (charts & KPIs)
(function(){
  let catChart, monthChart;
  const $ = (s, p=document) => p.querySelector(s);

  function monthKey(d){
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
  }

  function thisMonthRange(){
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
    return [start, end];
  }

  function within(d, start, end){
    const x = new Date(d);
    return x >= start && x <= end;
  }

  function computeKPIs(data){
    const [start, end] = thisMonthRange();
    const thisMonth = data.filter(t=>within(t.date, start, end));
    const count = thisMonth.length;
    const expenses = thisMonth.filter(t=>t.type==='expense');
    const avg = expenses.length ? expenses.reduce((s,t)=>s+Number(t.amount||0),0)/expenses.length : 0;
    const byCat = new Map();
    for(const t of expenses){
      byCat.set(t.category, (byCat.get(t.category)||0) + Number(t.amount||0));
    }
    let topCat = '—', topVal = 0;
    for(const [k,v] of byCat){ if(v>topVal){ topVal=v; topCat=k; } }
    return {count, avg, topCat};
  }

  function computeCategorySeries(data){
    const [start, end] = thisMonthRange();
    const expenses = data.filter(t=>t.type==='expense' && within(t.date, start, end));
    const byCat = new Map();
    for(const t of expenses){
      byCat.set(t.category, (byCat.get(t.category)||0) + Number(t.amount||0));
    }
    const labels = Array.from(byCat.keys());
    const values = labels.map(l=>byCat.get(l));
    return { labels, values };
  }

  function computeMonthlySeries(data){
    // last 6 months including current
    const now = new Date();
    const months = [];
    for(let i=5;i>=0;i--){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    const incomeMap = new Map(months.map(m=>[m,0]));
    const expenseMap = new Map(months.map(m=>[m,0]));
    for(const t of data){
      const key = monthKey(t.date);
      if(!incomeMap.has(key)) continue;
      if(t.type==='income') incomeMap.set(key, incomeMap.get(key)+Number(t.amount||0));
      else if(t.type==='expense') expenseMap.set(key, expenseMap.get(key)+Number(t.amount||0));
    }
    return {
      labels: months,
      income: months.map(m=>incomeMap.get(m)),
      expense: months.map(m=>expenseMap.get(m))
    };
  }

  function formatMoney(n){
    return new Intl.NumberFormat(undefined, { style:'currency', currency:'USD'}).format(n || 0);
  }

  function ensureCharts(){
    const ctx1 = $('#catChart');
    const ctx2 = $('#monthChart');
    return { ctx1, ctx2 };
  }

  window.renderInsights = function renderInsights(){
    if(!window.Chart) return; // Chart.js not yet loaded
    const data = (function(){
      try{ return JSON.parse(localStorage.getItem('tx.v1')) || []; } catch { return []; }
    })();

    // KPIs
    const k = computeKPIs(data);
    $('#kpi-count').textContent = String(k.count);
    $('#kpi-topcat').textContent = k.topCat || '—';
    $('#kpi-avg').textContent = formatMoney(k.avg);

    const { ctx1, ctx2 } = ensureCharts();
    if(!ctx1 || !ctx2) return;

    // Category pie (expenses this month)
    const cat = computeCategorySeries(data);
    const pieData = {
      labels: cat.labels,
      datasets: [{
        data: cat.values,
        backgroundColor: [
          '#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#22c55e','#14b8a6','#eab308'
        ],
        borderColor: '#0b1220'
      }]
    };
    if(catChart){ catChart.destroy(); }
    catChart = new Chart(ctx1, {
      type: 'pie',
      data: pieData,
      options: { plugins:{ legend:{ labels:{ color:'#e5e7eb' } } } }
    });

    // Monthly line (last 6 months)
    const m = computeMonthlySeries(data);
    const lineData = {
      labels: m.labels,
      datasets: [
        { label:'Income', data: m.income, borderColor:'#22c55e', backgroundColor:'rgba(34,197,94,.2)' },
        { label:'Expense', data: m.expense, borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.2)' }
      ]
    };
    if(monthChart){ monthChart.destroy(); }
    monthChart = new Chart(ctx2, {
      type: 'line',
      data: lineData,
      options: {
        responsive: true,
        plugins: { legend: { labels: { color:'#e5e7eb' } } },
        scales: {
          x: { ticks: { color:'#9ca3af' }, grid: { color:'#1f2937' } },
          y: { ticks: { color:'#9ca3af' }, grid: { color:'#1f2937' } }
        }
      }
    });
  }
})();

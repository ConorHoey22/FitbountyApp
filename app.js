(function(){
	const STORAGE_KEY = 'weight-tracker:entries:v1';
	const POUNDS_PER_KG = 2.20462262185;

	function toKg(value, unit){
		return unit === 'lbs' ? value / POUNDS_PER_KG : value;
	}
	function fromKg(valueKg, unit){
		return unit === 'lbs' ? valueKg * POUNDS_PER_KG : valueKg;
	}
	function round1(n){
		return Math.round(n * 10) / 10;
	}

	function loadEntries(){
		try{
			const raw = localStorage.getItem(STORAGE_KEY);
			if(!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		}catch(e){
			console.error('Failed to load entries', e);
			return [];
		}
	}
	function saveEntries(entries){
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	}

	function upsertEntry(entries, dateISO, weightKg){
		const idx = entries.findIndex(e => e.date === dateISO);
		if(idx >= 0){
			entries[idx].weightKg = weightKg;
		}else{
			entries.push({date: dateISO, weightKg});
		}
		entries.sort((a,b)=> a.date.localeCompare(b.date));
		return entries;
	}

	function getWeekKey(date){
		const d = new Date(date);
		const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		const day = utc.getUTCDay();
		const diffToMonday = (day + 6) % 7; // 0 for Monday
		const monday = new Date(utc);
		monday.setUTCDate(utc.getUTCDate() - diffToMonday);
		const year = monday.getUTCFullYear();
		const firstJan = new Date(Date.UTC(year,0,1));
		const days = Math.floor((monday - firstJan) / 86400000);
		const week = Math.floor(days / 7) + 1;
		const weekStr = String(week).padStart(2,'0');
		return `${year}-W${weekStr}`;
	}

	function computeWeeklyAverages(entries){
		const map = new Map();
		for(const e of entries){
			const wk = getWeekKey(e.date);
			if(!map.has(wk)) map.set(wk, []);
			map.get(wk).push(e.weightKg);
		}
		const result = [];
		for(const [wk, arr] of map.entries()){
			const avg = arr.reduce((a,b)=>a+b,0)/arr.length;
			result.push({ week: wk, avgKg: avg });
		}
		result.sort((a,b)=> a.week.localeCompare(b.week));
		return result;
	}

	function formatDate(d){
		return new Date(d).toISOString().slice(0,10);
	}

	const els = {
		form: document.getElementById('entry-form'),
		date: document.getElementById('entry-date'),
		weight: document.getElementById('entry-weight'),
		unit: document.getElementById('entry-unit'),
		entries: document.getElementById('entries'),
		clearAll: document.getElementById('clear-all'),
		displayUnit: document.getElementById('display-unit'),
		chartCanvas: document.getElementById('weeklyChart')
	};

	let entries = loadEntries();
	let chart;

	function renderEntries(){
		els.entries.innerHTML = '';
		if(entries.length === 0){
			const empty = document.createElement('div');
			empty.className = 'empty';
			empty.textContent = 'No entries yet.';
			els.entries.appendChild(empty);
			return;
		}
		for(const e of entries){
			const li = document.createElement('li');
			const left = document.createElement('div');
			const right = document.createElement('div');
			const del = document.createElement('button');

			left.innerHTML = `<div><span class="pill">${formatDate(e.date)}</span></div><div class="muted">${round1(fromKg(e.weightKg, els.displayUnit.value))} ${els.displayUnit.value}</div>`;
			del.textContent = 'Delete';
			del.className = 'danger';
			del.addEventListener('click', ()=>{
				entries = entries.filter(x => x.date !== e.date);
				saveEntries(entries);
				renderEntries();
				renderChart();
			});

			right.appendChild(del);
			li.appendChild(left);
			li.appendChild(right);
			els.entries.appendChild(li);
		}
	}

	function renderChart(){
		const weekly = computeWeeklyAverages(entries);
		const labels = weekly.map(w => w.week);
		const unit = els.displayUnit.value;
		const data = weekly.map(w => round1(fromKg(w.avgKg, unit)));
		const color = unit === 'kg' ? '#60a5fa' : '#facc15';

		if(chart){
			chart.data.labels = labels;
			chart.data.datasets[0].data = data;
			chart.data.datasets[0].label = `Weekly average (${unit})`;
			chart.data.datasets[0].borderColor = color;
			chart.update();
			return;
		}
		chart = new Chart(els.chartCanvas, {
			type: 'line',
			data: {
				labels,
				datasets: [{
					label: `Weekly average (${unit})`,
					data,
					borderColor: color,
					backgroundColor: 'rgba(96,165,250,0.15)',
					tension: 0.25,
					fill: true,
					pointRadius: 3
				}]
			},
			options: {
				plugins: {
					legend: { display: true, labels: { color: '#cbd5e1' } }
				},
				scales: {
					x: { ticks: { color: '#94a3b8' }, grid: { color: '#1f2937' } },
					y: { ticks: { color: '#94a3b8' }, grid: { color: '#1f2937' } }
				}
			}
		});
	}

	els.form.addEventListener('submit', (e)=>{
		e.preventDefault();
		const date = els.date.value || formatDate(new Date());
		const weight = parseFloat(els.weight.value);
		const unit = els.unit.value;
		if(!isFinite(weight) || weight <= 0){
			alert('Please enter a valid weight');
			return;
		}
		const weightKg = toKg(weight, unit);
		entries = upsertEntry(entries, date, weightKg);
		saveEntries(entries);
		els.weight.value = '';
		renderEntries();
		renderChart();
	});

	els.clearAll.addEventListener('click', ()=>{
		if(confirm('Delete all entries?')){
			entries = [];
			saveEntries(entries);
			renderEntries();
			renderChart();
		}
	});

	els.displayUnit.addEventListener('change', ()=>{
		renderEntries();
		renderChart();
	});

	// Initialize defaults
	els.date.value = formatDate(new Date());
	renderEntries();
	renderChart();
})();
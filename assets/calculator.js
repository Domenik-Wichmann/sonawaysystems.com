(() => {
  'use strict';
  const root = document.getElementById('reclaim-calculator');
  if (!root) return;
  const defaults = {staff:40, questions:4, minutes:2, resolution:50, rate:25};
  const values = {...defaults};
  const currency = document.getElementById('calc-currency');
  const number = new Intl.NumberFormat('en', {maximumFractionDigits:1});
  const setText = (id, value) => { document.getElementById(id).textContent = value; };
  function dailyTime(hours) {
    const minutes = hours * 60;
    if (minutes < 1) return number.format(minutes) + ' min';
    const rounded = Math.round(minutes);
    const h = Math.floor(rounded / 60), m = rounded % 60;
    return h ? number.format(h) + ' hr' + (m ? ' ' + m + ' min' : '') : m + ' min';
  }
  function render() {
    const questions = values.staff * values.questions;
    const handled = questions * values.resolution / 100;
    const daily = handled * values.minutes / 60;
    const monthly = daily * 30, yearly = monthly * 12;
    const remaining = (questions - handled) * values.minutes * 30 / 60;
    const money = new Intl.NumberFormat('en', {style:'currency', currency:currency.value, maximumFractionDigits:0});
    setText('calc-daily-time', dailyTime(daily));
    setText('calc-month-hours', number.format(monthly));
    setText('calc-year-hours', number.format(yearly));
    setText('calc-month-value', money.format(monthly * values.rate));
    setText('calc-year-value', money.format(yearly * values.rate));
    setText('calc-shifts', number.format(monthly / 8));
    setText('calc-reclaimed-label', number.format(monthly) + ' hours');
    setText('calc-remaining', number.format(remaining) + ' hours');
    setText('calc-breakdown', number.format(values.staff) + ' staff × ' + number.format(values.questions) + ' questions = ' + number.format(questions) + ' questions a day. At ' + values.resolution + '% handled automatically, ' + number.format(handled) + ' answers a day free up ' + number.format(values.minutes) + ' minutes each.');
    document.getElementById('calc-bar-reclaimed').style.width = (monthly + remaining > 0 ? values.resolution : 0) + '%';
  }
  function paint(key) {
    const input = document.getElementById('calc-' + key);
    const range = document.getElementById('calc-' + key + '-range');
    range.value = values[key];
    range.style.setProperty('--fill', (values[key] - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100 + '%');
  }
  function sync(key) {
    document.getElementById('calc-' + key).value = values[key];
    document.getElementById('calc-' + key).removeAttribute('aria-invalid');
    paint(key);
  }
  for (const key of Object.keys(defaults)) {
    const input = document.getElementById('calc-' + key);
    const range = document.getElementById('calc-' + key + '-range');
    input.addEventListener('input', () => {
      if (!input.validity.valid || !Number.isFinite(input.valueAsNumber)) {
        input.setAttribute('aria-invalid', 'true');
        return;
      }
      values[key] = input.valueAsNumber;
      input.removeAttribute('aria-invalid');
      paint(key);
      render();
    });
    input.addEventListener('blur', () => {
      const value = input.valueAsNumber;
      if (Number.isFinite(value)) {
        const min = Number(input.min), max = Number(input.max), step = Number(input.step);
        values[key] = Math.min(max, Math.max(min, min + Math.round((value - min) / step) * step));
      }
      sync(key);
      render();
    });
    range.addEventListener('input', () => { values[key] = Number(range.value); sync(key); render(); });
    sync(key);
  }
  currency.addEventListener('change', render);
  document.getElementById('calc-reset').addEventListener('click', () => {
    Object.assign(values, defaults);
    Object.keys(defaults).forEach(sync);
    currency.value = 'USD';
    render();
  });
  render();
  root.hidden = false;
})();


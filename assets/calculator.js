(() => {
 'use strict';
 const root=document.getElementById('reclaim-calculator');
 if(!root)return;
 const defaults={staff:40,questions:4,minutes:2,rate:25};
 const values={...defaults};
 const currency=document.getElementById('calc-currency');
 const number=new Intl.NumberFormat('en',{maximumFractionDigits:1});
 const setText=(id,value)=>{document.getElementById(id).textContent=value;};
 function render(){
  const monthly=values.staff*values.questions*values.minutes/60*30;
  const yearly=monthly*12;
  const money=new Intl.NumberFormat('en',{style:'currency',currency:currency.value,maximumFractionDigits:0});
  setText('calc-month-hours',number.format(monthly));
  setText('calc-year-hours',number.format(yearly));
  setText('calc-month-value',money.format(monthly*values.rate));
  setText('calc-year-value',money.format(yearly*values.rate));
  setText('calc-shifts',number.format(monthly/8));
 }
 function sync(key){
  const input=document.getElementById('calc-'+key);
  const range=document.getElementById('calc-'+key+'-range');
  input.value=values[key];range.value=values[key];input.removeAttribute('aria-invalid');
  range.style.setProperty('--fill',(values[key]-Number(input.min))/(Number(input.max)-Number(input.min))*100+'%');
 }
 for(const key of Object.keys(defaults)){
  const input=document.getElementById('calc-'+key);
  const range=document.getElementById('calc-'+key+'-range');
  input.addEventListener('input',()=>{
   if(!input.validity.valid||!Number.isFinite(input.valueAsNumber)){input.setAttribute('aria-invalid','true');return;}
   values[key]=input.valueAsNumber;range.value=values[key];input.removeAttribute('aria-invalid');
   range.style.setProperty('--fill',values[key]/Number(input.max)*100+'%');render();
  });
  input.addEventListener('blur',()=>{
   if(Number.isFinite(input.valueAsNumber)){
    const min=Number(input.min),max=Number(input.max),step=Number(input.step);
    values[key]=Math.min(max,Math.max(min,min+Math.round((input.valueAsNumber-min)/step)*step));
   }
   sync(key);render();
  });
  range.addEventListener('input',()=>{values[key]=Number(range.value);sync(key);render();});
  sync(key);
 }
 currency.addEventListener('change',render);
 document.getElementById('calc-reset').addEventListener('click',()=>{
  Object.assign(values,defaults);Object.keys(defaults).forEach(sync);currency.value='USD';render();
 });
 render();root.hidden=false;
})();

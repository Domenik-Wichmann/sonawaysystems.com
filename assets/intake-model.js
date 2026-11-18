/* Scripted hospitality intake: each choice changes the reviewed plan. No AI or backend calls. */
(function(root){
 'use strict';
 const properties={
  lakeside:{label:"East Facility",venues:[['main',"Main dispatch desk",'7–10 AM'],['terrace',"Collection desk",'7–10:30 AM'],['spa',"Priority desk",'8–11 AM']]},
  garden:{label:"Central Workshop",venues:[['garden',"Central Dispatch",'7–10 AM'],['courtyard',"Trade collection",'7–11 AM'],['lobby',"Customer desk",'8–11 AM']]},
  alpine:{label:"Packing Division",venues:[['lodgeA',"Line A Dispatch desk",'6:30–10 AM'],['lodgeB',"Line B Dispatch desk",'6:30–10 AM'],['summit',"Export dispatch desk",'7–10 AM']]}
 };
 const keys=['property','venue','change','detail','period','scope','owner'];
 const labels=["Site","Work area",'Change','Exact detail','When','Who / alternative','Approver'];
 const option=(id,label,note='')=>({id,label,note});
 function venue(a){return properties[a.property]?.venues.find(v=>v[0]===a.venue);}
 function step(a,index){
  const p=properties[a.property],v=venue(a);
  switch(index){
   case 0:return {question:"Which site is changing dispatch?",hint:"I found three sites with separate dispatch guidance.",status:'Matching site records…',options:Object.entries(properties).map(([id,p])=>option(id,p.label,"Explore its work areas"))};
   case 1:return {question:`Where at ${p.label}?`,hint:"Each venue has its own dispatch procedure. We’ll leave the others alone.",status:"Finding work areas and their source policies…",options:p.venues.map(v=>option(v[0],v[1],`Current dispatch: ${v[2]}`))};
   case 2:return {question:'What is actually changing?',hint:`Let’s narrow down the change to ${v[1]}.`,status:"Checking the current dispatch procedure…",options:[option('hours','Change the opening time','Keep the venue and closing time'),option('private','Reserve capacity for a priority batch',"Arrange an alternative for other customers"),option('move',"Move dispatch somewhere else",'Keep the current service hours')]};
   case 3:
    if(a.change==='hours')return {question:"What time should dispatch start?",hint:`It currently runs ${v[2]}. The closing time stays the same.`,status:'Comparing the proposed service times…',options:[option('06:00','6 AM','An earlier start'),option('08:00','8 AM','A later start'),option('09:00','9 AM','A shorter morning service')]};
    if(a.change==='private')return {question:'Who is the priority run for?',hint:'This determines whose access instructions need to change.',status:'Matching the event and access instructions…',options:[option('wedding',"A priority batch","Private dispatch for priority customers"),option('conference',"A trade customer group","Reserved dispatch for trade customers")]};
    return {question:"Where will dispatch move to?",hint:"Choose another work area at the same site.",status:'Checking alternative venues…',options:p.venues.filter(x=>x[0]!==a.venue).map(x=>option(x[0],x[1],"Use this venue for the affected dispatch service"))};
   case 4:return {question:'When should this apply?',hint:a.change==='private'?'The reservation applies only on its approved event date.':'A temporary change should not replace the normal year-round procedure.',status:'Checking the dates and normal-policy fallback…',options:a.change==='private'?[option('dec18','December 18 only',"One approved priority-order date"),option('dec25','December 25 only',"A year-end peak date"),option('apr16','April 16 only','A stocktake date')]:[option('dec18','December 18 only','Return to normal the next day'),option('christmas','December 24–30',"Year-end peak, then return to normal"),option('ongoing','From December 1 onward','No scheduled end date')]};
   case 5:
    if(a.change==='private'){const alternative=p.venues.find(x=>x[0]!==a.venue);return {question:"What should other customers do?",hint:"Closing access is only half the instruction. Customers also need a clear alternative.",status:"Tracing the customer notice and service handoff…",options:[option('alternative',`Dispatch at ${alternative[1]}`,`Keep their collection entitlement; use ${v[2]}`),option('room',"Use included delivery support",`Offer scheduled delivery during ${v[2]}`)]};}
    return {question:'Who does the change apply to?',hint:'The audience changes both the published notice and the staff instructions.',status:"Matching the affected customer and staff guidance…",options:[option('all',"All customers",'One arrangement for everyone'),option('event',"Priority customers only","Other customers keep their normal arrangements")]};
   case 6:return {question:'Who should approve this change?',hint:'We now have a specific draft. Choose who is responsible for reviewing it.',status:'Preparing the impact summary for review…',options:[option('fb',"Dispatch manager","Review dispatch capacity and service procedures"),option('duty','Duty manager',"Review customer arrangements and the operational handoff")]};
   default:return null;
  }
 }
 function selectedLabel(a,index){return step(a,index)?.options.find(o=>o.id===a[keys[index]])?.label||'';}
 function validate(a){return keys.every((key,index)=>Boolean(step(a,index)?.options.some(o=>o.id===a[key])));}
 function plan(a){
  if(!validate(a))throw new Error('Complete all intake choices before approval');
  const p=properties[a.property],v=venue(a),detail=selectedLabel(a,3),when=selectedLabel(a,4),owner=selectedLabel(a,6);
  const period={dec18:'December 18, 2026',dec25:'December 25, 2026',apr16:'April 16, 2026',christmas:'December 24–30, 2026',ongoing:'December 1, 2026 onward'}[a.period];
  const fallback=a.period==='ongoing'?'Remains in effect until an approved replacement.':'The normal procedure returns after the approved period.';
  const baseline=`${v[1]} · ${v[2]} · all customers`;
  let after,guest,staff;
  if(a.change==='hours'){
   const scope=a.scope==='all'?"All customers":"Priority customers";
   const closing=v[2].split('–')[1];
   after=`${detail} start · ${scope.toLowerCase()}`;
   guest=`${scope}: dispatch at ${v[1]} starts at ${detail} and closes at ${closing} for ${period}.${a.scope==='event'?" Other customers keep their normal dispatch arrangement.":''}`;
   staff=`Prepare ${v[1]} for the ${detail} opening, with the existing ${closing} close. Update the opening checklist and brief dispatch desk.${a.scope==='event'?" Apply the change only to priority customers; retain normal guidance for everyone else.":''}`;
  }else if(a.change==='private'){
   const party=a.detail==='wedding'?"priority batch":"trade customer group";
   const alternative=p.venues.find(x=>x[0]!==a.venue);
   const destination=a.scope==='room'?"included scheduled delivery support":`dispatch at ${alternative[1]}`;
   after=`Private ${party} · alternative arranged`;
   guest=`${v[1]} is reserved for a ${party} on ${period}. Other customers can use ${destination} during ${v[2]}, with their existing collection entitlement.`;
   staff=`Use the event list for access to ${v[1]}. Direct other customers to ${destination}, ${v[2]}. Confirm capacity with the packing lead and brief dispatch desk before service.`;
  }else{
   const destination=p.venues.find(x=>x[0]===a.detail)[1],scope=a.scope==='all'?"All customers":"Priority customers";
   after=`${destination} · ${v[2]}`;
   guest=`${scope}: dispatch moves from ${v[1]} to ${destination}, ${v[2]}, for ${period}.${a.scope==='event'?" Other customers keep their normal venue.":''}`;
   staff=`Set up ${destination} for ${v[2]} service. Update signs and brief dispatch desk.${a.scope==='event'?" Redirect only priority customers; retain normal service for other customers.":" Redirect all customers from the original venue."}`;
  }
  return {property:p.label,venue:v[1],baseline,after,when,period,owner,fallback,guest,staff,manager:`${owner} owns this change at ${p.label}. Confirm the venue, customer scope and dates before publishing. ${fallback}`,outputs:['Staff checklist',"Customer guide",'Manager brief','Training card']};
 }
 const model={properties,keys,labels,step,venue,selectedLabel,validate,plan};
 if(typeof module!=='undefined'&&module.exports)module.exports=model;else root.SonawayIntakeModel=model;
})(typeof window!=='undefined'?window:globalThis);


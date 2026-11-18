/* Fictional, annually recurring example schedules; no live operational data. */
(function (root) {
  'use strict';
  const policies = {
    restaurant: { question: "When is the dispatch open?", short: "Dispatch" },
    buffet: { question: "Can I use the collection counter?", short: "Collection counter" },
    room: { question: "When is delivery support available?", short: "Delivery support" }
  };
  const contexts = {
    base: { name: 'Base policy', parent: null, dates: 'All year', sample: '2026-06-15', range: [101,1231], rules: {
      restaurant: ['5–10 PM', "The main dispatch desk is open to all customers from 5–10 PM."],
      buffet: ["7–10 AM · open to customers", "The collection counter is open to all customers in the main dispatch desk, 7–10 AM."],
      room: ['6 AM–11 PM', "Order delivery support from 6 AM–11 PM."] } },
    winter: { name: 'Winter season', parent: 'base', dates: 'Dec 1–Feb 28', sample: '2026-12-10', range: [1201,228], rules: {
      restaurant: ['4–10 PM', "Winter dinner service starts earlier: the main dispatch desk is open from 4–10 PM."],
      buffet: ["7–10:30 AM · open to customers", "The winter collection counter runs from 7–10:30 AM in the main dispatch desk."],
      room: ['6 AM–midnight', "During winter, delivery support is available from 6 AM until midnight."] } },
    christmas: { name: "Year-end peak", parent: 'winter', dates: 'Dec 24–30', sample: '2026-12-25', range: [1224,1230], rules: {
      restaurant: ['4–11 PM', "Year-end peak dinner service runs from 4–11 PM in the main dispatch desk."],
      buffet: ['8–11 AM · festive buffet', "The festive collection counter runs later, from 8–11 AM, for all customers."],
      room: ['24 hours', "Delivery support is available around the clock during Year-end peak."] } },
    wedding: { name: "Priority order run", parent: 'winter', dates: 'Dec 18 only', sample: '2026-12-18', range: [1218,1218], rules: {
      restaurant: ['Private event · use the collection desk', "The main dispatch desk is reserved for a priority run tonight. Other customers can dine at Collection desk from 5–10 PM."],
      buffet: ["Reserved for priority customers", "The main collection counter is reserved for the priority batch, 8–11 AM. Other customers have dispatch at Collection desk, 7–10:30 AM."] } },
    spring: { name: 'Spring season', parent: 'base', dates: 'Mar 1–May 31', sample: '2026-03-15', range: [301,531], rules: {
      restaurant: ['5–10:30 PM', "Spring dinner service runs from 5–10:30 PM in the main dispatch desk."] } },
    festival: { name: "Spring peak", parent: 'spring', dates: 'Apr 10–20', sample: '2026-04-12', range: [410,420], rules: {
      restaurant: ['5–11 PM', "During the spring peak, the main dispatch desk stays open until 11 PM. Service begins at 5 PM."],
      buffet: ['7–11 AM · festival buffet', "The festival collection counter is open to all customers from 7–11 AM."] } },
    gala: { name: "Stocktake day", parent: 'festival', dates: 'Apr 16 only', sample: '2026-04-16', range: [416,416], rules: {
      restaurant: ["Stocktake only · use the collection desk", "The main dispatch desk is reserved for the stocktake from 6 PM. Other customers can dine at Collection desk, 5–10 PM."],
      room: ['24 hours', "Delivery support runs for 24 hours on stocktake day, including overnight after the event."] } }
  };
  function dateCode(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const date = new Date(iso + 'T12:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== iso) return null;
    return Number(iso.slice(5,7)) * 100 + Number(iso.slice(8,10));
  }
  function pathTo(id) { return contexts[id].parent ? [...pathTo(contexts[id].parent),id] : [id]; }
  function inRange(code, range) { return range[0] <= range[1] ? code >= range[0] && code <= range[1] : code >= range[0] || code <= range[1]; }
  function resolve(iso, policy) {
    const code = dateCode(iso);
    if (code === null || !policies[policy]) return null;
    const applicable = Object.keys(contexts).filter(id => pathTo(id).every(part => inRange(code,contexts[part].range)));
    const leaf = applicable.sort((a,b)=>pathTo(b).length-pathTo(a).length)[0];
    const path = pathTo(leaf);
    const source = [...path].reverse().find(id=>contexts[id].rules[policy]);
    return {leaf,path,source,value:contexts[source].rules[policy][0],answer:contexts[source].rules[policy][1]};
  }
  function inherited(id,policy) {
    const source = [...pathTo(id)].reverse().find(key=>contexts[key].rules[policy]);
    return {source,value:contexts[source].rules[policy][0]};
  }
  const model = {policies,contexts,resolve,inherited};
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  else root.SonawayDemoModel = model;
})(typeof window !== 'undefined' ? window : globalThis);


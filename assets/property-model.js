/* Local, fictional property-policy edits. Matching parent values automatically rejoin the inherited branch. */
(function(root){
  'use strict';
  const nodes={
    core:{name:"Northline Operations",short:'Group',parent:null,source:"Group dispatch cutoff policy"},
    lake:{name:"East Facility",short:"East Facility",parent:'core',source:"East Facility dispatch cutoff policy"},
    garden:{name:"Central Workshop",short:"Central",parent:'core',source:"Central dispatch cutoff policy"},
    alpine:{name:"Packing Division",short:"Packing",parent:'core',source:"Packing transfer agreement"},
    suites:{name:"East · priority desk",short:"Priority desk",parent:'lake',source:"Priority collection agreement"},
    rooms:{name:"Central · collection desk",short:"Collection desk",parent:'garden',source:"Standard collection cutoff"},
    lodgeA:{name:"Packing · Line A",short:"Line A",parent:'alpine',source:"Line A dispatch cutoff policy"},
    lodgeB:{name:"Packing · Line B",short:"Line B",parent:'alpine',source:"Line B dispatch cutoff policy"},
    chalet:{name:"Packing · Export Line",short:"Export",parent:'alpine',source:'Export carrier schedule'}
  };
  const defaults={core:'11:00',alpine:'10:00',suites:'13:00',chalet:'09:00'};
  function createState(){return {...defaults};}
  function sourceFor(id,state){if(!nodes[id])throw new Error('Unknown property');return Object.hasOwn(state,id)?id:sourceFor(nodes[id].parent,state);}
  function valueFor(id,state){return state[sourceFor(id,state)];}
  function lineage(id){return nodes[id].parent?[...lineage(nodes[id].parent),id]:[id];}
  function affected(id,state){return Object.keys(nodes).filter(key=>sourceFor(key,state)===id);}
  function format(time){const [h,m]=time.split(':').map(Number);return `${h%12||12}${m?':'+String(m).padStart(2,'0'):''} ${h<12?'AM':'PM'}`;}
  function normalize(state){
    const next={...state};
    Object.keys(nodes).sort((a,b)=>lineage(a).length-lineage(b).length).forEach(id=>{
      const parent=nodes[id].parent;
      if(parent&&Object.hasOwn(next,id)&&next[id]===valueFor(parent,next))delete next[id];
    });
    return next;
  }
  function changed(before,after){return Object.keys(nodes).filter(id=>valueFor(id,before)!==valueFor(id,after)||sourceFor(id,before)!==sourceFor(id,after));}
  function edit(state,id,time){
    if(!nodes[id]||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Invalid property or time');
    return normalize({...state,[id]:time});
  }
  function inherit(state,id){if(!nodes[id]||id==='core')throw new Error('The group must own its standard');const next={...state};delete next[id];return normalize(next);}
  const model={nodes,createState,sourceFor,valueFor,lineage,affected,format,edit,inherit,normalize,changed};
  if(typeof module!=='undefined'&&module.exports)module.exports=model;else root.SonawayPropertyModel=model;
})(typeof window!=='undefined'?window:globalThis);


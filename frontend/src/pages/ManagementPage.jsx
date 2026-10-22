import { useState } from 'react';
import { Check,Edit3,Plus,RefreshCw,Tag,Trash2,Users,X,Boxes,Search } from 'lucide-react';
import { EmptyState as Empty } from '../components/ui/EmptyState.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Loader as Loading } from '../components/ui/Loader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { money } from '../utils/formatCurrency.js';

const fields={
  productos:[
    {key:'nombre',label:'Nombre del producto',required:true},
    {key:'descripcion',label:'Descripción',type:'textarea'},
    {key:'precio',label:'Precio (₡)',type:'number',required:true},
    {key:'stock',label:'Stock',type:'number',required:true},
    {key:'categoria',label:'Categoría',required:true},
    {key:'destacado',label:'Producto destacado',type:'checkbox'}
  ],
  clientes:[
    {key:'nombre',label:'Nombre completo',required:true},
    {key:'email',label:'Correo electrónico',type:'email',required:true},
    {key:'ciudad',label:'Ciudad de envío',type:'city',required:true}
  ],
  cupones:[
    {key:'codigo',label:'Código',required:true},
    {key:'porcentaje',label:'Porcentaje de descuento',type:'number',required:true},
    {key:'vigente_hasta',label:'Vigente hasta',type:'date',required:true},
    {key:'usos_maximos',label:'Usos máximos',type:'number',required:true},
    {key:'activo',label:'Cupón activo',type:'checkbox'}
  ]
};

const tabs=[{key:'productos',label:'Productos',icon:Boxes},{key:'clientes',label:'Clientes',icon:Users},{key:'cupones',label:'Cupones',icon:Tag}];

function Editor({type,initial,cities,onClose,onSaved}) {
  const [form,setForm]=useState(()=>Object.fromEntries(fields[type].map(f=>[f.key,initial?.[f.key]??(f.type==='checkbox'?1:'')])));
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  async function save(e) {
    e.preventDefault();setBusy(true);setError('');
    const body=Object.fromEntries(fields[type].map(f=>[
      f.key,f.type==='number'?Number(form[f.key]):f.type==='checkbox'?Number(Boolean(form[f.key])):form[f.key]
    ]));
    try {
      await api(`/${type}${initial?`/${initial.id}`:''}`,{method:initial?'PUT':'POST',body});
      onSaved();onClose();
    } catch(err) {setError(err.message);} finally {setBusy(false);}
  }

  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="editor-modal" role="dialog" aria-modal="true" aria-label={initial?'Editar registro':'Nuevo registro'}><div className="modal-top"><div><span className="eyebrow">ADMINISTRACIÓN / {type.toUpperCase()}</span><h2>{initial?'Editar registro':'Nuevo registro'}</h2></div><button className="icon-button" aria-label="Cerrar editor" onClick={onClose}><X size={20}/></button></div>
      <form onSubmit={save} className="editor-form">{fields[type].map(f=><label key={f.key} className={`field ${f.type==='checkbox'?'checkbox-field':''}`}>
        {f.type==='checkbox'?<><input type="checkbox" checked={Boolean(form[f.key])} onChange={e=>setForm({...form,[f.key]:e.target.checked?1:0})}/><span>{f.label}</span></>:<>
          <span>{f.label}{f.required&&<em> *</em>}</span>
          {f.type==='textarea'?<textarea rows={3} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>:
          f.type==='city'?<select required value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}><option value="">Selecciona una ciudad</option>{cities?.map(c=><option key={c.ciudad} value={c.ciudad}>{c.ciudad}</option>)}</select>:
          <input required={!!f.required} type={f.type||'text'} min={f.type==='number'?0:undefined} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>}
        </>}
      </label>)}
        <ErrorMessage message={error}/><div className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancelar</button><button className="button button-dark" disabled={busy} type="submit"><Check size={17}/>{busy?'Guardando...':'Guardar cambios'}</button></div>
      </form>
    </div>
  </div>;
}

export function ManagementPage() {
  const [active,setActive]=useState('productos');
  const [editing,setEditing]=useState(undefined);
  const [search,setSearch]=useState('');
  const [error,setError]=useState('');
  const [busyId,setBusyId]=useState(null);
  const {data:rows,loading,error:loadError,refresh}=useFetch(`/${active}`);
  const {data:cities}=useFetch('/ciudades');

  function chooseTab(tab){setActive(tab);setSearch('');setError('');setEditing(undefined);}
  async function removeRow(row) {
    if(!window.confirm(`¿Eliminar «${row.nombre||row.codigo}»? Esta acción no se puede deshacer.`))return;
    setError('');setBusyId(row.id);
    try{await api(`/${active}/${row.id}`,{method:'DELETE'});refresh();}
    catch(err){setError(err.message);}finally{setBusyId(null);}
  }
  const filtered=(rows||[]).filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  return <div className="container page-pad">
    <div className="page-title-row"><div><span className="eyebrow">05 — PANEL DE ADMINISTRACIÓN</span><h1>Todo bajo <em>control.</em></h1><p>Gestiona productos, clientes y campañas desde un solo lugar.</p></div><button className="button button-dark" onClick={()=>setEditing(null)}><Plus size={18}/> Nuevo registro</button></div>
    <div className="management-tabs">{tabs.map(t=><button className={active===t.key?'active':''} key={t.key} onClick={()=>chooseTab(t.key)}><t.icon size={17}/>{t.label}</button>)}</div>
    <div className="management-table-shell"><div className="management-tools"><div><strong>{tabs.find(t=>t.key===active)?.label}</strong><span>{rows?.length??0} registros</span></div><div className="toolbar-controls"><label className="search-box"><Search size={17}/><input value={search} placeholder="Buscar en esta tabla" onChange={e=>setSearch(e.target.value)}/></label><button className="icon-button" title="Actualizar datos" onClick={refresh}><RefreshCw size={18}/></button></div></div>
      <ErrorMessage message={loadError||error}/>{loading?<Loading/>:!filtered.length?<Empty/>:<div className="table-scroll"><table className="admin-table"><thead><tr>{active==='productos'?<><th>PRODUCTO</th><th>CATEGORÍA</th><th>PRECIO</th><th>STOCK</th></>:active==='clientes'?<><th>CLIENTE</th><th>CORREO</th><th>CIUDAD</th><th>ÓRDENES</th></>:<><th>CÓDIGO</th><th>DESCUENTO</th><th>VENCE</th><th>USOS</th></>}<th>ACCIONES</th></tr></thead>
        <tbody>{filtered.map(row=><tr key={row.id}>{active==='productos'?<><td className="table-primary">{row.nombre}</td><td>{row.categoria}</td><td>{money(row.precio)}</td><td><span className={row.stock<=10?'stock-level':''}>{row.stock}</span></td></>:active==='clientes'?<><td className="table-primary">{row.nombre}</td><td>{row.email}</td><td>{row.ciudad}</td><td>{row.ordenes}</td></>:<><td className="table-primary">{row.codigo}</td><td>{row.porcentaje}%</td><td>{row.vigente_hasta}</td><td>{row.usos_actuales}/{row.usos_maximos} {row.activo===0?'· Inactivo':''}</td></>}
          <td><div className="table-actions"><button aria-label="Editar" title="Editar" disabled={busyId===row.id} onClick={()=>setEditing(row)}><Edit3 size={17}/></button><button className="red" aria-label="Eliminar" title="Eliminar" disabled={busyId===row.id} onClick={()=>removeRow(row)}><Trash2 size={17}/></button></div></td></tr>)}</tbody>
      </table></div>}
    </div>
    <p className="admin-footnote">Los registros históricos protegidos no pueden eliminarse: la API responde HTTP 409 para conservar integridad referencial.</p>
    {editing!==undefined&&<Editor key={`${active}-${editing?.id||'new'}`} type={active} initial={editing} cities={cities} onClose={()=>setEditing(undefined)} onSaved={()=>{refresh();setError('');}}/>}
  </div>;
}

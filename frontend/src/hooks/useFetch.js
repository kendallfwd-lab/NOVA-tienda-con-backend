import { useCallback,useEffect,useState } from 'react';
import { api } from '../services/api.js';

export function useFetch(path) {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [version,setVersion]=useState(0);
  const refresh=useCallback(()=>setVersion(v=>v+1),[]);
  useEffect(()=>{
    if(!path) {setData(null);setLoading(false);return;}
    const controller=new AbortController();
    setLoading(true);
    setError('');
    api(path,{signal:controller.signal})
      .then(setData)
      .catch(err=>{if(err.name!=='AbortError')setError(err.message);})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[path,version]);
  return {data,loading,error,refresh,setData};
}


import { Headphones,Speaker,Keyboard,Mouse,Cable,BatteryCharging,LampDesk,Watch,Laptop,Camera,Monitor,Package } from 'lucide-react';

export function ProductVisual({product,large=false}) {
  const name=(product.nombre||'').toLowerCase();
  const Icon=name.includes('auricular')?Headphones:name.includes('parlante')?Speaker:
    name.includes('teclado')?Keyboard:name.includes('mouse')?Mouse:
    name.includes('base')?Cable:name.includes('cargador')||name.includes('powerbank')?BatteryCharging:
    name.includes('lámpara')?LampDesk:name.includes('reloj')?Watch:
    name.includes('soporte')?Laptop:name.includes('cámara')?Camera:
    name.includes('monitor')?Monitor:Package;
  const colors=[
    ['#d8e6d8','#a5c9ae'],['#dfdbe9','#beb2cf'],['#ede3d1','#d0b28c'],
    ['#d9e8ef','#a8c9d2'],['#e7e5db','#cac8bb'],['#dbe2d4','#a9c1ab']
  ];
  const [from,to]=colors[(Number(product.id)||1)%colors.length];
  return <div className={`product-visual ${large?'product-visual--large':''}`} style={{'--visual-a':from,'--visual-b':to}}>
    <span className="visual-orbit orbit-one"/><span className="visual-orbit orbit-two"/>
    <span className="visual-number">N—{String(product.id||'00').padStart(3,'0')}</span>
    <Icon className="product-glyph" strokeWidth={1.15}/>
    <span className="visual-caption">NOVA / OBJECTS</span>
  </div>;
}


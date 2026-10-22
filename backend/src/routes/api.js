import { Router } from 'express';
import { catalogController } from '../controllers/catalogController.js';
import { orderController } from '../controllers/orderController.js';

const wrap = fn => (req,res,next) => {
  try { fn(req,res); } catch(error) { next(error); }
};

export function createApi(db) {
  const router = Router();
  const c = catalogController(db);
  const o = orderController(db);
  router.get('/health', (_req,res)=>res.json({ok:true,servicio:'NOVA API'}));
  router.get('/categorias',wrap(c.categories));
  router.get('/ciudades',wrap(c.cities));
  router.get('/productos',wrap(c.products));
  router.get('/productos/:id',wrap(c.product));
  router.post('/productos',wrap(c.createProduct));
  router.put('/productos/:id',wrap(c.updateProduct));
  router.patch('/productos/:id',wrap(c.updateProduct));
  router.delete('/productos/:id',wrap(c.deleteProduct));
  router.get('/clientes',wrap(c.clients));
  router.get('/clientes/:id',wrap(c.client));
  router.post('/clientes',wrap(c.createClient));
  router.put('/clientes/:id',wrap(c.updateClient));
  router.patch('/clientes/:id',wrap(c.updateClient));
  router.delete('/clientes/:id',wrap(c.deleteClient));
  router.get('/cupones',wrap(c.coupons));
  router.get('/cupones/:id',wrap(c.coupon));
  router.post('/cupones',wrap(c.createCoupon));
  router.put('/cupones/:id',wrap(c.updateCoupon));
  router.patch('/cupones/:id',wrap(c.updateCoupon));
  router.delete('/cupones/:id',wrap(c.deleteCoupon));
  router.get('/ordenes',wrap(o.orders));
  router.get('/ordenes/:id',wrap(o.order));
  router.post('/ordenes',wrap(o.createOrder));
  router.patch('/ordenes/:id/estado',wrap(o.status));
  router.get('/resumen',wrap(o.summary));
  router.post('/ia/demo',wrap(o.localDemo));
  return router;
}


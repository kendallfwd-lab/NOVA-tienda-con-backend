import { listOrders,getOrder,createOrder,setOrderStatus } from '../services/orders.js';
import { getSummary } from '../services/metrics.js';
import { localDemo } from '../services/ai-demo.js';

export function orderController(db) {
  return {
    orders: (req,res) => res.json(listOrders(db,req.query)),
    order: (req,res) => res.json(getOrder(db,req.params.id)),
    createOrder: (req,res) => res.status(201).json(createOrder(db,req.body)),
    status: (req,res) => res.json(setOrderStatus(db,req.params.id,req.body)),
    summary: (_req,res) => res.json(getSummary(db)),
    localDemo: (req,res) => res.json({ok:true,data:localDemo(db,req.body),error:null})
  };
}


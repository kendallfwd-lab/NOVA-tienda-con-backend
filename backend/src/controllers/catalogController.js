import * as catalog from '../services/catalog.js';

export function catalogController(db) {
  return {
    categories: (_req,res) => res.json(db.prepare('SELECT DISTINCT categoria FROM productos ORDER BY categoria').all().map(r=>r.categoria)),
    cities: (_req,res) => res.json(db.prepare('SELECT * FROM ciudades_envio ORDER BY ciudad').all()),
    products: (req,res) => res.json(catalog.listProducts(db,req.query)),
    product: (req,res) => res.json(catalog.getProduct(db,req.params.id)),
    createProduct: (req,res) => res.status(201).json(catalog.createProduct(db,req.body)),
    updateProduct: (req,res) => res.json(catalog.updateProduct(db,req.params.id,req.body)),
    deleteProduct: (req,res) => res.json(catalog.deleteProduct(db,req.params.id)),
    clients: (_req,res) => res.json(catalog.listClients(db)),
    client: (req,res) => res.json(catalog.getClient(db,req.params.id)),
    createClient: (req,res) => res.status(201).json(catalog.createClient(db,req.body)),
    updateClient: (req,res) => res.json(catalog.updateClient(db,req.params.id,req.body)),
    deleteClient: (req,res) => res.json(catalog.deleteClient(db,req.params.id)),
    coupons: (_req,res) => res.json(catalog.listCoupons(db)),
    coupon: (req,res) => res.json(catalog.getCoupon(db,req.params.id)),
    createCoupon: (req,res) => res.status(201).json(catalog.createCoupon(db,req.body)),
    updateCoupon: (req,res) => res.json(catalog.updateCoupon(db,req.params.id,req.body)),
    deleteCoupon: (req,res) => res.json(catalog.deleteCoupon(db,req.params.id))
  };
}


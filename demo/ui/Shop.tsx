import { ArrowUpRight, Columns2 } from 'lucide-react';
import { useState } from 'react';
import { money, products } from '../catalog';
import { Cart } from './Cart';
import { OrfinLogo } from './Brand';
import { ProductArt } from './ProductArt';
import { AddProduct } from './AddProduct';
import type { ShopProps } from './commerce-types';

export function ShopPage({ orfin, store, navigate }: ShopProps) {
  const [category, setCategory] = useState('All equipment');
  const filtered = products.filter(
    (product) => category === 'All equipment' || product.category === category,
  );
  return (
    <div className="shop-page">
      <div className="page-heading">
        <div>
          <h1>Tools for thoughtful work.</h1>
          <p>A small collection for the way your studio works.</p>
        </div>
        <button className="button" onClick={() => navigate('/compare')}>
          <Columns2 size={16} /> Compare displays
        </button>
      </div>
      <div className="shop-intro">
        <div>
          <h2>A screen that fits your day.</h2>
          <p>
            Two displays. Different strengths. Ask Orfin which one makes sense for your desk, your
            work and your budget.
          </p>
          <button
            className="shop-ask"
            onClick={() =>
              void orfin?.send(
                'Compare Luma 27 and Luma 32 Pro. Which is better for a small desk and web design? Show the comparison.',
              )
            }
          >
            <OrfinLogo size={20} /> Help me choose <ArrowUpRight size={15} />
          </button>
        </div>
        <ProductArt product={products[1]!} />
      </div>
      <div className="shop-layout">
        <Cart store={store} navigate={navigate} />
        <section className="catalog" data-orfin-section="equipment-catalog">
          <div className="catalog-heading">
            <h2>The collection</h2>
            <label>
              <span className="sr-only">Equipment category</span>
              <select
                aria-label="Equipment category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>All equipment</option>
                <option>Displays</option>
                <option>Desk essentials</option>
              </select>
            </label>
          </div>
          <div className="product-grid">
            {filtered.map((product) => (
              <article className={`product-card ${product.color}`} key={product.id}>
                <button
                  className="product-stage"
                  aria-label={`Open ${product.name}`}
                  onClick={() => navigate(`/shop/${product.id}`)}
                >
                  <ProductArt product={product} compact />
                </button>
                <div className="product-card-heading">
                  <button onClick={() => navigate(`/shop/${product.id}`)}>
                    <h3>{product.name}</h3>
                  </button>
                  <strong>{money(product.price)}</strong>
                </div>
                <p>{product.tagline}</p>
                <span className="product-meta">
                  {product.category} <span>{product.stock} available</span>
                </span>
                <AddProduct product={product} store={store} />
              </article>
            ))}
          </div>
        </section>
      </div>
      <p className="dataset-note">
        Northstar equipment is a fictional catalog. Specifications, reviews and prices are shared
        with Orfin’s tools.
      </p>
    </div>
  );
}

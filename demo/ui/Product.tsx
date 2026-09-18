import { ArrowLeft, Star } from 'lucide-react';
import { money, productById } from '../catalog';
import { Cart, CartStatus } from './Cart';
import { OrfinLogo } from './Brand';
import { ProductArt } from './ProductArt';
import { AddProduct } from './AddProduct';
import type { ShopProps } from './commerce-types';

export function ProductPage({ id, orfin, store, navigate }: ShopProps & { id: string }) {
  const product = productById(id);
  if (!product)
    return (
      <div>
        <h1>Product not found</h1>
        <button className="button" onClick={() => navigate('/shop')}>
          Browse equipment
        </button>
      </div>
    );
  return (
    <div className="product-page shop-page">
      <button className="back-link" onClick={() => navigate('/shop')}>
        <ArrowLeft size={15} /> All equipment
      </button>
      <div className="product-detail" data-orfin-section={`product-${id}`}>
        <div className={`product-detail-stage ${product.color}`}>
          <ProductArt product={product} />
          <span>Northstar equipment</span>
          <CartStatus store={store} navigate={navigate} />
        </div>
        <div className="product-detail-copy">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-tagline">{product.tagline}</p>
          <strong className="product-price">{money(product.price)}</strong>
          <p>{product.description}</p>
          <div className="product-availability">
            <span /> {product.stock} available in this demo
          </div>
          <AddProduct product={product} store={store} />
          <button
            className="text-button"
            onClick={() => void orfin?.send(`Open ${product.name} and add one to my demo cart.`)}
          >
            <OrfinLogo size={17} /> Ask Orfin to add it
          </button>
        </div>
      </div>
      <div className="product-information">
        <div>
          <section className="specification-section">
            <h2>The details that matter</h2>
            <dl className="product-specs">
              {Object.entries(product.specs).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <h3>A good fit for</h3>
            <p>{product.suitableFor}</p>
            <h3>Before you choose</h3>
            <ul className="product-limitations">
              {product.limitations.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
          <section className="product-reviews" data-orfin-section={`reviews-${id}`}>
            <div className="section-heading">
              <h2>People who use it</h2>
              <span>{product.reviews.length} demo reviews</span>
            </div>
            {product.reviews.map((review) => (
              <article className="product-review" data-review-id={review.id} key={review.id}>
                <div className="review-heading">
                  <strong>{review.author}</strong>
                  <span
                    role="img"
                    aria-label={`${review.rating} out of 5 stars`}
                    className="review-stars"
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={index < review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </span>
                  <time dateTime={review.date}>{review.date}</time>
                </div>
                <h3>{review.title}</h3>
                <blockquote>{review.text}</blockquote>
              </article>
            ))}
            {id === 'luma-32-pro' && (
              <button
                className="button"
                onClick={() =>
                  void orfin?.send(
                    'Find the 3-star review for Luma 32 Pro. Quote it briefly and explain why the reviewer gave it 3 stars.',
                  )
                }
              >
                <OrfinLogo size={18} /> Why the three-star review?
              </button>
            )}
          </section>
        </div>
        <Cart store={store} navigate={navigate} />
      </div>
    </div>
  );
}

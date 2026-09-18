import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { money, products } from '../catalog';
import { OrfinLogo } from './Brand';
import { ProductArt } from './ProductArt';
import { AddProduct } from './AddProduct';
import type { ShopProps } from './commerce-types';

export function ComparePage({ orfin, store, navigate }: ShopProps) {
  const compared = products.slice(0, 2);
  return (
    <div className="compare-page">
      <button className="back-link" onClick={() => navigate('/shop')}>
        <ArrowLeft size={15} /> All equipment
      </button>
      <div className="page-heading">
        <div>
          <h1>Find your kind of screen.</h1>
          <p>The same 4K detail. Two different ways to work.</p>
        </div>
        <button
          className="button"
          onClick={() =>
            void orfin?.send(
              'Compare these two monitors. Explain who each is for, the $250 difference and the limitations.',
            )
          }
        >
          <OrfinLogo size={18} /> Talk me through it
        </button>
      </div>
      <section className="comparison" data-orfin-section="product-comparison">
        <div className="comparison-products">
          <div className="comparison-intro">
            <h2>
              A decision,
              <br />
              with the details.
            </h2>
            <p>Start with your desk and your work. Bigger is useful when you have room for it.</p>
            <span className="price-difference">$250 difference</span>
          </div>
          {compared.map((product) => (
            <div key={product.id} className={`comparison-product ${product.color}`}>
              <ProductArt product={product} compact />
              <h2>{product.name}</h2>
              <strong>{money(product.price)}</strong>
              <button className="text-button" onClick={() => navigate(`/shop/${product.id}`)}>
                Explore product <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <caption>Display specifications and suitability</caption>
            <thead>
              <tr>
                <th scope="col">Specification</th>
                {compared.map((product) => (
                  <th scope="col" key={product.id}>
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(compared[0]!.specs).map((label) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {compared.map((product) => (
                    <td key={product.id}>{product.specs[label]}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">Who it suits</th>
                {compared.map((product) => (
                  <td key={product.id}>{product.suitableFor}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Keep in mind</th>
                {compared.map((product) => (
                  <td key={product.id}>{product.limitations.join(' ')}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="comparison-actions">
          {compared.map((product) => (
            <div key={product.id}>
              <strong>{product.name}</strong>
              <AddProduct product={product} store={store} />
            </div>
          ))}
        </div>
        <p className="dataset-note">
          sRGB and DCI-P3 are different color spaces; their coverage percentages cannot be compared
          directly. Both displays run at 60 Hz. All specifications are fictional demo data.
        </p>
      </section>
    </div>
  );
}

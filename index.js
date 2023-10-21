const fetchProducts = async () => {
  return await axios.get("http://localhost:4001/posts");
};

(async () => {
  const products = await fetchProducts();
  document.getElementById("product").innerHTML = products.data
    .map((product) => {
      const discountPrice = (product.price * (100 - product.discount)) / 100;
      return `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div id="product-1" class="single-product">
                <div class="product-image">
                    <img src=${product.img} alt="Product Image" />
                </div>
                ${
                  product.discount !== null
                    ? `<span class="discount">${product.discount}% off</span>`
                    : ""
                }
                ${product.new ? `<span class="new">New</span>` : ""}

                <div class="part-1">
                <ul>
                    <li>
                    <a href="#"><i class="bi bi-cart-fill"></i></a>
                    </li>
                    <li>
                    <a href="#"><i class="bi bi-heart-fill"></i></a>
                    </li>
                    <li>
                    <a href="#"><i class="bi bi-chat-fill"></i></a>
                    </li>
                </ul>
                </div>
                <div class="part-2">
                    <h3 class="product-title">${product.title}</h3>
                    ${
                      product.discount
                        ? `
                        <h4 class="product-old-price"> $${product.price.toFixed(
                          2
                        )}</h4>
                        `
                        : ""
                    }
                    <h4 class="product-price">$${discountPrice.toFixed(2)}</h4>
                </div>
            </div>
        </div>
      `;
    })
    .join("");
})();

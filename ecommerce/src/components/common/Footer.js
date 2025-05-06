import { Link } from "react-router-dom"
import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>EthioShop</h3>
            <p>
              Your one-stop shop for quality products in Ethiopia. We offer a wide range of electronics, clothing, home
              goods, and more.
            </p>
            <div className="contact">
              <p>
                <i className="fa fa-phone"></i> +251 91 234 5678
              </p>
              <p>
                <i className="fa fa-envelope"></i> info@ethioshop.com
              </p>
              <p>
                <i className="fa fa-map-marker"></i> Addis Ababa, Ethiopia
              </p>
            </div>
            <div className="socials">
              <a href="#">
                <i className="fa fa-facebook"></i>
              </a>
              <a href="#">
                <i className="fa fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fa fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fa fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              <li>
                <Link to="/cart">Cart</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section categories">
            <h3>Categories</h3>
            <ul>
              <li>
                <Link to="/products?category=1">Electronics</Link>
              </li>
              <li>
                <Link to="/products?category=2">Clothing</Link>
              </li>
              <li>
                <Link to="/products?category=3">Home & Kitchen</Link>
              </li>
              <li>
                <Link to="/products?category=4">Beauty</Link>
              </li>
              <li>
                <Link to="/products?category=5">Accessories</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section newsletter">
            <h3>Subscribe to Our Newsletter</h3>
            <p>Stay updated with our latest products and offers.</p>
            <form>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit" className="btn-subscribe">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EthioShop. All Rights Reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

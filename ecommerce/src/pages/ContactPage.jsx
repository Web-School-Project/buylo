"use client";

import { useState } from "react";
import "./ContactPage.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        console.log("Form submitted:", formData);
        setIsSubmitting(false);
        setSubmitSuccess(true);

        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }, 1500);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>
          We'd love to hear from you. Please fill out the form below or use our
          contact information.
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">
              <i className="fa fa-map-marker"></i>
            </div>
            <h3>Our Location</h3>
            <p>123 Main Street, Addis Ababa, Ethiopia</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <i className="fa fa-phone"></i>
            </div>
            <h3>Phone Number</h3>
            <p>+251 91 234 5678</p>
            <p>+251 92 345 6789</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <i className="fa fa-envelope"></i>
            </div>
            <h3>Email Address</h3>
            <p>info@ethioshop.com</p>
            <p>support@ethioshop.com</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <i className="fa fa-clock-o"></i>
            </div>
            <h3>Working Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
          </div>

          <div className="social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <i className="fa fa-facebook"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fa fa-twitter"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fa fa-instagram"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fa fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          {submitSuccess ? (
            <div className="success-message">
              <i className="fa fa-check-circle"></i>
              <h3>Thank You!</h3>
              <p>
                Your message has been sent successfully. We'll get back to you
                soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? "error" : ""}
                />
                {formErrors.name && (
                  <div className="error-message">{formErrors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? "error" : ""}
                />
                {formErrors.email && (
                  <div className="error-message">{formErrors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={formErrors.subject ? "error" : ""}
                />
                {formErrors.subject && (
                  <div className="error-message">{formErrors.subject}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={formErrors.message ? "error" : ""}
                ></textarea>
                {formErrors.message && (
                  <div className="error-message">{formErrors.message}</div>
                )}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="map-container">
        <h2>Find Us on the Map</h2>
        <div className="map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126766.39636748118!2d38.68707276897056!3d9.010774243731178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1683024536447!5m2!1sen!2sus"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="EthioShop Location"
          ></iframe>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className="faq-item">
            <h3>How can I track my order?</h3>
            <p>
              You can track your order by logging into your account and visiting
              the "My Orders" section in your dashboard. Alternatively, you can
              use the tracking number provided in your order confirmation email.
            </p>
          </div>

          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>
              We accept various payment methods including Chapa, credit/debit
              cards, and cash on delivery. All online payments are secure and
              encrypted.
            </p>
          </div>

          <div className="faq-item">
            <h3>What is your return policy?</h3>
            <p>
              We offer a 30-day return policy for most items. Products must be
              in their original condition with all tags and packaging. Please
              note that some items like personalized products cannot be
              returned.
            </p>
          </div>

          <div className="faq-item">
            <h3>How long does shipping take?</h3>
            <p>
              Shipping times vary depending on your location. Within Addis
              Ababa, delivery typically takes 1-3 business days. For other
              regions in Ethiopia, it may take 3-7 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { Link } from "react-router-dom";

import styles from "../styles/Footer.module.css";
// import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* BrandName */}
        <div className={styles.section}>
          <Link to="/" className="link-body-emphasis text-decoration-none">
            <p className={styles.brandName}>Apna Video Call</p>
          </Link>
        </div>

        {/* Get in touch */}
        <div className={`${styles.section} ${styles.getInTouchSection}`}>
          <div className={styles.footerListHeading}>GET IN TOUCH</div>
          <ul>
            <li>
              <IoMail /> devrajpujari292@gmail.com
            </li>
            <li>
              <IoMail /> devrajpujari003@gmail.com
            </li>
          </ul>
        </div>

        {/* Connect with us */}
        <div className={styles.section}>
          <div className={styles.footerListHeading}>Connect With Us</div>
          <ul>
            <li>
              <a
                href="https://instagram.com/devrajjj.codes"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                Instagram <FaInstagram className={styles.footerIcon} />
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/people/Devraj-Pujari/pfbid024kZDfiYmDJ9TyNPi2WHpxWAgLe5zjesrr9nmzDcuPdEekbPFf3sHEVUtYdEW7xb8l"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                Facebook <FaFacebook className={styles.footerIcon} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <hr />
      {/* copy right */}
      <p className={`mb-0 text-center ${styles.copyRight}`}>
        © 2025 Apna Video Call, Inc
      </p>
    </footer>
  );
};

export default Footer;

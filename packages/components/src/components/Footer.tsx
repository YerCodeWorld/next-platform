// packages/components/src/components/Footer.tsx
'use client';
import Link from 'next/link';
// @ts-ignore
import { EnvelopeSimple, Phone, MapPin, FacebookLogo, TwitterLogo, InstagramLogo, LinkedinLogo } from 'phosphor-react';

interface FooterTranslations {
    quickLinks: {
        title: string;
        about: string;
        courses: string;
        teachers: string;
        faqs: string;
        blogs: string;
    };
    category: {
        title: string;
        uiux: string;
        webDev: string;
        python: string;
        marketing: string;
        graphic: string;
    };
    contact: {
        title: string;
        phone: string;
        email: string;
        address: string;
    };
    copyright: string;
}

interface FooterProps {
    translations: FooterTranslations;
    locale: string;
}

const Footer: React.FC<FooterProps> = ({ translations, locale }) => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: translations.quickLinks.about, href: `/${locale}/about` },
        { label: translations.quickLinks.courses, href: `/${locale}/courses` },
        { label: translations.quickLinks.teachers, href: `/${locale}/teachers` },
        { label: translations.quickLinks.faqs, href: `/${locale}/faqs` },
        { label: translations.quickLinks.blogs, href: `/${locale}/blog` }
    ];

    const categories = [
        { label: translations.category.uiux, href: `/${locale}/categories/ui-ux` },
        { label: translations.category.webDev, href: `/${locale}/categories/web-development` },
        { label: translations.category.python, href: `/${locale}/categories/python` },
        { label: translations.category.marketing, href: `/${locale}/categories/marketing` },
        { label: translations.category.graphic, href: `/${locale}/categories/graphic-design` }
    ];

    const socialLinks = [
        { icon: FacebookLogo, href: '#', label: 'Facebook' },
        { icon: TwitterLogo, href: '#', label: 'Twitter' },
        { icon: InstagramLogo, href: '#', label: 'Instagram' },
        { icon: LinkedinLogo, href: '#', label: 'LinkedIn' }
    ];

    return (
        <footer className="footer">
            <div className="footer__main">
                <div className="container">
                    <div className="footer__content">
                        {/* Company Info */}
                        <div className="footer__section">
                            <div className="footer__brand">
                                <Link href={`/${locale}`} className="footer__logo">
                                    <span className="visually-hidden">EduGuiders</span>
                                </Link>
                                <p className="footer__description">
                                    Connecting learners with expert educators worldwide.
                                    Transform your learning experience with personalized education.
                                </p>
                                <div className="footer__social">
                                    {socialLinks.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.href}
                                            className="footer__social-link"
                                            aria-label={social.label}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <social.icon size={20} weight="regular" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer__section">
                            <h3 className="footer__title">{translations.quickLinks.title}</h3>
                            <ul className="footer__links">
                                {quickLinks.map((link, index) => (
                                    <li key={index} className="footer__link-item">
                                        <Link href={link.href} className="footer__link">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Categories */}
                        <div className="footer__section">
                            <h3 className="footer__title">{translations.category.title}</h3>
                            <ul className="footer__links">
                                {categories.map((category, index) => (
                                    <li key={index} className="footer__link-item">
                                        <Link href={category.href} className="footer__link">
                                            {category.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer__section">
                            <h3 className="footer__title">{translations.contact.title}</h3>
                            <div className="footer__contact">
                                <div className="footer__contact-item">
                                    <Phone size={18} weight="regular" />
                                    <a href={`tel:${translations.contact.phone}`} className="footer__contact-link">
                                        {translations.contact.phone}
                                    </a>
                                </div>
                                <div className="footer__contact-item">
                                    <EnvelopeSimple size={18} weight="regular" />
                                    <a href={`mailto:${translations.contact.email}`} className="footer__contact-link">
                                        {translations.contact.email}
                                    </a>
                                </div>
                                <div className="footer__contact-item">
                                    <MapPin size={18} weight="regular" />
                                    <span className="footer__contact-text">
                                        {translations.contact.address}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="footer__bottom">
                <div className="container">
                    <div className="footer__bottom-content">
                        <p className="footer__copyright">
                            © {currentYear} EduGuiders. All Rights Reserved.
                        </p>
                        <div className="footer__legal">
                            <Link href={`/${locale}/privacy`} className="footer__legal-link">
                                Privacy Policy
                            </Link>
                            <Link href={`/${locale}/terms`} className="footer__legal-link">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Footer: React.FC = () => {
    const { t } = useLanguage();
    return (
        <footer className="bg-white backdrop-blur-sm border-t border-gray-100 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="text-gray-500 text-sm font-medium">
                    © {new Date().getFullYear()} EcoAventura. {t('home.footer.rights')}
                </p>
            </div>
        </footer>
    );
};

export default Footer;

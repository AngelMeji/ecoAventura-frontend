import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Footer: React.FC = () => {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-eco-primary-900 text-white pt-16 pb-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            {/* Logo Icon */}
                            <div className="bg-white/10 p-2 rounded-lg">
                                <svg className="w-6 h-6 text-eco-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-display font-bold text-white tracking-tight">EcoAventura</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Conectando viajeros conscientes con la exuberante naturaleza de Risaralda. Turismo que protege y preserva.
                        </p>
                        {/* Social Icons (Visual placeholders) */}
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-eco-accent hover:text-eco-primary-900 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-eco-accent">Explorar</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a href="/home" className="hover:text-white transition-colors flex items-center gap-2">Destinos</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors flex items-center gap-2">Sobre Nosotros</a></li>
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">Blog (Pronto)</a></li>
                        </ul>
                    </div>

                    {/* Legal & Help */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-eco-accent">Soporte</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">{t('home.footer.privacy')}</Link></li>
                            <li><Link to="/cookies" className="hover:text-white transition-colors">{t('home.footer.cookies')}</Link></li>
                            <li><a href="/partner-request" className="hover:text-white transition-colors">Ser Socio</a></li>
                        </ul>
                    </div>

                    {/* Call to Action */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-eco-accent">Únete a nosotros</h4>
                        <p className="text-gray-400 text-sm mb-4">
                            ¿Tienes un destino ecoturístico? Únete a nuestra red de socios.
                        </p>
                        <a
                            href="/partner-request"
                            className="inline-block w-full text-center bg-eco-accent hover:bg-yellow-400 text-eco-primary-900 font-bold py-3 px-6 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg shadow-eco-accent/20"
                        >
                            Solicitar ser Socio
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        © {currentYear} EcoAventura. {t('home.footer.rights')}
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link to="/privacy" className="hover:text-white transition-colors">{t('home.footer.privacy')}</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">{t('home.footer.cookies')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import { Link } from 'react-router-dom';
import { FiBook, FiUpload, FiUsers, FiStar } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function Home() {
    const categories = [
        { name: 'ASIR', path: '/category/asir', color: 'from-blue-500 to-cyan-500' },
        { name: 'DAW', path: '/category/daw', color: 'from-purple-500 to-pink-500' },
        { name: 'DAM', path: '/category/dam', color: 'from-orange-500 to-red-500' },
        { name: 'SMR', path: '/category/smr', color: 'from-green-500 to-emerald-500' },
    ];

    const features = [
        { icon: <FiUpload className="w-6 h-6" />, title: 'Sube tus apuntes', desc: 'Comparte tu conocimiento con la comunidad' },
        { icon: <FiBook className="w-6 h-6" />, title: 'Encuentra material', desc: 'Miles de recursos categorizados por asignatura' },
        { icon: <FiUsers className="w-6 h-6" />, title: 'Comunidad Activa', desc: 'Aprende con otros estudiantes y sus apuntes.' },
        { icon: <FiStar className="w-6 h-6" />, title: 'Valora Contenido', desc: 'Vota los mejores apuntes para destacar la calidad' },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-10 pb-16">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
                        Repositorio de Informática<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            ApuntesIT 24/7
                        </span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Comparte, descarga y valora apuntes de ASIR, DAW, DAM y SMR. Todo en un solo lugar, creado por y para estudiantes.
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Explora por Ciclo Formativo</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 hover:cursor-pointer">
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                to={cat.path}
                                className={`group relative rounded-2xl p-8 overflow-hidden bg-gradient-to-br ${cat.color} transform transition-all hover:scale-105 hover:shadow-xl`}
                            >
                                <div className="relative z-10 flex flex-col h-full justify-center items-center text-center">
                                    <h3 className="text-4xl font-bold text-white tracking-widest">{cat.name}</h3>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
                                <div className="flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Removed Top Users Ranking */}
        </div>
    );
}

// src/components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({children}) => {

  
    return (
        <>
            <Navbar />
            <main className="container mt-4">
                {children}
            </main>
            <Footer />
        </>
    );
};

// Ensure this is the default export
export default Layout;
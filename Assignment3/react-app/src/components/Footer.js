import React from 'react';
import './footer.css'; // 创建一个名为Footer.css的文件，用于存放样式

function Footer() {
    return (
        <footer className="footer">
            <div className="content">
                <p>Powered by <a href="https://finnhub.io/">Finnhub.io</a></p>
            </div>
        </footer>
    );
}

export default Footer;

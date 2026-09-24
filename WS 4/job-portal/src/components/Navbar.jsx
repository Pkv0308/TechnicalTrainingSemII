import React from 'react';

const Navbar = ({ brandName, links }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <a className="navbar-brand" href="/">{brandName}</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {links.map((link, index) => (
              <li className="nav-item" key={index}>
                <a className="nav-link" href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
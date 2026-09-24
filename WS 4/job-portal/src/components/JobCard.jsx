import React from 'react';

const JobCard = ({ title, company, location, type }) => {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title fw-bold">{title}</h5>
        <h6 className="card-subtitle mb-3 text-muted">{company} • {location}</h6>
        <span className="badge bg-primary mb-3">{type}</span>
        <button className="btn btn-outline-success btn-sm w-100">
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobCard;
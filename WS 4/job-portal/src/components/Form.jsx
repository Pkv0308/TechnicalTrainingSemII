import React, { useState } from 'react';

const Form = ({ onSubmit, title, children, submitText = "Submit" }) => {
  const [validated, setValidated] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      onSubmit(event);
    }
    setValidated(true);
  };
  return (
    <form 
      noValidate 
      onSubmit={handleSubmit} 
      className={`p-4 border rounded shadow-sm bg-light ${validated ? 'was-validated' : ''}`}
    >
      <h4 className="mb-4 text-center">{title}</h4>
      {children}
      <button type="submit" className="btn btn-primary w-100 mt-4">
        {submitText}
      </button>
    </form>
  );
};

export default Form;
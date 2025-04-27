import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function FormDataDiri() {
  const [formData, setFormData] = useState({
    npm: '',
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [age, setAge] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'npm') {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.npm || !formData.firstName || !formData.lastName || !formData.birthdate) {
      alert('Mohon lengkapi semua field yang wajib diisi.');
      return;
    }

    const umur = calculateAge(formData.birthdate);
    setAge(umur);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Form Data Diri</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">NPM:</label>
          <input
            type="text"
            name="npm"
            className="form-control"
            value={formData.npm}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">First Name:</label>
          <input
            type="text"
            name="firstName"
            className="form-control"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Middle Name:</label>
          <input
            type="text"
            name="middleName"
            className="form-control"
            value={formData.middleName}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Last Name:</label>
          <input
            type="text"
            name="lastName"
            className="form-control"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Birthdate (YYYY-MM-DD):</label>
          <input
            type="date"
            name="birthdate"
            className="form-control"
            value={formData.birthdate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>

      {/* Modal */}
      {modalOpen && (
        <div className="modal show fade" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              
              <div className="modal-header">
                <h5 className="modal-title">Data Diri</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>

              <div className="modal-body">
                <p><strong>NPM:</strong> {formData.npm}</p>
                <p><strong>Fullname:</strong> {`${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim()}</p>
                <p><strong>Age:</strong> {age} tahun</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormDataDiri;

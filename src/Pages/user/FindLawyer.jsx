import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LawyerCard from './LawyerCard';
import LawyerProfileModal from './LawyerProfileModal';
const specializationOptions = [
  "Criminal Law", "Civil Law", "Corporate Law", "Family Law", "Intellectual Property",
  "Cyber Law", "Tax Law", "Environmental Law", "Constitutional Law", "Labor Law", "caljla"
];

const stateCityOptions = {
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "new tehri"],
  "Delhi": ["New Delhi", "Dwarka", "Saket"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Kanpur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli"]
};

const FindLawyer = () => {
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    state: '',
    city: ''
  });

  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showModal, setShowModal] = useState(false);

const handleViewProfile = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowModal(true);
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await axios.get('https://lawyerbackend-qrqa.onrender.com/lawapi/common/lwayerlist');
        if (res.data && Array.isArray(res.data.data)) {
          const allLawyers = res.data.data;
          setLawyers(allLawyers);
          setFilteredLawyers(allLawyers);
        } else {
          toast.error("Invalid lawyer data received");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch lawyers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLawyers();
  }, []);

  useEffect(() => {
    let results = [...lawyers];

    if (filters.specialization) {
      results = results.filter(l =>
        l.specialization?.toLowerCase().trim() === filters.specialization.toLowerCase().trim()
      );
    }

    if (filters.city) {
      results = results.filter(l =>
        l.city?.toLowerCase().trim() === filters.city.toLowerCase().trim()
      );
    }

    setFilteredLawyers(results);
  }, [filters, lawyers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'state' ? { city: '' } : {}) // Reset city if state changes
    }));
  };

  const resetFilters = () => {
    setFilters({
      specialization: '',
      state: '',
      city: ''
    });
    setFilteredLawyers(lawyers);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <ToastContainer position="top-center" />
      <h1 className="text-center mb-5">Find a Lawyer</h1>

      {/* Filters */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="specialization" className="form-label">Specialization</label>
              <select
                id="specialization"
                name="specialization"
                className="form-select"
                value={filters.specialization}
                onChange={handleFilterChange}
              >
                <option value="">All Specializations</option>
                {specializationOptions.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="state" className="form-label">State</label>
              <select
                id="state"
                name="state"
                className="form-select"
                value={filters.state}
                onChange={handleFilterChange}
              >
                <option value="">All States</option>
                {Object.keys(stateCityOptions).map((state, idx) => (
                  <option key={idx} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="city" className="form-label">City</label>
              <select
                id="city"
                name="city"
                className="form-select"
                value={filters.city}
                onChange={handleFilterChange}
                disabled={!filters.state}
              >
                <option value="">All Cities</option>
                {filters.state &&
                  stateCityOptions[filters.state]?.map((city, idx) => (
                    <option key={idx} value={city}>{city}</option>
                  ))}
              </select>
            </div>

            <div className="col-12 text-center">
              <button onClick={resetFilters} className="btn btn-outline-secondary me-2">
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Count */}
      <div className="mb-3">
        <h5>{filteredLawyers.length} {filteredLawyers.length === 1 ? 'Lawyer' : 'Lawyers'} Found</h5>
      </div>

      {/* Lawyer Cards */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredLawyers.length > 0 ? (
          filteredLawyers.map(lawyer => (
            <div key={lawyer._id} className="col">
              <LawyerCard lawyer={lawyer} 
                              onViewProfile={() => handleViewProfile(lawyer)} 
/>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-warning text-center">No lawyers found matching your criteria</div>
          </div>
        )}

      </div>
       {/* Lawyer Profile Modal */}
      {selectedLawyer && (
        <LawyerProfileModal 
          show={showModal} 
          handleClose={() => setShowModal(false)} 
          lawyer={selectedLawyer} 
        />
      )}
    </div>
  );
};

export default FindLawyer;

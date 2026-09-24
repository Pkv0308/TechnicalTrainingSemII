import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import JobCard from "./components/JobCard";
import Form from "./components/Form";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [jobs, setJobs] = useState([]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/jobs");
        const data = await response.json();

        if (response.ok) {
          setJobs(data);
        } else {
          console.error("Failed to fetch jobs:", data.message);
        }
      } catch (error) {
        console.error("Error connecting to the server:", error);
      }
    };

    fetchJobs();
  }, []); // The empty array ensures this only runs once when the app mounts

  const handleAuthentication = async (e) => {
    e.preventDefault();
    const endpoint = isLoginView ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLoginView) {
          // Save the token and log the user in
          localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
        } else {
          // Switch to login view after successful registration
          alert("Registration successful! Please log in.");
          setIsLoginView(true);
        }
      } else {
        alert(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("Server error. Is your backend running?");
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5 d-flex flex-column">
      <Navbar
        brandName="JobPortal"
        links={[
          { label: "Home", url: "#" },
          { label: "Jobs", url: "#" },
        ]}
      />
      <div className="container-fluid flex-grow-1 px-4 px-lg-5 mt-3">
        {!isLoggedIn ? (
          <div className="row justify-content-center mt-5">
            <div className="col-12 col-md-8 col-lg-5 col-xl-4">
              <Form
                title={isLoginView ? "User Login" : "Create Account"}
                submitText={isLoginView ? "Login" : "Register"}
                onSubmit={handleAuthentication}
              >
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter a valid email.
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    minLength="6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">
                    Password must be at least 6 characters.
                  </div>
                </div>
              </Form>

              <div className="text-center mt-3">
                <button
                  className="btn btn-link text-decoration-none"
                  onClick={() => setIsLoginView(!isLoginView)}
                >
                  {isLoginView
                    ? "Don't have an account? Register"
                    : "Already have an account? Login"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="row mb-5">
              <div className="col-12">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <h3 className="mb-0">Discover Jobs</h3>
                  <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: "350px" }}
                    placeholder="Search roles or companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="row g-4">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <div
                        className="col-12 col-sm-6 col-lg-4 col-xl-3"
                        key={job._id}
                      >
                        <JobCard
                          title={job.title}
                          company={job.company}
                          location={job.location}
                          type={job.type}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">
                      No jobs found matching your search.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className="mb-5" />
            <div className="row g-4 mb-4">
              <div className="col-12">
                <h3>My Applications</h3>
                <p className="text-muted mb-0">
                  Track the status of your recent job applications.
                </p>
              </div>
              <div className="col-12 col-md-4">
                <div className="card bg-primary text-white shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <h5 className="card-title">Applied</h5>
                    <h2 className="display-4 fw-bold mb-0">12</h2>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card bg-success text-white shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <h5 className="card-title">Accepted</h5>
                    <h2 className="display-4 fw-bold mb-0">2</h2>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card bg-danger text-white shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <h5 className="card-title">Rejected</h5>
                    <h2 className="display-4 fw-bold mb-0">3</h2>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

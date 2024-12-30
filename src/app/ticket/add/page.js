'use client';
import { useState, useEffect, useCallback } from 'react';
import ProfileListView from "src/component/ProfileListView";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Header from "src/component/Header";
import Footer from "src/component/Footer";
import "../../../../public/css/style.css"
import "../../../../public/css/responsive.css"
import { FRONTEND_TICKET, FRONTEND_TICKET_SUBJECT } from "../../../utils/frontendAPIEndPoints";
import { getDecodedToken, getOnlyToken, getUserLoginSession, getTicketSubjectData } from "../../../utils/frontendCommonFunction";
import { ManageAPIsData } from '../../../utils/commonFunction';

function TicketAdd() {

  const user_token_data = getOnlyToken();
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const decodedlogtkn = getDecodedToken();
    if (!decodedlogtkn || !decodedlogtkn.data || !decodedlogtkn.data.id) {
      enqueueSnackbar("Something Wrong! Please login to continue access", { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedlogtkn);
  }, []);

  const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data.id;

  const [listSubjectData, getSubjectData] = useState([]);

  // Fetch Ticket Subject
  const fetchData = useCallback(async () => {
    try {
      const data1 = await getTicketSubjectData();
      if (data1.data.length) { getSubjectData(data1.data); }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const initialFormData = {
    subject_id: '',
    title: '',
    description: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (isUserLoggedIn) {
      setFormData(prevData => ({
        ...prevData,
        // email: decodedToken.data.email,
        user_id: decodedToken.data.id,
      }));
    }
  }, [isUserLoggedIn]);

  const [formErrors, setFormErrors] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    setSubmitting(true);

    let errors = {};

    if (!formData.subject_id) {
      errors.subject_id = 'Please select Subject';
    }
    if (!formData.title.trim()) {
      errors.title = 'Please enter title';
    }
    if (!formData.description.trim()) {
      errors.description = 'Please enter description';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {

        let response;
        response = await ManageAPIsData(FRONTEND_TICKET, 'POST', formData, user_token_data);

        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          setSubmitting(false);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          setFormData(initialFormData);
          setSubmitSuccess(true);
          setSubmitting(false);
          router.push(`/ticket`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      <>
        <Header />
        <div id="myProfile" key="TicketAdd">
          <div className="container">
            <div className="row">
              <ProfileListView />
              <div className="col-md-9">
                <div id="addressSection">
                  <div className="address-title">
                    <h3>Add New Ticket</h3>
                    <Link href="/ticket" className="btn new-address-btn">List</Link>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                      <div className="mb-3">
                        <label htmlFor="subject" className="form-label">Subject:</label>
                        <select
                          name="subject_id"
                          value={formData.subject_id}
                          onChange={handleChange}
                          className={`form-control ${formErrors.subject_id && 'is-invalid'}`}
                        >
                          <option value="">Select Subject</option>
                          {listSubjectData && listSubjectData.length && listSubjectData.map(subject => (
                            <option key={subject.id} value={subject.id}>
                              {subject.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title:</label>
                        <input placeholder='Enter ...' type="text" name="title" value={formData.title} onChange={handleChange} className={`form-control ${formErrors.title && 'is-invalid'}`} id="title" required />
                        <div className="invalid-feedback">
                          {formErrors.title}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description:</label>
                        <textarea placeholder='Enter ...' name="description" value={formData.description} onChange={handleChange} className={`form-control ${formErrors.description && 'is-invalid'}`} id="description" required />
                        <div className="invalid-feedback">
                          {formErrors.description}
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                    </form>
                    {submitSuccess && <p className="text-success mt-3">Ticket successfully Created</p>}
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    </>
  );
}

export default TicketAdd;

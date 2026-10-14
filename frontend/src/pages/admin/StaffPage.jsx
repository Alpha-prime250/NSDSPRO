import React, { useEffect, useState } from 'react';
import { api } from '../../api';

import {
  Users,
  UserPlus,
  CalendarCheck,
  Wallet,
  Trash2,
  X,
  Save,
  RotateCcw,
  Upload,
  FileText,
  User,
  Phone,
  Briefcase,
  MapPin,
  Lock,
  ArrowLeft
} from 'lucide-react';

// =====================================
// COMMON STYLES
// =====================================

const pageStyle = {
  padding: '2rem',
  width: '100%',
  minHeight: '100vh',
  boxSizing: 'border-box',
  background: '#f8fafc'
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#0f172a',
  marginBottom: '1.25rem',
  paddingBottom: '0.8rem',
  borderBottom: '1px solid #e2e8f0'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '0.4rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.72rem 0.8rem',
  border: '1px solid #cbd5e1',
  borderRadius: '7px',
  boxSizing: 'border-box',
  fontSize: '0.92rem',
  outline: 'none',
  background: '#fff'
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '95px',
  resize: 'vertical'
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer'
};

const primaryButton = {
  padding: '0.75rem 1.2rem',
  background: '#059669',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem'
};

const secondaryButton = {
  padding: '0.75rem 1.2rem',
  background: '#fff',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem'
};

const dangerButton = {
  border: 'none',
  background: '#fee2e2',
  color: '#dc2626',
  padding: '0.5rem',
  borderRadius: '6px',
  cursor: 'pointer'
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '1rem'
};

const grid3 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '1rem'
};

// =====================================
// SAFE DATE FORMATTER
// =====================================

const formatDate = (dateValue) => {
  if (!dateValue) return '-';

  try {
    const dateString = String(dateValue).trim();

    if (!dateString) return '-';

    let date;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(`${dateString}T00:00:00`);
    } else {
      date = new Date(dateString);
    }

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date Format Error:', error);
    return '-';
  }
};

// =====================================
// FORM FIELD COMPONENT
// =====================================

const Field = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  children
}) => {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && (
          <span style={{ color: '#dc2626', marginLeft: '3px' }}>
            *
          </span>
        )}
      </label>

      {children ? (
        children
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
        />
      )}
    </div>
  );
};

// =====================================
// COMPONENT
// =====================================

export default function StaffPage() {
  // =====================================
  // MAIN STATES
  // =====================================

  const [activeSection, setActiveSection] = useState('staff');

  const [staffList, setStaffList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [payrollList, setPayrollList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);

  // FULL ADD STAFF PAGE
  const [showStaffForm, setShowStaffForm] = useState(false);

  // ATTENDANCE / PAYROLL MODALS
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);

  // =====================================
  // STAFF FORM
  // =====================================

  const initialStaffForm = {
    employee_id: '',
    first_name: '',
    last_name: '',
    name: '',

    gender: '',
    date_of_birth: '',
    marital_status: '',

    father_name: '',
    mother_name: '',

    phone: '',
    emergency_contact: '',
    email: '',

    user_id: '',
    password: '',
    status: 'Active',

    role: '',
    department: '',
    designation: '',
    joining_date: '',
    qualification: '',
    work_experience: '',
    contract_type: '',

    salary: '',
    epf_number: '',
    pay_scale: '',
    shift: '',

    current_address: '',
    permanent_address: '',
    location: '',
    state: '',

    profile_photo: '',
    resume: '',
    joining_letter: '',
    resignation_letter: '',
    other_document_name: '',
    other_document: ''
  };

  const [staffForm, setStaffForm] = useState(initialStaffForm);

  // =====================================
  // ATTENDANCE FORM
  // =====================================

  const [attendanceForm, setAttendanceForm] = useState({
    staff_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });

  // =====================================
  // PAYROLL FORM
  // =====================================

  const [payrollForm, setPayrollForm] = useState({
    staff_id: '',
    salary_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    month: '',
    payment_status: 'Paid'
  });

  // =====================================
  // DYNAMIC STAFF ROLES
  // =====================================

  const [staffRoles, setStaffRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const loadStaffRoles = async () => {
    try {
      setRolesLoading(true);

      const data = await api.getStaffRoles();

      const rolesData = Array.isArray(data)
        ? data
        : data.data || data.roles || [];

      setStaffRoles(rolesData);

      return rolesData;
    } catch (error) {
      console.error('Staff Roles Load Error:', error);
      setStaffRoles([]);
      return [];
    } finally {
      setRolesLoading(false);
    }
  };

  const addStaffRole = async () => {
    const roleName = window.prompt('Enter new Staff Role name:');

    if (roleName === null) return;

    const trimmedRoleName = roleName.trim();

    if (!trimmedRoleName) {
      alert('Staff Role name is required.');
      return;
    }

    try {
      await api.createStaffRole({
        role_name: trimmedRoleName
      });

      const updatedRoles = await loadStaffRoles();

      const addedRole = updatedRoles.find(
        (role) =>
          String(role.role_name || '').toLowerCase() ===
          trimmedRoleName.toLowerCase()
      );

      setStaffForm((prev) => ({
        ...prev,
        role: addedRole
          ? addedRole.role_name
          : trimmedRoleName
      }));

      alert('Staff Role added successfully!');
    } catch (error) {
      console.error('Staff Role Add Error:', error);
      alert(error.message || 'Staff Role add करते समय error आया');
    }
  };

  const deleteStaffRole = async () => {
    const selectedRoleName = String(staffForm.role || '').trim();

    if (!selectedRoleName) {
      alert('Delete करने के लिए पहले Staff Role select करें।');
      return;
    }

    const selectedRole = staffRoles.find(
      (role) =>
        String(role.role_name || '').toLowerCase() ===
        selectedRoleName.toLowerCase()
    );

    if (!selectedRole?.id) {
      alert('Selected Staff Role नहीं मिला।');
      return;
    }

    const confirmed = window.confirm(
      `क्या आप "${selectedRole.role_name}" Staff Role delete करना चाहते हैं?`
    );

    if (!confirmed) return;

    try {
      await api.deleteStaffRole(selectedRole.id);
      await loadStaffRoles();

      setStaffForm((prev) => ({
        ...prev,
        role: ''
      }));

      alert('Staff Role deleted successfully!');
    } catch (error) {
      console.error('Staff Role Delete Error:', error);
      alert(error.message || 'Staff Role delete करते समय error आया');
    }
  };

  // =====================================
  // LOAD STAFF
  // =====================================

  const loadStaff = async () => {
    try {
      setLoading(true);

      const data = await api.getStaff();

      const staffData = Array.isArray(data)
        ? data
        : data.data || data.staff || [];

      setStaffList(staffData);

      return staffData;
    } catch (error) {
      console.error('Staff Load Error:', error);
      alert('Staff data load नहीं हुआ। Backend check करें.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD ATTENDANCE
  // =====================================

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const data = await api.getAttendance();

      const attendanceData = Array.isArray(data)
        ? data
        : data.data || data.attendance || [];

      setAttendanceList(attendanceData);
    } catch (error) {
      console.error(
        'Attendance Load Error:',
        error
      );

      alert(
        'Attendance data load नहीं हुआ। Backend route check करें.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD PAYROLL
  // =====================================

  const loadPayroll = async () => {
    try {
      setLoading(true);

      const data = await api.getPayroll();

      const payrollData = Array.isArray(data)
        ? data
        : data.data || data.payroll || [];

      setPayrollList(payrollData);
    } catch (error) {
      console.error(
        'Payroll Load Error:',
        error
      );

      alert(
        'Payroll data load नहीं हुआ। Backend route check करें.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    loadStaff();
    loadStaffRoles();
  }, []);

  // =====================================
  // CHANGE SECTION
  // =====================================

  const changeSection = async (section) => {
    setActiveSection(section);

    if (section === 'staff') {
      await loadStaff();
    }

    if (section === 'attendance') {
      await loadStaff();
      await loadAttendance();
    }

    if (section === 'payroll') {
      await loadStaff();
      await loadPayroll();
    }
  };

  // =====================================
  // STAFF INPUT CHANGE
  // =====================================

  const handleStaffChange = (e) => {
    const { name, value } = e.target;

    setStaffForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =====================================
  // FILE CHANGE
  // =====================================

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (!files || !files[0]) {
      setStaffForm((prev) => ({
        ...prev,
        [name]: ''
      }));

      return;
    }

    // Currently stores selected file name.
    // Actual file upload requires multer/storage backend.
    setStaffForm((prev) => ({
      ...prev,
      [name]: files[0].name
    }));
  };

  // =====================================
  // RESET STAFF FORM
  // =====================================

  const resetStaffForm = () => {
    setStaffForm(initialStaffForm);
  };

  // =====================================
  // OPEN STAFF FORM
  // =====================================

  const openStaffForm = () => {
    setStaffForm(initialStaffForm);
    setShowStaffForm(true);
  };

  // =====================================
  // CLOSE STAFF FORM
  // =====================================

  const closeStaffForm = () => {
    setShowStaffForm(false);
  };

  // =====================================
  // ADD STAFF
  // =====================================

  const addStaff = async (e) => {
    e.preventDefault();

    if (!staffForm.first_name) {
      alert('First Name is required');
      return;
    }

    if (!staffForm.role) {
      alert('Staff Role is required');
      return;
    }

    if (!staffForm.joining_date) {
      alert('Date of Joining is required');
      return;
    }

    try {
      setSavingStaff(true);

      // Full name for old/current staff compatibility
      const fullName = `${staffForm.first_name} ${staffForm.last_name}`
        .trim();

      const payload = {
        employee_id: staffForm.employee_id,

        first_name: staffForm.first_name,
        last_name: staffForm.last_name,

        // Existing DB compatibility
        name: fullName,

        gender: staffForm.gender,
        date_of_birth: staffForm.date_of_birth || null,
        marital_status: staffForm.marital_status,

        father_name: staffForm.father_name,
        mother_name: staffForm.mother_name,

        phone: staffForm.phone,
        emergency_contact: staffForm.emergency_contact,
        email: staffForm.email,

        user_id: staffForm.user_id,
        password: staffForm.password,

        status: staffForm.status,

        role: staffForm.role,
        department: staffForm.department,
        designation: staffForm.designation,

        joining_date: staffForm.joining_date,

        qualification: staffForm.qualification,
        work_experience: staffForm.work_experience,
        contract_type: staffForm.contract_type,

        salary: Number(staffForm.salary || 0),

        epf_number: staffForm.epf_number,
        pay_scale: staffForm.pay_scale,
        shift: staffForm.shift,

        current_address: staffForm.current_address,
        permanent_address: staffForm.permanent_address,

        location: staffForm.location,
        state: staffForm.state,

        profile_photo: staffForm.profile_photo,
        resume: staffForm.resume,
        joining_letter: staffForm.joining_letter,
        resignation_letter: staffForm.resignation_letter,

        other_document_name:
          staffForm.other_document_name,

        other_document:
          staffForm.other_document
      };

      await api.createStaff(payload);

      alert('Staff successfully added!');

      setStaffForm(initialStaffForm);

      setShowStaffForm(false);

      await loadStaff();

    } catch (error) {
      console.error(
        'Staff Add Error:',
        error
      );

      alert(
        'Staff add करते समय error आया'
      );
    } finally {
      setSavingStaff(false);
    }
  };

  // =====================================
  // DELETE STAFF
  // =====================================

  const deleteStaff = async (id) => {
    const confirmDelete = window.confirm(
      'क्या आप इस Staff को delete करना चाहते हैं?'
    );

    if (!confirmDelete) return;

    try {
      await api.deleteStaff(id);

      alert('Staff deleted successfully');

      await loadStaff();

    } catch (error) {
      console.error(
        'Staff Delete Error:',
        error
      );

      alert(
        'Staff delete नहीं हुआ'
      );
    }
  };

  // =====================================
  // ADD ATTENDANCE
  // =====================================

  const addAttendance = async (e) => {
    e.preventDefault();

    if (
      !attendanceForm.staff_id ||
      !attendanceForm.attendance_date ||
      !attendanceForm.status
    ) {
      alert(
        'Staff, attendance date and status are required'
      );

      return;
    }

    try {
      await api.createAttendance({
        staff_id: String(attendanceForm.staff_id),
        attendance_date: attendanceForm.attendance_date,
        status: attendanceForm.status
      });

      alert(
        'Attendance successfully saved!'
      );

      setShowAttendanceForm(false);

      setAttendanceForm({
        staff_id: '',
        attendance_date:
          new Date().toISOString().split('T')[0],
        status: 'Present'
      });

      await loadAttendance();

    } catch (error) {
      console.error(
        'Attendance Save Error:',
        error
      );

      alert(
        'Attendance save करते समय error आया'
      );
    }
  };

  // =====================================
  // ADD PAYROLL
  // =====================================

  const addPayroll = async (e) => {
    e.preventDefault();

    if (
      !payrollForm.staff_id ||
      !payrollForm.salary_amount ||
      !payrollForm.payment_date ||
      !payrollForm.month ||
      !payrollForm.payment_status
    ) {
      alert(
        'Staff, salary amount, payment date, month and payment status are required'
      );

      return;
    }

    try {
      await api.createPayroll({
        staff_id: String(payrollForm.staff_id),
        salary_amount: Number(payrollForm.salary_amount || 0),
        payment_date: payrollForm.payment_date,
        month: payrollForm.month,
        payment_status: payrollForm.payment_status
      });

      alert(
        'Salary payment successfully saved!'
      );

      setShowPayrollForm(false);

      setPayrollForm({
        staff_id: '',
        salary_amount: '',
        payment_date:
          new Date().toISOString().split('T')[0],
        month: '',
        payment_status: 'Paid'
      });

      await loadPayroll();

    } catch (error) {
      console.error(
        'Payroll Save Error:',
        error
      );

      alert(
        'Payroll save करते समय error आया'
      );
    }
  };

  // =====================================
  // GET STAFF NAME
  // =====================================

  const getStaffName = (id) => {
    const staff = staffList.find(
      (item) =>
        String(item.id) === String(id)
    );

    return staff
      ? (
          staff.name ||
          `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
        )
      : 'Unknown';
  };

  // =====================================
  // OPEN ATTENDANCE FORM
  // =====================================

  const openAttendanceForm = async () => {
    await loadStaff();

    setAttendanceForm({
      staff_id: '',
      attendance_date:
        new Date().toISOString().split('T')[0],
      status: 'Present'
    });

    setShowAttendanceForm(true);
  };

  // =====================================
  // OPEN PAYROLL FORM
  // =====================================

  const openPayrollForm = async () => {
    await loadStaff();

    setPayrollForm({
      staff_id: '',
      salary_amount: '',
      payment_date:
        new Date().toISOString().split('T')[0],
      month: '',
      payment_status: 'Paid'
    });

    setShowPayrollForm(true);
  };

  // =====================================
  // FULL ADD STAFF PAGE
  // =====================================

  if (showStaffForm) {
    return (
      <div style={pageStyle}>

        {/* =====================================
            TOP HEADER
        ===================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >

          <div>
            <button
              type="button"
              onClick={closeStaffForm}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: 0,
                marginBottom: '0.6rem'
              }}
            >
              <ArrowLeft size={18} />
              Back to Staff Management
            </button>

            <h1
              style={{
                margin: 0,
                fontSize: '1.8rem',
                color: '#0f172a'
              }}
            >
              Add New Staff Member
            </h1>

            <p
              style={{
                margin: '0.4rem 0 0',
                color: '#64748b'
              }}
            >
              Add complete staff member information
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.7rem',
              flexWrap: 'wrap'
            }}
          >

            <button
              type="button"
              onClick={resetStaffForm}
              style={secondaryButton}
            >
              <RotateCcw size={17} />
              Reset Form
            </button>

            <button
              type="submit"
              form="staff-full-form"
              style={{
                ...primaryButton,
                opacity: savingStaff ? 0.7 : 1
              }}
              disabled={savingStaff}
            >
              <Save size={17} />

              {savingStaff
                ? 'Saving...'
                : 'Save Staff'}
            </button>

          </div>
        </div>

        {/* =====================================
            STAFF FORM
        ===================================== */}

        <form
          id="staff-full-form"
          onSubmit={addStaff}
        >

          {/* =====================================
              BASIC INFORMATION
          ===================================== */}

          <div style={cardStyle}>

            <div style={sectionTitleStyle}>
              <User size={20} />
              Basic Information
            </div>

            <div style={grid3}>

              <Field
                label="Employee ID"
                name="employee_id"
                value={staffForm.employee_id}
                onChange={handleStaffChange}
                placeholder="Enter employee ID"
              />

              <div>
                <label style={labelStyle}>
                  Staff Role
                  <span style={{ color: '#dc2626', marginLeft: '3px' }}>
                    *
                  </span>
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <select
                    name="role"
                    value={staffForm.role}
                    onChange={handleStaffChange}
                    required
                    style={{ ...selectStyle, flex: 1 }}
                  >
                    <option value="">
                      {rolesLoading
                        ? 'Loading Staff Roles...'
                        : 'Select Staff Role'}
                    </option>

                    {staffRoles.map((role) => (
                      <option
                        key={role.id}
                        value={role.role_name}
                      >
                        {role.role_name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={addStaffRole}
                    title="Add New Staff Role"
                    style={{
                      width: '44px',
                      height: '44px',
                      flexShrink: 0,
                      border: 'none',
                      borderRadius: '8px',
                      background: '#059669',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={deleteStaffRole}
                    title="Delete Selected Staff Role"
                    disabled={!staffForm.role || rolesLoading}
                    style={{
                      width: '44px',
                      height: '44px',
                      flexShrink: 0,
                      border: 'none',
                      borderRadius: '8px',
                      background: staffForm.role && !rolesLoading ? '#dc2626' : '#cbd5e1',
                      color: '#fff',
                      cursor: staffForm.role && !rolesLoading ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: staffForm.role && !rolesLoading ? 1 : 0.7
                    }}
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              </div>

              <Field
                label="Gender"
                name="gender"
                value={staffForm.gender}
                onChange={handleStaffChange}
              >
                <select
                  name="gender"
                  value={staffForm.gender}
                  onChange={handleStaffChange}
                  style={selectStyle}
                >
                  <option value="">
                    Select Gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </Field>

              <Field
                label="First Name"
                name="first_name"
                value={staffForm.first_name}
                onChange={handleStaffChange}
                placeholder="Enter first name"
                required
              />

              <Field
                label="Last Name"
                name="last_name"
                value={staffForm.last_name}
                onChange={handleStaffChange}
                placeholder="Enter last name"
              />

              <Field
                label="Date of Birth"
                name="date_of_birth"
                value={staffForm.date_of_birth}
                onChange={handleStaffChange}
                type="date"
              />

              <Field
                label="Marital Status"
                name="marital_status"
                value={staffForm.marital_status}
                onChange={handleStaffChange}
              >
                <select
                  name="marital_status"
                  value={staffForm.marital_status}
                  onChange={handleStaffChange}
                  style={selectStyle}
                >
                  <option value="">
                    Select Marital Status
                  </option>

                  <option value="Single">
                    Single
                  </option>

                  <option value="Married">
                    Married
                  </option>

                  <option value="Divorced">
                    Divorced
                  </option>

                  <option value="Widowed">
                    Widowed
                  </option>
                </select>
              </Field>

              <Field
                label="Father Name"
                name="father_name"
                value={staffForm.father_name}
                onChange={handleStaffChange}
                placeholder="Enter father name"
              />

              <Field
                label="Mother Name"
                name="mother_name"
                value={staffForm.mother_name}
                onChange={handleStaffChange}
                placeholder="Enter mother name"
              />

            </div>

          </div>

          {/* =====================================
              PROFILE PHOTO
          ===================================== */}

          <div style={cardStyle}>

            <div style={sectionTitleStyle}>
              <User size={20} />
              Profile Photo
            </div>

            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '1.5rem',
                textAlign: 'center',
                background: '#f8fafc'
              }}
            >

              <Upload
                size={30}
                color="#64748b"
              />

              <p
                style={{
                  margin: '0.6rem 0',
                  color: '#475569'
                }}
              >
                Upload Staff Profile Photo
              </p>

              <input
                type="file"
                name="profile_photo"
                accept="image/*"
                onChange={handleFileChange}
              />

              {staffForm.profile_photo && (
                <p
                  style={{
                    color: '#059669',
                    fontSize: '0.85rem',
                    marginTop: '0.6rem'
                  }}
                >
                  Selected: {staffForm.profile_photo}
                </p>
              )}

            </div>

          </div>

          {/* =====================================
              CONTACT INFORMATION
          ===================================== */}

          <div style={cardStyle}>

            <div style={sectionTitleStyle}>
              <Phone size={20} />
              Contact Information
            </div>

            <div style={grid3}>

              <Field
                label="Phone"
                name="phone"
                value={staffForm.phone}
                onChange={handleStaffChange}
                placeholder="Enter phone number"
              />

              <Field
                label="Emergency Contact"
                name="emergency_contact"
                value={staffForm.emergency_contact}
                onChange={handleStaffChange}
                placeholder="Emergency contact number"
              />

              <Field
                label="Email"
                name="email"
                value={staffForm.email}
                onChange={handleStaffChange}
                type="email"
                placeholder="Enter email address"
              />

            </div>

          </div>

          {/* =====================================
              ACCOUNT & ACCESS
          ===================================== */}

          <div style={cardStyle}>

            <div style={sectionTitleStyle}>
              <Lock size={20} />
              Account & Access
            </div>

            <div style={grid3}>

              <Field
                label="User ID"
                name="user_id"
                value={staffForm.user_id}
                onChange={handleStaffChange}
                placeholder="Enter user ID"
              />

              <Field
                label="Password"
                name="password"
                value={staffForm.password}
                onChange={handleStaffChange}
                type="password"
                placeholder="Enter password"
              />

              <Field
                label="Staff Status"
                name="status"
                value={staffForm.status}
                onChange={handleStaffChange}
              >
                <select
                  name="status"
                  value={staffForm.status}
                  onChange={handleStaffChange}
                  style={selectStyle}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </Field>

            </div>

          </div>

          {/* =====================================
              PROFESSIONAL INFORMATION
          ===================================== */}

          <div style={cardStyle}>

            <div style={sectionTitleStyle}>
              <Briefcase size={20} />
              Professional Information
            </div>

            <div style={grid3}>

              <Field
                label="Department"
                name="department"
                value={staffForm.department}
                onChange={handleStaffChange}
                placeholder="Enter department"
              />

              <Field
                label="Designation"
                name="designation"
                value={staffForm.designation}
                onChange={handleStaffChange}
                placeholder="Enter designation"
              />

              <Field
                label="Date of Joining"
                name="joining_date"
                value={staffForm.joining_date}
                onChange={handleStaffChange}
                type="date"
                required
              />

              <Field
                label="Qualification"
                name="qualification"
                value={staffForm.qualification}
                onChange={handleStaffChange}
                placeholder="Enter qualification"
              />

              <Field
                label="Work Experience"
                name="work_experience"
                value={staffForm.work_experience}
                onChange={handleStaffChange}
                placeholder="Example: 2 Years"
              />

              <Field
                label="Contract Type"
                name="contract_type"
                value={staffForm.contract_type}
                onChange={handleStaffChange}
              >
                <select
                  name="contract_type"
                  value={staffForm.contract_type}
                  onChange={handleStaffChange}
                  style={selectStyle}
                >
                  <option value="">
                    Select Contract Type
                  </option>

                  <option value="Permanent">
                    Permanent
                  </option>

                  <option value="Contract">
                    Contract
                  </option>

                  <option value="Temporary">
                    Temporary
                  </option>

                  <option value="Part Time">
                    Part Time
                  </option>
                </select>
              </Field>

              <Field
                label="Basic Salary"
                name="salary"
                value={staffForm.salary}
                onChange={handleStaffChange}
                type="number"
                placeholder="Enter basic salary"
              />

              <Field
                label="EPF Number"
                name="epf_number"
                value={staffForm.epf_number}
                onChange={handleStaffChange}
                placeholder="Enter EPF number"
              />

              <Field
                label="Pay Scale"
                name="pay_scale"
                value={staffForm.pay_scale}
                onChange={handleStaffChange}
                placeholder="Enter pay scale"
              />

              <Field
                label="Shift"
                name="shift"
                value={staffForm.shift}
                onChange={handleStaffChange}
              >
                <select
                  name="shift"
                  value={staffForm.shift}
                  onChange={handleStaffChange}
                  style={selectStyle}
                >
                  <option value="">
                    Select Shift
                  </option>

                  <option value="Morning">
                    Morning
                  </option>

                  <option value="General">
                    General
                  </option>

                  <option value="Evening">
                    Evening
                  </option>

                  <option value="Night">
                    Night
                  </option>
                </select>
              </Field>

            </div>

          </div>

          {/* =====================================
              ADDRESS INFORMATION
          ===================================== */}

          <div style={cardStyle}>

            <div style={sectionTitleStyle}>
              <MapPin size={20} />
              Address Information
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '1rem'
              }}
            >

              <div>
                <label style={labelStyle}>
                  Current / Local Address
                </label>

                <textarea
                  name="current_address"
                  value={staffForm.current_address}
                  onChange={handleStaffChange}
                  placeholder="Enter current address"
                  style={textareaStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Permanent Address
                </label>

                <textarea
                  name="permanent_address"
                  value={staffForm.permanent_address}
                  onChange={handleStaffChange}
                  placeholder="Enter permanent address"
                  style={textareaStyle}
                />
              </div>

              <Field
                label="Location"
                name="location"
                value={staffForm.location}
                onChange={handleStaffChange}
                placeholder="Enter location"
              />

              <Field
                label="State"
                name="state"
                value={staffForm.state}
                onChange={handleStaffChange}
                placeholder="Enter state"
              />

            </div>

          </div>

          {/* =====================================
              DOCUMENTS
          ===================================== */}

          <div style={cardStyle}>

            <div style={sectionTitleStyle}>
              <FileText size={20} />
              Documents
            </div>

            <div style={grid2}>

              {/* Resume */}

              <div>
                <label style={labelStyle}>
                  Resume
                </label>

                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={inputStyle}
                />

                {staffForm.resume && (
                  <small>
                    Selected: {staffForm.resume}
                  </small>
                )}
              </div>

              {/* Joining Letter */}

              <div>
                <label style={labelStyle}>
                  Joining Letter
                </label>

                <input
                  type="file"
                  name="joining_letter"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={inputStyle}
                />

                {staffForm.joining_letter && (
                  <small>
                    Selected: {staffForm.joining_letter}
                  </small>
                )}
              </div>

              {/* Resignation Letter */}

              <div>
                <label style={labelStyle}>
                  Resignation Letter
                </label>

                <input
                  type="file"
                  name="resignation_letter"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={inputStyle}
                />

                {staffForm.resignation_letter && (
                  <small>
                    Selected: {staffForm.resignation_letter}
                  </small>
                )}
              </div>

              {/* Other Document Name */}

              <Field
                label="Other Document Name"
                name="other_document_name"
                value={
                  staffForm.other_document_name
                }
                onChange={handleStaffChange}
                placeholder="Enter document name"
              />

              {/* Other Document */}

              <div>
                <label style={labelStyle}>
                  Other Document
                </label>

                <input
                  type="file"
                  name="other_document"
                  onChange={handleFileChange}
                  style={inputStyle}
                />

                {staffForm.other_document && (
                  <small>
                    Selected: {staffForm.other_document}
                  </small>
                )}
              </div>

            </div>

          </div>

          {/* =====================================
              BOTTOM BUTTONS
          ===================================== */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.8rem',
              paddingBottom: '2rem'
            }}
          >

            <button
              type="button"
              onClick={closeStaffForm}
              style={secondaryButton}
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="button"
              onClick={resetStaffForm}
              style={secondaryButton}
            >
              <RotateCcw size={17} />
              Reset Form
            </button>

            <button
              type="submit"
              style={{
                ...primaryButton,
                opacity: savingStaff ? 0.7 : 1
              }}
              disabled={savingStaff}
            >
              <Save size={17} />

              {savingStaff
                ? 'Saving Staff...'
                : 'Save Staff'}
            </button>

          </div>

        </form>

        {/* =====================================
            RESPONSIVE STYLE
        ===================================== */}

        <style>
          {`
            @media (max-width: 900px) {
              .staff-responsive-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 650px) {
              .staff-responsive-grid-3 {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>

      </div>
    );
  }

  // =====================================
  // MAIN STAFF MANAGEMENT PAGE
  // =====================================

  return (
    <div style={pageStyle}>

      {/* =====================================
          HEADER
      ===================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >

        <div>

          <h1
            style={{
              fontSize: '2rem',
              margin: 0,
              color: '#1e293b'
            }}
          >
            👥 Staff Management
          </h1>

          <p
            style={{
              color: '#64748b',
              marginTop: '0.5rem'
            }}
          >
            Manage staff, attendance and payroll
          </p>

        </div>

        {/* STAFF BUTTON */}

        {activeSection === 'staff' && (
          <button
            onClick={openStaffForm}
            style={primaryButton}
          >
            <UserPlus size={18} />
            Add Staff
          </button>
        )}

        {/* ATTENDANCE BUTTON */}

        {activeSection === 'attendance' && (
          <button
            onClick={openAttendanceForm}
            style={primaryButton}
          >
            <CalendarCheck size={18} />
            Mark Attendance
          </button>
        )}

        {/* PAYROLL BUTTON */}

        {activeSection === 'payroll' && (
          <button
            onClick={openPayrollForm}
            style={primaryButton}
          >
            <Wallet size={18} />
            Pay Salary
          </button>
        )}

      </div>

      {/* =====================================
          TABS
      ===================================== */}

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}
      >

        <button
          onClick={() =>
            changeSection('staff')
          }
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background:
              activeSection === 'staff'
                ? '#059669'
                : 'white',
            color:
              activeSection === 'staff'
                ? 'white'
                : '#334155'
          }}
        >
          <Users size={20} />
          Staff
        </button>

        <button
          onClick={() =>
            changeSection('attendance')
          }
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background:
              activeSection === 'attendance'
                ? '#059669'
                : 'white',
            color:
              activeSection === 'attendance'
                ? 'white'
                : '#334155'
          }}
        >
          <CalendarCheck size={20} />
          Attendance
        </button>

        <button
          onClick={() =>
            changeSection('payroll')
          }
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background:
              activeSection === 'payroll'
                ? '#059669'
                : 'white',
            color:
              activeSection === 'payroll'
                ? 'white'
                : '#334155'
          }}
        >
          <Wallet size={20} />
          Payroll
        </button>

      </div>

      {/* =====================================
          STAFF SECTION
      ===================================== */}

      {activeSection === 'staff' && (

        <div style={cardStyle}>

          <h2
            style={{
              marginTop: 0,
              color: '#0f172a'
            }}
          >
            All Staff Members
          </h2>

          {loading ? (

            <p>Loading staff...</p>

          ) : staffList.length === 0 ? (

            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b'
              }}
            >
              <Users
                size={40}
                style={{
                  marginBottom: '0.5rem'
                }}
              />

              <p>
                No Staff Added Yet
              </p>
            </div>

          ) : (

            <div
              style={{
                overflowX: 'auto'
              }}
            >

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}
              >

                <thead>

                  <tr
                    style={{
                      background: '#f8fafc'
                    }}
                  >

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Name
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Phone
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Role
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Salary
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Status
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {staffList.map((staff) => (

                    <tr
                      key={staff.id}
                      style={{
                        borderBottom:
                          '1px solid #e2e8f0'
                      }}
                    >

                      <td
                        style={{
                          padding: '1rem'
                        }}
                      >
                        {staff.name ||
                          `${staff.first_name || ''} ${staff.last_name || ''}`.trim() ||
                          '-'}
                      </td>

                      <td
                        style={{
                          padding: '1rem'
                        }}
                      >
                        {staff.phone || '-'}
                      </td>

                      <td
                        style={{
                          padding: '1rem'
                        }}
                      >
                        {staff.role || '-'}
                      </td>

                      <td
                        style={{
                          padding: '1rem'
                        }}
                      >
                        ₹
                        {Number(
                          staff.salary || 0
                        ).toFixed(2)}
                      </td>

                      <td
                        style={{
                          padding: '1rem'
                        }}
                      >
                        <span
                          style={{
                            padding:
                              '0.35rem 0.7rem',
                            borderRadius:
                              '999px',
                            background:
                              staff.status ===
                              'Active'
                                ? '#dcfce7'
                                : '#fee2e2',
                            color:
                              staff.status ===
                              'Active'
                                ? '#166534'
                                : '#991b1b',
                            fontSize:
                              '0.8rem',
                            fontWeight: '600'
                          }}
                        >
                          {staff.status ||
                            'Active'}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: '1rem'
                        }}
                      >

                        <button
                          onClick={() =>
                            deleteStaff(
                              staff.id
                            )
                          }
                          style={dangerButton}
                          title="Delete Staff"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

      {/* =====================================
          ATTENDANCE SECTION
      ===================================== */}

      {activeSection === 'attendance' && (

        <div style={cardStyle}>

          <h2
            style={{
              marginTop: 0,
              color: '#0f172a'
            }}
          >
            📅 Staff Attendance History
          </h2>

          {loading ? (

            <p>Loading attendance...</p>

          ) : attendanceList.length === 0 ? (

            <p>
              No attendance records found.
            </p>

          ) : (

            <div
              style={{
                overflowX: 'auto'
              }}
            >

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}
              >

                <thead>

                  <tr
                    style={{
                      background: '#f8fafc'
                    }}
                  >

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Staff
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Date
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {attendanceList.map(
                    (item) => (

                      <tr
                        key={item.id}
                        style={{
                          borderBottom:
                            '1px solid #e2e8f0'
                        }}
                      >

                        <td
                          style={{
                            padding: '1rem'
                          }}
                        >
                          {item.staff_name ||
                            item.name ||
                            getStaffName(
                              item.staff_id
                            )}
                        </td>

                        <td
                          style={{
                            padding: '1rem'
                          }}
                        >
                          {formatDate(
                            item.attendance_date
                          )}
                        </td>

                        <td
                          style={{
                            padding: '1rem'
                          }}
                        >
                          {item.status ||
                            '-'}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

      {/* =====================================
          PAYROLL SECTION
      ===================================== */}

      {activeSection === 'payroll' && (

        <div style={cardStyle}>

          <h2
            style={{
              marginTop: 0,
              color: '#0f172a'
            }}
          >
            💰 Payroll History
          </h2>

          {loading ? (

            <p>Loading payroll...</p>

          ) : payrollList.length === 0 ? (

            <p>
              No payroll records found.
            </p>

          ) : (

            <div
              style={{
                overflowX: 'auto'
              }}
            >

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}
              >

                <thead>

                  <tr
                    style={{
                      background: '#f8fafc'
                    }}
                  >

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Staff
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Month
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Salary
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Payment Date
                    </th>

                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {payrollList.map(
                    (item) => (

                      <tr
                        key={item.id}
                        style={{
                          borderBottom:
                            '1px solid #e2e8f0'
                        }}
                      >

                        <td
                          style={{
                            padding: '1rem'
                          }}
                        >
                          {item.staff_name ||
                            item.name ||
                            getStaffName(
                              item.staff_id
                            )}
                        </td>

                        <td
                          style={{
                            padding: '1rem'
                          }}
                        >
                          {item.month || '-'}
                        </td>

                        <td
                          style={{
                            padding: '1rem'
                          }}
                        >
                          ₹
                          {Number(
                            item.salary_amount ||
                              0
                          ).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: '1rem'
                          }}
                        >
                          {formatDate(
                            item.payment_date
                          )}
                        </td>

                        <td
                          style={{
                            padding: '1rem'
                          }}
                        >
                          {item.payment_status ||
                            '-'}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

      {/* =====================================
          ATTENDANCE MODAL
      ===================================== */}

      {showAttendanceForm && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
          }}
        >

          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              width: '450px',
              maxWidth: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}
            >

              <h2
                style={{
                  margin: 0
                }}
              >
                Mark Attendance
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowAttendanceForm(
                    false
                  )
                }
                style={{
                  border: 'none',
                  background:
                    'transparent',
                  cursor: 'pointer'
                }}
              >
                <X />
              </button>

            </div>

            <form
              onSubmit={addAttendance}
            >

              <label style={labelStyle}>
                Select Staff
              </label>

              <select
                value={
                  attendanceForm.staff_id
                }
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    staff_id:
                      e.target.value
                  })
                }
                required
                style={{
                  ...selectStyle,
                  marginBottom: '1rem'
                }}
              >

                <option value="">
                  Select Staff
                </option>

                {staffList.map(
                  (staff) => (

                    <option
                      key={staff.id}
                      value={staff.id}
                    >
                      {staff.name ||
                        `${staff.first_name || ''} ${staff.last_name || ''}`.trim()}
                    </option>

                  )
                )}

              </select>

              <label style={labelStyle}>
                Attendance Date
              </label>

              <input
                type="date"
                value={
                  attendanceForm.attendance_date
                }
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    attendance_date:
                      e.target.value
                  })
                }
                required
                style={{
                  ...inputStyle,
                  marginBottom:
                    '1rem'
                }}
              />

              <label style={labelStyle}>
                Status
              </label>

              <select
                value={
                  attendanceForm.status
                }
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    status:
                      e.target.value
                  })
                }
                required
                style={{
                  ...selectStyle,
                  marginBottom:
                    '1rem'
                }}
              >

                <option value="Present">
                  Present
                </option>

                <option value="Absent">
                  Absent
                </option>

                <option value="Half Day">
                  Half Day
                </option>

              </select>

              <button
                type="submit"
                style={{
                  ...primaryButton,
                  width: '100%'
                }}
              >
                <Save size={17} />
                Save Attendance
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =====================================
          PAYROLL MODAL
      ===================================== */}

      {showPayrollForm && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
          }}
        >

          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              width: '450px',
              maxWidth: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}
            >

              <h2
                style={{
                  margin: 0
                }}
              >
                Pay Staff Salary
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowPayrollForm(
                    false
                  )
                }
                style={{
                  border: 'none',
                  background:
                    'transparent',
                  cursor: 'pointer'
                }}
              >
                <X />
              </button>

            </div>

            <form
              onSubmit={addPayroll}
            >

              <label style={labelStyle}>
                Select Staff
              </label>

              <select
                value={
                  payrollForm.staff_id
                }
                onChange={(e) => {

                  const selectedStaff =
                    staffList.find(
                      (staff) =>
                        String(
                          staff.id
                        ) ===
                        String(
                          e.target.value
                        )
                    );

                  setPayrollForm({
                    ...payrollForm,
                    staff_id:
                      e.target.value,
                    salary_amount:
                      selectedStaff
                        ? selectedStaff.salary
                        : ''
                  });

                }}
                required
                style={{
                  ...selectStyle,
                  marginBottom:
                    '1rem'
                }}
              >

                <option value="">
                  Select Staff
                </option>

                {staffList.map(
                  (staff) => (

                    <option
                      key={staff.id}
                      value={staff.id}
                    >
                      {staff.name ||
                        `${staff.first_name || ''} ${staff.last_name || ''}`.trim()}
                    </option>

                  )
                )}

              </select>

              <label style={labelStyle}>
                Month
              </label>

              <input
                type="text"
                placeholder="Example: September 2026"
                value={
                  payrollForm.month
                }
                onChange={(e) =>
                  setPayrollForm({
                    ...payrollForm,
                    month:
                      e.target.value
                  })
                }
                required
                style={{
                  ...inputStyle,
                  marginBottom:
                    '1rem'
                }}
              />

              <label style={labelStyle}>
                Salary Amount
              </label>

              <input
                type="number"
                placeholder="Salary Amount"
                value={
                  payrollForm.salary_amount
                }
                onChange={(e) =>
                  setPayrollForm({
                    ...payrollForm,
                    salary_amount:
                      e.target.value
                  })
                }
                required
                style={{
                  ...inputStyle,
                  marginBottom:
                    '1rem'
                }}
              />

              <label style={labelStyle}>
                Payment Date
              </label>

              <input
                type="date"
                value={
                  payrollForm.payment_date
                }
                onChange={(e) =>
                  setPayrollForm({
                    ...payrollForm,
                    payment_date:
                      e.target.value
                  })
                }
                required
                style={{
                  ...inputStyle,
                  marginBottom:
                    '1rem'
                }}
              />

              <label style={labelStyle}>
                Payment Status
              </label>

              <select
                value={
                  payrollForm.payment_status
                }
                onChange={(e) =>
                  setPayrollForm({
                    ...payrollForm,
                    payment_status:
                      e.target.value
                  })
                }
                required
                style={{
                  ...selectStyle,
                  marginBottom:
                    '1rem'
                }}
              >

                <option value="Paid">
                  Paid
                </option>

                <option value="Pending">
                  Pending
                </option>

              </select>

              <button
                type="submit"
                style={{
                  ...primaryButton,
                  width: '100%'
                }}
              >
                <Save size={17} />
                Save Payroll
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

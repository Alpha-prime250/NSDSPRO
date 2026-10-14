import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Search,
  Loader2
} from 'lucide-react';

import { api } from '../../api';


// ======================================================
// API URL
// ======================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5050/api'
).replace(/\/$/, '');


export default function CustomerRegisterPage() {

  const navigate = useNavigate();


  // ======================================================
  // FORM
  // ======================================================

  const [form, setForm] = useState({

    name: '',

    phone: '',

    email: '',

    password: '',

    confirmPassword: '',

    pincode: '',

    address: ''

  });


  // ======================================================
  // GENERAL STATES
  // ======================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  // ======================================================
  // DELIVERY AVAILABILITY STATES
  // ======================================================

  const [checkingDelivery, setCheckingDelivery] =
    useState(false);

  const [deliveryChecked, setDeliveryChecked] =
    useState(false);

  const [deliveryAvailable, setDeliveryAvailable] =
    useState(false);

  const [deliveryZone, setDeliveryZone] =
    useState(null);

  const [deliveryMessage, setDeliveryMessage] =
    useState('');


  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm((prev) => ({

      ...prev,

      [name]: value

    }));


    if (error) {

      setError('');

    }


    // ------------------------------------------
    // If PIN changes, old availability becomes
    // invalid and must be checked again.
    // ------------------------------------------

    if (name === 'pincode') {

      setDeliveryChecked(false);

      setDeliveryAvailable(false);

      setDeliveryZone(null);

      setDeliveryMessage('');

    }

  };


  // ======================================================
  // CHECK DELIVERY AVAILABILITY
  // ======================================================

  const checkDeliveryAvailability = async () => {

    setError('');

    setDeliveryMessage('');

    setDeliveryZone(null);

    setDeliveryChecked(false);

    setDeliveryAvailable(false);


    const pincode =
      form.pincode.trim();


    // ------------------------------------------
    // PIN VALIDATION
    // ------------------------------------------

    if (!/^[0-9]{6}$/.test(pincode)) {

      setDeliveryMessage(
        'Please enter a valid 6-digit PIN code.'
      );

      setDeliveryChecked(true);

      return;

    }


    try {

      setCheckingDelivery(true);


      const response = await fetch(

        `${API_URL}/delivery-zones/check/${encodeURIComponent(pincode)}`

      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(

          data?.message ||

          data?.error ||

          'Unable to check delivery availability.'

        );

      }


      // ------------------------------------------
      // DELIVERY AVAILABLE
      // ------------------------------------------

      if (data?.available) {

        setDeliveryAvailable(true);

        setDeliveryChecked(true);

        setDeliveryZone(
          data.zone || null
        );

        setDeliveryMessage(
          data.message ||
          'Delivery Available'
        );

        return;

      }


      // ------------------------------------------
      // DELIVERY NOT AVAILABLE
      // ------------------------------------------

      setDeliveryAvailable(false);

      setDeliveryChecked(true);

      setDeliveryZone(null);

      setDeliveryMessage(

        data?.message ||

        'Delivery is not available for this PIN code.'

      );


    } catch (err) {

      console.error(
        'Delivery Availability Error:',
        err
      );


      setDeliveryAvailable(false);

      setDeliveryChecked(true);

      setDeliveryZone(null);

      setDeliveryMessage(

        err?.message ||

        'Unable to check delivery availability. Please try again.'

      );

    } finally {

      setCheckingDelivery(false);

    }

  };


  // ======================================================
  // SUBMIT REGISTRATION
  // ======================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');


    const name =
      form.name.trim();

    const phone =
      form.phone.trim();

    const email =
      form.email.trim().toLowerCase();

    const password =
      form.password;

    const confirmPassword =
      form.confirmPassword;

    const pincode =
      form.pincode.trim();

    const address =
      form.address.trim();


    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!name) {

      setError(
        'Please enter your full name.'
      );

      return;

    }


    if (!/^[0-9]{10}$/.test(phone)) {

      setError(
        'Please enter a valid 10-digit mobile number.'
      );

      return;

    }


    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

      setError(
        'Please enter a valid email address.'
      );

      return;

    }


    if (!password) {

      setError(
        'Password is required.'
      );

      return;

    }


    if (password.length < 6) {

      setError(
        'Password must be at least 6 characters.'
      );

      return;

    }


    if (password !== confirmPassword) {

      setError(
        'Password and Confirm Password do not match.'
      );

      return;

    }


    if (!/^[0-9]{6}$/.test(pincode)) {

      setError(
        'Please enter a valid 6-digit PIN code.'
      );

      return;

    }


    if (!address) {

      setError(
        'Please enter your delivery address.'
      );

      return;

    }


    // ==================================================
    // IMPORTANT DELIVERY CHECK
    // ==================================================

    if (!deliveryChecked) {

      setError(
        'Please check delivery availability for your PIN code first.'
      );

      return;

    }


    if (!deliveryAvailable) {

      setError(
        'Delivery is not available at this PIN code. Please enter another PIN code.'
      );

      return;

    }


    try {

      setLoading(true);


      // ==================================================
      // CUSTOMER DATA
      // ==================================================

      const customerData = {

        name,

        phone,

        email,

        password,

        pincode,

        address

      };


      console.log(
        'Customer registration data:',
        {
          name,
          phone,
          email,
          pincode,
          address
        }
      );


      // ==================================================
      // REGISTER CUSTOMER USING CENTRAL API
      // ==================================================

      const data =
        await api.registerCustomer(
          customerData
        );


      console.log(
        'Registration response:',
        data
      );


      // ==================================================
      // SAVE CUSTOMER TOKEN
      // ==================================================

      if (data?.token) {

        localStorage.setItem(

          'customer_token',

          data.token

        );

      }


      // ==================================================
      // SAVE CUSTOMER INFORMATION
      // ==================================================

      if (data?.customer) {

        localStorage.setItem(

          'store_customer',

          JSON.stringify(
            data.customer
          )

        );

      }


      // ==================================================
      // SAVE DELIVERY INFORMATION
      // ==================================================

      if (deliveryZone) {

        localStorage.setItem(

          'customer_delivery_zone',

          JSON.stringify(
            deliveryZone
          )

        );

      }


      // ==================================================
      // CUSTOMER REGISTERED
      // ==================================================

      localStorage.setItem(

        'customer_registered',

        'true'

      );


      // ==================================================
      // GET PREVIOUS SHOPPING PATH
      // ==================================================

      const shopPath =

        sessionStorage.getItem(
          'customer_shop_path'
        ) || '/shop';


      sessionStorage.removeItem(
        'customer_shop_path'
      );


      // ==================================================
      // GO TO SHOP
      // ==================================================

      navigate(shopPath);


    } catch (err) {

      console.error(

        'Customer Registration Error:',

        err

      );


      const message =

        err?.message ||

        'Unable to create account. Please try again.';


      // ------------------------------------------
      // DUPLICATE ACCOUNT
      // ------------------------------------------

      if (

        message
          .toLowerCase()
          .includes('already') ||

        message
          .toLowerCase()
          .includes('exists') ||

        message
          .toLowerCase()
          .includes('duplicate')

      ) {

        setError(

          'An account with this email or mobile number already exists. Please login instead.'

        );

      }

      // ------------------------------------------
      // DELIVERY ERROR FROM BACKEND
      // ------------------------------------------

      else if (

        message
          .toLowerCase()
          .includes('delivery')

      ) {

        setError(
          message
        );

        setDeliveryAvailable(false);

      }

      else {

        setError(
          message
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // ======================================================
  // STYLES
  // ======================================================

  const inputStyle = {

    width: '100%',

    boxSizing: 'border-box',

    padding:
      '0.85rem 1rem 0.85rem 2.7rem',

    border:
      '1px solid #dbe2e8',

    borderRadius: '10px',

    outline: 'none',

    fontSize: '0.9rem'

  };


  const labelStyle = {

    display: 'block',

    marginBottom: '0.4rem',

    fontWeight: '700',

    color: '#374151',

    fontSize: '0.85rem'

  };


  // ======================================================
  // UI
  // ======================================================

  return (

    <div
      style={{

        minHeight: '100vh',

        background: '#f6f8f7',

        display: 'flex',

        flexDirection: 'column'

      }}
    >

      {/* ==========================================
          TOP BRAND HEADER
      =========================================== */}

      <header
        style={{

          background: '#ffffff',

          borderBottom:
            '1px solid #e5e7eb',

          padding: '1rem 5%',

          display: 'flex',

          alignItems: 'center',

          justifyContent:
            'space-between'

        }}
      >

        <Link
          to="/"
          style={{

            textDecoration: 'none',

            color: 'inherit',

            display: 'flex',

            alignItems: 'center',

            gap: '0.75rem'

          }}
        >

          <div
            style={{

              width: '46px',

              height: '46px',

              borderRadius: '12px',

              background: '#08a66a',

              color: '#ffffff',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center'

            }}
          >

            <Store
              size={25}
            />

          </div>


          <div>

            <div
              style={{

                fontSize: '1.25rem',

                fontWeight: '800',

                color: '#172033'

              }}
            >
              Green Grocery & Retail Store
            </div>


            <div
              style={{

                fontSize: '0.8rem',

                color: '#718096'

              }}
            >
              Online Supermarket & Express Delivery
            </div>

          </div>

        </Link>


        <Link
          to="/"
          style={{

            textDecoration: 'none',

            color: '#087f5b',

            fontWeight: '700'

          }}
        >
          Home
        </Link>

      </header>


      {/* ==========================================
          MAIN
      =========================================== */}

      <main
        style={{

          flex: 1,

          display: 'flex',

          justifyContent: 'center',

          alignItems: 'center',

          padding: '3rem 1rem'

        }}
      >

        <div
          style={{

            width: '100%',

            maxWidth: '560px',

            background: '#ffffff',

            borderRadius: '18px',

            padding: '2rem',

            boxShadow:
              '0 10px 35px rgba(0,0,0,0.08)'

          }}
        >

          {/* ======================================
              TITLE
          ======================================= */}

          <div
            style={{

              textAlign: 'center',

              marginBottom: '1.75rem'

            }}
          >

            <div
              style={{

                width: '58px',

                height: '58px',

                margin:
                  '0 auto 1rem',

                borderRadius: '50%',

                background: '#e7f8f1',

                color: '#08a66a',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center'

              }}
            >

              <User
                size={28}
              />

            </div>


            <h1
              style={{

                margin: 0,

                fontSize: '1.7rem',

                fontWeight: '800',

                color: '#172033'

              }}
            >
              Create Your Account
            </h1>


            <p
              style={{

                marginTop: '0.5rem',

                color: '#718096',

                fontSize: '0.9rem'

              }}
            >
              Create your account before starting shopping.
            </p>

          </div>


          {/* ======================================
              ERROR
          ======================================= */}

          {error && (

            <div
              style={{

                background: '#fff1f2',

                border:
                  '1px solid #fecdd3',

                color: '#be123c',

                padding:
                  '0.75rem 1rem',

                borderRadius: '10px',

                marginBottom: '1rem',

                fontSize: '0.85rem',

                lineHeight: '1.5'

              }}
            >

              {error}

            </div>

          )}


          {/* ======================================
              FORM
          ======================================= */}

          <form
            onSubmit={handleSubmit}
            style={{

              display: 'flex',

              flexDirection: 'column',

              gap: '1rem'

            }}
          >

            {/* ==================================
                NAME
            =================================== */}

            <div>

              <label
                style={labelStyle}
              >
                Full Name *
              </label>


              <div
                style={{
                  position: 'relative'
                }}
              >

                <User
                  size={18}
                  style={{

                    position: 'absolute',

                    left: '14px',

                    top: '50%',

                    transform:
                      'translateY(-50%)',

                    color: '#94a3b8'

                  }}
                />


                <input
                  type="text"

                  name="name"

                  value={
                    form.name
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Enter your full name"

                  autoComplete="name"

                  required

                  style={
                    inputStyle
                  }

                />

              </div>

            </div>


            {/* ==================================
                PHONE
            =================================== */}

            <div>

              <label
                style={labelStyle}
              >
                Mobile Number *
              </label>


              <div
                style={{
                  position: 'relative'
                }}
              >

                <Phone
                  size={18}
                  style={{

                    position: 'absolute',

                    left: '14px',

                    top: '50%',

                    transform:
                      'translateY(-50%)',

                    color: '#94a3b8'

                  }}
                />


                <input
                  type="tel"

                  name="phone"

                  value={
                    form.phone
                  }

                  onChange={(e) => {

                    const value =
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);

                    setForm((prev) => ({

                      ...prev,

                      phone: value

                    }));

                    if (error) {

                      setError('');

                    }

                  }}

                  placeholder="Enter 10 digit mobile number"

                  autoComplete="tel"

                  required

                  style={
                    inputStyle
                  }

                />

              </div>

            </div>


            {/* ==================================
                EMAIL
            =================================== */}

            <div>

              <label
                style={labelStyle}
              >
                Email ID *
              </label>


              <div
                style={{
                  position: 'relative'
                }}
              >

                <Mail
                  size={18}
                  style={{

                    position: 'absolute',

                    left: '14px',

                    top: '50%',

                    transform:
                      'translateY(-50%)',

                    color: '#94a3b8'

                  }}
                />


                <input
                  type="email"

                  name="email"

                  value={
                    form.email
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Enter your email address"

                  autoComplete="email"

                  required

                  style={
                    inputStyle
                  }

                />

              </div>

            </div>


            {/* ==================================
                PASSWORD
            =================================== */}

            <div>

              <label
                style={labelStyle}
              >
                Password *
              </label>


              <div
                style={{
                  position: 'relative'
                }}
              >

                <Lock
                  size={18}
                  style={{

                    position: 'absolute',

                    left: '14px',

                    top: '50%',

                    transform:
                      'translateY(-50%)',

                    color: '#94a3b8'

                  }}
                />


                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }

                  name="password"

                  value={
                    form.password
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Create a password"

                  autoComplete="new-password"

                  required

                  style={{

                    ...inputStyle,

                    padding:
                      '0.85rem 3rem 0.85rem 2.7rem'

                  }}

                />


                <button
                  type="button"

                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }

                  style={{

                    position:
                      'absolute',

                    right: '10px',

                    top: '50%',

                    transform:
                      'translateY(-50%)',

                    border: 'none',

                    background:
                      'transparent',

                    cursor:
                      'pointer',

                    color:
                      '#64748b',

                    display:
                      'flex',

                    alignItems:
                      'center'

                  }}
                >

                  {showPassword ? (

                    <EyeOff
                      size={18}
                    />

                  ) : (

                    <Eye
                      size={18}
                    />

                  )}

                </button>

              </div>


              <div
                style={{

                  marginTop:
                    '0.35rem',

                  fontSize:
                    '0.75rem',

                  color:
                    '#718096'

                }}
              >
                Password must be at least 6 characters.
              </div>

            </div>


            {/* ==================================
                CONFIRM PASSWORD
            =================================== */}

            <div>

              <label
                style={labelStyle}
              >
                Confirm Password *
              </label>


              <div
                style={{
                  position: 'relative'
                }}
              >

                <Lock
                  size={18}
                  style={{

                    position: 'absolute',

                    left: '14px',

                    top: '50%',

                    transform:
                      'translateY(-50%)',

                    color: '#94a3b8'

                  }}
                />


                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }

                  name="confirmPassword"

                  value={
                    form.confirmPassword
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Re-enter your password"

                  autoComplete="new-password"

                  required

                  style={{

                    ...inputStyle,

                    padding:
                      '0.85rem 3rem 0.85rem 2.7rem'

                  }}

                />


                <button
                  type="button"

                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) =>
                        !prev
                    )
                  }

                  style={{

                    position:
                      'absolute',

                    right: '10px',

                    top: '50%',

                    transform:
                      'translateY(-50%)',

                    border: 'none',

                    background:
                      'transparent',

                    cursor:
                      'pointer',

                    color:
                      '#64748b',

                    display:
                      'flex',

                    alignItems:
                      'center'

                  }}
                >

                  {showConfirmPassword ? (

                    <EyeOff
                      size={18}
                    />

                  ) : (

                    <Eye
                      size={18}
                    />

                  )}

                </button>

              </div>

            </div>


            {/* ==================================
                PIN CODE
            =================================== */}

            <div>

              <label
                style={labelStyle}
              >
                Delivery PIN Code *
              </label>


              <div
                style={{

                  display: 'flex',

                  gap: '8px',

                  alignItems: 'stretch'

                }}
              >

                <div
                  style={{

                    position:
                      'relative',

                    flex: 1

                  }}
                >

                  <MapPin
                    size={18}
                    style={{

                      position:
                        'absolute',

                      left: '14px',

                      top: '50%',

                      transform:
                        'translateY(-50%)',

                      color:
                        '#94a3b8'

                    }}
                  />


                  <input
                    type="text"

                    name="pincode"

                    value={
                      form.pincode
                    }

                    onChange={(e) => {

                      const value =
                        e.target.value
                          .replace(
                            /\D/g,
                            ''
                          )
                          .slice(
                            0,
                            6
                          );

                      setForm(
                        (prev) => ({

                          ...prev,

                          pincode:
                            value

                        })
                      );

                      setDeliveryChecked(
                        false
                      );

                      setDeliveryAvailable(
                        false
                      );

                      setDeliveryZone(
                        null
                      );

                      setDeliveryMessage(
                        ''
                      );

                      if (error) {

                        setError('');

                      }

                    }}

                    placeholder="Enter 6 digit PIN"

                    inputMode="numeric"

                    autoComplete="postal-code"

                    maxLength={6}

                    required

                    style={
                      inputStyle
                    }

                  />

                </div>


                {/* CHECK BUTTON */}

                <button
                  type="button"

                  onClick={
                    checkDeliveryAvailability
                  }

                  disabled={
                    checkingDelivery ||
                    form.pincode.length !== 6
                  }

                  style={{

                    border: 'none',

                    borderRadius:
                      '10px',

                    padding:
                      '0 15px',

                    background:
                      form.pincode.length === 6 &&
                      !checkingDelivery

                        ? '#2563eb'

                        : '#cbd5e1',

                    color: '#ffffff',

                    fontWeight:
                      '700',

                    cursor:
                      form.pincode.length === 6 &&
                      !checkingDelivery

                        ? 'pointer'

                        : 'not-allowed',

                    whiteSpace:
                      'nowrap',

                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'center',

                    gap: '6px'

                  }}
                >

                  {checkingDelivery ? (

                    <>

                      <Loader2
                        size={16}
                        style={{
                          animation:
                            'spin 1s linear infinite'
                        }}
                      />

                      Checking...

                    </>

                  ) : (

                    <>

                      <Search
                        size={16}
                      />

                      Check

                    </>

                  )}

                </button>

              </div>


              {/* ==================================
                  AVAILABILITY RESULT
              =================================== */}

              {deliveryChecked && (

                <div
                  style={{

                    marginTop:
                      '10px',

                    borderRadius:
                      '10px',

                    padding:
                      '12px 14px',

                    background:
                      deliveryAvailable
                        ? '#f0fdf4'
                        : '#fff1f2',

                    border:
                      deliveryAvailable

                        ? '1px solid #bbf7d0'

                        : '1px solid #fecdd3',

                    color:
                      deliveryAvailable

                        ? '#166534'

                        : '#be123c'

                  }}
                >

                  <div
                    style={{

                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap: '8px',

                      fontWeight:
                        '800',

                      fontSize:
                        '0.9rem'

                    }}
                  >

                    {deliveryAvailable ? (

                      <CheckCircle
                        size={19}
                      />

                    ) : (

                      <XCircle
                        size={19}
                      />

                    )}


                    {deliveryAvailable

                      ? 'Delivery Available'

                      : 'Delivery Not Available'}

                  </div>


                  <div
                    style={{

                      marginTop:
                        '6px',

                      fontSize:
                        '0.8rem',

                      lineHeight:
                        '1.5'

                    }}
                  >

                    {deliveryMessage}

                  </div>


                  {/* AVAILABLE ZONE DETAILS */}

                  {deliveryAvailable &&
                    deliveryZone && (

                    <div
                      style={{

                        marginTop:
                          '9px',

                        paddingTop:
                          '9px',

                        borderTop:
                          '1px solid rgba(22,101,52,0.15)',

                        fontSize:
                          '0.8rem'

                      }}
                    >

                      <div>

                        <strong>
                          Area:
                        </strong>{' '}

                        {deliveryZone.place ||
                          deliveryZone.zone_name ||
                          '-'}

                      </div>


                      <div>

                        <strong>
                          Delivery Fee:
                        </strong>{' '}

                        ₹
                        {Number(
                          deliveryZone.delivery_fee ||
                          0
                        ).toFixed(0)}

                      </div>


                      <div>

                        <strong>
                          Estimated Time:
                        </strong>{' '}

                        {deliveryZone.estimated_minutes ||
                          60}{' '}

                        minutes

                      </div>


                      <div>

                        <strong>
                          Delivery Range:
                        </strong>{' '}

                        {deliveryZone.min_distance_km ??
                          0}
                        –
                        {deliveryZone.max_distance_km ??
                          5}{' '}

                        KM

                      </div>

                    </div>

                  )}


                  {/* NOT AVAILABLE HELP */}

                  {!deliveryAvailable && (

                    <div
                      style={{

                        marginTop:
                          '6px',

                        fontSize:
                          '0.78rem'

                      }}
                    >

                      Please enter another PIN code
                      where delivery is available.

                    </div>

                  )}

                </div>

              )}

            </div>


            {/* ==================================
                ADDRESS
            =================================== */}

            <div>

              <label
                style={labelStyle}
              >
                Delivery Address *
              </label>


              <div
                style={{
                  position: 'relative'
                }}
              >

                <MapPin
                  size={18}
                  style={{

                    position:
                      'absolute',

                    left: '14px',

                    top: '16px',

                    color:
                      '#94a3b8'

                  }}
                />


                <textarea
                  name="address"

                  value={
                    form.address
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Enter your complete delivery address"

                  autoComplete="street-address"

                  required

                  rows="4"

                  style={{

                    width: '100%',

                    boxSizing:
                      'border-box',

                    padding:
                      '0.85rem 1rem 0.85rem 2.7rem',

                    border:
                      '1px solid #dbe2e8',

                    borderRadius:
                      '10px',

                    outline:
                      'none',

                    fontSize:
                      '0.9rem',

                    resize:
                      'vertical'

                  }}

                />

              </div>

            </div>


            {/* ==================================
                DELIVERY STATUS INFORMATION
            =================================== */}

            <div
              style={{

                display:
                  'flex',

                gap:
                  '0.6rem',

                background:
                  deliveryAvailable
                    ? '#f0fdf8'
                    : '#f8fafc',

                border:
                  deliveryAvailable

                    ? '1px solid #ccefe2'

                    : '1px solid #e2e8f0',

                padding:
                  '0.8rem',

                borderRadius:
                  '10px',

                color:
                  deliveryAvailable
                    ? '#166534'
                    : '#64748b',

                fontSize:
                  '0.8rem'

              }}
            >

              <ShieldCheck
                size={18}
                style={{
                  flexShrink: 0
                }}
              />


              <span>

                {deliveryAvailable

                  ? 'Your PIN code is inside our delivery area. You can create your account and start shopping.'

                  : 'Enter your PIN code and check delivery availability before creating your account.'}

              </span>

            </div>


            {/* ==================================
                SUBMIT
            =================================== */}

            <button
              type="submit"

              disabled={
                loading ||
                checkingDelivery ||
                !deliveryAvailable
              }

              style={{

                border: 'none',

                borderRadius:
                  '10px',

                padding:
                  '0.95rem 1rem',

                background:
                  deliveryAvailable &&
                  !loading

                    ? '#08a66a'

                    : '#cbd5e1',

                color:
                  '#ffffff',

                fontWeight:
                  '800',

                fontSize:
                  '0.95rem',

                cursor:
                  deliveryAvailable &&
                  !loading

                    ? 'pointer'

                    : 'not-allowed',

                opacity:
                  loading
                    ? 0.7
                    : 1,

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                gap:
                  '0.5rem'

              }}
            >

              {loading

                ? 'Creating Account...'

                : !deliveryAvailable

                ? 'Check Delivery Availability First'

                : 'Create Account & Start Shopping'}


              {!loading &&
                deliveryAvailable && (

                <ArrowRight
                  size={18}
                />

              )}

            </button>

          </form>


          {/* ======================================
              LOGIN LINK
          ======================================= */}

          <div
            style={{

              textAlign:
                'center',

              marginTop:
                '1.25rem',

              fontSize:
                '0.85rem',

              color:
                '#718096'

            }}
          >

            Already have an account?{' '}

            <Link
              to="/customer-login"
              style={{

                color:
                  '#087f5b',

                fontWeight:
                  '700',

                textDecoration:
                  'none'

              }}
            >
              Login here
            </Link>

          </div>


          {/* ======================================
              FOOTER
          ======================================= */}

          <div
            style={{

              textAlign:
                'center',

              marginTop:
                '0.8rem',

              fontSize:
                '0.8rem',

              color:
                '#718096'

            }}
          >

            Account create karne ke baad hi
            shopping start hogi.

          </div>

        </div>

      </main>


      {/* ======================================
          SMALL SPINNER ANIMATION
      ======================================= */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

    </div>

  );

}
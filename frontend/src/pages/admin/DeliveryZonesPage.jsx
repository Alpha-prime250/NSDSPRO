import React, { useEffect, useState } from 'react';

import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
  Ruler,
  IndianRupee,
  Clock
} from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5050/api';

export default function DeliveryZonesPage() {

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // EMPTY FORM
  // ==========================================

  const emptyForm = {
    zone_name: '',
    pincode: '',
    place: '',
    city: '',
    state: 'Maharashtra',

    min_distance_km: '0',
    max_distance_km: '5',

    delivery_available: true,

    delivery_fee: '',
    min_order_amount: '',
    estimated_minutes: ''
  };

  const [form, setForm] = useState(emptyForm);


  // ==========================================
  // LOAD DELIVERY ZONES
  // ==========================================

  const loadZones = async () => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem('pos_token');

      const response = await fetch(
        `${API_URL}/delivery-zones`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          'Failed to load delivery zones'
        );

      }

      const list = Array.isArray(data)
        ? data
        : data.data ||
          data.zones ||
          [];

      setZones(list);

    } catch (error) {

      console.error(
        'Delivery Zones Load Error:',
        error
      );

      alert(
        error.message ||
        'Delivery zones load nahi hue.'
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadZones();

  }, []);


  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setForm((prev) => ({

      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value

    }));

  };


  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const openAddForm = () => {

    setEditingZone(null);

    setForm({
      ...emptyForm
    });

    setShowForm(true);

  };


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (zone) => {

    setEditingZone(zone);

    setForm({

      zone_name:
        zone.zone_name ||
        zone.place ||
        '',

      pincode:
        zone.pincode ||
        '',

      place:
        zone.place ||
        '',

      city:
        zone.city ||
        '',

      state:
        zone.state ||
        'Maharashtra',

      min_distance_km:
        zone.min_distance_km ??
        0,

      max_distance_km:
        zone.max_distance_km ??
        5,

      delivery_available:
        Number(zone.delivery_available) === 1 ||
        zone.delivery_available === true,

      delivery_fee:
        zone.delivery_fee ??
        '',

      min_order_amount:
        zone.min_order_amount ??
        '',

      estimated_minutes:
        zone.estimated_minutes ??
        ''

    });

    setShowForm(true);

  };


  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {

    if (saving) return;

    setShowForm(false);

    setEditingZone(null);

    setForm({
      ...emptyForm
    });

  };


  // ==========================================
  // SAVE / UPDATE ZONE
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // ------------------------------------------
    // BASIC VALIDATION
    // ------------------------------------------

    if (!form.place.trim()) {

      alert(
        'Place / Area is required.'
      );

      return;
    }


    if (
      !form.pincode.trim() &&
      !form.place.trim()
    ) {

      alert(
        'Enter PIN Code or Place.'
      );

      return;
    }


    const minDistance =
      Number(
        form.min_distance_km || 0
      );

    const maxDistance =
      Number(
        form.max_distance_km || 0
      );


    if (
      Number.isNaN(minDistance) ||
      minDistance < 0
    ) {

      alert(
        'Minimum distance must be 0 or greater.'
      );

      return;
    }


    if (
      Number.isNaN(maxDistance) ||
      maxDistance <= 0
    ) {

      alert(
        'Maximum distance must be greater than 0.'
      );

      return;
    }


    if (maxDistance < minDistance) {

      alert(
        'Maximum distance cannot be less than minimum distance.'
      );

      return;
    }


    try {

      setSaving(true);

      const token =
        localStorage.getItem('pos_token');


      // ------------------------------------------
      // PAYLOAD
      // ------------------------------------------

      const payload = {

        zone_name:
          form.zone_name.trim() ||
          form.place.trim(),

        pincode:
          form.pincode.trim(),

        place:
          form.place.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        min_distance_km:
          minDistance,

        max_distance_km:
          maxDistance,

        delivery_available:
          form.delivery_available
            ? 1
            : 0,

        delivery_fee:
          Number(
            form.delivery_fee || 0
          ),

        min_order_amount:
          Number(
            form.min_order_amount || 0
          ),

        estimated_minutes:
          Number(
            form.estimated_minutes || 60
          )

      };


      const url = editingZone

        ? `${API_URL}/delivery-zones/${editingZone.id}`

        : `${API_URL}/delivery-zones`;


      const method = editingZone
        ? 'PUT'
        : 'POST';


      const response = await fetch(
        url,
        {
          method,

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`
          },

          body:
            JSON.stringify(payload)
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          'Failed to save delivery zone'
        );

      }


      alert(
        editingZone

          ? 'Delivery zone updated successfully.'

          : 'Delivery zone added successfully.'
      );


      closeForm();

      await loadZones();

    } catch (error) {

      console.error(
        'Save Delivery Zone Error:',
        error
      );

      alert(
        error.message ||
        'Delivery zone save nahi hua.'
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // DELETE ZONE
  // ==========================================

  const deleteZone = async (zone) => {

    if (!zone?.id) return;


    const confirmed =
      window.confirm(
        `Delete delivery zone "${zone.place}"?`
      );


    if (!confirmed) return;


    try {

      const token =
        localStorage.getItem('pos_token');


      const response =
        await fetch(
          `${API_URL}/delivery-zones/${zone.id}`,
          {
            method: 'DELETE',

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          'Failed to delete zone'
        );

      }


      alert(
        'Delivery zone deleted.'
      );


      setZones((prev) =>
        prev.filter(
          (item) =>
            item.id !== zone.id
        )
      );


    } catch (error) {

      console.error(
        'Delete Delivery Zone Error:',
        error
      );

      alert(
        error.message ||
        'Delivery zone delete nahi hua.'
      );

    }

  };


  // ==========================================
  // TOGGLE DELIVERY
  // ==========================================

  const toggleAvailability = async (
    zone
  ) => {

    try {

      const token =
        localStorage.getItem('pos_token');


      const current =
        Number(
          zone.delivery_available
        ) === 1 ||
        zone.delivery_available === true;


      // ------------------------------------------
      // IMPORTANT:
      // Distance fields are also sent here
      // so they are never lost while toggling ON/OFF.
      // ------------------------------------------

      const payload = {

        zone_name:
          zone.zone_name ||
          zone.place ||
          '',

        pincode:
          zone.pincode ||
          '',

        place:
          zone.place ||
          '',

        city:
          zone.city ||
          '',

        state:
          zone.state ||
          '',

        min_distance_km:
          Number(
            zone.min_distance_km ??
            0
          ),

        max_distance_km:
          Number(
            zone.max_distance_km ??
            5
          ),

        delivery_available:
          current
            ? 0
            : 1,

        delivery_fee:
          Number(
            zone.delivery_fee ||
            0
          ),

        min_order_amount:
          Number(
            zone.min_order_amount ||
            0
          ),

        estimated_minutes:
          Number(
            zone.estimated_minutes ||
            60
          )

      };


      const response =
        await fetch(
          `${API_URL}/delivery-zones/${zone.id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify(payload)
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          'Failed to update status'
        );

      }


      // Use server response if available
      setZones((prev) =>
        prev.map((item) => {

          if (
            item.id !== zone.id
          ) {

            return item;

          }


          return {

            ...item,

            ...(data || {}),

            delivery_available:
              current
                ? 0
                : 1

          };

        })
      );


    } catch (error) {

      console.error(
        'Toggle Delivery Error:',
        error
      );

      alert(
        error.message ||
        'Delivery status update nahi hua.'
      );

    }

  };


  // ==========================================
  // FORMAT DISTANCE
  // ==========================================

  const formatDistanceRange = (
    zone
  ) => {

    const min =
      Number(
        zone.min_distance_km ??
        0
      );

    const max =
      Number(
        zone.max_distance_km ??
        5
      );


    return `${min}–${max} KM`;

  };


  // ==========================================
  // STYLES
  // ==========================================

  const pageStyle = {

    padding: '24px',

    background: '#f8fafc',

    minHeight: '100%'

  };


  const cardStyle = {

    background: '#ffffff',

    borderRadius: '14px',

    border:
      '1px solid #e2e8f0',

    boxShadow:
      '0 4px 14px rgba(15,23,42,0.05)'

  };


  const inputStyle = {

    width: '100%',

    boxSizing: 'border-box',

    padding: '11px 12px',

    border:
      '1px solid #cbd5e1',

    borderRadius: '8px',

    outline: 'none',

    fontSize: '14px'

  };


  const labelStyle = {

    display: 'block',

    marginBottom: '6px',

    fontWeight: '600',

    color: '#334155',

    fontSize: '13px'

  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div
      style={pageStyle}
    >

      {/* ======================================
          HEADER
      ======================================= */}

      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems: 'center',

          marginBottom: '22px',

          gap: '12px',

          flexWrap: 'wrap'
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,

              color: '#0f172a',

              fontSize: '26px'
            }}
          >
            Delivery Zones
          </h1>


          <p
            style={{
              margin:
                '6px 0 0',

              color:
                '#64748b'
            }}
          >
            Manage PIN codes, areas,
            distance ranges and
            delivery availability.
          </p>

        </div>


        <div
          style={{
            display: 'flex',

            gap: '10px'
          }}
        >

          {/* REFRESH */}

          <button
            onClick={loadZones}
            disabled={loading}
            style={{
              border:
                '1px solid #cbd5e1',

              background: '#fff',

              padding:
                '10px 14px',

              borderRadius: '8px',

              cursor:
                loading
                  ? 'not-allowed'
                  : 'pointer',

              display: 'flex',

              alignItems:
                'center',

              gap: '7px'
            }}
          >

            <RefreshCw
              size={17}
            />

            Refresh

          </button>


          {/* ADD */}

          <button
            onClick={openAddForm}
            style={{
              border: 'none',

              background:
                '#2563eb',

              color: '#fff',

              padding:
                '10px 16px',

              borderRadius:
                '8px',

              cursor:
                'pointer',

              display: 'flex',

              alignItems:
                'center',

              gap: '7px',

              fontWeight:
                '600'
            }}
          >

            <Plus
              size={18}
            />

            Add Delivery Zone

          </button>

        </div>

      </div>


      {/* ======================================
          DELIVERY ZONE LIST
      ======================================= */}

      <div
        style={{
          ...cardStyle,

          padding:
            zones.length === 0
              ? '0'
              : '6px 0'
        }}
      >

        {loading ? (

          <div
            style={{
              padding:
                '50px',

              textAlign:
                'center',

              color:
                '#64748b'
            }}
          >

            Loading delivery zones...

          </div>

        ) : zones.length === 0 ? (

          <div
            style={{
              padding:
                '60px 20px',

              textAlign:
                'center',

              color:
                '#64748b'
            }}
          >

            <MapPin
              size={48}
              style={{
                marginBottom:
                  '10px'
              }}
            />

            <h3
              style={{
                margin:
                  '0 0 8px',

                color:
                  '#334155'
              }}
            >
              No Delivery Zones
            </h3>

            <p>
              Add your first
              PIN code or area.
            </p>

          </div>

        ) : (

          <div>

            {zones.map(
              (zone, index) => {

                const available =
                  Number(
                    zone.delivery_available
                  ) === 1 ||
                  zone.delivery_available === true;


                return (

                  <div
                    key={zone.id}
                    style={{
                      padding:
                        '20px 24px',

                      borderBottom:
                        index ===
                        zones.length - 1
                          ? 'none'
                          : '1px solid #e2e8f0'
                    }}
                  >

                    {/* =================================
                        ZONE TOP
                    ================================== */}

                    <div
                      style={{
                        display: 'flex',

                        justifyContent:
                          'space-between',

                        alignItems:
                          'flex-start',

                        gap: '15px',

                        flexWrap:
                          'wrap'
                      }}
                    >

                      {/* LEFT */}

                      <div>

                        <div
                          style={{
                            display: 'flex',

                            alignItems:
                              'center',

                            gap: '9px',

                            marginBottom:
                              '5px'
                          }}
                        >

                          <MapPin
                            size={19}
                            color="#2563eb"
                          />

                          <span
                            style={{
                              fontSize:
                                '18px',

                              fontWeight:
                                '700',

                              color:
                                '#0f172a'
                            }}
                          >
                            {zone.place ||
                              zone.zone_name ||
                              'Unknown Area'}
                          </span>

                        </div>


                        <div
                          style={{
                            color:
                              '#64748b',

                            fontSize:
                              '14px',

                            marginLeft:
                              '28px'
                          }}
                        >
                          PIN:{' '}
                          {zone.pincode ||
                            '-'}
                        </div>

                      </div>


                      {/* ACTIONS */}

                      <div
                        style={{
                          display: 'flex',

                          gap: '8px'
                        }}
                      >

                        {/* EDIT */}

                        <button
                          onClick={() =>
                            openEditForm(
                              zone
                            )
                          }
                          title="Edit"
                          style={{
                            border:
                              'none',

                            background:
                              '#dbeafe',

                            color:
                              '#2563eb',

                            padding:
                              '9px',

                            borderRadius:
                              '8px',

                            cursor:
                              'pointer'
                          }}
                        >

                          <Pencil
                            size={17}
                          />

                        </button>


                        {/* DELETE */}

                        <button
                          onClick={() =>
                            deleteZone(
                              zone
                            )
                          }
                          title="Delete"
                          style={{
                            border:
                              'none',

                            background:
                              '#fee2e2',

                            color:
                              '#dc2626',

                            padding:
                              '9px',

                            borderRadius:
                              '8px',

                            cursor:
                              'pointer'
                          }}
                        >

                          <Trash2
                            size={17}
                          />

                        </button>

                      </div>

                    </div>


                    {/* =================================
                        DETAILS
                    ================================== */}

                    <div
                      style={{
                        marginTop:
                          '14px',

                        display:
                          'flex',

                        alignItems:
                          'center',

                        flexWrap:
                          'wrap',

                        gap: '9px',

                        marginLeft:
                          '28px'
                      }}
                    >

                      {/* DISTANCE */}

                      <span
                        style={{
                          display:
                            'inline-flex',

                          alignItems:
                            'center',

                          gap: '5px',

                          padding:
                            '7px 11px',

                          borderRadius:
                            '20px',

                          background:
                            '#eff6ff',

                          color:
                            '#1d4ed8',

                          fontSize:
                            '13px',

                          fontWeight:
                            '600'
                        }}
                      >

                        <Ruler
                          size={15}
                        />

                        {formatDistanceRange(
                          zone
                        )}

                      </span>


                      {/* DELIVERY FEE */}

                      <span
                        style={{
                          display:
                            'inline-flex',

                          alignItems:
                            'center',

                          gap: '4px',

                          padding:
                            '7px 11px',

                          borderRadius:
                            '20px',

                          background:
                            '#f0fdf4',

                          color:
                            '#166534',

                          fontSize:
                            '13px',

                          fontWeight:
                            '600'
                        }}
                      >

                        <IndianRupee
                          size={14}
                        />

                        {Number(
                          zone.delivery_fee ||
                          0
                        ).toFixed(0)}

                      </span>


                      {/* ETA */}

                      <span
                        style={{
                          display:
                            'inline-flex',

                          alignItems:
                            'center',

                          gap: '5px',

                          padding:
                            '7px 11px',

                          borderRadius:
                            '20px',

                          background:
                            '#fff7ed',

                          color:
                            '#c2410c',

                          fontSize:
                            '13px',

                          fontWeight:
                            '600'
                        }}
                      >

                        <Clock
                          size={14}
                        />

                        {zone.estimated_minutes ||
                          60}{' '}
                        min

                      </span>


                      {/* MIN ORDER */}

                      <span
                        style={{
                          padding:
                            '7px 11px',

                          borderRadius:
                            '20px',

                          background:
                            '#f8fafc',

                          color:
                            '#475569',

                          fontSize:
                            '13px',

                          fontWeight:
                            '600'
                        }}
                      >

                        Min Order ₹
                        {Number(
                          zone.min_order_amount ||
                          0
                        ).toFixed(0)}

                      </span>


                      {/* STATUS */}

                      <button
                        onClick={() =>
                          toggleAvailability(
                            zone
                          )
                        }
                        style={{
                          border:
                            'none',

                          cursor:
                            'pointer',

                          padding:
                            '7px 11px',

                          borderRadius:
                            '20px',

                          display:
                            'inline-flex',

                          alignItems:
                            'center',

                          gap: '5px',

                          background:
                            available
                              ? '#dcfce7'
                              : '#fee2e2',

                          color:
                            available
                              ? '#166534'
                              : '#991b1b',

                          fontWeight:
                            '700',

                          fontSize:
                            '13px'
                        }}
                      >

                        {available ? (

                          <>

                            <CheckCircle
                              size={15}
                            />

                            ON

                          </>

                        ) : (

                          <>

                            <XCircle
                              size={15}
                            />

                            OFF

                          </>

                        )}

                      </button>

                    </div>


                    {/* =================================
                        CITY
                    ================================== */}

                    {zone.city && (

                      <div
                        style={{
                          marginTop:
                            '10px',

                          marginLeft:
                            '28px',

                          color:
                            '#64748b',

                          fontSize:
                            '13px'
                        }}
                      >

                        City:{' '}
                        {zone.city}

                        {zone.state
                          ? `, ${zone.state}`
                          : ''}

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* ======================================
          ADD / EDIT MODAL
      ======================================= */}

      {showForm && (

        <div
          style={{
            position:
              'fixed',

            inset: 0,

            background:
              'rgba(15,23,42,0.55)',

            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'center',

            padding:
              '20px',

            zIndex:
              9999
          }}
        >

          <div
            style={{
              background:
                '#fff',

              width:
                '100%',

              maxWidth:
                '700px',

              maxHeight:
                '90vh',

              overflowY:
                'auto',

              borderRadius:
                '14px',

              boxShadow:
                '0 20px 60px rgba(0,0,0,0.2)'
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                padding:
                  '18px 20px',

                borderBottom:
                  '1px solid #e2e8f0',

                display:
                  'flex',

                justifyContent:
                  'space-between',

                alignItems:
                  'center'
              }}
            >

              <h2
                style={{
                  margin: 0,

                  color:
                    '#0f172a'
                }}
              >

                {editingZone
                  ? 'Edit Delivery Zone'
                  : 'Add Delivery Zone'}

              </h2>


              <button
                onClick={closeForm}
                disabled={saving}
                style={{
                  border:
                    'none',

                  background:
                    '#f1f5f9',

                  borderRadius:
                    '8px',

                  padding:
                    '7px',

                  cursor:
                    'pointer'
                }}
              >

                <X
                  size={19}
                />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              style={{
                padding:
                  '20px'
              }}
            >

              <div
                style={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',

                  gap:
                    '16px'
                }}
              >

                {/* ZONE NAME */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    Zone Name
                  </label>

                  <input
                    name="zone_name"
                    value={
                      form.zone_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Niphad"
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* PIN */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    PIN Code
                  </label>

                  <input
                    name="pincode"
                    value={
                      form.pincode
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: 422303"
                    maxLength="10"
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* PLACE */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    Place / Area *
                  </label>

                  <input
                    name="place"
                    value={
                      form.place
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Niphad"
                    required
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* CITY */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    City
                  </label>

                  <input
                    name="city"
                    value={
                      form.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Nashik"
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* STATE */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    State
                  </label>

                  <input
                    name="state"
                    value={
                      form.state
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Maharashtra"
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* =================================
                    MIN DISTANCE
                ================================== */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    Minimum Distance (KM)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    name="min_distance_km"
                    value={
                      form.min_distance_km
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0"
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* =================================
                    MAX DISTANCE
                ================================== */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    Maximum Distance (KM)
                  </label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    name="max_distance_km"
                    value={
                      form.max_distance_km
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="5"
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* DELIVERY FEE */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    Delivery Fee (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="delivery_fee"
                    value={
                      form.delivery_fee
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="20"
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* MIN ORDER */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    Minimum Order (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="min_order_amount"
                    value={
                      form.min_order_amount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="200"
                    style={
                      inputStyle
                    }
                  />

                </div>


                {/* ETA */}

                <div>

                  <label
                    style={labelStyle}
                  >
                    Estimated Delivery (Minutes)
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="estimated_minutes"
                    value={
                      form.estimated_minutes
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="30"
                    style={
                      inputStyle
                    }
                  />

                </div>

              </div>


              {/* ==================================
                  RANGE PREVIEW
              =================================== */}

              <div
                style={{
                  marginTop:
                    '18px',

                  padding:
                    '14px',

                  background:
                    '#eff6ff',

                  border:
                    '1px solid #bfdbfe',

                  borderRadius:
                    '10px'
                }}
              >

                <div
                  style={{
                    fontWeight:
                      '700',

                    color:
                      '#1e3a8a',

                    marginBottom:
                      '5px'
                  }}
                >
                  Delivery Range Preview
                </div>


                <div
                  style={{
                    color:
                      '#475569',

                    fontSize:
                      '14px'
                  }}
                >

                  {form.min_distance_km ||
                    0}
                  –
                  {form.max_distance_km ||
                    0}{' '}
                  KM

                  {' | '}

                  ₹
                  {Number(
                    form.delivery_fee ||
                    0
                  ).toFixed(0)}

                  {' | '}

                  {form.estimated_minutes ||
                    60}{' '}
                  min

                  {' | '}

                  {form.delivery_available
                    ? '🟢 ON'
                    : '🔴 OFF'}

                </div>

              </div>


              {/* ==================================
                  STATUS
              =================================== */}

              <div
                style={{
                  marginTop:
                    '18px',

                  padding:
                    '14px',

                  background:
                    '#f8fafc',

                  borderRadius:
                    '10px'
                }}
              >

                <label
                  style={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap:
                      '10px',

                    cursor:
                      'pointer',

                    fontWeight:
                      '600',

                    color:
                      '#334155'
                  }}
                >

                  <input
                    type="checkbox"
                    name="delivery_available"
                    checked={
                      form.delivery_available
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '18px',

                      height:
                        '18px'
                    }}
                  />

                  Delivery Available

                </label>


                <div
                  style={{
                    fontSize:
                      '12px',

                    color:
                      '#64748b',

                    marginTop:
                      '5px',

                    marginLeft:
                      '28px'
                  }}
                >
                  OFF करने पर customers
                  इस area में order नहीं
                  कर पाएंगे.
                </div>

              </div>


              {/* ==================================
                  BUTTONS
              =================================== */}

              <div
                style={{
                  display:
                    'flex',

                  justifyContent:
                    'flex-end',

                  gap:
                    '10px',

                  marginTop:
                    '22px'
                }}
              >

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                  style={{
                    padding:
                      '10px 18px',

                    border:
                      '1px solid #cbd5e1',

                    background:
                      '#fff',

                    borderRadius:
                      '8px',

                    cursor:
                      saving
                        ? 'not-allowed'
                        : 'pointer'
                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  style={{
                    padding:
                      '10px 20px',

                    border:
                      'none',

                    background:
                      '#2563eb',

                    color:
                      '#fff',

                    borderRadius:
                      '8px',

                    cursor:
                      saving
                        ? 'not-allowed'
                        : 'pointer',

                    fontWeight:
                      '600'
                  }}
                >

                  {saving

                    ? 'Saving...'

                    : editingZone

                    ? 'Update Zone'

                    : 'Save Zone'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}
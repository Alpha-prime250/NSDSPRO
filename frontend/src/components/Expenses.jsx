import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Plus,
  Trash2,
  X,
  RefreshCw,
  Settings,
  Edit,
  Check
} from 'lucide-react';

export default function Expenses({ settings }) {

  // ==========================================
  // EXPENSE STATES
  // ==========================================

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // EXPENSE MODAL STATES
  // ==========================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // EXPENSE CATEGORY STATES
  // ==========================================

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Add Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const [isCategorySaving, setIsCategorySaving] = useState(false);

  // Manage Categories Modal
  const [isManageCategoryOpen, setIsManageCategoryOpen] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryDescription, setEditingCategoryDescription] =
    useState('');

  const [isCategoryUpdating, setIsCategoryUpdating] = useState(false);

  // ==========================================
  // CURRENCY
  // ==========================================

  const symbol = settings?.currency_symbol || '₹';

  // ==========================================
  // LOAD EXPENSES
  // ==========================================

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const list = await api.getExpenses();

      setExpenses(
        Array.isArray(list)
          ? list
          : []
      );

    } catch (err) {
      console.error(
        'Failed to load expenses:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD EXPENSE CATEGORIES
  // ==========================================

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);

      const list =
        await api.getExpenseCategories();

      const categoryList =
        Array.isArray(list)
          ? list
          : [];

      setCategories(categoryList);

      if (
        !category &&
        categoryList.length > 0
      ) {
        setCategory(
          categoryList[0].name
        );
      }

    } catch (err) {
      console.error(
        'Failed to load expense categories:',
        err
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  // ==========================================
  // TOTAL EXPENSE
  // ==========================================

  const totalExpenseAmount =
    expenses.reduce(
      (sum, e) =>
        sum + Number(e.amount || 0),
      0
    );

  // ==========================================
  // OPEN EXPENSE MODAL
  // ==========================================

  const openExpenseModal = () => {

    setTitle('');
    setAmount('');
    setNotes('');

    setExpenseDate(
      new Date().toISOString().slice(0, 10)
    );

    setPaymentMode('Cash');

    if (categories.length > 0) {
      setCategory(
        categories[0].name
      );
    } else {
      setCategory('');
    }

    setIsModalOpen(true);
  };

  // ==========================================
  // CLOSE EXPENSE MODAL
  // ==========================================

  const closeExpenseModal = () => {

    if (isSaving) return;

    setIsModalOpen(false);
  };

  // ==========================================
  // CREATE EXPENSE
  // ==========================================

  const handleCreate = async (e) => {

    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter expense title.');
      return;
    }

    if (!category) {
      alert('Please select an expense category.');
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      alert('Please enter a valid expense amount.');
      return;
    }

    try {

      setIsSaving(true);

      await api.createExpense({

        title: title.trim(),

        category,

        amount: Number(amount),

        expense_date: expenseDate,

        payment_mode: paymentMode,

        notes: notes.trim()

      });

      setIsModalOpen(false);

      setTitle('');
      setAmount('');
      setNotes('');

      setPaymentMode('Cash');

      setExpenseDate(
        new Date().toISOString().slice(0, 10)
      );

      await loadExpenses();

    } catch (err) {

      alert(
        err.message ||
        'Failed to add expense'
      );

    } finally {

      setIsSaving(false);

    }
  };

  // ==========================================
  // DELETE EXPENSE
  // ==========================================

  const handleDelete = async (
    id,
    expenseTitle
  ) => {

    if (
      !window.confirm(
        `Delete expense "${expenseTitle}"?`
      )
    ) {
      return;
    }

    try {

      await api.deleteExpense(id);

      await loadExpenses();

    } catch (err) {

      alert(
        err.message ||
        'Failed to delete expense'
      );

    }
  };

  // ==========================================
  // OPEN ADD CATEGORY MODAL
  // ==========================================

  const openAddCategoryModal = () => {

    setCategoryName('');
    setCategoryDescription('');

    setIsCategoryModalOpen(true);
  };

  // ==========================================
  // CLOSE ADD CATEGORY MODAL
  // ==========================================

  const closeAddCategoryModal = () => {

    if (isCategorySaving) return;

    setIsCategoryModalOpen(false);
  };

  // ==========================================
  // CREATE CATEGORY
  // ==========================================

  const handleCreateCategory = async (e) => {

    e.preventDefault();

    const name =
      categoryName.trim();

    const description =
      categoryDescription.trim();

    if (!name) {
      alert('Please enter category name.');
      return;
    }

    try {

      setIsCategorySaving(true);

      const response =
        await api.createExpenseCategory({
          name,
          description
        });

      await loadCategories();

      if (response?.category?.name) {

        setCategory(
          response.category.name
        );
      }

      setIsCategoryModalOpen(false);

      setCategoryName('');
      setCategoryDescription('');

      alert(
        response?.message ||
        'Category added successfully'
      );

    } catch (err) {

      alert(
        err.message ||
        'Failed to add category'
      );

    } finally {

      setIsCategorySaving(false);

    }
  };

  // ==========================================
  // OPEN MANAGE CATEGORY MODAL
  // ==========================================

  const openManageCategories = async () => {

    setIsManageCategoryOpen(true);

    try {

      setCategoriesLoading(true);

      const list =
        await api.getAllExpenseCategories();

      setCategories(
        Array.isArray(list)
          ? list
          : []
      );

    } catch (err) {

      alert(
        err.message ||
        'Failed to load categories'
      );

    } finally {

      setCategoriesLoading(false);

    }
  };

  // ==========================================
  // CLOSE MANAGE CATEGORY MODAL
  // ==========================================

  const closeManageCategories = () => {

    if (isCategoryUpdating) return;

    setIsManageCategoryOpen(false);

    setEditingCategoryId(null);
    setEditingCategoryName('');
    setEditingCategoryDescription('');

    loadCategories();
  };

  // ==========================================
  // START EDIT CATEGORY
  // ==========================================

  const startEditCategory = (cat) => {

    setEditingCategoryId(cat.id);

    setEditingCategoryName(
      cat.name || ''
    );

    setEditingCategoryDescription(
      cat.description || ''
    );
  };

  // ==========================================
  // CANCEL EDIT CATEGORY
  // ==========================================

  const cancelEditCategory = () => {

    setEditingCategoryId(null);

    setEditingCategoryName('');
    setEditingCategoryDescription('');
  };

  // ==========================================
  // UPDATE CATEGORY
  // ==========================================

  const handleUpdateCategory = async (id) => {

    const name =
      editingCategoryName.trim();

    const description =
      editingCategoryDescription.trim();

    if (!name) {

      alert(
        'Category name is required.'
      );

      return;
    }

    try {

      setIsCategoryUpdating(true);

      const response =
        await api.updateExpenseCategory(
          id,
          {
            name,
            description
          }
        );

      const list =
        await api.getAllExpenseCategories();

      const updatedCategories =
        Array.isArray(list)
          ? list
          : [];

      setCategories(
        updatedCategories
      );

      if (
        response?.category?.name
      ) {

        const oldCategory =
          categories.find(
            item => item.id === id
          );

        if (
          oldCategory &&
          category === oldCategory.name
        ) {

          setCategory(
            response.category.name
          );
        }
      }

      cancelEditCategory();

      alert(
        response?.message ||
        'Category updated successfully'
      );

    } catch (err) {

      alert(
        err.message ||
        'Failed to update category'
      );

    } finally {

      setIsCategoryUpdating(false);

    }
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDeleteCategory = async (
    id,
    name
  ) => {

    if (
      !window.confirm(
        `Delete category "${name}"?`
      )
    ) {
      return;
    }

    try {

      await api.deleteExpenseCategory(id);

      const list =
        await api.getAllExpenseCategories();

      setCategories(
        Array.isArray(list)
          ? list
          : []
      );

      const activeList =
        await api.getExpenseCategories();

      const activeCategories =
        Array.isArray(activeList)
          ? activeList
          : [];

      setCategories(
        activeCategories
      );

      if (category === name) {

        if (
          activeCategories.length > 0
        ) {

          setCategory(
            activeCategories[0].name
          );

        } else {

          setCategory('');

        }
      }

      alert(
        'Category deleted successfully'
      );

    } catch (err) {

      alert(
        err.message ||
        'Failed to delete category'
      );

    }
  };

  // ==========================================
  // REFRESH CATEGORIES
  // ==========================================

  const refreshCategories = async () => {
    await loadCategories();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >

      {/* ======================================
          TOP HEADER & TOTAL
      ====================================== */}

      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >

        <div>

          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '800'
            }}
          >
            Store Expense Tracker
          </h2>

          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)'
            }}
          >

            Total Recorded Expenses:{' '}

            <strong
              style={{
                color: 'var(--danger)'
              }}
            >
              {symbol}
              {totalExpenseAmount.toFixed(2)}
            </strong>

          </span>

        </div>

        {/* RECORD EXPENSE + MANAGE CATEGORIES */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            minWidth: '180px'
          }}
        >

          {/* RECORD EXPENSE */}

          <button
            onClick={openExpenseModal}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center'
            }}
          >

            <Plus size={16} />

            Record Expense

          </button>

          {/* MANAGE CATEGORIES */}

          <button
            type="button"
            onClick={openManageCategories}
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center'
            }}
          >

            <Settings size={16} />

            Manage Categories

          </button>

        </div>

      </div>

      {/* ======================================
          EXPENSE TABLE
      ====================================== */}

      <div className="table-container">

        <table className="data-table">

          <thead>

            <tr>

              <th>Date</th>
              <th>Expense Title</th>
              <th>Category</th>
              <th>Payment Mode</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                  }}
                >

                  <RefreshCw
                    className="animate-spin"
                    size={20}
                    style={{
                      display: 'inline',
                      marginRight: '0.5rem'
                    }}
                  />

                  Loading expenses...

                </td>

              </tr>

            ) : expenses.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                  }}
                >

                  No expenses recorded yet.
                  Click "Record Expense" to log costs.

                </td>

              </tr>

            ) : (

              expenses.map(e => (

                <tr key={e.id}>

                  <td
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8125rem'
                    }}
                  >

                    {new Date(
                      e.expense_date
                    ).toLocaleDateString()}

                  </td>

                  <td
                    style={{
                      fontWeight: '700'
                    }}
                  >
                    {e.title}
                  </td>

                  <td>

                    <span
                      className="badge badge-warning"
                    >
                      {e.category}
                    </span>

                  </td>

                  <td>
                    {e.payment_mode}
                  </td>

                  <td
                    style={{
                      fontWeight: '800',
                      color: 'var(--danger)'
                    }}
                  >

                    {symbol}
                    {Number(
                      e.amount
                    ).toFixed(2)}

                  </td>

                  <td
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    {e.notes || '—'}
                  </td>

                  <td>

                    <button
                      onClick={() =>
                        handleDelete(
                          e.id,
                          e.title
                        )
                      }
                      className="btn btn-secondary"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--danger)'
                      }}
                    >

                      <Trash2 size={13} />

                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ======================================
          ADD EXPENSE MODAL
      ====================================== */}

      {isModalOpen && (

        <div
          className="modal-overlay"
          onClick={closeExpenseModal}
        >

          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              padding: '1.5rem',
              maxWidth: '650px',
              width: '100%'
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}
            >

              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '800'
                }}
              >
                Record New Expense
              </h3>

              <button
                onClick={closeExpenseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >

                <X size={18} />

              </button>

            </div>

            {/* EXPENSE FORM */}

            <form
              onSubmit={handleCreate}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >

              {/* EXPENSE TITLE */}

              <div>

                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Expense Title *
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Shop Electricity Bill"
                  value={title}
                  onChange={e =>
                    setTitle(e.target.value)
                  }
                  className="input-field"
                />

              </div>

              {/* CATEGORY + AMOUNT */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}
              >

                {/* CATEGORY */}

                <div>

                  <label
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      display: 'block'
                    }}
                  >
                    Category *
                  </label>

                  <select
                    value={category}
                    onChange={e => {

                      const value =
                        e.target.value;

                      if (
                        value ===
                        '__ADD_CATEGORY__'
                      ) {

                        openAddCategoryModal();

                        return;
                      }

                      setCategory(value);

                    }}
                    className="input-field"
                    disabled={categoriesLoading}
                  >

                    {categories.length === 0 ? (

                      <option value="">

                        {categoriesLoading
                          ? 'Loading categories...'
                          : 'No categories available'}

                      </option>

                    ) : (

                      categories
                        .filter(
                          cat =>
                            Number(
                              cat.is_active
                            ) === 1
                        )
                        .map(cat => (

                          <option
                            key={cat.id}
                            value={cat.name}
                          >
                            {cat.name}
                          </option>

                        ))

                    )}

                    {/* ONLY ADD CATEGORY */}

                    <option
                      value="__ADD_CATEGORY__"
                    >
                      + Add Category
                    </option>

                  </select>

                </div>

                {/* AMOUNT */}

                <div>

                  <label
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      display: 'block'
                    }}
                  >
                    Amount ({symbol}) *
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e =>
                      setAmount(
                        e.target.value
                      )
                    }
                    className="input-field"
                  />

                </div>

              </div>

              {/* DATE + PAYMENT MODE */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}
              >

                {/* DATE */}

                <div>

                  <label
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      display: 'block'
                    }}
                  >
                    Date
                  </label>

                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e =>
                      setExpenseDate(
                        e.target.value
                      )
                    }
                    className="input-field"
                  />

                </div>

                {/* PAYMENT MODE */}

                <div>

                  <label
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      display: 'block'
                    }}
                  >
                    Payment Mode
                  </label>

                  <select
                    value={paymentMode}
                    onChange={e =>
                      setPaymentMode(
                        e.target.value
                      )
                    }
                    className="input-field"
                  >

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                  </select>

                </div>

              </div>

              {/* NOTES */}

              <div>

                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Notes / Bill Ref
                </label>

                <input
                  type="text"
                  placeholder="Optional remarks or receipt voucher #"
                  value={notes}
                  onChange={e =>
                    setNotes(
                      e.target.value
                    )
                  }
                  className="input-field"
                />

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}
              >

                <button
                  type="button"
                  onClick={closeExpenseModal}
                  className="btn btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    !category
                  }
                  className="btn btn-primary"
                >

                  {isSaving
                    ? 'Saving...'
                    : 'Save Expense'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================
          ADD CATEGORY MODAL
      ====================================== */}

      {isCategoryModalOpen && (

        <div
          className="modal-overlay"
          onClick={closeAddCategoryModal}
        >

          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              padding: '1.5rem',
              maxWidth: '500px',
              width: '100%'
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}
            >

              <div>

                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '800'
                  }}
                >
                  Add Expense Category
                </h3>

                <p
                  style={{
                    margin: '0.25rem 0 0',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  Create a new category for expenses.
                </p>

              </div>

              <button
                onClick={closeAddCategoryModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >

                <X size={18} />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateCategory}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >

              {/* NAME */}

              <div>

                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Category Name *
                </label>

                <input
                  type="text"
                  required
                  maxLength="100"
                  placeholder="e.g. Internet & Phone"
                  value={categoryName}
                  onChange={e =>
                    setCategoryName(
                      e.target.value
                    )
                  }
                  className="input-field"
                  autoFocus
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Description
                </label>

                <textarea
                  rows="3"
                  maxLength="255"
                  placeholder="Optional description"
                  value={categoryDescription}
                  onChange={e =>
                    setCategoryDescription(
                      e.target.value
                    )
                  }
                  className="input-field"
                  style={{
                    resize: 'vertical'
                  }}
                />

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}
              >

                <button
                  type="button"
                  onClick={closeAddCategoryModal}
                  className="btn btn-secondary"
                  disabled={isCategorySaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCategorySaving}
                >

                  {isCategorySaving
                    ? 'Saving...'
                    : 'Add Category'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================
          MANAGE CATEGORIES MODAL
      ====================================== */}

      {isManageCategoryOpen && (

        <div
          className="modal-overlay"
          onClick={closeManageCategories}
        >

          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              padding: '1.5rem',
              maxWidth: '750px',
              width: '100%'
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}
            >

              <div>

                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '800'
                  }}
                >
                  Manage Expense Categories
                </h3>

                <p
                  style={{
                    margin: '0.25rem 0 0',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  Edit or delete expense categories.
                </p>

              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >

                {/* REFRESH */}

                <button
                  type="button"
                  onClick={refreshCategories}
                  className="btn btn-secondary"
                  title="Refresh categories"
                  disabled={categoriesLoading}
                  style={{
                    padding: '0.4rem'
                  }}
                >

                  <RefreshCw
                    size={15}
                    className={
                      categoriesLoading
                        ? 'animate-spin'
                        : ''
                    }
                  />

                </button>

                {/* CLOSE */}

                <button
                  onClick={closeManageCategories}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >

                  <X size={18} />

                </button>

              </div>

            </div>

            {/* CATEGORY LIST */}

            {categoriesLoading ? (

              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--text-muted)'
                }}
              >

                <RefreshCw
                  className="animate-spin"
                  size={20}
                  style={{
                    display: 'inline',
                    marginRight: '0.5rem'
                  }}
                />

                Loading categories...

              </div>

            ) : categories.length === 0 ? (

              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--text-muted)'
                }}
              >

                No expense categories found.

              </div>

            ) : (

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
              >

                {categories.map(cat => (

                  <div
                    key={cat.id}
                    style={{
                      border:
                        '1px solid var(--border-color)',
                      borderRadius: '0.6rem',
                      padding: '0.8rem',
                      background:
                        'var(--bg-secondary)'
                    }}
                  >

                    {editingCategoryId === cat.id ? (

                      /* EDIT MODE */

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem'
                        }}
                      >

                        <input
                          type="text"
                          maxLength="100"
                          value={editingCategoryName}
                          onChange={e =>
                            setEditingCategoryName(
                              e.target.value
                            )
                          }
                          className="input-field"
                          placeholder="Category name"
                        />

                        <textarea
                          rows="2"
                          maxLength="255"
                          value={editingCategoryDescription}
                          onChange={e =>
                            setEditingCategoryDescription(
                              e.target.value
                            )
                          }
                          className="input-field"
                          placeholder="Description"
                          style={{
                            resize: 'vertical'
                          }}
                        />

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.5rem'
                          }}
                        >

                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={cancelEditCategory}
                            disabled={
                              isCategoryUpdating
                            }
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              handleUpdateCategory(
                                cat.id
                              )
                            }
                            disabled={
                              isCategoryUpdating
                            }
                          >

                            <Check size={14} />

                            {isCategoryUpdating
                              ? 'Saving...'
                              : 'Save'}

                          </button>

                        </div>

                      </div>

                    ) : (

                      /* VIEW MODE */

                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          flexWrap: 'wrap'
                        }}
                      >

                        <div
                          style={{
                            minWidth: '200px',
                            flex: 1
                          }}
                        >

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              flexWrap: 'wrap'
                            }}
                          >

                            <strong
                              style={{
                                fontSize: '0.9rem'
                              }}
                            >
                              {cat.name}
                            </strong>

                            {Number(
                              cat.is_active
                            ) === 0 && (

                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding:
                                    '0.15rem 0.4rem',
                                  borderRadius:
                                    '999px',
                                  background:
                                    'var(--bg-tertiary)',
                                  color:
                                    'var(--text-muted)'
                                }}
                              >
                                Inactive
                              </span>

                            )}

                          </div>

                          <div
                            style={{
                              fontSize: '0.78rem',
                              color:
                                'var(--text-muted)',
                              marginTop: '0.2rem'
                            }}
                          >
                            {cat.description ||
                              'No description'}
                          </div>

                        </div>

                        {/* ACTIONS */}

                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem'
                          }}
                        >

                          {/* EDIT */}

                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                              startEditCategory(
                                cat
                              )
                            }
                            style={{
                              padding:
                                '0.4rem 0.6rem'
                            }}
                            title="Edit category"
                          >

                            <Edit size={14} />

                            <span
                              style={{
                                marginLeft:
                                  '0.25rem'
                              }}
                            >
                              Edit
                            </span>

                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                              handleDeleteCategory(
                                cat.id,
                                cat.name
                              )
                            }
                            style={{
                              padding:
                                '0.4rem 0.6rem',
                              color:
                                'var(--danger)'
                            }}
                            title="Delete category"
                          >

                            <Trash2 size={14} />

                            <span
                              style={{
                                marginLeft:
                                  '0.25rem'
                              }}
                            >
                              Delete
                            </span>

                          </button>

                        </div>

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

            {/* BOTTOM CLOSE */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1rem'
              }}
            >

              <button
                type="button"
                onClick={closeManageCategories}
                className="btn btn-secondary"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}
